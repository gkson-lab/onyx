// The sky over Austin, Texas, where Onyx is made: volumetric clouds and a physical atmosphere from three-geospatial
// (https://github.com/takram-design-engineering/three-geospatial, MIT, Takram) with the sun and moon where they are
// for the time it's given. Nothing is downloaded but our own blue noise (noise.bin): the atmosphere's lookup tables,
// the cloud shapes, the weather and the turbulence are all generated on the GPU when the scene starts.
import { HalfFloatType, NoToneMapping, PerspectiveCamera, Scene, Vector3, WebGLRenderer, MathUtils } from 'three';
import { EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from 'postprocessing';
import { AerialPerspectiveEffect, PrecomputedTexturesGenerator, getSunDirectionECEF, getMoonDirectionECEF } from '@takram/three-atmosphere';
import { CloudsEffect, CloudShape, CloudShapeDetail, LocalWeather, Turbulence } from '@takram/three-clouds';
import { Ellipsoid, Geodetic, radians, STBNLoader } from '@takram/three-geospatial';

export const AUSTIN = { lat: 30.2672, lon: -97.7431, name: 'Austin, Texas' };

const smooth = (t) => t * t * (3 - 2 * t);

const AUSTIN_UP = Ellipsoid.WGS84.getSurfaceNormal(new Geodetic(radians(AUSTIN.lon), radians(AUSTIN.lat), 0).toECEF());
const sunScratch = new Vector3();
/** The sun's height over Austin in degrees at a moment. */
export function sunHeightAt(date) {
	getSunDirectionECEF(date, sunScratch);
	return MathUtils.radToDeg(Math.asin(MathUtils.clamp(sunScratch.dot(AUSTIN_UP), -1, 1)));
}
/** Sunrise and sunset in Austin on the day of `date` (in Austin's own calendar), to the minute. */
export function daylightAt(date) {
	const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
	// Austin's midnight: try the two offsets it uses (CST, CDT) and keep the one that lands on that day's 00:00.
	let midnight = 0;
	for (const offset of [6, 5]) {
		const t = Date.parse(`${day}T00:00:00Z`) + offset * 3600e3;
		const hour = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', hourCycle: 'h23' }).format(t);
		if (Number(hour) === 0) { midnight = t; break; }
	}
	let rise = null, set = null, prev = sunHeightAt(new Date(midnight));
	for (let m = 1; m <= 24 * 60; m++) {
		const h = sunHeightAt(new Date(midnight + m * 60e3));
		if (prev < 0 && h >= 0 && rise === null) rise = new Date(midnight + m * 60e3);
		if (prev >= 0 && h < 0) set = new Date(midnight + m * 60e3);
		prev = h;
	}
	return { midnight: new Date(midnight), rise, set };
}
const clamp01 = (t) => Math.min(1, Math.max(0, t));

/**
 * Mounts the sky into a canvas. `noise` is the URL of the blue-noise volume. Returns null where WebGL 2 or float
 * render targets are missing. The returned object takes a scroll progress (0 above the clouds, 1 below them) and a
 * date, and reports the sun's height so the page can say whether it's day or night.
 */
export async function mountSky(canvas, { noise, date = new Date(), quality, onReady } = {}) {
	let renderer;
	try {
		renderer = new WebGLRenderer({ canvas, depth: false, antialias: false, powerPreference: 'high-performance', logarithmicDepthBuffer: false });
	} catch {
		return null;
	}
	if (!renderer.capabilities.isWebGL2) { renderer.dispose(); return null; }
	const small = matchMedia('(max-width: 760px)').matches || matchMedia('(pointer: coarse)').matches;
	const calm = matchMedia('(prefers-reduced-motion: reduce)');
	renderer.setPixelRatio(1);
	renderer.toneMapping = NoToneMapping;
	renderer.toneMappingExposure = 10;

	// Where we are: a frame whose x, y and z are east, north and up at Austin.
	const ground = new Geodetic(radians(AUSTIN.lon), radians(AUSTIN.lat), 0);
	const frame = Ellipsoid.WGS84.getEastNorthUpFrame(ground.toECEF());
	const east = new Vector3(), north = new Vector3(), up = new Vector3();
	frame.extractBasis(east, north, up);

	const scene = new Scene();
	const camera = new PerspectiveCamera(small ? 70 : 58, 1, 10, 1e6);
	camera.up.copy(up);

	const aerial = new AerialPerspectiveEffect(camera);
	aerial.sky = true;
	aerial.sun = true;
	aerial.moon = true;
	const clouds = new CloudsEffect(camera);
	clouds.qualityPreset = quality ?? (small ? 'low' : 'medium');
	clouds.resolutionScale = small ? 0.5 : 0.75;
	clouds.coverage = 0.42;
	clouds.localWeatherVelocity.set(0.0012, 0.0003);
	clouds.localWeatherTexture = new LocalWeather();
	clouds.shapeTexture = new CloudShape();
	clouds.shapeDetailTexture = new CloudShapeDetail();
	clouds.turbulenceTexture = new Turbulence();
	clouds.events.addEventListener('change', (event) => {
		if (event.property === 'atmosphereOverlay') aerial.overlay = clouds.atmosphereOverlay;
		if (event.property === 'atmosphereShadow') aerial.shadow = clouds.atmosphereShadow;
		if (event.property === 'atmosphereShadowLength') aerial.shadowLength = clouds.atmosphereShadowLength;
	});

	const composer = new EffectComposer(renderer, { frameBufferType: HalfFloatType, multisampling: 0 });
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(new EffectPass(camera, clouds, aerial));
	composer.addPass(new EffectPass(camera, new ToneMappingEffect({ mode: ToneMappingMode.AGX })));

	// The atmosphere's lookup tables, made on the GPU, and the one file we load.
	let textures;
	try {
		textures = await new PrecomputedTexturesGenerator(renderer).update();
	} catch {
		renderer.dispose();
		return null;
	}
	Object.assign(aerial, textures);
	Object.assign(clouds, textures);
	await new Promise((resolve) => new STBNLoader().load(noise, (t) => { aerial.stbnTexture = t; clouds.stbnTexture = t; resolve(); }, undefined, resolve));

	// The sun and moon for the date; the camera faces the sun's side of the sky, or the moon's at night.
	const sun = new Vector3(), moon = new Vector3(), look = new Vector3();
	let sunHeight = 0, facing = 0;
	const setDate = (d) => {
		getSunDirectionECEF(d, sun);
		getMoonDirectionECEF(d, moon);
		aerial.sunDirection.copy(sun);
		aerial.moonDirection.copy(moon);
		sunHeight = MathUtils.radToDeg(Math.asin(sun.dot(up)));
		// The clouds' shadow pass keeps half-floats, and with the sun near the horizon its shadow camera stands up to
		// 1,000 km away, which overflows them and blackens the clouds. So the clouds are lit by a sun held at least 9°
		// up, on the same bearing; the sky keeps the true one.
		const lift = Math.max(radians(9), Math.asin(MathUtils.clamp(sun.dot(up), -1, 1)));
		const bearing = Math.atan2(sun.dot(east), sun.dot(north));
		clouds.sunDirection.set(0, 0, 0)
			.addScaledVector(east, Math.sin(bearing) * Math.cos(lift))
			.addScaledVector(north, Math.cos(bearing) * Math.cos(lift))
			.addScaledVector(up, Math.sin(lift));
		const target = sunHeight > -6 ? sun : moon;
		facing = Math.atan2(target.dot(east), target.dot(north));
		// Brighter exposure as the sun goes down, so dusk and moonlight still read.
		renderer.toneMappingExposure = sunHeight > 8 ? 10 : sunHeight > -6 ? 10 + (8 - sunHeight) * 2.8 : 140;
		dirty = 24;
	};

	// Scroll: from 4,200 m above the city, looking a little down at the cloud tops, to 300 m, looking up at them.
	let progress = 0;
	const place = () => {
		const p = smooth(clamp01(progress));
		const altitude = MathUtils.lerp(4200, 300, p);
		const pitch = radians(MathUtils.lerp(-9, 14, p));
		const yaw = facing + radians(MathUtils.lerp(-12, 12, p));
		new Geodetic(radians(AUSTIN.lon), radians(AUSTIN.lat), altitude).toECEF(camera.position);
		look.set(0, 0, 0)
			.addScaledVector(east, Math.sin(yaw) * Math.cos(pitch))
			.addScaledVector(north, Math.cos(yaw) * Math.cos(pitch))
			.addScaledVector(up, Math.sin(pitch));
		camera.lookAt(look.add(camera.position));
	};

	let width = 0, height = 0, visible = false, raf = 0, dirty = 24, last = 0;
	const resize = () => {
		const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
		if (w === width && h === height) return;
		width = w; height = h;
		composer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		dirty = 24;
	};
	let ready = false;
	const loop = (now) => {
		raf = 0;
		if (!visible || document.hidden) return;
		const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
		last = now;
		resize();
		place();
		// The clouds drift unless motion is reduced; then frames are drawn only until the picture settles.
		if (!calm.matches || dirty > 0) {
			composer.render(calm.matches ? 0 : dt);
			if (dirty > 0) dirty--;
			if (!ready) { ready = true; onReady?.(); }
		}
		raf = requestAnimationFrame(loop);
	};
	const start = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(loop); } };
	const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { rootMargin: '200px' });
	io.observe(canvas);
	const onVis = () => start();
	document.addEventListener('visibilitychange', onVis);

	setDate(date);
	resize();
	return {
		setProgress(p) { if (Math.abs(p - progress) > 1e-4) { progress = p; dirty = 24; } },
		setDate(d) { setDate(d); start(); },
		get sunHeight() { return sunHeight; },
		/** Draws one settled picture now, for screenshots and the still. */
		async settle(frames = 48) { resize(); place(); for (let i = 0; i < frames; i++) composer.render(1 / 60); dirty = 0; },
		destroy() { io.disconnect(); document.removeEventListener('visibilitychange', onVis); cancelAnimationFrame(raf); composer.dispose(); renderer.dispose(); },
	};
}

// The Onyx mark in liquid chrome: Paper Shaders' liquid metal effect (https://github.com/paper-design/shaders,
// Apache-2.0, "Powered by Paper Shaders") over the mark. It is the effect behind Paper's Liquid Logo. The mark's
// edge map is worked out once at build time (see build.mjs), so a phone doesn't have to solve it on load.
import { ShaderMount, liquidMetalFragmentShader, getShaderColorFromString, ShaderFitOptions, LiquidMetalShapes } from '@paper-design/shaders';

// Strong red and blue shifts split the chrome's reflections into rainbow fringes: chromatic chrome.
export const CHROME = {
	speed: 0.55,
	colorBack: 'rgba(0, 0, 0, 0)',
	colorTint: '#ffffff',
	repetition: 3.2,
	softness: 0.3,
	shiftRed: 2.8,
	shiftBlue: 2.8,
	distortion: 0.08,
	contour: 0.48,
	angle: 72,
	scale: 0.86,
};

// How the metal is drawn at each quality level (see intro/quality.js): at least `ratio` pixels to a CSS pixel where the
// screen has fewer, never more than `pixels` in all, and at most `fps` frames a second, whatever the screen's refresh.
const LEVELS = {
	high: { ratio: 2, pixels: 1600 * 1600, fps: 60 },
	mid: { ratio: 1, pixels: 760 * 760, fps: 30 },
	low: { ratio: 1, pixels: 560 * 560, fps: 20 },
};

/**
 * Mounts the chrome mark into `el` (which sets its size). `image` is the prepared edge map. Returns null where WebGL 2
 * is missing; with reduced motion the metal stands still. Stops drawing while off screen. `quality` is a level above;
 * setQuality() changes it later.
 */
export async function mountChrome(el, image, { quality = 'high', ...options } = {}) {
	const o = { ...CHROME, ...options };
	let q = LEVELS[quality] ?? LEVELS.high;
	const img = await new Promise((resolve, reject) => {
		const i = new Image();
		i.decoding = 'async';
		i.onload = () => resolve(i);
		i.onerror = reject;
		i.src = image;
	});
	const calm = matchMedia('(prefers-reduced-motion: reduce)');
	const uniforms = () => ({
		u_colorTint: getShaderColorFromString(o.colorTint),
		u_repetition: o.repetition, u_softness: o.softness, u_shiftRed: o.shiftRed, u_shiftBlue: o.shiftBlue,
		u_distortion: o.distortion, u_contour: o.contour, u_angle: o.angle, u_scale: o.scale,
	});
	let mount;
	try {
		// Speed 0: the page runs the clock itself (below), so the shader draws only the frames it's asked for.
		mount = new ShaderMount(el, liquidMetalFragmentShader, {
			u_image: img,
			u_colorBack: getShaderColorFromString(o.colorBack),
			...uniforms(),
			u_shape: LiquidMetalShapes.none,
			u_isImage: true,
			u_fit: ShaderFitOptions.contain,
			u_rotation: 0,
			u_originX: 0.5,
			u_originY: 0.5,
			u_offsetX: 0,
			u_offsetY: 0,
			u_worldWidth: 0,
			u_worldHeight: 0,
		}, { alpha: true, premultipliedAlpha: false }, 0, 12, q.ratio, q.pixels);
	} catch {
		return null;
	}
	if (!el.querySelector('canvas')) return null;
	// The clock: the metal flows at `speed` while it can be seen, at no more than the level's frame rate. Settings
	// that change in between (the light following the pointer) go out with the next frame.
	let visible = true, raf = 0, drawn = 0, frame = 12, pending = null;
	const running = () => visible && !calm.matches && !document.hidden && o.speed > 0;
	const tick = (now) => {
		raf = 0;
		if (!running()) return;
		raf = requestAnimationFrame(tick);
		if (drawn && now - drawn < 1000 / q.fps - 2) return;
		frame += (drawn ? Math.min(100, now - drawn) : 16) * o.speed;
		drawn = now;
		if (pending) {
			mount.currentFrame = frame;
			mount.setUniforms(pending);
			pending = null;
		} else mount.setFrame(frame);
	};
	const sync = () => {
		if (running()) {
			if (!raf) { drawn = 0; raf = requestAnimationFrame(tick); }
		} else {
			if (raf) { cancelAnimationFrame(raf); raf = 0; }
			if (pending && visible) { mount.setUniforms(pending); pending = null; }
		}
	};
	const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
	io.observe(el);
	document.addEventListener('visibilitychange', sync);
	calm.addEventListener('change', sync);
	sync();
	return {
		set(next) {
			Object.assign(o, next);
			pending = uniforms();
			sync();
		},
		/** A lighter level: fewer pixels and frames. */
		setQuality(level) {
			q = LEVELS[level] ?? q;
			mount.setMinPixelRatio(q.ratio);
			mount.setMaxPixelCount(q.pixels);
		},
		destroy() {
			io.disconnect();
			if (raf) cancelAnimationFrame(raf);
			raf = 0;
			document.removeEventListener('visibilitychange', sync);
			calm.removeEventListener('change', sync);
			mount.dispose();
		},
	};
}

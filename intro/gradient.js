// A slow, banded gradient: a plane rippled by 3D noise, coloured by how far across each point lies and how high it rose,
// and lit like a polished surface. It is ShaderGradient's "waterPlane" (https://github.com/ruucm/shadergradient,
// MIT, (c) ruucm and stone-skipper) ported to plain three.js: the same 10 x 10 plane, noise, displacement and colour mix,
// set into three's own physical material instead of a copied shader, with the ripples' slope turned into real normals
// so the light runs along the bands. Its noise is the classic 3D Perlin noise of webgl-noise
// (https://github.com/stegu/webgl-noise, MIT, (c) Stefan Gustavson and Ian McEwan), as ShaderGradient uses it.
import * as THREE from 'three';

const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float cnoise(vec3 P) {
	vec3 Pi0 = floor(P), Pi1 = Pi0 + vec3(1.0);
	Pi0 = mod289(Pi0); Pi1 = mod289(Pi1);
	vec3 Pf0 = fract(P), Pf1 = Pf0 - vec3(1.0);
	vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x), iy = vec4(Pi0.yy, Pi1.yy);
	vec4 iz0 = Pi0.zzzz, iz1 = Pi1.zzzz;
	vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);
	vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
	gx0 = fract(gx0);
	vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));
	gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
	vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
	gx1 = fract(gx1);
	vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));
	gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
	vec3 g000 = vec3(gx0.x, gy0.x, gz0.x), g100 = vec3(gx0.y, gy0.y, gz0.y), g010 = vec3(gx0.z, gy0.z, gz0.z), g110 = vec3(gx0.w, gy0.w, gz0.w);
	vec3 g001 = vec3(gx1.x, gy1.x, gz1.x), g101 = vec3(gx1.y, gy1.y, gz1.y), g011 = vec3(gx1.z, gy1.z, gz1.z), g111 = vec3(gx1.w, gy1.w, gz1.w);
	vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
	g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
	vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
	g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
	float n000 = dot(g000, Pf0), n100 = dot(g100, vec3(Pf1.x, Pf0.yz)), n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z)), n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
	float n001 = dot(g001, vec3(Pf0.xy, Pf1.z)), n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z)), n011 = dot(g011, vec3(Pf0.x, Pf1.yz)), n111 = dot(g111, Pf1);
	vec3 fade_xyz = fade(Pf0);
	vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
	vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
	return 2.2 * mix(n_yz.x, n_yz.y, fade_xyz.x);
}`;

/** The gradients the page uses. Angles in degrees, as ShaderGradient's controls give them. */
export const PRESETS = {
	// Banded onyx: near-black, a vein of sard (the red-brown of sardonyx) and a pale band where the folds rise. The
	// plane, camera and light follow ShaderGradient's water-plane presets: tilted 45 degrees, seen from above and
	// behind, lit mostly by even ambient light, so the colour bands do the work.
	onyx: {
		colors: ['#0f0c0a', '#6a2a17', '#cbb99c'],
		density: 1.2, strength: 3.2, speed: 0.12, grain: 0.05,
		position: [0, 0.9, -0.3], rotation: [45, 0, 0],
		camera: { azimuth: 200, polar: 62, distance: 4.4, fov: 45 },
		ambient: 0.8, key: 0.3, roughness: 0.55, clearcoat: 0.4,
	},
	// The same stone, darker and calmer, behind the download panel.
	night: {
		colors: ['#0d0b09', '#4a2012', '#9c8a70'],
		density: 1.4, strength: 2.6, speed: 0.08, grain: 0.05,
		position: [0, 0.6, -0.3], rotation: [50, 0, -40],
		camera: { azimuth: 180, polar: 72, distance: 4.2, fov: 45 },
		ambient: 0.75, key: 0.25, roughness: 0.6, clearcoat: 0.3,
	},
};

/** Presets for the background settings: the page's own stone and three more. Each changes only the colours and motion. */
export const STONES = {
	Onyx: { colors: PRESETS.onyx.colors, speed: 0.12, strength: 3.2, density: 1.2, grain: 0.05 },
	Sardonyx: { colors: ['#1a0d08', '#b4532c', '#f0d8b2'], speed: 0.18, strength: 2.6, density: 1.5, grain: 0.04 },
	Agate: { colors: ['#14171c', '#4d6b7c', '#e6d7c1'], speed: 0.1, strength: 3.6, density: 1.0, grain: 0.05 },
	Ember: { colors: ['#120a07', '#d0461f', '#ffc483'], speed: 0.3, strength: 2.2, density: 2.0, grain: 0.07 },
};

const DEG = Math.PI / 180;

/**
 * Draws a preset into a canvas, and keeps it moving while the canvas is on screen. The pointer tilts the camera a
 * few degrees. With reduced motion it draws one still frame. Returns null where WebGL is missing.
 */
export function createGradient(canvas, preset = PRESETS.onyx, { onFirstFrame } = {}) {
	let renderer;
	try {
		renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
	} catch {
		return null;
	}
	const small = matchMedia('(max-width: 760px)').matches;
	renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.25 : 1.5));
	renderer.setClearColor(preset.colors[0]);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(preset.camera.fov, 1, 0.1, 100);
	const segments = small ? 96 : 192;
	const geometry = new THREE.PlaneGeometry(10, 10, segments, segments);

	const uniforms = {
		uTime: { value: 0 },
		uPhase: { value: 0 },
		uDensity: { value: preset.density },
		uStrength: { value: preset.strength },
		uGrain: { value: preset.grain },
		uC1: { value: new THREE.Color(preset.colors[0]) },
		uC2: { value: new THREE.Color(preset.colors[1]) },
		uC3: { value: new THREE.Color(preset.colors[2]) },
	};
	const material = new THREE.MeshPhysicalMaterial({
		metalness: 0.2, roughness: preset.roughness, clearcoat: preset.clearcoat, clearcoatRoughness: 0.5,
		side: THREE.DoubleSide,
	});
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, uniforms);
		shader.vertexShader = shader.vertexShader
			.replace('#include <common>', `#include <common>
uniform float uPhase, uDensity, uStrength;
varying vec3 vPos;
${NOISE}
// ShaderGradient's displacement: noise sampled at 0.43 x position x density, moving with time x speed (kept here as
// one phase, so a change of speed does not jump), pushes the plane along z.
vec3 ripple(vec3 p) { return p + vec3(0.0, 0.0, 1.0) * 0.75 * cnoise(0.43 * p * uDensity + uPhase) * uStrength; }`)
			// The slope of the ripples, from two neighbours, gives the normal, so the light follows the bands.
			.replace('#include <beginnormal_vertex>', `vec3 sgPos = ripple(position);
vec3 sgDx = ripple(position + vec3(0.04, 0.0, 0.0)) - sgPos;
vec3 sgDy = ripple(position + vec3(0.0, 0.04, 0.0)) - sgPos;
vec3 objectNormal = normalize(cross(sgDx, sgDy));
#ifdef USE_TANGENT
vec3 objectTangent = vec3(tangent.xyz);
#endif`)
			.replace('#include <begin_vertex>', 'vec3 transformed = sgPos;\nvPos = sgPos;');
		shader.fragmentShader = shader.fragmentShader
			.replace('#include <common>', `#include <common>
uniform vec3 uC1, uC2, uC3;
uniform float uGrain, uTime;
varying vec3 vPos;
float sgHash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }`)
			// ShaderGradient's colour: across x from colour 1 to colour 2, then toward colour 3 as the surface rises (eased in,
			// where ShaderGradient mixes by height directly, so the pale band fades in rather than cutting).
			.replace('vec4 diffuseColor = vec4( diffuse, opacity );',
				'vec4 diffuseColor = vec4(mix(mix(uC1, uC2, smoothstep(-3.0, 3.0, vPos.x)), uC3, smoothstep(0.1, 2.0, vPos.z)), opacity);')
			.replace('#include <dithering_fragment>', `#include <dithering_fragment>
gl_FragColor.rgb += (sgHash(gl_FragCoord.xy + fract(uTime * 7.0) * 61.0) - 0.5) * uGrain;`);
	};
	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(...preset.position);
	mesh.rotation.set(preset.rotation[0] * DEG, preset.rotation[1] * DEG, preset.rotation[2] * DEG);
	scene.add(mesh);

	// ShaderGradient's "3d" light is ambient light at brightness x pi; a faint key light adds the polish.
	scene.add(new THREE.AmbientLight(0xffffff, preset.ambient * Math.PI));
	const key = new THREE.DirectionalLight(0xfff1e2, preset.key * Math.PI);
	key.position.set(-1, 4, -3);
	scene.add(key);

	// The camera on a sphere round the plane, as ShaderGradient places it; the pointer nudges it.
	const look = { az: 0, po: 0, taz: 0, tpo: 0 };
	const place = () => {
		const az = (preset.camera.azimuth + look.az) * DEG, po = (preset.camera.polar + look.po) * DEG;
		const r = preset.camera.distance;
		camera.position.set(r * Math.sin(po) * Math.sin(az), r * Math.cos(po), r * Math.sin(po) * Math.cos(az));
		camera.lookAt(0, 0, 0);
	};

	const calm = matchMedia('(prefers-reduced-motion: reduce)');
	let visible = false, frame = 0, last = 0, drawn = false, speed = preset.speed;
	const resize = () => {
		const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		if (!frame) draw(0);
	};
	const draw = (dt) => {
		if (!calm.matches) { uniforms.uTime.value += dt; uniforms.uPhase.value += dt * speed; }
		look.az += (look.taz - look.az) * Math.min(1, dt * 2.5);
		look.po += (look.tpo - look.po) * Math.min(1, dt * 2.5);
		place();
		renderer.render(scene, camera);
		if (!drawn) { drawn = true; onFirstFrame?.(); }
	};
	const loop = (now) => {
		frame = 0;
		const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
		last = now;
		draw(dt);
		if (visible && !calm.matches && !document.hidden) frame = requestAnimationFrame(loop);
	};
	const start = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(loop); } };

	const onPointer = (e) => {
		if (calm.matches || e.pointerType === 'touch') return;
		look.taz = ((e.clientX / innerWidth) * 2 - 1) * -6;
		look.tpo = ((e.clientY / innerHeight) * 2 - 1) * 3;
	};
	addEventListener('pointermove', onPointer, { passive: true });
	const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); }, { rootMargin: '100px' });
	io.observe(canvas);
	const ro = new ResizeObserver(resize);
	ro.observe(canvas);
	const onVisibility = () => { if (!document.hidden) start(); };
	document.addEventListener('visibilitychange', onVisibility);
	calm.addEventListener('change', () => { if (!calm.matches) start(); else draw(0); });
	uniforms.uTime.value = 4;
	uniforms.uPhase.value = 4 * speed + 0.5; // start on a well-formed wave rather than flat noise
	resize();

	return {
		/** Changes any of colors, speed, strength, density and grain, and draws at once. */
		set(o) {
			if (o.colors) {
				o.colors.forEach((c, i) => uniforms[`uC${i + 1}`].value.set(c));
				renderer.setClearColor(o.colors[0]);
			}
			if (o.speed !== undefined) speed = o.speed;
			if (o.strength !== undefined) uniforms.uStrength.value = o.strength;
			if (o.density !== undefined) uniforms.uDensity.value = o.density;
			if (o.grain !== undefined) uniforms.uGrain.value = o.grain;
			if (!frame) draw(0);
		},
		destroy() {
			cancelAnimationFrame(frame);
			removeEventListener('pointermove', onPointer);
			document.removeEventListener('visibilitychange', onVisibility);
			io.disconnect();
			ro.disconnect();
			geometry.dispose();
			material.dispose();
			renderer.dispose();
		},
	};
}

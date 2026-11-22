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

/**
 * Mounts the chrome mark into `el` (which sets its size). `image` is the prepared edge map. Returns null where WebGL 2
 * is missing; with reduced motion the metal stands still. Stops drawing while off screen.
 */
export async function mountChrome(el, image, options = {}) {
	const o = { ...CHROME, ...options };
	const img = await new Promise((resolve, reject) => {
		const i = new Image();
		i.decoding = 'async';
		i.onload = () => resolve(i);
		i.onerror = reject;
		i.src = image;
	});
	const calm = matchMedia('(prefers-reduced-motion: reduce)');
	let mount;
	try {
		mount = new ShaderMount(el, liquidMetalFragmentShader, {
			u_image: img,
			u_colorBack: getShaderColorFromString(o.colorBack),
			u_colorTint: getShaderColorFromString(o.colorTint),
			u_repetition: o.repetition,
			u_softness: o.softness,
			u_shiftRed: o.shiftRed,
			u_shiftBlue: o.shiftBlue,
			u_distortion: o.distortion,
			u_contour: o.contour,
			u_angle: o.angle,
			u_shape: LiquidMetalShapes.none,
			u_isImage: true,
			u_fit: ShaderFitOptions.contain,
			u_scale: o.scale,
			u_rotation: 0,
			u_originX: 0.5,
			u_originY: 0.5,
			u_offsetX: 0,
			u_offsetY: 0,
			u_worldWidth: 0,
			u_worldHeight: 0,
		}, { alpha: true, premultipliedAlpha: false }, calm.matches ? 0 : o.speed, 12, 2, 1600 * 1600);
	} catch {
		return null;
	}
	if (!el.querySelector('canvas')) return null;
	// Only animate while it can be seen.
	let visible = true;
	const sync = () => mount.setSpeed(visible && !calm.matches && !document.hidden ? o.speed : 0);
	const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
	io.observe(el);
	document.addEventListener('visibilitychange', sync);
	calm.addEventListener('change', sync);
	return {
		set(next) {
			Object.assign(o, next);
			mount.setUniforms({
				u_colorTint: getShaderColorFromString(o.colorTint),
				u_repetition: o.repetition, u_softness: o.softness, u_shiftRed: o.shiftRed, u_shiftBlue: o.shiftBlue,
				u_distortion: o.distortion, u_contour: o.contour, u_angle: o.angle, u_scale: o.scale,
			});
			sync();
		},
		destroy() { io.disconnect(); document.removeEventListener('visibilitychange', sync); mount.dispose(); },
	};
}

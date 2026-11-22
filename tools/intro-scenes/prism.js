// One message in, five specialists out: a white beam (your message) through a glass prism (Onyx Core), split into
// five coloured beams (the specialists). The prism is 3D glass, ray traced per colour channel so it splits light the
// way real glass does (prism.wgsl). It is drawn with vgpu (https://github.com/vercel-labs/vgpu, MIT, Vercel) on
// WebGPU; where WebGPU is missing or fails, the same shader runs on WebGL 2 (prism.frag), and failing that a flat
// drawing on Canvas 2D. The page places the agents' labels where the beams end, from the same layout.
import { init, effect, surface, frameLoop, clock } from 'vgpu';
import prismShader from './prism.wgsl';
import prismFrag from './prism.frag';

// Each specialist's colour, red to violet, the way a prism orders them.
export const BEAMS = [
	{ agent: 'Researcher', color: [1.0, 0.36, 0.22] },
	{ agent: 'Coder', color: [1.0, 0.74, 0.2] },
	{ agent: 'Scheduler', color: [0.33, 0.86, 0.52] },
	{ agent: 'Messenger', color: [0.26, 0.68, 1.0] },
	{ agent: 'Memory', color: [0.66, 0.45, 1.0] },
];

// The prism: an equilateral triangle (sides of 2, apex up, centred on the axis) run along z. These match the shader.
const S3 = Math.sqrt(3);
const R_IN = 1 / S3;
const APEX = [0, 2 / S3], RIGHT = [1, -1 / S3], LEFT = [-1, -1 / S3];
const N_LEFT = [-S3 / 2, 0.5], N_RIGHT = [S3 / 2, 0.5];
const DEPTH = 1.05; // half its length
const FOV = (34 * Math.PI) / 180;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp2 = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
// Snell's law in the plane: d heads into the surface, n faces back against it, eta is n1 / n2.
function refract(d, n, eta) {
	const cosi = -(d[0] * n[0] + d[1] * n[1]);
	const k = 1 - eta * eta * (1 - cosi * cosi);
	if (k < 0) return null;
	const f = eta * cosi - Math.sqrt(k);
	return [eta * d[0] + f * n[0], eta * d[1] + f * n[1]];
}

/**
 * The scene for a canvas of w x h CSS pixels: the camera, the beams' paths, and where it all lands on screen.
 * `yaw` and `pitch` (radians) turn the camera a little from its resting place; `tilt` (-1 to 1) swings the
 * incoming beam. Tall canvases see the whole thing turned a quarter, so the beam comes down from the top.
 */
export function layout(w, h, { yaw = 0, pitch = 0, tilt = 0 } = {}) {
	const tall = h > w * 1.05;
	const aspect = w / h;
	const th = Math.tan(FOV / 2);
	// The camera looks at a point right of the prism, where the colours fan out, from in front, a little above and
	// to the right, far enough back that the prism and the fan both fit. Tall: close enough that the prism takes
	// about half the width, level with the beams (looking down on them would skew the fan sideways), and moved
	// across, below, until the fan's ends are centred.
	const dist = tall ? Math.max(1.92 / (th * aspect), 3.0 / th) : Math.max(3.75 / (th * aspect), 1.95 / th);
	const ya = ((tall ? 12 : 16) * Math.PI) / 180 + yaw;
	const pa = ((tall ? 0 : 10) * Math.PI) / 180 + pitch;
	const camera = (target) => {
		const pos = [target[0] + dist * Math.sin(ya) * Math.cos(pa), target[1] + dist * Math.sin(pa), target[2] + dist * Math.cos(ya) * Math.cos(pa)];
		const fwd = unit(sub(target, pos));
		let right = unit(cross(fwd, [0, 1, 0]));
		let up = cross(right, fwd);
		if (tall) [right, up] = [up, [-right[0], -right[1], -right[2]]];
		const project = (p) => {
			const r = sub(p, pos);
			const z = dot(r, fwd);
			return [((dot(r, right) / (z * th * aspect)) * 0.5 + 0.5) * w, (0.5 - (dot(r, up) / (z * th)) * 0.5) * h];
		};
		return { pos, fwd, right, up, project, flat: (p) => project([p[0], p[1], 0]) };
	};
	let cam = camera(tall ? [1.9, 0.15, 0] : [1.25, -0.45, 0]);

	// The beams, in the plane through the middle of the prism: in through the left face, bent at both faces by
	// Snell's law, each colour with its own index of refraction (exaggerated, so the fan is wide).
	const entry = lerp2(LEFT, APEX, 0.45 + tilt * 0.05);
	const angle = (((tall ? 54 : 27) + tilt * 6) * Math.PI) / 180;
	const dIn = [Math.cos(angle), Math.sin(angle)];
	// Narrow screens get a wider fan (about 41 degrees against 30) pointed straight down, so every beam reaches the
	// bottom edge and five labels fit across it in two rows.
	const iors = tall ? [1.25, 1.38, 1.51, 1.64, 1.77] : [1.44, 1.5, 1.56, 1.62, 1.68];
	const exits = [], dirs = [];
	for (const n of iors) {
		const d1 = refract(dIn, N_LEFT, 1 / n);
		const t = (R_IN - (N_RIGHT[0] * entry[0] + N_RIGHT[1] * entry[1])) / (N_RIGHT[0] * d1[0] + N_RIGHT[1] * d1[1]);
		const x = [entry[0] + d1[0] * t, entry[1] + d1[1] * t];
		exits.push(x);
		dirs.push(refract(d1, [-N_RIGHT[0], -N_RIGHT[1]], n) ?? d1);
	}
	// How far a ray in that plane can go and stay inside a box on screen (fractions of the canvas), by bisection.
	const reach = (p, d, [x0, y0, x1, y1]) => {
		const on = (L) => { const [x, y] = cam.flat([p[0] + d[0] * L, p[1] + d[1] * L]); return x >= x0 * w && x <= x1 * w && y >= y0 * h && y <= y1 * h; };
		let lo = 0, hi = 60;
		if (on(hi)) return hi;
		for (let k = 0; k < 26; k++) { const mid = (lo + hi) / 2; if (on(mid)) lo = mid; else hi = mid; }
		return lo;
	};
	const box = tall ? [0.04, 0.03, 0.96, 0.97] : [0.03, 0.06, 0.97, 0.94];
	const endsNow = () => exits.map((x, i) => { const L = reach(x, dirs[i], box); return [x[0] + dirs[i][0] * L, x[1] + dirs[i][1] * L]; });
	let ends = endsNow();
	if (tall) {
		// Where the beams would cross the bottom edge if nothing stopped them, then the camera moved across to centre that.
		const far = exits.map((x, i) => { const L = reach(x, dirs[i], [-9, 0.03, 10, 0.97]); return cam.flat([x[0] + dirs[i][0] * L, x[1] + dirs[i][1] * L])[0]; });
		const off = ((far[0] + far[4]) / 2 - w / 2) / w;
		cam = camera([1.9, 0.15 + off * 2 * th * aspect * dist, 0]);
		ends = endsNow();
	}
	const back = reach(entry, [-dIn[0], -dIn[1]], [-0.02, -0.02, 1.02, 1.02]);
	const src = [entry[0] - dIn[0] * back, entry[1] - dIn[1] * back];
	const mid = [exits.reduce((s, p) => s + p[0], 0) / 5, exits.reduce((s, p) => s + p[1], 0) / 5];
	const { pos, right, up, fwd, project, flat } = cam;
	return {
		tall,
		unit: Math.max(1, Math.min(w, h) / 520),
		// For the shader, in the scene's own units.
		cam: { pos, right, up, fwd, th },
		src3: [...src, 0], entry3: [...entry, 0], exits3: exits.map((p) => [...p, 0]), ends3: ends.map((p) => [...p, 0]),
		// On screen, in CSS pixels: for the labels and the flat drawing.
		a: flat(APEX), b: flat(RIGHT), c: flat(LEFT),
		src: flat(src), entry: flat(entry), exit: flat(mid), ends: ends.map(flat),
		labels: ends.map((e, i) => flat(tall ? lerp2(exits[i], e, i % 2 ? 0.78 : 0.97) : e)),
		core: project([0, 0, DEPTH]),
	};
}

/** The shader's uniforms for a layout, drawn into `res` device pixels. */
export function shaderParams(g, res, { time = 2, focus = -1, glow = 1, grain = 0.012 } = {}) {
	const v4 = (a, w = 0) => [a[0], a[1], a[2], w];
	return {
		res, time, focus,
		camPos: v4(g.cam.pos, 1), camRight: v4(g.cam.right), camUp: v4(g.cam.up), camFwd: v4(g.cam.fwd, g.cam.th),
		src: v4(g.src3), entry: v4(g.entry3),
		exits: g.exits3.map((p) => v4(p)), ends: g.ends3.map((p) => v4(p)),
		cols: BEAMS.map((b) => [...b.color, 1]),
		misc: [glow, DEPTH, grain, 0],
	};
}

const VERTEX = `#version 300 es
void main() {
	vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
	gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

/**
 * Mounts the prism into a canvas. Returns { kind, canvas, geometry, setFocus(i), setPointer(x, y), destroy }, or
 * null if nothing can draw it. `onLayout(geometry)` runs whenever what's on screen moves: on resize, and as the
 * camera drifts. If a renderer fails, now or later, the canvas is swapped for a fresh one (a canvas keeps the first
 * kind of context it's given) and the next renderer takes over; `canvas` always names the one in the page.
 */
export async function mountPrism(canvas, { onLayout, webgpu = true, webgl = true } = {}) {
	const calm = matchMedia('(prefers-reduced-motion: reduce)');
	const small = matchMedia('(max-width: 760px)').matches || matchMedia('(pointer: coarse)').matches;
	const s = {
		el: canvas, kind: null, renderer: null, focus: -1, glow: 0, geometry: null, visible: true,
		yaw: 0, pitch: 0, tilt: 0, goal: { yaw: 0, pitch: 0, tilt: 0 },
	};
	const relayout = () => {
		s.geometry = layout(s.el.clientWidth || 1, s.el.clientHeight || 1, { yaw: s.yaw, pitch: s.pitch, tilt: s.tilt });
		onLayout?.(s.geometry);
	};
	// The camera drifts a little on its own and leans towards the pointer; true while it is still moving.
	const drift = (now) => {
		const t = now / 1000;
		const goal = calm.matches ? { yaw: 0, pitch: 0, tilt: 0 } : {
			yaw: s.goal.yaw + Math.sin(t * 0.23) * 0.05,
			pitch: s.goal.pitch + Math.sin(t * 0.31) * 0.025,
			tilt: s.goal.tilt,
		};
		let moved = false;
		for (const k of ['yaw', 'pitch', 'tilt']) {
			const diff = goal[k] - s[k];
			if (Math.abs(diff) > 1e-4) { s[k] += diff * 0.06; moved = true; }
		}
		if (moved) relayout();
		return moved;
	};
	const io = new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; s.renderer?.kick(); });
	io.observe(canvas);
	const onVis = () => s.renderer?.kick();
	document.addEventListener('visibilitychange', onVis);
	const fresh = () => {
		const next = s.el.cloneNode(false);
		s.el.replaceWith(next);
		s.el = next;
		io.disconnect();
		io.observe(next);
	};

	// WebGPU, through vgpu.
	const gpuRenderer = async () => {
		const gpu = await init();
		try {
			const view = surface(gpu, s.el, { dpr: small ? [1, 1] : [1, 1.5], clearColor: [0.03, 0.028, 0.034, 1] });
			const fx = effect(gpu, prismShader);
			await fx.compile(view);
			const time = clock(gpu);
			let needs = 2;
			relayout();
			const loop = frameLoop(gpu, (frame) => {
				if (!s.visible || document.hidden) return;
				const moving = drift(performance.now());
				if (calm.matches && !moving && needs <= 0) return;
				needs--;
				s.glow = calm.matches ? 1 : Math.min(1, s.glow + 0.02);
				fx.set({ params: shaderParams(s.geometry, [view.size[0], view.size[1]], { time: calm.matches ? 2 : time.time, focus: s.focus, glow: s.glow }) });
				frame.pass(view, fx);
			});
			const offResize = view.onResize(() => { relayout(); needs = 2; });
			const offError = gpu.onError((error) => fallback(error));
			gpu.lost.then((info) => fallback(info));
			s.kind = 'webgpu';
			return { kick() { needs = 2; }, stop() { loop.stop(); offResize(); offError(); gpu.dispose(); } };
		} catch (error) {
			gpu.dispose();
			throw error;
		}
	};

	// WebGL 2: the same shader in GLSL.
	const glRenderer = () => {
		const el = s.el;
		const gl = el.getContext('webgl2', { antialias: false, alpha: false, depth: false, powerPreference: 'high-performance' });
		if (!gl) return null;
		const shader = (type, src) => {
			const sh = gl.createShader(type);
			gl.shaderSource(sh, src);
			gl.compileShader(sh);
			if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader did not compile');
			return sh;
		};
		const prog = gl.createProgram();
		gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERTEX));
		gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, prismFrag));
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'program did not link');
		gl.useProgram(prog);
		const u = Object.fromEntries(['uRes', 'uTime', 'uFocus', 'uCamPos', 'uCamRight', 'uCamUp', 'uCamFwd', 'uSrc', 'uEntry', 'uExits', 'uEnds', 'uCols', 'uMisc'].map((n) => [n, gl.getUniformLocation(prog, n)]));
		gl.bindVertexArray(gl.createVertexArray());
		let raf = 0, stopped = false;
		const t0 = performance.now();
		const draw = (now) => {
			raf = 0;
			if (stopped || gl.isContextLost()) return;
			const dpr = Math.min(small ? 1 : 1.5, devicePixelRatio || 1);
			const W = Math.max(1, Math.round(el.clientWidth * dpr)), H = Math.max(1, Math.round(el.clientHeight * dpr));
			if (el.width !== W || el.height !== H) { el.width = W; el.height = H; relayout(); }
			const moving = drift(now);
			s.glow = calm.matches ? 1 : Math.min(1, s.glow + 0.02);
			const p = shaderParams(s.geometry, [W, H], { time: calm.matches ? 2 : (now - t0) / 1000, focus: s.focus, glow: s.glow });
			gl.viewport(0, 0, W, H);
			gl.uniform2f(u.uRes, W, H);
			gl.uniform1f(u.uTime, p.time);
			gl.uniform1f(u.uFocus, p.focus);
			gl.uniform4fv(u.uCamPos, p.camPos);
			gl.uniform4fv(u.uCamRight, p.camRight);
			gl.uniform4fv(u.uCamUp, p.camUp);
			gl.uniform4fv(u.uCamFwd, p.camFwd);
			gl.uniform4fv(u.uSrc, p.src);
			gl.uniform4fv(u.uEntry, p.entry);
			gl.uniform4fv(u.uExits, p.exits.flat());
			gl.uniform4fv(u.uEnds, p.ends.flat());
			gl.uniform4fv(u.uCols, p.cols.flat());
			gl.uniform4fv(u.uMisc, p.misc);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
			if ((!calm.matches || moving) && s.visible && !document.hidden) raf = requestAnimationFrame(draw);
		};
		const kick = () => { if (!raf && !stopped) raf = requestAnimationFrame(draw); };
		const ro = new ResizeObserver(() => { relayout(); kick(); });
		ro.observe(el);
		const lost = (e) => { e.preventDefault(); fallback('the WebGL context was lost'); };
		el.addEventListener('webglcontextlost', lost);
		s.kind = 'webgl';
		relayout();
		kick();
		return { kick, stop() { stopped = true; cancelAnimationFrame(raf); ro.disconnect(); el.removeEventListener('webglcontextlost', lost); } };
	};

	// Canvas 2D: a flat drawing in the same place, with the light running along the beams as moving dashes.
	const canvasRenderer = () => {
		const el = s.el;
		const ctx = el.getContext('2d');
		if (!ctx) return null;
		let raf = 0;
		const t0 = performance.now();
		const css = (c, a = 1) => `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${a})`;
		const line = (p, q, color, width, blur) => {
			ctx.strokeStyle = color; ctx.lineWidth = width; ctx.shadowColor = typeof color === 'string' ? color : 'transparent'; ctx.shadowBlur = blur;
			ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
		};
		const draw = (now) => {
			raf = 0;
			const dpr = Math.min(2, devicePixelRatio || 1);
			const w = el.clientWidth, h = el.clientHeight;
			if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) { el.width = Math.round(w * dpr); el.height = Math.round(h * dpr); relayout(); }
			const moving = drift(now);
			s.glow = calm.matches ? 1 : Math.min(1, s.glow + 0.03);
			const g = s.geometry, u = g.unit, glow = s.glow, focus = s.focus;
			const time = calm.matches ? 2 : (now - t0) / 1000;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.globalCompositeOperation = 'source-over';
			ctx.fillStyle = '#080709';
			ctx.fillRect(0, 0, w, h);
			ctx.globalCompositeOperation = 'lighter';
			ctx.lineCap = 'round';
			line(g.src, g.entry, 'rgba(255, 250, 242, 0.9)', 2.4 * u, 18 * u);
			if (!calm.matches) {
				ctx.setLineDash([16 * u, 34 * u]);
				ctx.lineDashOffset = -time * 70 * u;
				line(g.src, g.entry, 'rgba(255, 255, 255, 0.5)', 2.4 * u, 0);
				ctx.setLineDash([]);
			}
			ctx.shadowBlur = 0;
			for (let i = 0; i < 4; i++) {
				const m = [(g.ends[i][0] + g.ends[i + 1][0]) / 2, (g.ends[i][1] + g.ends[i + 1][1]) / 2];
				const grad = ctx.createLinearGradient(g.exit[0], g.exit[1], m[0], m[1]);
				grad.addColorStop(0, css(BEAMS[i].color, 0));
				grad.addColorStop(1, css(BEAMS[i].color, 0.08 * glow));
				ctx.fillStyle = grad;
				ctx.beginPath(); ctx.moveTo(g.exit[0], g.exit[1]); ctx.lineTo(...g.ends[i]); ctx.lineTo(...g.ends[i + 1]); ctx.closePath(); ctx.fill();
			}
			BEAMS.forEach((b, i) => {
				const lit = focus < 0 ? 1 : focus === i ? 1.6 : 0.35;
				const width = (2 + (focus === i ? 1.5 : 0)) * u;
				line(g.exit, g.ends[i], css(b.color, Math.min(1, 0.85 * lit * glow)), width, 16 * u * lit);
				if (!calm.matches) {
					ctx.setLineDash([12 * u, 40 * u]);
					ctx.lineDashOffset = -(time * 60 + i * 9) * u;
					line(g.exit, g.ends[i], css([1, 1, 1], 0.28 * lit * glow), width * 0.6, 0);
					ctx.setLineDash([]);
				}
			});
			ctx.globalCompositeOperation = 'source-over';
			ctx.shadowBlur = 0;
			ctx.beginPath(); ctx.moveTo(...g.a); ctx.lineTo(...g.b); ctx.lineTo(...g.c); ctx.closePath();
			ctx.fillStyle = 'rgba(30, 30, 36, 0.92)';
			ctx.fill();
			ctx.globalCompositeOperation = 'lighter';
			ctx.strokeStyle = 'rgba(225, 230, 255, 0.9)'; ctx.lineWidth = 1.4 * u; ctx.shadowColor = 'rgba(225, 230, 255, 0.6)'; ctx.shadowBlur = 14 * u;
			ctx.stroke();
			const inner = ctx.createLinearGradient(g.entry[0], g.entry[1], g.exit[0], g.exit[1]);
			inner.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
			inner.addColorStop(1, css(BEAMS[2].color, 0.45));
			line(g.entry, g.exit, inner, 2 * u, 10 * u);
			ctx.globalCompositeOperation = 'source-over';
			ctx.shadowBlur = 0;
			if ((!calm.matches || moving) && s.visible && !document.hidden) raf = requestAnimationFrame(draw);
		};
		const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
		const ro = new ResizeObserver(() => { relayout(); kick(); });
		ro.observe(el);
		s.kind = 'canvas';
		relayout();
		kick();
		return { kick, stop() { cancelAnimationFrame(raf); raf = -1; ro.disconnect(); } };
	};

	// The next renderer down, on a fresh canvas: WebGPU, then WebGL 2, then Canvas 2D.
	const startGl = () => {
		if (!webgl) return null;
		try { return glRenderer(); } catch (error) {
			console.info(`Prism: drawing flat (${error?.message || 'WebGL 2 unavailable'}).`);
			fresh();
			return null;
		}
	};
	const fallback = (why) => {
		if (s.kind === 'canvas') return;
		const from = s.kind;
		console.warn(`Prism: ${from === 'webgpu' ? 'WebGPU' : 'WebGL'} stopped (${why?.message || why?.reason || why || 'lost'}), switching renderer.`);
		s.renderer?.stop();
		fresh();
		s.renderer = (from === 'webgpu' && startGl()) || canvasRenderer();
		// A lost GPU can take WebGL down with it for a moment while the browser restarts its GPU process: draw flat
		// meanwhile, and try WebGL again shortly.
		if (from === 'webgpu' && s.kind === 'canvas' && webgl) {
			let tries = 0;
			const retry = () => {
				if (s.kind !== 'canvas' || !s.renderer) return;
				const probe = document.createElement('canvas').getContext('webgl2');
				probe?.getExtension('WEBGL_lose_context')?.loseContext();
				if (probe) {
					s.renderer.stop();
					fresh();
					s.renderer = startGl() || canvasRenderer();
				} else if (++tries < 4) setTimeout(retry, 1500 * tries);
			};
			setTimeout(retry, 1200);
		}
	};

	if (navigator.gpu && webgpu) {
		try {
			s.renderer = await gpuRenderer();
		} catch (error) {
			// Plenty of browsers have no WebGPU yet; that's expected, not an error.
			console.info(`Prism: using WebGL 2 (${error?.message || 'WebGPU unavailable'}).`);
			fresh();
		}
	}
	if (!s.renderer) s.renderer = startGl();
	if (!s.renderer) s.renderer = canvasRenderer();
	if (!s.renderer) { io.disconnect(); document.removeEventListener('visibilitychange', onVis); return null; }
	return {
		get kind() { return s.kind; },
		get canvas() { return s.el; },
		get geometry() { return s.geometry; },
		setFocus(i) { s.focus = i; s.renderer?.kick(); },
		/** x and y from -1 to 1 across the stage: the camera leans that way and the incoming beam swings. */
		setPointer(x, y) {
			if (calm.matches) return;
			s.goal = { yaw: x * 0.16, pitch: -y * 0.08, tilt: Math.max(-1, Math.min(1, y * 0.8)) };
			s.renderer?.kick();
		},
		destroy() { s.renderer?.stop(); s.renderer = null; io.disconnect(); document.removeEventListener('visibilitychange', onVis); },
	};
}

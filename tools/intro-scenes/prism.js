// One message in, five specialists out: a white beam (your message) through a glass prism (Onyx Core), split into
// five coloured beams (the specialists). Drawn with vgpu (https://github.com/vercel-labs/vgpu, MIT, Vercel) on
// WebGPU, from prism.wgsl; where WebGPU is missing or fails, the same picture is drawn with Canvas 2D. The page places
// the agents' labels at the beams' ends, from the same layout.
import { init, effect, surface, frameLoop, clock } from 'vgpu';
import prismShader from './prism.wgsl';

// Each specialist's colour, red to violet, the way a prism orders them.
export const BEAMS = [
	{ agent: 'Researcher', color: [1.0, 0.36, 0.22] },
	{ agent: 'Coder', color: [1.0, 0.74, 0.2] },
	{ agent: 'Scheduler', color: [0.33, 0.86, 0.52] },
	{ agent: 'Messenger', color: [0.26, 0.68, 1.0] },
	{ agent: 'Memory', color: [0.66, 0.45, 1.0] },
];

/**
 * The picture's geometry for a canvas of w x h CSS pixels. Wide canvases send the beam from the left and fan the
 * colours out to the right; tall ones send it down from the top. `tilt` (-1 to 1) swings the incoming beam a little.
 */
export function layout(w, h, tilt = 0) {
	const tall = h > w * 1.05;
	// Work in a frame where the beam travels along +x, then turn it for tall canvases.
	const L = tall ? h : w, S = tall ? w : h;
	const side = Math.min(L * 0.3, S * 0.5);
	const cx = L * 0.38, cy = S * 0.5;
	const hgt = side * Math.sqrt(3) / 2;
	// Apex towards -y in the local frame: the classic prism.
	const A = [cx, cy - hgt * 0.62], B = [cx + side / 2, cy + hgt * 0.38], C = [cx - side / 2, cy + hgt * 0.38];
	const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
	const entry = lerp(C, A, 0.5 + tilt * 0.08);
	const exit = lerp(B, A, 0.52 - tilt * 0.06);
	const src = [0, entry[1] + (S * 0.16) * (1 + tilt * 0.6)];
	// Five beams fanning out towards the far edge, red bent least (highest), violet most. Narrow canvases fan wider,
	// so the labels have room; either way the fan is squeezed until every beam lands inside the canvas.
	const run = L - exit[0];
	const lo = Math.atan2(S * 0.07 - exit[1], run), hi = Math.atan2(S * 0.93 - exit[1], run);
	let first, last;
	if (tall) {
		// Narrow canvases have little room across, so the fan opens almost to the edges.
		first = lo * 0.92 + 0.04 * tilt;
		last = hi * 0.92 + 0.04 * tilt;
	} else {
		const spread = 0.121 + 0.028 * tilt, base = 0.2 + 0.04 * tilt;
		first = Math.max(lo, base - spread * 2);
		last = Math.min(hi, base + spread * 2);
	}
	const ends = BEAMS.map((_, i) => {
		const a = first + (last - first) * (i / 4);
		return [L, exit[1] + Math.tan(a) * run];
	});
	// Where each agent's label sits: at the beam's end on wide canvases; on tall ones, staggered along the beams.
	const labels = ends.map((p, i) => (tall ? lerp(exit, p, i % 2 ? 0.7 : 0.92) : p));
	const turn = (p) => (tall ? [S - p[1], p[0]] : p);
	return {
		tall, a: turn(A), b: turn(B), c: turn(C), entry: turn(entry), exit: turn(exit), src: turn(src),
		ends: ends.map(turn), labels: labels.map(turn), unit: Math.max(1, Math.min(w, h) / 520),
	};
}

const times = (p, k) => [p[0] * k, p[1] * k];

/** The shader's uniforms for a geometry in CSS pixels, drawn at `k` device pixels per CSS pixel into `res`. */
export function shaderParams(g, k, res, { time = 2, focus = -1, glow = 1 } = {}) {
	return {
		res, time, focus,
		a: times(g.a, k), b: times(g.b, k), c: times(g.c, k), entry: times(g.entry, k), exit: times(g.exit, k), src: times(g.src, k),
		ends: g.ends.map((p) => [p[0] * k, p[1] * k, 0, 0]),
		cols: BEAMS.map((b) => [...b.color, 1]),
		unit: g.unit * k, glow, _pad: [0, 0],
	};
}

/**
 * Mounts the prism into a canvas. Returns { kind, canvas, geometry, setFocus(i), setTilt(t), destroy }, or null if
 * neither WebGPU nor Canvas 2D is available. `onLayout(geometry)` runs whenever the canvas changes size. If WebGPU
 * fails, now or later, the canvas is swapped for a fresh one drawn with Canvas 2D (a canvas keeps the first kind of
 * context it is given); `canvas` always names the one in the page.
 */
export async function mountPrism(canvas, { onLayout, webgpu = true } = {}) {
	const calm = matchMedia('(prefers-reduced-motion: reduce)');
	const s = { el: canvas, kind: null, renderer: null, focus: -1, tilt: 0, tiltGoal: 0, glow: 0, geometry: null, visible: true };
	const relayout = () => {
		s.geometry = layout(s.el.clientWidth || 1, s.el.clientHeight || 1, s.tilt);
		onLayout?.(s.geometry);
	};
	// Eases the tilt towards its goal; true while it is still moving.
	const ease = (rate) => {
		if (Math.abs(s.tiltGoal - s.tilt) <= 1e-3) return false;
		s.tilt += (s.tiltGoal - s.tilt) * rate;
		relayout();
		return true;
	};
	const io = new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; s.renderer?.kick(); });
	io.observe(canvas);
	const onVis = () => s.renderer?.kick();
	document.addEventListener('visibilitychange', onVis);

	// WebGPU, through vgpu.
	const gpuRenderer = async () => {
		const gpu = await init();
		try {
			const view = surface(gpu, s.el, { dpr: [1, 2], clearColor: [0.043, 0.039, 0.035, 1] });
			const fx = effect(gpu, prismShader);
			await fx.compile(view);
			const time = clock(gpu);
			let needs = 2;
			relayout();
			const loop = frameLoop(gpu, (frame) => {
				if (!s.visible || document.hidden) return;
				const moving = ease(0.06);
				// With reduced motion, frames are drawn only when something changed.
				if (calm.matches && !moving && needs <= 0) return;
				needs--;
				s.glow = calm.matches ? 1 : Math.min(1, s.glow + 0.02);
				const k = view.size[0] / Math.max(1, s.el.clientWidth);
				fx.set({ params: shaderParams(s.geometry, k, [view.size[0], view.size[1]], { time: calm.matches ? 2 : time.time, focus: s.focus, glow: s.glow }) });
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

	// Canvas 2D: the same picture, with the light running along the beams as moving dashes.
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
		const draw = () => {
			raf = 0;
			const dpr = Math.min(2, devicePixelRatio || 1);
			const w = el.clientWidth, h = el.clientHeight;
			if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) { el.width = Math.round(w * dpr); el.height = Math.round(h * dpr); relayout(); }
			const moving = ease(0.08);
			s.glow = calm.matches ? 1 : Math.min(1, s.glow + 0.03);
			const g = s.geometry, u = g.unit, glow = s.glow, focus = s.focus;
			const time = calm.matches ? 2 : (performance.now() - t0) / 1000;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.globalCompositeOperation = 'source-over';
			ctx.fillStyle = '#0b0a09';
			ctx.fillRect(0, 0, w, h);
			ctx.globalCompositeOperation = 'lighter';
			ctx.lineCap = 'round';
			// The white beam, and light running along it into the prism.
			line(g.src, g.entry, 'rgba(255, 250, 242, 0.9)', 2.4 * u, 18 * u);
			if (!calm.matches) {
				ctx.setLineDash([16 * u, 34 * u]);
				ctx.lineDashOffset = -time * 70 * u;
				line(g.src, g.entry, 'rgba(255, 255, 255, 0.5)', 2.4 * u, 0);
				ctx.setLineDash([]);
			}
			// The faint fan between the beams, then the beams.
			ctx.shadowBlur = 0;
			for (let i = 0; i < 4; i++) {
				const mid = [(g.ends[i][0] + g.ends[i + 1][0]) / 2, (g.ends[i][1] + g.ends[i + 1][1]) / 2];
				const grad = ctx.createLinearGradient(g.exit[0], g.exit[1], mid[0], mid[1]);
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
			// The prism: dark glass, a lit rim, and the beam crossing it.
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

	const fallback = (why) => {
		if (s.kind !== 'webgpu') return;
		console.warn(`Prism: WebGPU stopped (${why?.message || why?.reason || 'device lost'}), drawing with Canvas 2D instead.`);
		s.renderer.stop();
		const fresh = s.el.cloneNode(false);
		s.el.replaceWith(fresh);
		s.el = fresh;
		io.disconnect();
		io.observe(fresh);
		s.renderer = canvasRenderer();
	};

	if (navigator.gpu && webgpu) {
		try {
			s.renderer = await gpuRenderer();
		} catch (error) {
			// Plenty of browsers have no WebGPU yet; that's expected, not an error.
			console.info(`Prism: drawing with Canvas 2D (${error?.message || 'WebGPU unavailable'}).`);
			// The canvas may already hold a WebGPU context, so start the fallback on a fresh one.
			const fresh = s.el.cloneNode(false);
			s.el.replaceWith(fresh);
			s.el = fresh;
			io.disconnect();
			io.observe(fresh);
		}
	}
	if (!s.renderer) s.renderer = canvasRenderer();
	if (!s.renderer) { io.disconnect(); document.removeEventListener('visibilitychange', onVis); return null; }
	return {
		get kind() { return s.kind; },
		get canvas() { return s.el; },
		get geometry() { return s.geometry; },
		setFocus(i) { s.focus = i; s.renderer?.kick(); },
		setTilt(t) { s.tiltGoal = Math.max(-1, Math.min(1, t)); s.renderer?.kick(); },
		destroy() { s.renderer?.stop(); s.renderer = null; io.disconnect(); document.removeEventListener('visibilitychange', onVis); },
	};
}

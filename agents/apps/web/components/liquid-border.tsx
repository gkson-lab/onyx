'use client';
import { useEffect, useRef } from 'react';
import { useLive } from '@/lib/api';
import { useLook } from '@/lib/look';

/**
 * Liquid glass round everything. The app is built of slabs of glass (the sidebar and the main pane: data-glass="slab")
 * with panels on them (the chat list, the bar, the composer, bubbles and cards: data-glass="rim"), and the edge of
 * each flows outwards as a lip of liquid glass, its rim a thin line of chromatic chrome. Waves roll along the lips all
 * the time. Slabs and panels that come close melt together, as drops of liquid do. The glass swells towards the
 * pointer near an edge, and moving the pointer there sends ripples through it. While Onyx is answering, the waves run
 * faster and higher, colour flows round the rims and glows out from them, a light runs round the app's edge, and each
 * burst of words drops a ripple into it. What's on a slab or a panel is never covered.
 *
 * The glass follows Apple's "Clear" Liquid Glass, as the macOS 27 and iOS 27 kits in Figma build it: what's behind it
 * shows through, lifted a little (a 6% dodge and a touch of shade); light gathers along its rim (two soft inner
 * highlights); it splits a faint rainbow there (dispersion 0.2); and it casts a soft shadow. The chrome line is the
 * Onyx mark's liquid chrome, two pixels wide round the slabs and a pixel and a half round the panels. The Black chrome
 * look (html[data-look="black"], see lib/look.ts) makes that line black liquid metal whose light splits into hot colour
 * at its edges, and the glass smoky. The Standard look has none of it: the canvas isn't made.
 *
 * It's one transparent WebGL canvas over the app that takes no clicks, drawn by a shader that works only on the pixels
 * near an edge. A panel that scrolls out of view (data-glass-scroll marks the scroller, with the insets its bars
 * cover) draws its glass back in as it goes. An open dialog (aria-modal) has the glass to itself. With reduced motion
 * it stands still; without WebGL 2 there is none.
 */
const SLABS = 4;
const RIMS = 16;
const RIPPLES = 10;

const VERTEX = `#version 300 es
void main() {
	vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
	gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;        // the canvas, in device pixels
uniform vec2 uView;       // the window, in CSS px
uniform float uDpr;
uniform float uTime;      // seconds
uniform float uPhase;     // how far the waves have rolled (they roll faster while Onyx answers)
uniform float uMotion;    // 1, or 0 with reduced motion
uniform vec4 uBand;       // the slabs' glass: its resting width, its waves' height; then the panels' (CSS px)
uniform vec2 uReach;      // how far the glass swells towards the pointer: at the slabs' edges, at the panels'
uniform vec4 uPointer;    // x, y (CSS px), presence 0..1, energy 0..1
uniform vec4 uRipples[${RIPPLES}]; // x, y, age (s), strength
uniform vec2 uAgent;      // Onyx answering (0..1, eased in and out), and a pulse as each burst of words arrives
uniform int uSlabs;
uniform vec4 uSlab[${SLABS}];    // x, y, width, height (CSS px)
uniform vec4 uSlabR[${SLABS}];   // the corners' radii: top left, top right, bottom right, bottom left
uniform int uRims;
uniform vec4 uRim[${RIMS}];
uniform vec4 uRimR[${RIMS}];
uniform vec4 uRimK[${RIMS}];     // how much glass the panel has (less as it scrolls away), whether it glows
uniform float uBlack;     // 1: the Black chrome look; 0: Liquid glass, chromatic
out vec4 outColor;

const float PI = 3.14159265;

// How far p is from a rounded rectangle (negative inside), and which way that grows.
vec3 box(vec2 p, vec4 rect, vec4 rad) {
	vec2 h = rect.zw * 0.5;
	vec2 c = p - rect.xy - h;
	float r = c.x > 0.0 ? (c.y > 0.0 ? rad.z : rad.y) : (c.y > 0.0 ? rad.w : rad.x);
	r = min(r, min(h.x, h.y));
	vec2 q = abs(c) - h + r;
	vec2 o = max(q, 0.0);
	float l = length(o);
	float m = max(q.x, q.y);
	vec2 g = m > 0.0 ? o / max(l, 1e-4) : (q.x > q.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0));
	return vec3(min(m, 0.0) + l - r, vec2(c.x < 0.0 ? -g.x : g.x, c.y < 0.0 ? -g.y : g.y));
}

// Melts shape b into shape a where they come close, as drops of liquid do: x the distance, yz which way it grows;
// what each shape carries (ka, kb) is blended the same way.
void melt(inout vec3 a, inout vec2 ka, vec3 b, vec2 kb, float k) {
	float h = clamp(0.5 + 0.5 * (b.x - a.x) / k, 0.0, 1.0);
	a = vec3(mix(b.x, a.x, h) - k * h * (1.0 - h), mix(b.yz, a.yz, h));
	ka = mix(kb, ka, h);
}

// Waves rolling along the edges both ways. One field over the plane, read along each edge, so the waves run on round
// the corners without a seam. x: about -1 to 1; yz: which way it grows.
vec3 waves(vec2 p, float t) {
	float a = p.x + p.y, b = p.x - p.y;
	float a1 = a * 0.0165 - t * 1.1, b1 = b * 0.0235 + t * 0.85 + 1.3, a2 = a * 0.05 + t * 1.9;
	float da = 0.56 * 0.0165 * cos(a1) + 0.11 * 0.05 * cos(a2), db = 0.33 * 0.0235 * cos(b1);
	return vec3(0.56 * sin(a1) + 0.33 * sin(b1) + 0.11 * sin(a2), da + db, da - db);
}

// How far the glass reaches out at p, and which way that grows: its rest, its waves (their crests a little sharper
// than their troughs), its swell towards the pointer (only on the side of the shape that faces it: away is the way
// the shape's edge faces at p), and the ripples set off by the pointer or by Onyx's words.
vec3 width(vec2 p, vec2 away, vec3 wv, float rest, float height, float reach, float ripple) {
	float w = wv.x;
	float crest = w > 0.0 ? pow(w, 0.8) : w;
	float slope = w > 0.0 ? 0.8 * pow(max(w, 0.03), -0.2) : 1.0;
	float h = rest + height * crest;
	vec2 g = height * slope * wv.yz;
	vec2 d = p - uPointer.xy;
	float faces = smoothstep(-0.15, 0.55, dot(away, -d) / max(length(d), 1.0));
	float swell = uPointer.z * reach * faces * exp(-dot(d, d) / 14000.0);
	h += swell;
	g -= swell * d / 7000.0;
	for (int i = 0; i < ${RIPPLES}; i++) {
		vec4 r = uRipples[i];
		if (r.w <= 0.0) continue;
		vec2 v = p - r.xy;
		float len = max(length(v), 1e-3);
		float front = len - r.z * 260.0;
		float env = r.w * ripple * exp(-r.z * 1.2) * exp(-front * front / 1800.0);
		h += env * sin(front * 0.12);
		g += env * (0.12 * cos(front * 0.12) - front / 900.0 * sin(front * 0.12)) * (v / len);
	}
	return h > 1.5 ? vec3(h, g) : vec3(1.5, 0.0, 0.0);
}

// Black chrome: a dark mirror with two bands of light in it, a bright one above and a dim one below. Each colour reads
// the light a little apart, so the bands' edges split into hot colour, orange and gold on the way into the light and
// blue on the way out, as liquid black metal does.
vec3 blackChrome(float k) {
	vec3 c = k + vec3(0.075, 0.02, -0.065);
	vec3 high = smoothstep(0.55, 0.64, c) * (1.0 - smoothstep(0.84, 0.95, c));
	vec3 low = smoothstep(0.05, 0.11, c) * (1.0 - smoothstep(0.2, 0.27, c));
	return vec3(0.05, 0.055, 0.07) + high * 1.15 + low * 0.42;
}
// The hot colours black chrome splits into: orange, gold, then blue, as x goes from 0 to 1.
vec3 hot(float x) {
	return mix(mix(vec3(1.0, 0.5, 0.16), vec3(1.0, 0.86, 0.45), smoothstep(0.0, 0.35, x)), vec3(0.4, 0.58, 1.0), smoothstep(0.45, 0.9, x));
}

// The glass at p, premultiplied. f: how far p is past the glass's rim (negative inside it), gf: which way that grows;
// edge: how far p is from the slab or panel the glass flows out of. line: the chrome line's half-width; shadow: how
// dark the shadow it casts; light: how bright the glass; amount: how much glass there is; glow: whether it glows while
// Onyx answers; outer: 1 round the slabs, where a light runs round while Onyx answers.
vec4 glass(vec2 p, float f, vec2 gf, float edge, float wave, float line, float shadow, float light, float amount, float glow, float outer) {
	float px = 1.0 / uDpr;
	float t = uTime * uMotion;
	float lit = glow * clamp(0.6 * uAgent.x + 0.5 * uAgent.y, 0.0, 1.0);
	float along = (p.x + p.y) * 0.0045;
	bool black = uBlack > 0.5;
	// While Onyx answers: colour flowing along the glass (a rainbow; in black chrome, its hot colours), and a light
	// running round the app's edge.
	vec3 aura = black ? hot(0.5 + 0.5 * sin(2.0 * PI * (along * 1.6 - t * 0.35))) : 0.5 + 0.5 * cos(2.0 * PI * (along * 1.6 - t * 0.35 + vec3(0.0, 0.33, 0.67)));
	vec2 c = p - uView * 0.5;
	float turn = atan(c.y, c.x) / (2.0 * PI);
	float comet = outer * uAgent.x * uMotion * pow(0.5 + 0.5 * cos(2.0 * PI * (turn - t * 0.4)), 28.0);
	// Out past the rim: the soft shadow the glass casts, and while Onyx answers, a glow of colour instead.
	if (f > line + px) {
		float o = f - line;
		float a = shadow * exp(-o / 9.0) * (1.0 - 0.55 * lit);
		vec3 halo = aura * exp(-o / 11.0) * (0.34 * lit + 0.5 * comet);
		return vec4(halo, a) * amount;
	}
	// Where the glass meets its slab or panel: a hairline of light.
	if (edge < 0.0) return vec4(vec3(0.16 * light * exp(edge / 0.9)), 0.0) * amount;
	vec2 n2 = normalize(gf + vec2(1e-5));
	vec2 dp = p - uPointer.xy;
	vec3 toPointer = normalize(vec3(uPointer.xy - p, 160.0));

	// The glass: what's behind shows through, lifted a little and shaded a touch. Light gathers along its rim (a little
	// more where it faces up or down) and along the edge it flows from; a faint rainbow lies inside the rim, where the
	// glass bends light the most; the pointer's light falls on it. Black chrome's glass is smoky: it darkens what's
	// behind, its rim light is sharper, and inside the rim the light splits gold, then blue.
	float g = max(0.0, -f);
	float facing = 0.65 + 0.35 * abs(n2.y);
	vec3 col;
	float shade;
	if (black) {
		col = vec3(0.02);
		shade = 0.22;
		col += vec3(0.95, 0.97, 1.0) * (exp(-g / 2.0) * 0.3 + exp(-g / 9.0) * 0.05) * facing;
		col += vec3(0.6, 0.65, 0.75) * exp(-edge / 2.0) * 0.08;
		col += vec3(1.0, 0.56, 0.2) * exp(-pow((g - 1.8) / 1.1, 2.0)) * 0.2 + vec3(0.32, 0.5, 1.0) * exp(-pow((g - 4.2) / 1.6, 2.0)) * 0.16;
	} else {
		col = vec3(0.045);
		shade = 0.07;
		col += vec3(0.95, 0.97, 1.0) * (exp(-g / 2.6) * 0.34 + exp(-g / 11.0) * 0.07) * facing;
		col += vec3(0.6, 0.65, 0.75) * exp(-edge / 2.5) * 0.10;
		vec3 spectrum = 0.5 + 0.5 * cos(2.0 * PI * (g / 6.0 - t * 0.05 + vec3(0.0, 0.33, 0.67)));
		col += spectrum * exp(-g / 4.5) * 0.15;
	}
	col += vec3(0.11) * uPointer.z * exp(-dot(dp, dp) / 9000.0);
	col += aura * (exp(-g / 5.0) * 0.3 + 0.05) * lit + vec3(comet * 0.35);
	col *= light;

	// The chrome line along the rim: a thin tube of liquid chrome, shaded across its width as chrome is, its colours
	// flowing along it as bands of a rainbow (faster, and stronger, while Onyx answers). In black chrome it's dark
	// where the rim faces away from the light (up and to the left) and catches the bright band where it faces it; the
	// waves tilt it in and out of the light, so the band's hot edges run along it, and while Onyx answers glints race
	// along it too.
	float u = clamp(f / line, -1.0, 1.0);
	vec3 n = normalize(vec3(n2 * u, sqrt(max(0.0, 1.0 - u * u))));
	vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
	vec3 chrome;
	if (black) {
		float toward = dot(n2, normalize(vec2(-0.45, -0.9)));
		chrome = blackChrome(0.5 + 0.42 * toward + 0.2 * wave + 0.05 * u + lit * 0.22 * sin(2.0 * PI * (along * 1.4 - t * 0.5)));
		chrome += vec3(0.32) * smoothstep(0.35, 1.0, u);
	} else {
		float flow = along - t * (0.12 + 0.5 * lit) + 0.08 * wave;
		vec3 hue = 0.5 + 0.5 * cos(2.0 * PI * (flow + vec3(0.0, 0.33, 0.67)));
		float shine = 0.5 + 0.5 * clamp(-r.y * 1.6 + 0.4, 0.0, 1.0);
		chrome = mix(vec3(shine), hue * (0.35 + 0.85 * shine), 0.6 + 0.3 * lit) + hue * 0.35 * lit;
	}
	chrome += pow(max(dot(r, normalize(vec3(-0.5, -0.7, 0.5))), 0.0), 20.0) * 0.7;
	chrome += pow(max(dot(r, toPointer), 0.0), 30.0) * 1.4 * uPointer.z;
	chrome += vec3(comet * 1.5);
	float cover = (1.0 - smoothstep(line - px, line + px, abs(f))) * amount;
	return vec4(mix(col * amount, chrome, cover), mix(shade * amount, 1.0, cover));
}

void main() {
	vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
	float busy = uAgent.x;
	// The slabs, melted together where they come close.
	vec3 s = vec3(1e5, 0.0, 0.0);
	vec2 sk = vec2(1.0);
	float edge = 1e5;
	for (int i = 0; i < ${SLABS}; i++) {
		if (i >= uSlabs) break;
		vec3 b = box(p, uSlab[i], uSlabR[i]);
		edge = min(edge, b.x);
		melt(s, sk, b, vec2(1.0), 28.0);
	}
	// Off the slabs (or at their very edge): their glass, flowing out into the margin and the gaps between them.
	if (edge > -3.0) {
		if (s.x > 140.0) discard;
		vec3 wv = waves(p, uPhase * uMotion);
		vec3 w = width(p, s.yz, wv, uBand.x * (1.0 + 0.3 * busy), uBand.y * (1.0 + 0.7 * busy), uReach.x, 9.0);
		outColor = glass(p, s.x - w.x, s.yz - w.yz, edge, wv.x, 1.0, 0.22, 1.0, 1.0, 1.0, 1.0);
		return;
	}
	// On a slab: the glass round the panels on it. A panel too far away for its glass to reach is skipped; a pixel on
	// a panel is left alone.
	vec3 f = vec3(1e5, 0.0, 0.0);
	vec2 fk = vec2(0.0);
	float inner = 1e5;
	for (int i = 0; i < ${RIMS}; i++) {
		if (i >= uRims) break;
		vec4 r = uRim[i];
		if (p.x < r.x - 72.0 || p.y < r.y - 72.0 || p.x > r.x + r.z + 72.0 || p.y > r.y + r.w + 72.0) continue;
		vec3 b = box(p, r, uRimR[i]);
		inner = min(inner, b.x);
		if (inner < -3.0) discard;
		melt(f, fk, b, uRimK[i].xy, 10.0);
	}
	if (f.x > 70.0) discard;
	vec3 wv = waves(p, uPhase * uMotion);
	vec3 w = width(p, f.yz, wv, uBand.z * (1.0 + 0.3 * busy), uBand.w * (1.0 + 0.7 * busy), uReach.y, 4.0);
	outColor = glass(p, f.x - w.x * fk.x, f.yz - w.yz * fk.x, inner, wv.x, 0.75, 0.15, 0.8, fk.x, fk.y, 0.0);
}`;

interface Ripple { x: number; y: number; born: number; strength: number }
interface Shape { x: number; y: number; w: number; h: number; r: number[]; amount: number; glow: number }

// A panel's corners, from its style. Kept: they don't change as it moves.
const cornersOf = new WeakMap<Element, number[]>();
const corners = (el: Element) => {
	let r = cornersOf.get(el);
	if (!r) {
		const s = getComputedStyle(el);
		r = [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius].map((v) => parseFloat(v) || 0);
		cornersOf.set(el, r);
	}
	return r;
};
// The scroller a panel sits in, if any.
const scrollerOf = new WeakMap<Element, HTMLElement | null>();

// How far a point is from a shape's edge (negative inside), as the shader measures it.
const distance = (x: number, y: number, s: Shape) => {
	const hw = s.w / 2, hh = s.h / 2, cx = x - s.x - hw, cy = y - s.y - hh;
	const r = Math.min(cx > 0 ? (cy > 0 ? s.r[2]! : s.r[1]!) : cy > 0 ? s.r[3]! : s.r[0]!, hw, hh);
	const qx = Math.abs(cx) - hw + r, qy = Math.abs(cy) - hh + r;
	return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
};
const nearest = (x: number, y: number, shapes: Shape[]) => shapes.reduce((m, s) => Math.min(m, Math.abs(distance(x, y, s))), 1e4);

/** The slabs and panels on screen now: an open dialog's alone, if one is open. */
function collect(slabs: Shape[], rims: Shape[]) {
	slabs.length = 0;
	rims.length = 0;
	const dialog = document.querySelector('[aria-modal="true"]');
	for (const el of (dialog ?? document).querySelectorAll<HTMLElement>('[data-glass]')) {
		const b = el.getBoundingClientRect();
		if (b.width < 4 || b.height < 4 || b.bottom < -60 || b.right < -60 || b.top > innerHeight + 60 || b.left > innerWidth + 60) continue;
		const slab = !!dialog || el.dataset.glass === 'slab';
		let amount = 1;
		if (!slab) {
			let sc = scrollerOf.get(el);
			if (sc === undefined) scrollerOf.set(el, (sc = el.parentElement?.closest<HTMLElement>('[data-glass-scroll]') ?? null));
			if (sc) {
				// Its glass draws in over the last 28 px before it leaves the clear part of the scroller.
				const v = sc.getBoundingClientRect();
				const [top = 0, bottom = 0] = (sc.dataset.glassScroll || '').split(' ').map((n) => Number(n) || 0);
				const inside = Math.min(b.top - (v.top + top), v.bottom - bottom - b.bottom);
				amount = inside >= 0 ? 1 : Math.max(0, 1 + inside / 28);
			}
		}
		if (amount <= 0.01) continue;
		const list = slab ? slabs : rims;
		if (list.length < (slab ? SLABS : RIMS)) list.push({ x: b.left, y: b.top, w: b.width, h: b.height, r: corners(el), amount, glow: slab || el.hasAttribute('data-glass-glow') ? 1 : 0 });
	}
}

// A point on a slab's edge, anywhere round it.
const onEdge = (s: Shape): [number, number] => {
	let u = Math.random() * 2 * (s.w + s.h);
	if (u < s.w) return [s.x + u, s.y];
	if ((u -= s.w) < s.h) return [s.x + s.w, s.y + u];
	if ((u -= s.h) < s.w) return [s.x + s.w - u, s.y + s.h];
	return [s.x, s.y + s.h - (u - s.w)];
};

export function LiquidBorder() {
	const ref = useRef<HTMLCanvasElement>(null);
	const { live } = useLive();
	// Only the two glass looks have liquid glass; Standard has no canvas at all.
	const on = useLook() !== 'standard';
	// Onyx answering: any run in progress, and the words its answers have streamed so far.
	const busy = Object.values(live.nodes).some((n) => n.status === 'running');
	const words = Object.values(live.text).reduce((n, t) => n + t.length, 0);
	const agent = useRef({ busy: false, words: 0, pulse: 0, drop: 0, kick: () => {} });
	useEffect(() => {
		agent.current.busy = busy;
		document.documentElement.toggleAttribute('data-answering', busy);
		agent.current.kick();
		return () => document.documentElement.removeAttribute('data-answering');
	}, [busy]);
	useEffect(() => {
		const a = agent.current;
		if (words > a.words) {
			a.pulse = Math.min(1, a.pulse + 0.45);
			a.drop++;
			a.kick();
		}
		a.words = words;
	}, [words]);

	useEffect(() => {
		const canvas = ref.current;
		if (!on || !canvas) return;
		const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
		if (!gl) return;
		const shader = (type: number, src: string) => {
			const s = gl.createShader(type)!;
			gl.shaderSource(s, src);
			gl.compileShader(s);
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
			return s;
		};
		let prog: WebGLProgram;
		try {
			prog = gl.createProgram()!;
			gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERTEX));
			gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAGMENT));
			gl.linkProgram(prog);
			if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link');
		} catch (error) {
			console.warn('Onyx: the liquid glass is off,', error);
			return;
		}
		gl.useProgram(prog);
		gl.bindVertexArray(gl.createVertexArray());
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		const at = (n: string) => gl.getUniformLocation(prog, n);
		const u = {
			res: at('uRes'), view: at('uView'), dpr: at('uDpr'), time: at('uTime'), phase: at('uPhase'), motion: at('uMotion'), band: at('uBand'), reach: at('uReach'),
			pointer: at('uPointer'), ripples: at('uRipples'), agent: at('uAgent'), slabs: at('uSlabs'), slab: at('uSlab'), slabR: at('uSlabR'), rims: at('uRims'), rim: at('uRim'), rimR: at('uRimR'), rimK: at('uRimK'), black: at('uBlack'),
		};

		const calm = matchMedia('(prefers-reduced-motion: reduce)');
		const touch = matchMedia('(pointer: coarse)');
		const rippleData = new Float32Array(RIPPLES * 4);
		const slabData = new Float32Array(SLABS * 4), slabCorners = new Float32Array(SLABS * 4);
		const rimData = new Float32Array(RIMS * 4), rimCorners = new Float32Array(RIMS * 4), rimKind = new Float32Array(RIMS * 4);
		const slabs: Shape[] = [], rims: Shape[] = [];
		const pointer = { x: -9999, y: -9999, presence: 0, target: 0, energy: 0, lastX: 0, lastY: 0, lastT: 0, rippleX: -9999, rippleY: -9999 };
		const ripples: Ripple[] = [];
		const a = agent.current;
		const start = performance.now();
		let raf = 0, last = 0, drawn = 0, phase = 0, active = 0, dropped = a.drop, lastDrop = 0, scrolling = 0;

		const size = () => {
			const dpr = Math.min(devicePixelRatio || 1, 1.5);
			const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
			if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
			return dpr;
		};
		const pack = (list: Shape[], data: Float32Array, cornerData: Float32Array, kind?: Float32Array) => {
			data.fill(0);
			list.forEach((s, i) => {
				data.set([s.x, s.y, s.w, s.h], i * 4);
				cornerData.set(s.r, i * 4);
				kind?.set([s.amount, s.glow, 0, 0], i * 4);
			});
		};
		const draw = (now: number) => {
			const dpr = size();
			collect(slabs, rims);
			const t = (now - start) / 1000;
			const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
			last = now;
			pointer.presence += (pointer.target - pointer.presence) * Math.min(1, dt * 5);
			pointer.energy *= Math.exp(-dt * 2.2);
			// Onyx answering eases in and out; each burst of words pulses, and drops a ripple somewhere on the app's edge.
			active += ((a.busy ? 1 : 0) - active) * Math.min(1, dt * 2.4);
			a.pulse *= Math.exp(-dt * 2.6);
			if (a.drop !== dropped && now - lastDrop > 140 && slabs.length) {
				dropped = a.drop;
				lastDrop = now;
				const [x, y] = onEdge(slabs.reduce((m, s) => (s.w * s.h > m.w * m.h ? s : m)));
				ripples.push({ x, y, born: t, strength: 0.55 });
			}
			phase += dt * (1 + 1.5 * active);
			for (let i = ripples.length - 1; i >= 0; i--) if (t - ripples[i]!.born > 3) ripples.splice(i, 1);
			rippleData.fill(0);
			ripples.slice(-RIPPLES).forEach((r, i) => rippleData.set([r.x, r.y, t - r.born, r.strength], i * 4));
			pack(slabs, slabData, slabCorners);
			pack(rims, rimData, rimCorners, rimKind);
			// A phone gets thinner glass, as the screen is small and there's no pointer to reach for.
			const narrow = touch.matches || innerWidth < 700;
			const still = calm.matches;
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.uniform2f(u.res, canvas.width, canvas.height);
			gl.uniform2f(u.view, innerWidth, innerHeight);
			gl.uniform1f(u.dpr, dpr);
			gl.uniform1f(u.time, t);
			gl.uniform1f(u.phase, phase);
			gl.uniform1f(u.motion, still ? 0 : 1);
			gl.uniform4f(u.band, narrow ? 5 : 13, narrow ? 2.5 : 8, narrow ? 2.5 : 4.5, narrow ? 1.2 : 2.5);
			gl.uniform2f(u.reach, (18 + 16 * pointer.energy) * Math.exp(-nearest(pointer.x, pointer.y, slabs) / 110), (7 + 7 * pointer.energy) * Math.exp(-nearest(pointer.x, pointer.y, rims) / 50));
			gl.uniform4f(u.pointer, pointer.x, pointer.y, still ? 0 : pointer.presence, pointer.energy);
			gl.uniform4fv(u.ripples, still ? rippleData.fill(0) : rippleData);
			gl.uniform2f(u.agent, active, still ? 0 : a.pulse);
			gl.uniform1i(u.slabs, slabs.length);
			gl.uniform4fv(u.slab, slabData);
			gl.uniform4fv(u.slabR, slabCorners);
			gl.uniform1i(u.rims, rims.length);
			gl.uniform4fv(u.rim, rimData);
			gl.uniform4fv(u.rimR, rimCorners);
			gl.uniform4fv(u.rimK, rimKind);
			gl.uniform1f(u.black, document.documentElement.dataset.look === 'black' ? 1 : 0);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		};
		// Every frame while something moves it (the pointer, a ripple, Onyx answering, a scroll); 30 a second when only
		// its own waves move; with reduced motion, only when something changes.
		const loop = (now: number) => {
			raf = 0;
			if (document.hidden) return;
			const lively = pointer.energy > 0.02 || ripples.length > 0 || Math.abs(pointer.presence - pointer.target) > 0.01 || a.busy || active > 0.01 || a.pulse > 0.01 || now < scrolling;
			if (!calm.matches && !lively && now - drawn < 31) { raf = requestAnimationFrame(loop); return; }
			drawn = now;
			draw(now);
			if (!calm.matches || Math.abs((a.busy ? 1 : 0) - active) > 0.01) raf = requestAnimationFrame(loop);
		};
		const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
		a.kick = kick;
		const move = (e: PointerEvent) => {
			if (e.pointerType === 'touch') return;
			const now = performance.now();
			const speed = pointer.lastT ? Math.hypot(e.clientX - pointer.lastX, e.clientY - pointer.lastY) / Math.max(8, now - pointer.lastT) : 0;
			pointer.lastX = e.clientX; pointer.lastY = e.clientY; pointer.lastT = now;
			pointer.x = e.clientX; pointer.y = e.clientY; pointer.target = 1;
			pointer.energy = Math.min(1, Math.max(pointer.energy, speed * 0.8));
			// Near an edge, every 36 px or so of travel drops a ripple into the glass, stronger the faster it went.
			const near = Math.min(nearest(e.clientX, e.clientY, slabs) / 90, nearest(e.clientX, e.clientY, rims) / 50);
			if (near < 1 && Math.hypot(e.clientX - pointer.rippleX, e.clientY - pointer.rippleY) > 36) {
				pointer.rippleX = e.clientX; pointer.rippleY = e.clientY;
				ripples.push({ x: e.clientX, y: e.clientY, born: (now - start) / 1000, strength: Math.min(1, 0.3 + speed * 0.7) * (1 - near * 0.8) });
			}
			kick();
		};
		const leave = () => { pointer.target = 0; kick(); };
		const scroll = () => { scrolling = performance.now() + 200; kick(); };
		window.addEventListener('pointermove', move, { passive: true });
		window.addEventListener('scroll', scroll, { passive: true, capture: true });
		document.documentElement.addEventListener('pointerleave', leave);
		document.addEventListener('visibilitychange', kick);
		window.addEventListener('resize', kick);
		kick();
		return () => {
			cancelAnimationFrame(raf);
			a.kick = () => {};
			window.removeEventListener('pointermove', move);
			window.removeEventListener('scroll', scroll, { capture: true });
			window.removeEventListener('resize', kick);
			document.documentElement.removeEventListener('pointerleave', leave);
			document.removeEventListener('visibilitychange', kick);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	}, [on]);
	return on ? <canvas ref={ref} aria-hidden className="liquid-border" /> : null;
}

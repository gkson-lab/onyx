// One white beam (your message) into a glass prism (Onyx Core), five coloured beams out (the specialists).
// All positions arrive in canvas pixels from prism.js, which uses the same numbers to place the agents' labels.

struct Params {
	res: vec2f,
	time: f32,
	focus: f32, // the beam to light up, 0 to 4, or -1 for none
	a: vec2f, // the prism's corners
	b: vec2f,
	c: vec2f,
	entry: vec2f, // where the white beam meets the prism
	exit: vec2f, // where the coloured beams leave it
	src: vec2f, // where the white beam starts
	ends: array<vec4f, 5>, // xy: where each coloured beam ends
	cols: array<vec4f, 5>, // each beam's colour
	unit: f32, // one "pixel" of the design, in canvas pixels
	glow: f32, // overall brightness, for fading in
	_pad: vec2f,
}
@group(0) @binding(0) var<uniform> params: Params;

fn seg(p: vec2f, a: vec2f, b: vec2f) -> vec2f {
	let pa = p - a;
	let ba = b - a;
	let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
	return vec2f(length(pa - ba * h), h);
}

fn edge(p: vec2f, a: vec2f, b: vec2f) -> f32 {
	return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

fn hash(p: vec2f) -> f32 {
	return fract(sin(dot(p, vec2f(12.9898, 78.233))) * 43758.5453);
}

// A spectrum from red (0) to violet (1), for the faint fan between the five beams.
fn spectrum(t: f32) -> vec3f {
	let r = (1.0 - smoothstep(0.0, 0.55, t)) + smoothstep(0.85, 1.0, t) * 0.5;
	let g = smoothstep(0.0, 0.35, t) * (1.0 - smoothstep(0.45, 0.85, t));
	let b = smoothstep(0.4, 0.85, t);
	return vec3f(r, g, b);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
	let p = uv * params.res;
	let u = params.unit;
	let t = params.time;
	var col = vec3f(0.0);

	// The incoming white beam, with a soft halo and light running along it.
	let dIn = seg(p, params.src, params.entry);
	let wIn = 1.6 * u;
	let run = 0.82 + 0.18 * sin(dIn.y * 26.0 - t * 5.0);
	col += vec3f(1.0, 0.98, 0.95) * (exp(-dIn.x * dIn.x / (wIn * wIn)) * 1.3 + exp(-dIn.x / (14.0 * u)) * 0.12) * run;

	// The prism: dark glass with a lit rim, a faint glow inside, and the beam crossing it.
	let e0 = edge(p, params.a, params.b);
	let e1 = edge(p, params.b, params.c);
	let e2 = edge(p, params.c, params.a);
	let inside = (e0 >= 0.0 && e1 >= 0.0 && e2 >= 0.0) || (e0 <= 0.0 && e1 <= 0.0 && e2 <= 0.0);
	let rim = min(seg(p, params.a, params.b).x, min(seg(p, params.b, params.c).x, seg(p, params.c, params.a).x));
	let centre = (params.a + params.b + params.c) / 3.0;
	if (inside) {
		let depth = length(p - centre) / length(params.a - centre);
		col += vec3f(0.10, 0.10, 0.12) * (1.0 - depth * 0.6);
		let dMid = seg(p, params.entry, params.exit);
		col += mix(vec3f(1.0), spectrum(dMid.y), dMid.y) * exp(-dMid.x / (6.0 * u)) * 0.5;
	}
	col += vec3f(0.9, 0.92, 1.0) * (exp(-rim * rim / (0.9 * u * u)) * 0.9 + exp(-rim / (10.0 * u)) * 0.08);

	// The five beams out, and a faint rainbow fan between them.
	let first = normalize(params.ends[0].xy - params.exit);
	let last = normalize(params.ends[4].xy - params.exit);
	let toP = p - params.exit;
	let along = length(toP);
	let dir = toP / max(along, 1e-3);
	let span = acos(clamp(dot(first, last), -1.0, 1.0));
	let fromFirst = acos(clamp(dot(first, dir), -1.0, 1.0));
	let fromLast = acos(clamp(dot(last, dir), -1.0, 1.0));
	let outsidePrism = !inside;
	if (outsidePrism && abs(fromFirst + fromLast - span) < 0.002 && along > 2.0 * u) {
		col += spectrum(fromFirst / max(span, 1e-3)) * 0.09 * smoothstep(0.0, 140.0 * u, along) * params.glow;
	}
	for (var i = 0u; i < 5u; i = i + 1u) {
		let d = seg(p, params.exit, params.ends[i].xy);
		let w = (1.4 + d.y * 3.0) * u;
		let lit = select(1.0, select(0.35, 1.9, f32(i) == params.focus), params.focus >= 0.0);
		let pulse = 0.78 + 0.22 * sin(d.y * 30.0 - t * 4.0 - f32(i) * 1.3);
		let beam = exp(-d.x * d.x / (w * w)) + exp(-d.x / (16.0 * u)) * 0.14;
		col += params.cols[i].rgb * beam * lit * pulse * select(0.0, 1.0, outsidePrism) * params.glow;
	}

	// A little grain, and a gentle curve so the brightest light stays soft.
	col += (hash(p + fract(t) * 91.0) - 0.5) * 0.02;
	col = col / (1.0 + col * 0.55);
	let base = vec3f(0.043, 0.039, 0.035);
	return vec4f(base + col, 1.0);
}

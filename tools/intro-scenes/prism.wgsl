// A glass prism in 3D: one white beam (your message) goes in, five coloured beams (the specialists) come out.
// Each view ray is traced through the glass three times, once per colour channel, with a different index of
// refraction for each, so the glass splits light the way a real prism does: rainbow fringes on its edges and on
// whatever is seen through it. The beams' paths are worked out in prism.js with Snell's law, and arrive here as
// points in the plane through the middle of the prism. prism.frag is the same shader for WebGL 2; keep them in step.

struct Params {
	res: vec2f,
	time: f32,
	focus: f32, // the beam to light up, 0 to 4, or -1 for none
	camPos: vec4f,
	camRight: vec4f,
	camUp: vec4f,
	camFwd: vec4f, // w: tan(half the vertical field of view)
	src: vec4f, // where the white beam starts
	entry: vec4f, // where it enters the glass
	exits: array<vec4f, 5>, // where each coloured beam leaves the glass
	ends: array<vec4f, 5>, // where each coloured beam ends
	cols: array<vec4f, 5>, // each beam's colour
	misc: vec4f, // x: brightness (fades in), y: the prism's half-length, z: grain, w: unused
}
@group(0) @binding(0) var<uniform> params: Params;

const R_IN: f32 = 0.5773503; // the triangle's inradius: every side face is this far from the axis
const S3H: f32 = 0.8660254;
const IOR: vec3f = vec3f(1.47, 1.52, 1.58); // red, green and blue: exaggerated, so the dispersion shows

struct Hit { tn: f32, tf: f32, nn: vec3f, nf: vec3f }

fn faceN(i: u32) -> vec3f {
	switch i {
		case 0u: { return vec3f(-S3H, 0.5, 0.0); }
		case 1u: { return vec3f(S3H, 0.5, 0.0); }
		case 2u: { return vec3f(0.0, -1.0, 0.0); }
		case 3u: { return vec3f(0.0, 0.0, 1.0); }
		default: { return vec3f(0.0, 0.0, -1.0); }
	}
}
fn faceK(i: u32) -> f32 { return select(R_IN, params.misc.y, i >= 3u); }

// The ray against the prism, as the intersection of its five half-spaces: where it enters (tn) and leaves (tf),
// and the outward normals there.
fn prism(o: vec3f, d: vec3f) -> Hit {
	var h: Hit;
	h.tn = -1e9;
	h.tf = 1e9;
	h.nn = vec3f(0.0, 1.0, 0.0);
	h.nf = vec3f(0.0, 1.0, 0.0);
	for (var i = 0u; i < 5u; i = i + 1u) {
		let n = faceN(i);
		let den = dot(n, d);
		let num = faceK(i) - dot(n, o);
		if (abs(den) < 1e-6) {
			if (num < 0.0) { h.tn = 1e9; h.tf = -1e9; }
			continue;
		}
		let t = num / den;
		if (den < 0.0) {
			if (t > h.tn) { h.tn = t; h.nn = n; }
		} else {
			if (t < h.tf) { h.tf = t; h.nf = n; }
		}
	}
	return h;
}

// Closest approach between the ray o + s d (s from s0 to s1) and the segment a to b: (distance, how far along it).
fn seg(o: vec3f, d: vec3f, s0: f32, s1: f32, a: vec3f, b: vec3f) -> vec2f {
	let v = b - a;
	let w0 = o - a;
	let bb = dot(d, v);
	let cc = max(dot(v, v), 1e-6);
	let dd = dot(d, w0);
	let ee = dot(v, w0);
	let den = max(cc - bb * bb, 1e-6);
	var u = clamp((ee - dd * bb) / den, 0.0, 1.0);
	let s = clamp(dot(a + v * u - o, d), s0, s1);
	u = clamp(dot(o + d * s - a, v) / cc, 0.0, 1.0);
	return vec2f(length(o + d * s - (a + v * u)), u);
}

fn glow(dist: f32, width: f32) -> f32 {
	let x = dist / width;
	return exp(-x * x) + 0.1 * exp(-dist / (width * 8.0));
}

fn lit(i: u32) -> f32 {
	return select(1.0, select(0.3, 1.8, f32(i) == params.focus), params.focus >= 0.0);
}

// The beams in open air, seen along a stretch of a ray.
fn outside(o: vec3f, d: vec3f, s0: f32, s1: f32) -> vec3f {
	let t = params.time;
	var c = vec3f(0.0);
	let w = seg(o, d, s0, s1, params.src.xyz, params.entry.xyz);
	c += vec3f(1.0, 0.97, 0.93) * glow(w.x, 0.022) * 1.5 * (0.82 + 0.18 * sin(w.y * 42.0 - t * 5.0));
	for (var i = 0u; i < 5u; i = i + 1u) {
		let b = seg(o, d, s0, s1, params.exits[i].xyz, params.ends[i].xyz);
		let pulse = 0.74 + 0.26 * sin(b.y * 36.0 - t * 4.0 - f32(i) * 1.3);
		c += params.cols[i].rgb * glow(b.x, 0.018 * (1.0 + b.y * 1.4)) * lit(i) * pulse * params.misc.x;
	}
	return c;
}

// The fan inside the glass: white where it enters, each colour where it leaves.
fn inside(o: vec3f, d: vec3f, s0: f32, s1: f32) -> vec3f {
	var c = vec3f(0.0);
	for (var i = 0u; i < 5u; i = i + 1u) {
		let b = seg(o, d, s0, s1, params.entry.xyz, params.exits[i].xyz);
		let tint = mix(vec3f(1.0), params.cols[i].rgb, smoothstep(0.0, 0.85, b.y));
		c += tint * glow(b.x, 0.014) * 0.6 * lit(i) * params.misc.x;
	}
	return c;
}

// A dark studio: a soft light overhead and to the left, a bright strip to the right, a faint cool sky.
fn env(d: vec3f) -> vec3f {
	let top = pow(max(dot(d, normalize(vec3f(-0.45, 1.0, 0.35))), 0.0), 18.0) * 2.4;
	let strip = smoothstep(0.93, 0.985, dot(d, normalize(vec3f(1.0, 0.25, 0.55)))) * 1.6;
	let front = pow(max(dot(d, normalize(vec3f(0.25, 0.35, 1.0))), 0.0), 5.0) * 0.32;
	let sky = smoothstep(-0.1, 0.8, d.y) * 0.1;
	return vec3f(0.012, 0.012, 0.016) + vec3f(1.0, 0.97, 0.92) * (top + strip + front) + vec3f(0.55, 0.65, 0.9) * sky;
}

fn fresnel(cosi: f32) -> f32 { return 0.04 + 0.96 * pow(1.0 - clamp(cosi, 0.0, 1.0), 5.0); }

// Channel c (0, 1, 2) of a colour, without indexing a vector by a runtime value.
fn pick(v: vec3f, c: u32) -> f32 { return dot(v, vec3f(f32(c == 0u), f32(c == 1u), f32(c == 2u))); }

// One colour channel's light through the glass: in at p, bouncing inside up to twice, out into the room.
fn through(p: vec3f, d: vec3f, n: vec3f, c: u32) -> f32 {
	let eta = pick(IOR, c);
	var dir = refract(d, n, 1.0 / eta);
	var pos = p;
	var keep = 1.0;
	var acc = 0.0;
	for (var b = 0u; b < 3u; b = b + 1u) {
		let h = prism(pos + dir * 1e-3, dir);
		let len = max(h.tf, 0.0) + 1e-3;
		acc += pick(inside(pos, dir, 0.0, len), c) * keep;
		let q = pos + dir * len;
		let ex = refract(dir, -h.nf, eta);
		if (dot(ex, ex) > 0.0) {
			let f = fresnel(dot(dir, h.nf));
			acc += pick(outside(q + ex * 1e-3, ex, 0.0, 60.0) + env(ex) * 0.35, c) * keep * (1.0 - f);
			keep *= f;
		}
		dir = reflect(dir, -h.nf);
		pos = q;
		if (keep < 0.02) { break; }
	}
	// A whisper of absorption, a little more in red, so thick glass reads faintly cool.
	return acc * select(1.0, 0.93, c == 0u);
}

fn hash(p: vec2f) -> f32 { return fract(sin(dot(p, vec2f(12.9898, 78.233))) * 43758.5453); }

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
	let aspect = params.res.x / params.res.y;
	let th = params.camFwd.w;
	let o = params.camPos.xyz;
	let d = normalize(params.camFwd.xyz + params.camRight.xyz * ((uv.x * 2.0 - 1.0) * th * aspect) + params.camUp.xyz * ((1.0 - uv.y * 2.0) * th));
	// A dark room, a little lighter in the middle.
	let v = uv - vec2f(0.5);
	var col = vec3f(0.03, 0.028, 0.034) * (1.0 - dot(v, v) * 1.6);
	let h = prism(o, d);
	if (h.tn < h.tf && h.tn > 0.0) {
		let p = o + d * h.tn;
		let n = h.nn;
		let f = fresnel(-dot(d, n));
		let rd = reflect(d, n);
		let refl = env(rd) + outside(p + rd * 1e-3, rd, 0.0, 60.0) * 0.5;
		let trans = vec3f(through(p, d, n, 0u), through(p, d, n, 1u), through(p, d, n, 2u));
		col = col * 0.25 + outside(o, d, 0.0, h.tn) + refl * f + (trans + vec3f(0.02, 0.026, 0.036)) * (1.0 - f);
		// The edges catch the light, each channel a hair wider than the last: a thin rainbow on every edge.
		var d1 = 1e9;
		var d2 = 1e9;
		for (var i = 0u; i < 5u; i = i + 1u) {
			let k = abs(faceK(i) - dot(faceN(i), p));
			if (k < d1) { d2 = d1; d1 = k; } else if (k < d2) { d2 = k; }
		}
		let shine = 0.55 + 0.45 * max(dot(n, normalize(vec3f(-0.3, 1.0, 0.5))), 0.0);
		let e = vec3f(exp(-pow(d2 / 0.010, 2.0)), exp(-pow(d2 / 0.013, 2.0)), exp(-pow(d2 / 0.017, 2.0)));
		col += e * shine * 0.9 + vec3f(exp(-d2 / 0.06)) * 0.05;
	} else {
		col += outside(o, d, 0.0, 60.0);
	}
	col = col / (1.0 + col * 0.55);
	col += (hash(uv * params.res + fract(params.time) * 61.0) - 0.5) * params.misc.z;
	return vec4f(col, 1.0);
}

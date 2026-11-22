#version 300 es
// The prism for WebGL 2: the same picture as prism.wgsl, line for line, for browsers without WebGPU. Keep them in step.
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uFocus;
uniform vec4 uCamPos;
uniform vec4 uCamRight;
uniform vec4 uCamUp;
uniform vec4 uCamFwd;
uniform vec4 uSrc;
uniform vec4 uEntry;
uniform vec4 uExits[5];
uniform vec4 uEnds[5];
uniform vec4 uCols[5];
uniform vec4 uMisc;
out vec4 fragColor;

const float R_IN = 0.5773503;
const float S3H = 0.8660254;
const vec3 IOR = vec3(1.47, 1.52, 1.58);

struct Hit { float tn; float tf; vec3 nn; vec3 nf; };

vec3 faceN(int i) {
	if (i == 0) return vec3(-S3H, 0.5, 0.0);
	if (i == 1) return vec3(S3H, 0.5, 0.0);
	if (i == 2) return vec3(0.0, -1.0, 0.0);
	if (i == 3) return vec3(0.0, 0.0, 1.0);
	return vec3(0.0, 0.0, -1.0);
}
float faceK(int i) { return i >= 3 ? uMisc.y : R_IN; }

Hit prism(vec3 o, vec3 d) {
	Hit h = Hit(-1e9, 1e9, vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 0.0));
	for (int i = 0; i < 5; i++) {
		vec3 n = faceN(i);
		float den = dot(n, d);
		float num = faceK(i) - dot(n, o);
		if (abs(den) < 1e-6) {
			if (num < 0.0) { h.tn = 1e9; h.tf = -1e9; }
			continue;
		}
		float t = num / den;
		if (den < 0.0) {
			if (t > h.tn) { h.tn = t; h.nn = n; }
		} else {
			if (t < h.tf) { h.tf = t; h.nf = n; }
		}
	}
	return h;
}

vec2 seg(vec3 o, vec3 d, float s0, float s1, vec3 a, vec3 b) {
	vec3 v = b - a;
	vec3 w0 = o - a;
	float bb = dot(d, v);
	float cc = max(dot(v, v), 1e-6);
	float dd = dot(d, w0);
	float ee = dot(v, w0);
	float den = max(cc - bb * bb, 1e-6);
	float u = clamp((ee - dd * bb) / den, 0.0, 1.0);
	float s = clamp(dot(a + v * u - o, d), s0, s1);
	u = clamp(dot(o + d * s - a, v) / cc, 0.0, 1.0);
	return vec2(length(o + d * s - (a + v * u)), u);
}

float glow(float dist, float width) {
	float x = dist / width;
	return exp(-x * x) + 0.1 * exp(-dist / (width * 8.0));
}

float lit(int i) {
	if (uFocus < 0.0) return 1.0;
	return float(i) == uFocus ? 1.8 : 0.3;
}

vec3 outside(vec3 o, vec3 d, float s0, float s1) {
	float t = uTime;
	vec3 c = vec3(0.0);
	vec2 w = seg(o, d, s0, s1, uSrc.xyz, uEntry.xyz);
	c += vec3(1.0, 0.97, 0.93) * glow(w.x, 0.022) * 1.5 * (0.82 + 0.18 * sin(w.y * 42.0 - t * 5.0));
	for (int i = 0; i < 5; i++) {
		vec2 b = seg(o, d, s0, s1, uExits[i].xyz, uEnds[i].xyz);
		float pulse = 0.74 + 0.26 * sin(b.y * 36.0 - t * 4.0 - float(i) * 1.3);
		c += uCols[i].rgb * glow(b.x, 0.018 * (1.0 + b.y * 1.4)) * lit(i) * pulse * uMisc.x;
	}
	return c;
}

vec3 inside(vec3 o, vec3 d, float s0, float s1) {
	vec3 c = vec3(0.0);
	for (int i = 0; i < 5; i++) {
		vec2 b = seg(o, d, s0, s1, uEntry.xyz, uExits[i].xyz);
		vec3 tint = mix(vec3(1.0), uCols[i].rgb, smoothstep(0.0, 0.85, b.y));
		c += tint * glow(b.x, 0.014) * 0.6 * lit(i) * uMisc.x;
	}
	return c;
}

vec3 env(vec3 d) {
	float top = pow(max(dot(d, normalize(vec3(-0.45, 1.0, 0.35))), 0.0), 18.0) * 2.4;
	float strip = smoothstep(0.93, 0.985, dot(d, normalize(vec3(1.0, 0.25, 0.55)))) * 1.6;
	float front = pow(max(dot(d, normalize(vec3(0.25, 0.35, 1.0))), 0.0), 5.0) * 0.32;
	float sky = smoothstep(-0.1, 0.8, d.y) * 0.1;
	return vec3(0.012, 0.012, 0.016) + vec3(1.0, 0.97, 0.92) * (top + strip + front) + vec3(0.55, 0.65, 0.9) * sky;
}

float fresnel(float cosi) { return 0.04 + 0.96 * pow(1.0 - clamp(cosi, 0.0, 1.0), 5.0); }

float pick(vec3 v, int c) { return c == 0 ? v.r : c == 1 ? v.g : v.b; }

float through(vec3 p, vec3 d, vec3 n, int c) {
	float eta = pick(IOR, c);
	vec3 dir = refract(d, n, 1.0 / eta);
	vec3 pos = p;
	float keep = 1.0;
	float acc = 0.0;
	for (int b = 0; b < 3; b++) {
		Hit h = prism(pos + dir * 1e-3, dir);
		float len = max(h.tf, 0.0) + 1e-3;
		acc += pick(inside(pos, dir, 0.0, len), c) * keep;
		vec3 q = pos + dir * len;
		vec3 ex = refract(dir, -h.nf, eta);
		if (dot(ex, ex) > 0.0) {
			float f = fresnel(dot(dir, h.nf));
			acc += pick(outside(q + ex * 1e-3, ex, 0.0, 60.0) + env(ex) * 0.35, c) * keep * (1.0 - f);
			keep *= f;
		}
		dir = reflect(dir, -h.nf);
		pos = q;
		if (keep < 0.02) break;
	}
	return acc * (c == 0 ? 0.93 : 1.0);
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
	// Top-left origin, like vgpu's uv.
	vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
	float aspect = uRes.x / uRes.y;
	float th = uCamFwd.w;
	vec3 o = uCamPos.xyz;
	vec3 d = normalize(uCamFwd.xyz + uCamRight.xyz * ((uv.x * 2.0 - 1.0) * th * aspect) + uCamUp.xyz * ((1.0 - uv.y * 2.0) * th));
	vec2 v = uv - vec2(0.5);
	vec3 col = vec3(0.03, 0.028, 0.034) * (1.0 - dot(v, v) * 1.6);
	Hit h = prism(o, d);
	if (h.tn < h.tf && h.tn > 0.0) {
		vec3 p = o + d * h.tn;
		vec3 n = h.nn;
		float f = fresnel(-dot(d, n));
		vec3 rd = reflect(d, n);
		vec3 refl = env(rd) + outside(p + rd * 1e-3, rd, 0.0, 60.0) * 0.5;
		vec3 trans = vec3(through(p, d, n, 0), through(p, d, n, 1), through(p, d, n, 2));
		col = col * 0.25 + outside(o, d, 0.0, h.tn) + refl * f + (trans + vec3(0.02, 0.026, 0.036)) * (1.0 - f);
		float d1 = 1e9;
		float d2 = 1e9;
		for (int i = 0; i < 5; i++) {
			float k = abs(faceK(i) - dot(faceN(i), p));
			if (k < d1) { d2 = d1; d1 = k; } else if (k < d2) { d2 = k; }
		}
		float shine = 0.55 + 0.45 * max(dot(n, normalize(vec3(-0.3, 1.0, 0.5))), 0.0);
		vec3 e = vec3(exp(-pow(d2 / 0.010, 2.0)), exp(-pow(d2 / 0.013, 2.0)), exp(-pow(d2 / 0.017, 2.0)));
		col += e * shine * 0.9 + vec3(exp(-d2 / 0.06)) * 0.05;
	} else {
		col += outside(o, d, 0.0, 60.0);
	}
	col = col / (1.0 + col * 0.55);
	col += (hash(uv * uRes + fract(uTime) * 61.0) - 0.5) * uMisc.z;
	fragColor = vec4(col, 1.0);
}

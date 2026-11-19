// The Onyx Agents intro: the 3D stage and everything else that moves.
//
// The stone is the mark cut in 3D, from the same geometry as tools/brand.py: a dark pentagonal base, five facets
// round it (the specialists) and a raised, lit table in the middle (Onyx Core). Two rings of type turn round it,
// pebbles and pearls orbit, and dust drifts behind. The stage eases between poses set along the page; in the
// "Inside" chapter, which holds still while you scroll, the stone opens into its six agents and closes again.
// Without WebGL the flat mark stands in, and the page reads the same.

import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const load = window.onyxLoad ?? { step() {}, done() {} };
load.step(0.55);

const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let calm = motionQuery.matches;
motionQuery.addEventListener?.('change', (e) => { calm = e.matches; });
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
const loaded = () => root.classList.contains('loaded');
function whenLoaded(fn) {
	if (loaded()) return fn();
	const mo = new MutationObserver(() => { if (loaded()) { mo.disconnect(); fn(); } });
	mo.observe(root, { attributes: true, attributeFilter: ['class'] });
}

/* ---------------------------------------------------------------- the page */

// Headings set letter by letter: each letter rises out of its word when the heading comes into view.
function split(el) {
	const text = el.textContent.trim();
	el.setAttribute('aria-label', text);
	el.textContent = '';
	let i = 0;
	text.split(/(\s+)/).forEach((word) => {
		if (!word) return;
		if (/^\s+$/.test(word)) return el.append(' ');
		const w = document.createElement('span');
		w.className = 'w';
		w.setAttribute('aria-hidden', 'true');
		for (const ch of word) {
			const c = document.createElement('span');
			c.className = 'c';
			c.textContent = ch;
			c.style.setProperty('--i', i++);
			w.append(c);
		}
		el.append(w);
	});
}
$$('[data-split]').forEach(split);

// Numbers count up the first time they are seen.
function countUp(scope) {
	const els = scope.matches?.('[data-count]') ? [scope] : $$('[data-count]', scope);
	for (const el of els) {
		if (el.dataset.counted || calm) continue;
		el.dataset.counted = '1';
		const to = Number(el.dataset.count);
		const comma = el.dataset.format === 'comma';
		const t0 = performance.now();
		const step = (now) => {
			const t = clamp((now - t0) / 1300);
			const v = Math.round(to * easeOut(t));
			el.textContent = comma ? v.toLocaleString('en-US') : String(v);
			if (t < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}
}

const shown = (el) => { el.classList.add('in'); countUp(el); };
if ('IntersectionObserver' in window) {
	const io = new IntersectionObserver((entries) => {
		for (const e of entries) if (e.isIntersecting) { shown(e.target); io.unobserve(e.target); }
	}, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
	// The hero waits for the curtain; everything else waits to be scrolled to.
	whenLoaded(() => $$('[data-reveal], [data-split]').forEach((el) => io.observe(el)));
} else {
	whenLoaded(() => $$('[data-reveal], [data-split]').forEach(shown));
}

// The header marks the chapter in view.
const links = new Map($$('.top nav a[href^="#"]').map((a) => [a.getAttribute('href').slice(1), a]));
if ('IntersectionObserver' in window) {
	const nav = new IntersectionObserver((entries) => {
		for (const e of entries) links.get(e.target.id)?.classList.toggle('here', e.isIntersecting);
	}, { rootMargin: '-45% 0px -50% 0px' });
	for (const id of links.keys()) { const el = document.getElementById(id); if (el) nav.observe(el); }
}

// Buttons lean toward the pointer; cards light up under it.
if (fine) {
	for (const b of $$('.magnetic')) {
		b.addEventListener('pointermove', (e) => {
			if (calm) return;
			const r = b.getBoundingClientRect();
			b.style.transition = 'transform 0.15s linear';
			b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
		});
		b.addEventListener('pointerleave', () => { b.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'; b.style.transform = ''; });
	}
	for (const c of $$('.card')) {
		c.addEventListener('pointermove', (e) => {
			const r = c.getBoundingClientRect();
			c.style.setProperty('--mx', `${e.clientX - r.left}px`);
			c.style.setProperty('--my', `${e.clientY - r.top}px`);
		});
	}
}

const inside = $('#inside');
const beats = $$('.beats li', inside);
const rail = $('.rail', inside);
const glass = $('.screen .glass');
const rows = $$('.marquee .row').map((el) => ({ el, speed: Number(el.dataset.speed) || 1, x: 0 }));
let lastScroll = scrollY, velocity = 0, direction = 1;

function insideProgress() {
	const r = inside.getBoundingClientRect();
	return clamp(-r.top / Math.max(1, r.height - innerHeight));
}

function pageFrame(dt) {
	const v = (scrollY - lastScroll) / Math.max(dt, 1e-3);
	lastScroll = scrollY;
	if (Math.abs(v) > 5) direction = Math.sign(v);
	velocity += (Math.abs(v) - velocity) * (1 - Math.exp(-dt * 6));

	// The marquees run on their own and faster while the page scrolls, the way it scrolls.
	if (!calm) {
		for (const r of rows) {
			const width = r.el.scrollWidth / 2;
			r.x -= (55 + Math.min(velocity, 3000) * 0.22) * r.speed * direction * dt;
			if (width > 0) r.x = ((r.x % width) - width) % width;
			r.el.style.transform = `translate3d(${r.x.toFixed(1)}px, 0, 0)`;
		}
	}

	// Inside: which beat is lit, and the rail.
	const p = insideProgress();
	const beat = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
	beats.forEach((li, i) => li.classList.toggle('on', i === beat));
	rail?.style.setProperty('--p', p.toFixed(3));

	// The app's screen lies back until it is in the middle of the view.
	if (glass) {
		const r = glass.getBoundingClientRect();
		const f = calm ? 1 : easeOut(clamp(1 - Math.abs(r.top + r.height / 2 - innerHeight / 2) / (innerHeight * 0.85)));
		glass.style.transform = `rotateX(${((1 - f) * 20).toFixed(2)}deg) rotateY(${((1 - f) * -16).toFixed(2)}deg) scale(${(0.88 + 0.12 * f).toFixed(3)})`;
	}
	return p;
}

/* --------------------------------------------------------------- the stage */

const stage = $('.stage');
const canvas = $('canvas', stage);
const glowEl = $('.glow', stage);
const tags = $$('.tag', stage).map((el) => ({ el, piece: el.dataset.piece }));

// The mark's geometry (tools/brand.py), in scene units: 30 of the mark's units make one.
const U = 1 / 30;
const R_OUT = 47 * U, R_IN = 31 * U, CORE = 18 * U, GAP = 5 * U;
const DEG = Math.PI / 180;
const pentagon = (r) => Array.from({ length: 5 }, (_, k) => new THREE.Vector2(Math.cos((-90 + 72 * k) * DEG) * r, -Math.sin((-90 + 72 * k) * DEG) * r));
const along = (p, q, d) => p.clone().add(q.clone().sub(p).setLength(d));

// One pose for each place along the page: x and y as fractions of the view's half-width and half-height, s the
// size, rx the stone's lean, face how far it turns to show the mark flat on, explode how far it is open, glow the
// table's light, ring and ring2 the two rings of type, orbit the pebbles and pearls, tags the agents' names.
const POSE = {
	hero: { x: 0, y: 0.22, s: 1, rx: -0.38, face: 0, explode: 0, glow: 0.3, ring: 1, ring2: 1, orbit: 1, tags: 0 },
	in0: { x: 0.36, y: 0.14, s: 1.08, rx: -0.12, face: 1, explode: 0, glow: 0.35, ring: 0, ring2: 0, orbit: 0.25, tags: 0 },
	in1: { x: 0.36, y: 0.14, s: 1.08, rx: -0.12, face: 1, explode: 0, glow: 1, ring: 0, ring2: 0, orbit: 0.25, tags: 0 },
	in2: { x: 0.4, y: 0.16, s: 0.84, rx: -0.12, face: 1, explode: 1, glow: 0.6, ring: 0, ring2: 0, orbit: 0.15, tags: 1 },
	in3: { x: 0.36, y: 0.14, s: 1.08, rx: -0.12, face: 1, explode: 0, glow: 1, ring: 0.25, ring2: 0, orbit: 0.4, tags: 0 },
	specs: { x: -0.52, y: -0.64, s: 0.46, rx: -0.32, face: 0, explode: 0, glow: 0.3, ring: 0.9, ring2: 0, orbit: 0.6, tags: 0 },
	pc: { x: 0.9, y: 0.9, s: 0.001, rx: -0.3, face: 0, explode: 0, glow: 0.3, ring: 0, ring2: 0, orbit: 0, tags: 0 },
	team: { x: 0.8, y: 0.66, s: 0.32, rx: -0.3, face: 0.6, explode: 0, glow: 0.5, ring: 0, ring2: 0, orbit: 0, tags: 0 },
	free: { x: 0.52, y: 0.04, s: 0.84, rx: -0.32, face: 0, explode: 0, glow: 0.3, ring: 1, ring2: 0.6, orbit: 1, tags: 0 },
	get: { x: 0, y: 0.58, s: 0.58, rx: -0.3, face: 0.35, explode: 0, glow: 0.6, ring: 1, ring2: 1, orbit: 1, tags: 0 },
};
// On a phone the stage keeps the middle of the top of the screen.
const NARROW = {
	in0: { x: 0, y: 0.5, s: 0.95 }, in1: { x: 0, y: 0.5, s: 0.95 }, in2: { x: 0, y: 0.54, s: 0.66 }, in3: { x: 0, y: 0.5, s: 0.95 },
	specs: { x: 0, y: 0.5, s: 0.9 }, pc: { x: 0, y: 0.5, s: 0.85 }, team: { x: 0.62, y: 0.78, s: 0.34 },
	free: { x: 0, y: 0.5, s: 0.95 }, get: { x: 0, y: 0.5, s: 0.95 },
};
const KEYS = Object.keys(POSE.hero);
// The rig's height on screen at size 1, in scene units: the stone and both rings.
const RIG_HEIGHT = 3.3;

function seeded(seed) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// Onyx's bands: near-black, faintly lighter layers that waver, laid across the whole stone.
function bandTexture() {
	const c = document.createElement('canvas');
	c.width = c.height = 512;
	const g = c.getContext('2d');
	for (let y = 0; y < 512; y++) {
		const v = 11 + 5 * Math.sin(y * 0.05 + Math.sin(y * 0.013) * 2.4) + 3 * Math.sin(y * 0.21) ** 8;
		g.fillStyle = `rgb(${v | 0},${v | 0},${(v + 1) | 0})`;
		g.fillRect(0, y, 512, 1);
	}
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	t.wrapS = t.wrapT = THREE.RepeatWrapping;
	t.repeat.set(0.5, 0.5);
	t.rotation = 0.5;
	return t;
}

function softDot(size = 64, inner = 0) {
	const c = document.createElement('canvas');
	c.width = c.height = size;
	const g = c.getContext('2d');
	const grad = g.createRadialGradient(size / 2, size / 2, inner, size / 2, size / 2, size / 2);
	grad.addColorStop(0, 'rgba(255,255,255,1)');
	grad.addColorStop(1, 'rgba(255,255,255,0)');
	g.fillStyle = grad;
	g.fillRect(0, 0, size, size);
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

// A ring's type, white on clear, filling its band exactly once round.
async function ringTexture({ words, family, weight, size, height, gap, anisotropy }) {
	try {
		await Promise.race([document.fonts.load(`${weight} ${size}px "${family}"`), new Promise((r) => setTimeout(r, 2500))]);
	} catch { /* the fallback face will do */ }
	const W = 4096;
	const c = document.createElement('canvas');
	c.width = W;
	c.height = height;
	const g = c.getContext('2d');
	g.font = `${weight} ${size}px "${family}", ui-sans-serif, system-ui, sans-serif`;
	const mark = size * 0.24;
	const widths = words.map((w) => g.measureText(w).width);
	const natural = widths.reduce((a, b) => a + b, 0) + words.length * (2 * gap + mark);
	const reps = Math.max(1, Math.round(W / natural));
	g.setTransform(W / (natural * reps), 0, 0, 1, 0, 0);
	g.fillStyle = '#ffffff';
	const base = height / 2 + size * 0.36;
	let x = 0;
	for (let r = 0; r < reps; r++) {
		words.forEach((word, i) => {
			g.fillText(word, x, base);
			x += widths[i] + gap;
			g.save();
			g.translate(x + mark / 2, height / 2);
			g.rotate(Math.PI / 4);
			g.fillRect(-mark / 2.9, -mark / 2.9, mark / 1.45, mark / 1.45);
			g.restore();
			x += mark + gap;
		});
	}
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = anisotropy;
	return { texture: t, aspect: height / W };
}

function ring(texture, aspect, radius, segments = 192) {
	const geo = new THREE.CylinderGeometry(radius, radius, 2 * Math.PI * radius * aspect, segments, 1, true);
	const front = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.FrontSide, depthWrite: false, toneMapped: false }));
	const back = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.BackSide, depthWrite: false, toneMapped: false, opacity: 0.12 }));
	back.renderOrder = 1;
	front.renderOrder = 2;
	const spin = new THREE.Group();
	spin.add(back, front);
	const tilt = new THREE.Group();
	tilt.add(spin);
	return { geo, front, back, spin, tilt, segments };
}

async function buildStage() {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, innerWidth < 760 ? 1.75 : 2));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;
	renderer.setClearColor(0x000000, 0);

	const scene = new THREE.Scene();
	const pmrem = new THREE.PMREMGenerator(renderer);
	const room = new RoomEnvironment();
	scene.environment = pmrem.fromScene(room, 0.04).texture;
	scene.environmentIntensity = 0.7;
	room.dispose();
	pmrem.dispose();

	const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
	camera.position.set(0, 0, 10);
	const key = new THREE.DirectionalLight(0xffffff, 2.6);
	key.position.set(4, 5, 6);
	const rim = new THREE.DirectionalLight(0xffffff, 2.4);
	rim.position.set(-5, 3, -6);
	const fill = new THREE.DirectionalLight(0xffffff, 0.35);
	fill.position.set(-3, -2, 4);
	scene.add(key, rim, fill);

	const rand = seeded(11);
	const onyx = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: bandTexture(), roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.035 });
	const onyxFlat = onyx.clone();
	onyxFlat.flatShading = true;
	const tableMat = new THREE.MeshPhysicalMaterial({ color: 0xf2f2f2, roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, emissive: 0xffffff, emissiveIntensity: 0.15 });

	const rig = new THREE.Group();
	scene.add(rig);
	const stone = new THREE.Group();
	rig.add(stone);

	const extrude = (points, depth, bevel) => {
		const shape = new THREE.Shape(points);
		const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 3, curveSegments: 1 });
		geo.computeVertexNormals();
		return geo;
	};
	const base = new THREE.Mesh(extrude(pentagon(R_OUT * 0.985), 0.36, 0.04), onyx);
	base.position.z = -0.42;
	stone.add(base);
	const table = new THREE.Mesh(extrude(pentagon(CORE), 0.26, 0.035), tableMat);
	table.position.z = 0.04;
	stone.add(table);

	// The five facets, each on a pivot along its inner edge so it can lean outward and lift away.
	const outer = pentagon(R_OUT), inner = pentagon(R_IN);
	const innerGap = (GAP / 2) * (R_IN / R_OUT);
	const LEAN = 10 * DEG;
	const facets = Array.from({ length: 5 }, (_, k) => {
		const n = (k + 1) % 5;
		const quad = [along(outer[k], outer[n], GAP / 2), along(outer[n], outer[k], GAP / 2), along(inner[n], inner[k], innerGap), along(inner[k], inner[n], innerGap)];
		const m = inner[k].clone().add(inner[n]).multiplyScalar(0.5);
		const e = inner[n].clone().sub(inner[k]).normalize();
		const u = new THREE.Vector2(-e.y, e.x);
		const local = quad.map((p) => { const d = p.clone().sub(m); return new THREE.Vector2(d.dot(e), d.dot(u)); });
		const mesh = new THREE.Mesh(extrude(local, 0.14, 0.03), onyx);
		mesh.rotation.x = -LEAN;
		const pivot = new THREE.Group();
		pivot.position.set(m.x, m.y, 0);
		pivot.rotation.z = Math.atan2(e.y, e.x);
		pivot.add(mesh);
		stone.add(pivot);
		return { pivot, mesh, m, u, spin: (rand() - 0.5) * 0.9 };
	});

	const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot(128, 0), color: 0xffffff, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending }));
	glow.scale.setScalar(6.5);
	glow.position.z = -1.2;
	rig.add(glow);

	const aniso = renderer.capabilities.getMaxAnisotropy();
	const [t1, t2] = await Promise.all([
		ringTexture({ words: ['ONYX AGENTS', 'SIX AGENTS', 'ONE ANSWER', 'RUNS ON YOUR PC'], family: 'Geist', weight: 900, size: 124, height: 160, gap: 62, anisotropy: aniso }),
		ringTexture({ words: ['QWEN3', 'OLLAMA', 'WINDOWS', 'YOUR PHONE', 'WHATSAPP', 'SMS', 'MIT LICENSE', 'NO SUBSCRIPTION'], family: 'Geist Mono', weight: 500, size: 64, height: 96, gap: 34, anisotropy: aniso }),
	]);
	load.step(0.8);
	const ring1 = ring(t1.texture, t1.aspect, 2.55);
	ring1.tilt.rotation.set(0.3, 0, -0.1);
	const ring2 = ring(t2.texture, t2.aspect, 2.15);
	ring2.tilt.rotation.set(-0.55, 0, 0.28);
	ring2.front.material.opacity = 0.55;
	rig.add(ring1.tilt, ring2.tilt);

	// Pebbles of onyx and pearls, each on its own orbit.
	const pebbleGeo = new THREE.IcosahedronGeometry(1, 0);
	const pebbles = Array.from({ length: 6 }, (_, i) => {
		const mesh = new THREE.Mesh(pebbleGeo, onyxFlat);
		mesh.scale.set(0.13 + rand() * 0.08, 0.1 + rand() * 0.06, 0.12 + rand() * 0.08);
		rig.add(mesh);
		return { mesh, size: mesh.scale.clone(), r: 2.35 + rand() * 1.1, phase: (i / 6) * Math.PI * 2 + rand() * 0.5, speed: 0.18 + rand() * 0.14,
			orbit: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35 + rand() * 0.5, rand() * Math.PI, (rand() - 0.5) * 0.5)),
			spin: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(), q: new THREE.Quaternion() };
	});
	const pearlMat = new THREE.MeshPhysicalMaterial({ color: 0xf0f0f0, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.04 });
	const sphere = new THREE.SphereGeometry(1, 32, 16);
	const pearls = Array.from({ length: 7 }, (_, i) => {
		const mesh = new THREE.Mesh(sphere, pearlMat);
		rig.add(mesh);
		return { mesh, size: 0.045 + rand() * 0.07, r: 3.0 + rand() * 1.6, h: (rand() - 0.5) * 2.6, phase: (i / 7) * Math.PI * 2 + rand(), speed: 0.05 + rand() * 0.08, bob: rand() * 6 };
	});

	// Dust: a few hundred specks far behind and around, drifting.
	const DUST = innerWidth < 760 ? 160 : 280;
	const dustPos = new Float32Array(DUST * 3);
	for (let i = 0; i < DUST; i++) {
		const r = 3.5 + rand() * 6, a = rand() * Math.PI * 2, b = Math.acos(2 * rand() - 1);
		dustPos.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * 0.7, r * Math.sin(b) * Math.sin(a) - 2], i * 3);
	}
	const dustGeo = new THREE.BufferGeometry();
	dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
	const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.04, map: softDot(32, 2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, color: 0xffffff }));
	scene.add(dust);
	load.step(0.92);

	/* -- where things are along the page -- */
	let half = { w: 1, h: 1 }, narrow = false, keys = [];
	const heroPose = { ...POSE.hero };
	function measure() {
		const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		half.h = Math.tan((camera.fov / 2) * DEG) * camera.position.z;
		half.w = half.h * camera.aspect;
		narrow = w < 761 || camera.aspect < 0.9;
		const unit = Math.min(half.h / 2.9, half.w / 3.1);
		// The opening pose fills the room between the header and the hero's words.
		const words = $('.hero-copy');
		if (words) {
			const top = 70, bottom = words.getBoundingClientRect().top + scrollY - 16;
			const roomPx = Math.max(150, bottom - top);
			heroPose.s = clamp((roomPx * 2 * half.h) / (RIG_HEIGHT * unit * innerHeight), 0.35, 1.05);
			heroPose.y = 1 - (top + bottom) / innerHeight;
		}
		const end = Math.max(0, document.documentElement.scrollHeight - innerHeight);
		const topOf = (el) => el.getBoundingClientRect().top + scrollY;
		const centreOf = (id) => {
			const el = document.getElementById(id);
			const panel = narrow && el.querySelector('.copy');
			return Math.min(end, panel ? topOf(panel) - innerHeight * 0.6 : topOf(el) + el.offsetHeight / 2 - innerHeight / 2);
		};
		const inTop = topOf(inside), span = Math.max(1, inside.offsetHeight - innerHeight);
		const pose = (name) => (narrow && NARROW[name] ? { ...POSE[name], ...NARROW[name] } : POSE[name]);
		keys = [
			[0, heroPose],
			[inTop, pose('in0')],
			[inTop + span * 0.3, pose('in1')],
			[inTop + span * 0.62, pose('in2')],
			[inTop + span * 0.94, pose('in3')],
			[centreOf('specs'), pose('specs')],
			[centreOf('your-pc'), pose('pc')],
			[centreOf('team'), pose('team')],
			[centreOf('free'), pose('free')],
			[centreOf('get'), pose('get')],
		].sort((a, b) => a[0] - b[0]);
		return unit;
	}
	let unit = measure();
	new ResizeObserver(() => { unit = measure(); }).observe(document.body);
	addEventListener('resize', () => { unit = measure(); });
	document.fonts?.ready.then(() => { unit = measure(); });

	function target() {
		const y = scrollY;
		if (y <= keys[0][0]) return keys[0][1];
		for (let i = 0; i < keys.length - 1; i++) {
			const [y0, a] = keys[i], [y1, b] = keys[i + 1];
			if (y <= y1) {
				const f = smooth(clamp((y - y0) / Math.max(1, y1 - y0)));
				const out = {};
				for (const k of KEYS) out[k] = mix(a[k], b[k], f);
				return out;
			}
		}
		return keys[keys.length - 1][1];
	}

	const pose = { ...heroPose };
	const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
	if (fine) addEventListener('pointermove', (e) => { pointer.tx = (e.clientX / innerWidth) * 2 - 1; pointer.ty = (e.clientY / innerHeight) * 2 - 1; });

	const qIdle = new THREE.Quaternion(), qFace = new THREE.Quaternion(), e3 = new THREE.Euler();
	const v = new THREE.Vector3(), up = new THREE.Vector3();
	let time = 0, openedAt = null, ringAngle = 0, ring2Angle = 0, glowAt = '';

	function render(dt, scrollBoost) {
		time += dt;
		if (openedAt === null && loaded()) openedAt = time;
		// Before the curtain lifts the pieces wait far out; after, the opening plays (or is skipped, with reduced motion).
		const t = calm ? 99 : openedAt === null ? -1 : time - openedAt;

		const goal = calm ? heroPose : target();
		const k = calm ? 1 : 1 - Math.exp(-dt * 3.4);
		for (const key2 of KEYS) pose[key2] += (goal[key2] - pose[key2]) * k;
		pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 3));
		pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 3));

		rig.position.set(pose.x * half.w, pose.y * half.h, 0);
		rig.scale.setScalar(pose.s * unit);
		camera.position.x = calm ? 0 : pointer.x * 0.35;
		camera.position.y = calm ? 0 : -pointer.y * 0.25;
		camera.lookAt(0, 0, 0);

		// The opening: the pieces fly in and the table rises, the rings draw themselves round, then the rest arrives.
		const gather = t < 0 ? 0 : easeOut(clamp(t / 1.5));
		const tableIn = t < 0 ? 0 : easeOutBack(clamp((t - 0.55) / 0.8));
		const ringIn = t < 0 ? 0 : easeInOut(clamp((t - 0.35) / 1.5));
		const orbitIn = t < 0 ? 0 : easeOut(clamp((t - 0.6) / 1.4));
		const dustIn = t < 0 ? 0 : clamp((t - 0.4) / 2);

		const sway = calm ? 0 : Math.sin(time * 0.45 + scrollY * 0.0016) * 0.62;
		e3.set(pose.rx + (calm ? 0 : pointer.y * 0.18), sway + (calm ? 0.35 : pointer.x * 0.25) + (1 - gather) * 2.4, 0, 'XYZ');
		qIdle.setFromEuler(e3);
		qFace.setFromEuler(e3.set(calm ? 0 : pointer.y * 0.08, calm ? 0 : pointer.x * 0.1, 0, 'XYZ'));
		stone.quaternion.copy(qIdle).slerp(qFace, clamp(pose.face));

		// Open: each facet lifts off its edge and leans out like a petal; the table rises.
		const open = clamp(pose.explode) + (1 - gather) * 2.4;
		facets.forEach((f) => {
			f.pivot.position.set(f.m.x + f.u.x * open * 0.85, f.m.y + f.u.y * open * 0.85, open * 0.45);
			f.mesh.rotation.x = -LEAN - open * 0.42;
			f.mesh.rotation.y = f.spin * open * 0.6;
		});
		table.position.z = 0.04 + clamp(pose.explode) * 0.32;
		table.scale.setScalar(Math.max(0.001, tableIn));
		tableMat.emissiveIntensity = 0.12 + 0.55 * clamp(pose.glow);
		glow.material.opacity = (0.06 + 0.2 * clamp(pose.glow)) * gather;

		// The rings: the big one turns with the scroll, the small one the other way.
		ringAngle += dt * (calm ? 0 : 0.18 + scrollBoost);
		ring2Angle += dt * (calm ? 0 : 0.11 + scrollBoost * 0.6);
		ring1.spin.rotation.y = -ringAngle;
		ring2.spin.rotation.y = ring2Angle;
		for (const [r, show] of [[ring1, pose.ring], [ring2, pose.ring2]]) {
			const s = clamp(show);
			r.tilt.visible = s > 0.01;
			r.tilt.scale.setScalar(0.82 + 0.18 * s);
			r.front.material.opacity = (r === ring2 ? 0.55 : 1) * s;
			r.back.material.opacity = 0.12 * s;
			r.geo.setDrawRange(0, 6 * Math.round(r.segments * ringIn));
		}

		const orbit = clamp(pose.orbit) * orbitIn;
		pebbles.forEach((p) => {
			const a = p.phase + (calm ? 0 : time * p.speed);
			v.set(Math.cos(a) * p.r, 0, Math.sin(a) * p.r).applyQuaternion(p.orbit).multiplyScalar(1 + (1 - orbitIn) * 1.6);
			p.mesh.position.copy(v);
			p.q.setFromAxisAngle(p.spin, (calm ? 1 : time) * 0.8);
			p.mesh.quaternion.copy(p.q);
			p.mesh.scale.copy(p.size).multiplyScalar(Math.max(0.001, orbit));
		});
		pearls.forEach((p) => {
			const a = p.phase + (calm ? 0 : time * p.speed);
			p.mesh.position.set(Math.cos(a) * p.r, p.h + (calm ? 0 : Math.sin(time * 0.7 + p.bob) * 0.12), Math.sin(a) * p.r * 0.6 - 0.6);
			p.mesh.scale.setScalar(Math.max(0.001, p.size * orbit * (1 - 0.9 * clamp(Math.abs(pose.x) / 0.5) * (narrow ? 0 : 1))));
		});
		dust.rotation.y = calm ? 0 : time * 0.015;
		dust.material.opacity = 0.5 * dustIn;

		// With reduced motion the stage keeps its first pose, and steps back once the reader scrolls on.
		stage.style.opacity = calm ? String(1 - 0.75 * clamp(scrollY / innerHeight)) : '';
		renderer.render(scene, camera);

		// The page's glow follows the stone; the agents' names follow their pieces.
		v.setFromMatrixPosition(stone.matrixWorld).project(camera);
		const g = `${((v.x + 1) * 50).toFixed(1)}% ${((1 - v.y) * 50).toFixed(1)}%`;
		if (g !== glowAt) {
			const [gx, gy] = g.split(' ');
			glowEl.style.setProperty('--gx', gx);
			glowEl.style.setProperty('--gy', gy);
			glowAt = g;
		}
		const tagShow = clamp(pose.tags);
		const W = canvas.clientWidth, H = canvas.clientHeight;
		for (const tg of tags) {
			if (tagShow < 0.02) { if (tg.el.style.opacity !== '0') tg.el.style.opacity = '0'; continue; }
			if (tg.piece === 'table') v.set(0, CORE * 0.2, 0.45 + clamp(pose.explode) * 0.32);
			else {
				const f = facets[Number(tg.piece)];
				v.set(f.m.x + f.u.x * (open * 0.85 + 0.75), f.m.y + f.u.y * (open * 0.85 + 0.75), open * 0.45);
			}
			stone.localToWorld(v).project(camera);
			const bw = tg.el.offsetWidth, bh = tg.el.offsetHeight;
			const px = clamp((v.x + 1) * 0.5 * W, 8 + bw / 2, W - 8 - bw / 2), py = clamp((1 - v.y) * 0.5 * H, 70 + bh / 2, H - 8 - bh / 2);
			tg.el.style.transform = `translate(${(px - bw / 2).toFixed(1)}px, ${(py - bh / 2).toFixed(1)}px)`;
			tg.el.style.opacity = tagShow.toFixed(3);
		}
	}

	return { render };
}

/* ------------------------------------------------------------------ the loop */

let stageApi = null;
buildStage().then((api) => {
	stageApi = api;
}).catch((err) => {
	stage.classList.add('no-3d');
	console.warn('Onyx intro: the 3D stage could not start.', err);
	load.done();
});

let last = performance.now(), boost = 0, first = true;
function frame(now) {
	const dt = Math.min((now - last) / 1000, 0.05);
	last = now;
	pageFrame(dt);
	boost += (clamp(velocity / 900, 0, 3) - boost) * (1 - Math.exp(-dt * 4));
	if (stageApi) {
		stageApi.render(dt, boost);
		if (first) {
			first = false;
			stage.classList.add('ready');
			load.done();
		}
	}
	requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

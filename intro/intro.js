// The Onyx Agents intro's 3D stage.
//
// Onyx Core is a glossy black cube whose top face carries the mark's lit facet. The five specialists orbit it as
// small cubes, a few white pearls drift further out, and a ring of giant type turns round them all. The stage has
// one pose per chapter of the page and eases between them as the page scrolls; scrolling also spins the ring.
// Everything is drawn here: no models or images are loaded.

import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const stage = document.querySelector('.stage');
const canvas = stage.querySelector('canvas');
const glow = stage.querySelector('.glow');
const chapters = [...document.querySelectorAll('main > section')];
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let calm = motionQuery.matches;
motionQuery.addEventListener?.('change', (e) => { calm = e.matches; });

const RING_WORDS = ['ONYX AGENTS', 'YOUR OWN AI TEAM', 'RUNS ON YOUR PC'];

// One pose per chapter. x and y are fractions of the half-width and half-height of the view, s scales the whole
// rig, ring is how much of the ring shows, logo turns the cubes to the mark's pose, form gathers the specialists
// round Onyx Core.
const POSES = {
	wide: [
		{ x: 0, y: 0.24, s: 1, ring: 1, logo: 0, form: 0 },
		{ x: 0.5, y: 0.02, s: 0.8, ring: 0, logo: 0.85, form: 1 },
		{ x: 0.5, y: 0.02, s: 0.92, ring: 0, logo: 0.35, form: 0 },
		{ x: 0.5, y: 0.02, s: 0.82, ring: 1, logo: 0, form: 0 },
		{ x: 0, y: 0.5, s: 0.66, ring: 1, logo: 0.5, form: 0 },
	],
	narrow: [
		{ x: 0, y: 0.3, s: 1, ring: 1, logo: 0, form: 0 },
		{ x: 0, y: 0.5, s: 1, ring: 0, logo: 0.85, form: 1 },
		{ x: 0, y: 0.5, s: 1.05, ring: 0, logo: 0.35, form: 0 },
		{ x: 0, y: 0.5, s: 0.95, ring: 1, logo: 0, form: 0 },
		{ x: 0, y: 0.5, s: 0.95, ring: 1, logo: 0.5, form: 0 },
	],
};
const KEYS = ['x', 'y', 's', 'ring', 'logo', 'form'];
// The rig's height on screen at scale 1 (the orbits and the ring's lower arc reach furthest), in scene units.
const RIG_HEIGHT = 3.3;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

// A small seeded random, so the stage looks the same on every visit.
function seeded(seed) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// The top face of every cube: dark, with the mark's lit facet on one half.
function facetTexture() {
	const c = document.createElement('canvas');
	c.width = c.height = 512;
	const g = c.getContext('2d');
	g.fillStyle = '#1c1c1c';
	g.fillRect(0, 0, 512, 512);
	g.fillStyle = '#f5f5f5';
	g.beginPath();
	g.moveTo(512, 0);
	g.lineTo(512, 512);
	g.lineTo(0, 512);
	g.closePath();
	g.fill();
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = 8;
	return t;
}

// The ring's type, white on clear, filling the band exactly once round.
async function ringTexture(anisotropy) {
	const size = 124;
	try {
		await Promise.race([document.fonts.load(`900 ${size}px Geist`), new Promise((r) => setTimeout(r, 2500))]);
	} catch { /* the fallback face will do */ }
	const W = 4096, H = 160;
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const g = c.getContext('2d');
	g.font = `900 ${size}px Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
	const gap = size * 0.5;
	const mark = size * 0.2;
	const widths = RING_WORDS.map((w) => g.measureText(w).width);
	const natural = widths.reduce((a, b) => a + b, 0) + RING_WORDS.length * (2 * gap + mark);
	const reps = Math.max(1, Math.round(W / natural));
	g.setTransform(W / (natural * reps), 0, 0, 1, 0, 0);
	g.fillStyle = '#ffffff';
	g.textBaseline = 'alphabetic';
	const base = H / 2 + size * 0.36;
	let x = 0;
	for (let r = 0; r < reps; r++) {
		RING_WORDS.forEach((word, i) => {
			g.fillText(word, x, base);
			x += widths[i] + gap;
			// Between phrases, a small square on its corner: a facet.
			g.save();
			g.translate(x + mark / 2, H / 2 + size * 0.0);
			g.rotate(Math.PI / 4);
			g.fillRect(-mark / 2.9, -mark / 2.9, mark / 1.45, mark / 1.45);
			g.restore();
			x += mark + gap;
		});
	}
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = anisotropy;
	return { texture: t, aspect: H / W };
}

async function start() {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;
	renderer.setClearColor(0x000000, 0);

	const scene = new THREE.Scene();
	const pmrem = new THREE.PMREMGenerator(renderer);
	const room = new RoomEnvironment();
	scene.environment = pmrem.fromScene(room, 0.04).texture;
	scene.environmentIntensity = 0.6;
	room.dispose();
	pmrem.dispose();

	const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
	camera.position.set(0, 0, 10);

	// A key light from the upper right (it lights the facet), a rim from behind to cut the black cube from the
	// black page, and a little fill.
	const key = new THREE.DirectionalLight(0xffffff, 2.4);
	key.position.set(3.5, 4.5, 5);
	const rim = new THREE.DirectionalLight(0xffffff, 2.2);
	rim.position.set(-4, 2.5, -6);
	const fill = new THREE.DirectionalLight(0xffffff, 0.35);
	fill.position.set(-3, -2, 4);
	scene.add(key, rim, fill);

	const black = new THREE.MeshPhysicalMaterial({ color: 0x0d0d0d, roughness: 0.2, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 });
	const facet = facetTexture();
	const lit = new THREE.MeshPhysicalMaterial({
		color: 0xffffff, map: facet, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05,
		emissive: 0xffffff, emissiveMap: facet, emissiveIntensity: 0.22,
	});
	const faces = [black, black, lit, black, black, black];

	const rig = new THREE.Group();
	scene.add(rig);

	const core = new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.5, 1.5, 6, 0.12), faces);
	rig.add(core);

	const rand = seeded(7);
	const smallBox = new RoundedBoxGeometry(0.34, 0.34, 0.34, 3, 0.045);
	const specialists = Array.from({ length: 5 }, (_, i) => {
		const m = new THREE.Mesh(smallBox, faces);
		m.userData = {
			phase: (i / 5) * Math.PI * 2 + rand() * 0.4,
			radius: 1.95 + (i % 2) * 0.42 + rand() * 0.1,
			speed: 0.3 + rand() * 0.12,
			orbit: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.38 + rand() * 0.3, rand() * Math.PI, (rand() - 0.5) * 0.4)),
			spin: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
			spinSpeed: 0.6 + rand() * 0.8,
			q: new THREE.Quaternion(),
		};
		rig.add(m);
		return m;
	});

	const pearlMat = new THREE.MeshPhysicalMaterial({ color: 0xf0f0f0, roughness: 0.14, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 });
	const sphere = new THREE.SphereGeometry(1, 32, 16);
	const pearls = Array.from({ length: 7 }, (_, i) => {
		const m = new THREE.Mesh(sphere, pearlMat);
		m.userData = {
			size: 0.045 + rand() * 0.075,
			radius: 3.0 + rand() * 1.4,
			height: (rand() - 0.5) * 2.4,
			phase: (i / 7) * Math.PI * 2 + rand(),
			speed: 0.06 + rand() * 0.08,
			bob: rand() * Math.PI * 2,
		};
		rig.add(m);
		return m;
	});

	const { texture, aspect } = await ringTexture(renderer.capabilities.getMaxAnisotropy());
	const R = 2.3;
	const SEGMENTS = 192;
	const ringGeo = new THREE.CylinderGeometry(R, R, 2 * Math.PI * R * aspect, SEGMENTS, 1, true);
	const ringFront = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.FrontSide, depthWrite: false, toneMapped: false }));
	const ringBack = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.BackSide, depthWrite: false, toneMapped: false, opacity: 0.12 }));
	ringBack.renderOrder = 1;
	ringFront.renderOrder = 2;
	const ring = new THREE.Group();
	ring.add(ringBack, ringFront);
	const ringTilt = new THREE.Group();
	ringTilt.rotation.set(0.3, 0, -0.1);
	ringTilt.add(ring);
	rig.add(ringTilt);

	const LOGO = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.atan(1 / Math.SQRT2), Math.PI / 4, 0, 'XYZ'));
	const qIdle = new THREE.Quaternion();
	const eIdle = new THREE.Euler();
	const v = new THREE.Vector3();
	const formAt = (i) => {
		const a = -Math.PI / 2 + (i + 0.5) * ((Math.PI * 2) / 5);
		return new THREE.Vector3(Math.cos(a) * 1.75, -Math.sin(a) * 1.75, 0.35);
	};
	const FORM = specialists.map((_, i) => formAt(i));

	// Where each chapter is centred in the page, and the view's half-size at the cubes' depth.
	let focus = [];
	let half = { w: 1, h: 1 };
	let narrow = false;
	function measure() {
		const w = canvas.clientWidth || innerWidth;
		const h = canvas.clientHeight || innerHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		half.h = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
		half.w = half.h * camera.aspect;
		narrow = w < 761 || camera.aspect < 0.9;
		// The opening pose fills the space between the header and the hero's words, whatever the screen.
		const words = document.querySelector('.hero-copy');
		if (words) {
			const unit = Math.min(half.h / 2.7, half.w / 2.9);
			const top = 64, bottom = words.getBoundingClientRect().top + scrollY - 20;
			const room = Math.max(140, bottom - top);
			for (const set of [POSES.wide, POSES.narrow]) {
				set[0].s = clamp((room * 2 * half.h) / (RIG_HEIGHT * unit * innerHeight), 0.35, 1);
				set[0].y = 1 - (top + bottom) / innerHeight;
			}
		}
		// The last chapters may sit too near the end of the page to be centred: they count as reached at the bottom.
		const end = Math.max(0, document.documentElement.scrollHeight - innerHeight);
		// A chapter's pose is reached when the chapter is centred; on a phone, when its panel's top is 60% down the
		// screen, so the stage shows above the panel.
		focus = chapters.map((el) => {
			const panel = narrow && el.querySelector('.copy');
			const y = panel
				? panel.getBoundingClientRect().top + scrollY - innerHeight * 0.6
				: el.getBoundingClientRect().top + scrollY + el.offsetHeight / 2 - innerHeight / 2;
			return Math.min(end, y);
		});
		focus[0] = 0;
	}
	measure();
	new ResizeObserver(measure).observe(document.body);
	addEventListener('resize', measure);
	document.fonts?.ready.then(measure);

	function targetPose() {
		const poses = narrow ? POSES.narrow : POSES.wide;
		const y = scrollY;
		let a = poses[0], b = poses[0], f = 0;
		if (y >= focus[focus.length - 1]) a = b = poses[poses.length - 1];
		else {
			for (let i = 0; i < focus.length - 1; i++) {
				if (y < focus[i + 1]) {
					a = poses[i];
					b = poses[i + 1];
					f = smooth(clamp((y - focus[i]) / Math.max(1, focus[i + 1] - focus[i])));
					break;
				}
			}
		}
		const out = {};
		for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * f;
		return out;
	}

	const pose = targetPose();
	const clock = new THREE.Clock();
	let time = 0;
	let ringAngle = 0;
	let boost = 0;
	let lastScroll = scrollY;
	let shown = false;
	const glowAt = { x: '', y: '' };

	function frame() {
		const dt = Math.min(clock.getDelta(), 0.05);
		time += dt;
		const t = calm ? 99 : time;

		// Scrolling spins the ring, then it settles.
		const speed = (scrollY - lastScroll) / Math.max(dt, 1e-3);
		lastScroll = scrollY;
		boost += (clamp(Math.abs(speed) / 500, 0, 3.5) - boost) * (1 - Math.exp(-dt * 4));

		// Ease toward the pose of the chapter in view (with reduced motion, the stage stays in the first pose).
		const goal = calm ? (narrow ? POSES.narrow : POSES.wide)[0] : targetPose();
		const k = calm ? 1 : 1 - Math.exp(-dt * 3.2);
		for (const key2 of KEYS) pose[key2] += (goal[key2] - pose[key2]) * k;

		const unit = Math.min(half.h / 2.7, half.w / 2.9);
		rig.position.set(pose.x * half.w, pose.y * half.h, 0);
		rig.scale.setScalar(pose.s * unit);

		// The opening: the cube arrives with a spin, the ring draws itself round, the specialists fly in.
		const coreIn = clamp(t / 1.1);
		const ringIn = easeInOutCubic(clamp((t - 0.35) / 1.4));
		const orbitIn = easeOutCubic(clamp((t - 0.45) / 1.5));
		const pearlIn = easeOutCubic(clamp((t - 0.9) / 1.2));

		core.scale.setScalar(Math.max(0.001, easeOutBack(coreIn)));
		const spinIn = (1 - easeOutCubic(clamp(t / 1.6))) * 5;
		eIdle.set(0.42 + (calm ? 0 : Math.sin(time * 0.5) * 0.06), (calm ? 0.6 : time * 0.32 + scrollY * 0.0012) + spinIn, 0.1, 'XYZ');
		qIdle.setFromEuler(eIdle);
		core.quaternion.copy(qIdle).slerp(LOGO, clamp(pose.logo));

		specialists.forEach((m, i) => {
			const d = m.userData;
			const ang = d.phase + (calm ? 0 : time * d.speed);
			v.set(Math.cos(ang) * d.radius, 0, Math.sin(ang) * d.radius).applyQuaternion(d.orbit);
			v.multiplyScalar(1 + (1 - orbitIn) * 2.2);
			v.lerp(FORM[i], clamp(pose.form));
			m.position.copy(v);
			d.q.setFromAxisAngle(d.spin, (calm ? 1 : time) * d.spinSpeed);
			m.quaternion.copy(d.q).slerp(LOGO, clamp(pose.form));
			m.scale.setScalar(Math.max(0.001, orbitIn));
		});

		pearls.forEach((m) => {
			const d = m.userData;
			const ang = d.phase + (calm ? 0 : time * d.speed);
			m.position.set(Math.cos(ang) * d.radius, d.height + Math.sin(time * 0.7 + d.bob) * (calm ? 0 : 0.12), Math.sin(ang) * d.radius * 0.6 - 0.6);
			// The pearls drift wide: when the stage stands beside the words, they shrink away rather than cross them.
			const aside = clamp(Math.abs(pose.x) / 0.5);
			m.scale.setScalar(Math.max(0.001, d.size * pearlIn * (1 - 0.5 * clamp(pose.form)) * (1 - 0.9 * aside)));
		});

		ringAngle += dt * (calm ? 0 : 0.2 + boost);
		ring.rotation.y = -ringAngle;
		const show = clamp(pose.ring);
		ringTilt.visible = show > 0.01;
		ringTilt.scale.setScalar(0.8 + 0.2 * show);
		ringFront.material.opacity = show;
		ringBack.material.opacity = 0.12 * show;
		ringGeo.setDrawRange(0, 6 * Math.round(SEGMENTS * ringIn));

		stage.style.opacity = calm ? String(1 - 0.75 * clamp(scrollY / innerHeight)) : '';
		renderer.render(scene, camera);

		// The page's glow follows the cube.
		v.setFromMatrixPosition(core.matrixWorld).project(camera);
		const gx = `${((v.x + 1) * 50).toFixed(1)}%`, gy = `${((1 - v.y) * 50).toFixed(1)}%`;
		if (gx !== glowAt.x || gy !== glowAt.y) {
			glow.style.setProperty('--gx', gx);
			glow.style.setProperty('--gy', gy);
			glowAt.x = gx;
			glowAt.y = gy;
		}
		if (!shown) {
			shown = true;
			stage.classList.add('ready');
		}
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

start().catch((err) => {
	// No WebGL (or it failed): the flat mark stays, and the page reads the same without the stage.
	stage.classList.add('no-3d');
	console.warn('Onyx intro: the 3D stage could not start.', err);
});

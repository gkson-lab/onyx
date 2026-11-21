// "Your PC": a glass graphics card and two sticks of memory, built with React Three Fiber
// (https://github.com/pmndrs/react-three-fiber, MIT, Poimandres). The card's memory chips light up with the model a
// tier uses, after the memory Windows and the display keep for themselves; whatever doesn't fit on the card spills into
// the sticks of system memory. The numbers come from the page's planner (the same sums Setup does). There is no
// react-dom here: R3F's own createRoot draws straight into the canvas, and the page writes the words around it.
import { createRoot, extend, useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

extend(THREE);

const GPU_RESERVED_GB = 2; // planner.js keeps this much of the card for Windows and the display
const RAM_RESERVED_GB = 8; // and this much of the system memory for everything else
const RESERVE = '#454b55';
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));

/** How a model's memory lands: `fills[i]` lists the coloured runs on chip i, as fractions of the chip. */
export function memoryMap({ vramGb, ramGb, needGb, gpuShare }) {
	const runs = (total, chips, reserved, used) => {
		const per = total / chips;
		const out = [];
		for (let i = 0; i < chips; i++) {
			const a = i * per, b = a + per, list = [];
			const r = [Math.max(a, 0), Math.min(b, reserved)];
			if (r[1] > r[0]) list.push({ kind: 'reserve', from: (r[0] - a) / per, to: (r[1] - a) / per });
			const m = [Math.max(a, reserved), Math.min(b, reserved + used)];
			if (m[1] > m[0]) list.push({ kind: 'model', from: (m[0] - a) / per, to: (m[1] - a) / per });
			out.push(list);
		}
		return out;
	};
	const cardChips = vramGb ? (vramGb % 2 ? vramGb : vramGb / 2) : 0;
	const onCard = vramGb ? Math.min(needGb * gpuShare, Math.max(0, vramGb - GPU_RESERVED_GB)) : 0;
	const inRam = Math.min(needGb - onCard, Math.max(0, ramGb - RAM_RESERVED_GB));
	return {
		card: cardChips ? runs(vramGb, cardChips, GPU_RESERVED_GB, onCard) : [],
		ram: runs(ramGb, 16, RAM_RESERVED_GB, inRam),
		onCard, inRam,
		freeCard: vramGb ? Math.max(0, vramGb - GPU_RESERVED_GB - onCard) : 0,
		freeRam: Math.max(0, ramGb - RAM_RESERVED_GB - inRam),
	};
}

// The chips around the graphics processor: as even as possible on its four sides, numbered clockwise from top left.
function cardSlots(count) {
	const sides = [0, 0, 0, 0];
	for (let i = 0; i < count; i++) sides[[0, 2, 3, 1][i % 4]]++;
	const hx = 1.88, hz = 1.56, cx = 0, out = [];
	const along = (n, len) => Array.from({ length: n }, (_, k) => (n === 1 ? 0 : -len / 2 + (len * k) / (n - 1)));
	along(sides[0], 2.2).forEach((x) => out.push({ x: cx + x, z: -hz, turn: 0 }));
	along(sides[1], 1.7).forEach((z) => out.push({ x: cx + hx, z, turn: 0 }));
	along(sides[2], 2.2).reverse().forEach((x) => out.push({ x: cx + x, z: hz, turn: 0 }));
	along(sides[3], 1.7).reverse().forEach((z) => out.push({ x: cx - hx, z, turn: 0 }));
	return out;
}

// A soft round glow, drawn once, for the light above each busy chip.
let glowTexture = null;
function glow() {
	if (glowTexture) return glowTexture;
	const c = document.createElement('canvas');
	c.width = c.height = 64;
	const g = c.getContext('2d');
	const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
	r.addColorStop(0, 'rgba(255,255,255,0.9)');
	r.addColorStop(0.35, 'rgba(255,255,255,0.28)');
	r.addColorStop(1, 'rgba(255,255,255,0)');
	g.fillStyle = r;
	g.fillRect(0, 0, 64, 64);
	glowTexture = new THREE.CanvasTexture(c);
	glowTexture.colorSpace = THREE.SRGBColorSpace;
	return glowTexture;
}

function roundedRect(w, d, r) {
	const s = new THREE.Shape();
	s.moveTo(-w / 2 + r, -d / 2);
	s.lineTo(w / 2 - r, -d / 2);
	s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
	s.lineTo(w / 2, d / 2 - r);
	s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
	s.lineTo(-w / 2 + r, d / 2);
	s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
	s.lineTo(-w / 2, -d / 2 + r);
	s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
	return s;
}

/**
 * One memory chip with its coloured runs. `levels[index]` (0 to 1, updated every frame) grows the model's runs in;
 * the reserved part is always shown. Chips lie flat (card) or stand up (memory sticks) depending on the parent group.
 */
function Chip({ size, runs, color, index, levels, lit }) {
	const [w, h, d] = size;
	const bars = useRef([]);
	const halo = useRef();
	const tint = useMemo(() => new THREE.Color(color), [color]);
	useFrame(() => {
		const k = levels[index] ?? 1;
		runs.forEach((run, i) => {
			const bar = bars.current[i];
			if (!bar) return;
			const amount = run.kind === 'model' ? k : 1;
			const len = Math.max(1e-3, (run.to - run.from) * amount);
			bar.scale.x = len * w * 0.92;
			bar.position.x = (-0.5 + run.from + len / 2) * w * 0.92;
			bar.visible = amount > 0.001;
		});
		if (halo.current) {
			const model = runs.find((r) => r.kind === 'model');
			const amount = model ? (model.to - model.from) * k : 0;
			halo.current.material.opacity = 0.55 * amount * lit;
			halo.current.visible = amount > 0.001;
		}
	});
	return (
		<group>
			<mesh position={[0, h / 2, 0]}>
				<boxGeometry args={[w, h, d]} />
				<meshStandardMaterial color="#14161a" roughness={0.45} metalness={0.3} />
			</mesh>
			{runs.map((run, i) => (
				<mesh key={i} ref={(m) => { bars.current[i] = m; }} position={[0, h + 0.004, 0]}>
					<boxGeometry args={[1, 0.012, d * 0.74]} />
					{run.kind === 'model'
						? <meshBasicMaterial color={tint} toneMapped={false} />
						: <meshBasicMaterial color={RESERVE} />}
				</mesh>
			))}
			<mesh ref={halo} position={[0, h + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
				<planeGeometry args={[w * 2.6, d * 3.2]} />
				<meshBasicMaterial map={glow()} color={tint} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
			</mesh>
		</group>
	);
}

// Small parts scattered on a board, so it reads as a circuit board and not a slab. Same layout every time.
function Parts({ count, area, seed, color, size }) {
	const ref = useRef();
	useLayoutEffect(() => {
		let s = seed;
		const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
		const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
		for (let i = 0; i < count; i++) {
			const turn = rnd() > 0.5;
			p.set(area[0] + rnd() * (area[1] - area[0]), size[1] / 2, area[2] + rnd() * (area[3] - area[2]));
			q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), turn ? Math.PI / 2 : 0);
			sc.set(size[0] * (0.6 + rnd() * 0.8), size[1], size[2] * (0.6 + rnd() * 0.8));
			ref.current.setMatrixAt(i, m.compose(p, q, sc));
		}
		ref.current.instanceMatrix.needsUpdate = true;
	}, [count, area, seed, size]);
	return (
		<instancedMesh ref={ref} args={[null, null, count]}>
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />
		</instancedMesh>
	);
}

function Fan({ x, spin }) {
	const blades = useRef();
	const blade = useMemo(() => {
		const s = new THREE.Shape();
		s.moveTo(0.34, -0.07);
		s.quadraticCurveTo(0.8, -0.26, 1.2, -0.04);
		s.lineTo(1.2, 0.18);
		s.quadraticCurveTo(0.8, 0.02, 0.34, 0.11);
		s.closePath();
		return new THREE.ShapeGeometry(s, 8);
	}, []);
	useFrame((_, dt) => { if (blades.current) blades.current.rotation.z -= spin.current * dt; });
	return (
		<group position={[x, 0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
			<mesh>
				<torusGeometry args={[1.3, 0.03, 8, 96]} />
				<meshStandardMaterial color="#d9dee8" metalness={1} roughness={0.25} />
			</mesh>
			<group ref={blades}>
				{Array.from({ length: 9 }, (_, i) => (
					<mesh key={i} geometry={blade} rotation={[0, 0, (i / 9) * Math.PI * 2]}>
						<meshStandardMaterial color="#cfd6e4" transparent opacity={0.14} metalness={0.2} roughness={0.2} side={THREE.DoubleSide} depthWrite={false} />
					</mesh>
				))}
				<mesh rotation={[Math.PI / 2, 0, 0]}>
					<cylinderGeometry args={[0.33, 0.33, 0.08, 40]} />
					<meshStandardMaterial color="#e8ebf2" metalness={1} roughness={0.18} />
				</mesh>
			</group>
		</group>
	);
}

function GraphicsCard({ spec, map, levels, spin, intro }) {
	const shroud = useRef();
	const slots = useMemo(() => cardSlots(map.card.length), [map.card.length]);
	const glass = useMemo(() => new THREE.ExtrudeGeometry(roundedRect(10.2, 4.4, 0.45), { depth: 1.0, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 1, curveSegments: 10 }).rotateX(-Math.PI / 2), []);
	const edges = useMemo(() => new THREE.EdgesGeometry(glass, 30), [glass]);
	useFrame(() => {
		if (!shroud.current) return;
		const t = smooth(clamp01(intro.current));
		shroud.current.position.y = 0.2 + (1 - t) * 1.6;
		shroud.current.children.forEach((c) => { if (c.material) c.material.opacity = c.userData.opacity * t; });
	});
	const ghost = !spec.vramGb;
	return (
		<group>
			{/* The board, its connector and bracket */}
			<mesh position={[0, -0.05, 0]}>
				<boxGeometry args={[10, 0.1, 4.2]} />
				<meshStandardMaterial color={ghost ? '#0d0e10' : '#0f1513'} roughness={0.7} metalness={0.15} transparent={ghost} opacity={ghost ? 0.35 : 1} />
			</mesh>
			<mesh position={[-1.1, -0.04, 2.13]}>
				<boxGeometry args={[5.6, 0.07, 0.1]} />
				<meshStandardMaterial color="#c9a14a" metalness={1} roughness={0.3} />
			</mesh>
			<mesh position={[-5.04, 0.7, 0]}>
				<boxGeometry args={[0.06, 1.5, 4.25]} />
				<meshStandardMaterial color="#5d636d" metalness={1} roughness={0.45} transparent={ghost} opacity={ghost ? 0.3 : 1} />
			</mesh>
			{/* A soft shadow under it all */}
			<mesh position={[0, -0.12, -1.2]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
				<planeGeometry args={[17, 11]} />
				<meshBasicMaterial map={glow()} color="#000000" transparent opacity={0.85} depthWrite={false} />
			</mesh>
			{!ghost && (
				<>
					{/* The graphics processor */}
					<mesh position={[0, 0.03, 0]}>
						<boxGeometry args={[2.1, 0.06, 2.1]} />
						<meshStandardMaterial color="#1d2a24" roughness={0.6} />
					</mesh>
					<mesh position={[0, 0.1, 0]}>
						<boxGeometry args={[1.2, 0.08, 1.2]} />
						<meshStandardMaterial color="#8f959e" metalness={1} roughness={0.22} emissive={spec.color} emissiveIntensity={map.onCard > 0 ? 0.18 : 0} />
					</mesh>
					{slots.map((slot, i) => (
						<group key={`${map.card.length}-${i}`} position={[slot.x, 0, slot.z]} rotation={[0, slot.turn, 0]}>
							<Chip size={[0.7, 0.07, 0.5]} runs={map.card[i]} color={spec.color} index={i} levels={levels} lit={1} />
						</group>
					))}
					<Parts count={34} area={[2.6, 4.7, -1.8, 1.8]} seed={7} color="#3a3f47" size={[0.22, 0.16, 0.22]} />
					<Parts count={48} area={[-4.7, -2.6, -1.8, 1.8]} seed={11} color="#2a2e34" size={[0.12, 0.05, 0.08]} />
				</>
			)}
			{/* The cooler, in glass so the memory shows through */}
			<group ref={shroud}>
				<mesh geometry={glass} userData={{ opacity: ghost ? 0.035 : 0.09 }} renderOrder={2}>
					<meshStandardMaterial color="#c4cede" transparent opacity={0.1} roughness={0.08} metalness={0.1} depthWrite={false} />
				</mesh>
				<lineSegments geometry={edges} userData={{ opacity: ghost ? 0.14 : 0.42 }} renderOrder={2}>
					<lineBasicMaterial color="#e6ebf5" transparent opacity={0.42} depthWrite={false} />
				</lineSegments>
				{!ghost && <Fan x={-3.6} spin={spin} />}
				{!ghost && <Fan x={3.6} spin={spin} />}
			</group>
		</group>
	);
}

function MemoryStick({ x, runs, offset, spec, levels }) {
	return (
		<group position={[x, 0, 0]}>
			<mesh position={[0, 0.72, 0]}>
				<boxGeometry args={[5.2, 1.36, 0.06]} />
				<meshStandardMaterial color="#10161a" roughness={0.7} metalness={0.15} />
			</mesh>
			<mesh position={[0, 0.07, 0.035]}>
				<boxGeometry args={[4.9, 0.12, 0.012]} />
				<meshStandardMaterial color="#c9a14a" metalness={1} roughness={0.3} />
			</mesh>
			{runs.map((r, i) => (
				<group key={i} position={[-2.1 + i * 0.6, 0.78, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
					<Chip size={[0.5, 0.05, 0.78]} runs={r} color={spec.color} index={offset + i} levels={levels} lit={0.8} />
				</group>
			))}
		</group>
	);
}

// The camera: framed to fit the aspect, drifting a little with the pointer and on its own.
function Rig({ pointer, calm, anchors }) {
	const { camera, size } = useThree();
	const look = useMemo(() => new THREE.Vector3(0, 0.4, -1.1), []);
	const pos = useMemo(() => new THREE.Vector3(), []);
	const probe = useMemo(() => new THREE.Vector3(), []);
	useFrame((state) => {
		const aspect = size.width / Math.max(1, size.height);
		// Fit about 12.5 units across, and the whole height on tall screens.
		const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
		const dist = Math.max(12.5 / 2 / (half * aspect), 8 / 2 / half) * 1.04;
		const t = calm ? 0 : state.clock.elapsedTime;
		const yaw = (calm ? 0 : pointer.current.x * 0.2 + Math.sin(t * 0.25) * 0.06) - 0.12;
		const pitch = 0.6 + (calm ? 0 : -pointer.current.y * 0.07 + Math.sin(t * 0.31) * 0.02);
		pos.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(dist).add(look);
		if (calm) camera.position.copy(pos); else camera.position.lerp(pos, 0.08);
		camera.lookAt(look);
		// Where the page's two labels go, in CSS pixels.
		const at = (x, y, z) => { probe.set(x, y, z).project(camera); return [(probe.x * 0.5 + 0.5) * size.width, (-probe.y * 0.5 + 0.5) * size.height]; };
		anchors.current = { card: at(-4.4, 0.2, 2.3), ram: at(-5.4, 1.55, -3.4) };
	});
	return null;
}

function Scene({ spec, active, calm, pointer, anchors, onFrame }) {
	const map = useMemo(() => memoryMap(spec), [spec]);
	const { gl, scene, invalidate } = useThree();
	// The room's light, made on the GPU once: no image is downloaded.
	useLayoutEffect(() => {
		const pmrem = new THREE.PMREMGenerator(gl);
		const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		scene.environment = env;
		scene.environmentIntensity = 0.55;
		pmrem.dispose();
		return () => { env.dispose(); scene.environment = null; };
	}, [gl, scene]);

	// Each chip's reveal, 0 to 1; the model's runs grow in chip by chip after every change.
	const reveal = useRef({ card: [], ram: [] });
	const started = useRef(0);
	const intro = useRef(calm ? 1 : 0);
	const spin = useRef(1);
	useLayoutEffect(() => { started.current = performance.now(); invalidate(); }, [spec, invalidate]);
	useLayoutEffect(() => { if (active) invalidate(); }, [active, invalidate]);
	useFrame((state, dt) => {
		const since = (performance.now() - started.current) / 1000;
		const step = (list, count, delay) => { for (let i = 0; i < count; i++) list[i] = calm ? 1 : smooth(clamp01((since - delay - i * 0.07) / 0.35)); };
		step(reveal.current.card, map.card.length, 0.1);
		step(reveal.current.ram, 16, 0.1 + map.card.length * 0.07);
		intro.current = calm ? 1 : Math.min(1, intro.current + dt / 1.4);
		const goal = 0.8 + Math.log10(1 + (spec.tokensPerSec ?? 0)) * 1.6;
		spin.current = calm ? 0 : spin.current + (goal - spin.current) * Math.min(1, dt * 2);
		onFrame?.(anchors.current);
		const settling = since < 0.6 + (map.card.length + 16) * 0.07 || intro.current < 1;
		if (active && (!calm || settling)) state.invalidate();
	});
	const ramRuns = map.ram;
	return (
		<>
			<Rig pointer={pointer} calm={calm} anchors={anchors} />
			<ambientLight intensity={0.15} />
			<directionalLight position={[4, 8, 6]} intensity={1.6} />
			<directionalLight position={[-6, 3, -4]} intensity={0.8} color="#9fb4ff" />
			<GraphicsCard spec={spec} map={map} levels={reveal.current.card} spin={spin} intro={intro} />
			<group position={[0, 0, -3.4]}>
				<MemoryStick x={-2.75} runs={ramRuns.slice(0, 8)} offset={0} spec={spec} levels={reveal.current.ram} />
				<MemoryStick x={2.75} runs={ramRuns.slice(8)} offset={8} spec={spec} levels={reveal.current.ram} />
			</group>
		</>
	);
}

/**
 * Mounts the scene into a canvas (its parent sets the size). Returns { show(spec), memoryMap, destroy }, or null
 * without WebGL. spec: { vramGb, ramGb, needGb, gpuShare, tokensPerSec, color }. `onFrame(anchors)` gets the
 * labels' positions in CSS pixels whenever a frame is drawn.
 */
export async function mountVram(canvas, { spec, onFrame } = {}) {
	const probe = document.createElement('canvas');
	if (!probe.getContext('webgl2')) return null;
	const calmQuery = matchMedia('(prefers-reduced-motion: reduce)');
	const root = createRoot(canvas);
	const pointer = { current: { x: 0, y: 0 } };
	const anchors = { current: null };
	let current = spec, inView = false;
	const box = () => { const r = canvas.parentElement.getBoundingClientRect(); return { width: r.width, height: r.height, top: r.top, left: r.left }; };
	// configure() puts back the default for anything it isn't given, so it always gets the whole set.
	const settings = () => ({
		gl: { antialias: true, alpha: true, powerPreference: 'high-performance' },
		dpr: [1, 2],
		camera: { fov: 30, near: 0.5, far: 80, position: [0, 8, 14] },
		frameloop: 'demand',
		size: box(),
	});
	await root.configure(settings());
	const draw = () => {
		if (!current) return;
		root.render(<Scene spec={current} active={inView && !document.hidden} calm={calmQuery.matches} pointer={pointer} anchors={anchors} onFrame={onFrame} />);
	};
	const ro = new ResizeObserver(async () => { await root.configure(settings()); draw(); });
	ro.observe(canvas.parentElement);
	const io = new IntersectionObserver(([e]) => { if (inView !== e.isIntersecting) { inView = e.isIntersecting; draw(); } });
	io.observe(canvas);
	const onVis = () => draw();
	document.addEventListener('visibilitychange', onVis);
	const onMove = (e) => {
		const r = canvas.getBoundingClientRect();
		pointer.current = { x: clamp01((e.clientX - r.left) / r.width) * 2 - 1, y: clamp01((e.clientY - r.top) / r.height) * 2 - 1 };
	};
	canvas.parentElement.addEventListener('pointermove', onMove);
	draw();
	return {
		show(next) { current = next; draw(); },
		memoryMap,
		destroy() { ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis); canvas.parentElement.removeEventListener('pointermove', onMove); root.unmount(); },
	};
}

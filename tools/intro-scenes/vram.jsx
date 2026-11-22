// "Your PC": a graphics card and two sticks of memory on a motherboard, built with React Three Fiber
// (https://github.com/pmndrs/react-three-fiber, MIT, Poimandres). The card's memory chips light up with the model a
// tier uses, after the memory Windows and the display keep for themselves; whatever doesn't fit on the card spills into
// system memory, shown on the sticks' light bars. The numbers come from the page's planner (the same sums Setup does).
// There is no react-dom here: R3F's own createRoot draws straight into the canvas, and the page writes the words
// around it. Every texture (circuit board, chip markings, brushed metal, the spectrum strip) is drawn here at start.
import { createRoot, extend, useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

extend(THREE);

const GPU_RESERVED_GB = 2; // planner.js keeps this much of the card for Windows and the display
const RAM_RESERVED_GB = 8; // and this much of the system memory for everything else
const RESERVE = '#59606b';
const SPECTRUM = ['#ff5c38', '#ffbd33', '#54db85', '#42adff', '#a873ff'];
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
// The same scattering every time, so the board looks the same on every visit.
const seeded = (seed) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

/** How a model's memory lands: `card[i]` and `ram[i]` list the coloured runs on chip or segment i, as fractions. */
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
	const hx = 1.88, hz = 1.56, out = [];
	const along = (n, len) => Array.from({ length: n }, (_, k) => (n === 1 ? 0 : -len / 2 + (len * k) / (n - 1)));
	along(sides[0], 2.2).forEach((x) => out.push({ x, z: -hz }));
	along(sides[1], 1.7).forEach((z) => out.push({ x: hx, z }));
	along(sides[2], 2.2).reverse().forEach((x) => out.push({ x, z: hz }));
	along(sides[3], 1.7).reverse().forEach((z) => out.push({ x: -hx, z }));
	return out;
}

/* ---------- Textures, drawn once ---------- */
const textures = new Map();
function canvasTexture(key, w, h, draw, { srgb = true, repeat } = {}) {
	if (textures.has(key)) return textures.get(key);
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	draw(c.getContext('2d'), w, h);
	const t = new THREE.CanvasTexture(c);
	if (srgb) t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = 4;
	if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
	textures.set(key, t);
	return t;
}
// A soft round glow, for the light above each busy chip and the shadow under the card.
const glowTexture = () => canvasTexture('glow', 64, 64, (g) => {
	const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
	r.addColorStop(0, 'rgba(255,255,255,0.9)');
	r.addColorStop(0.35, 'rgba(255,255,255,0.28)');
	r.addColorStop(1, 'rgba(255,255,255,0)');
	g.fillStyle = r;
	g.fillRect(0, 0, 64, 64);
});
// A circuit board: fibreglass weave, bundles of copper traces with 45-degree jogs, vias, and white silkscreen.
const pcbTexture = (key, seed, { base = '#0c1512', words = [] } = {}) => canvasTexture(key, 1024, 432, (g, w, h) => {
	const rnd = seeded(seed);
	g.fillStyle = base;
	g.fillRect(0, 0, w, h);
	for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? 'rgba(40,64,54,0.18)' : 'rgba(0,0,0,0.2)'; g.fillRect(0, y, w, 2); }
	g.lineCap = 'round';
	g.lineJoin = 'round';
	for (let b = 0; b < 34; b++) {
		const n = 3 + Math.floor(rnd() * 6), gap = 5, horiz = rnd() > 0.5, len = 70 + rnd() * 240, jog = (rnd() - 0.5) * 110;
		const x = rnd() * w, y = rnd() * h;
		g.strokeStyle = `rgba(${170 + rnd() * 40}, ${120 + rnd() * 30}, 62, ${0.2 + rnd() * 0.16})`;
		g.lineWidth = 1.7;
		for (let k = 0; k < n; k++) {
			g.beginPath();
			if (horiz) { g.moveTo(x, y + k * gap); g.lineTo(x + len, y + k * gap); g.lineTo(x + len + Math.abs(jog), y + k * gap + jog); g.lineTo(x + len * 1.6 + Math.abs(jog), y + k * gap + jog); }
			else { g.moveTo(x + k * gap, y); g.lineTo(x + k * gap, y + len); g.lineTo(x + k * gap + jog, y + len + Math.abs(jog)); g.lineTo(x + k * gap + jog, y + len * 1.6 + Math.abs(jog)); }
			g.stroke();
		}
	}
	for (let i = 0; i < 320; i++) {
		const x = rnd() * w, y = rnd() * h;
		g.fillStyle = 'rgba(200,170,96,0.4)';
		g.beginPath(); g.arc(x, y, 2.3, 0, 7); g.fill();
		g.fillStyle = '#04070a';
		g.beginPath(); g.arc(x, y, 0.9, 0, 7); g.fill();
	}
	g.strokeStyle = 'rgba(232,236,242,0.34)';
	g.fillStyle = 'rgba(232,236,242,0.42)';
	g.lineWidth = 1.1;
	g.font = '600 12px ui-monospace, Menlo, Consolas, monospace';
	for (let i = 0; i < 40; i++) {
		const x = rnd() * w, y = rnd() * h, bw = 12 + rnd() * 30, bh = 7 + rnd() * 16;
		g.strokeRect(x, y, bw, bh);
		if (rnd() > 0.45) g.fillText(['C', 'R', 'L', 'Q', 'U', 'FB'][Math.floor(rnd() * 6)] + (1 + Math.floor(rnd() * 480)), x, y - 3);
	}
	g.font = '700 22px ui-sans-serif, system-ui, sans-serif';
	g.fillStyle = 'rgba(232,236,242,0.5)';
	words.forEach(([text, x, y]) => g.fillText(text, x * w, y * h));
});
const chipTexture = () => canvasTexture('chip', 160, 112, (g, w, h) => {
	g.fillStyle = '#17191e';
	g.fillRect(0, 0, w, h);
	g.fillStyle = 'rgba(255,255,255,0.05)';
	g.fillRect(0, 0, w, 6);
	g.fillStyle = 'rgba(214,220,232,0.62)';
	g.font = '700 22px ui-monospace, Menlo, Consolas, monospace';
	g.fillText('GDDR7', 14, 38);
	g.font = '500 15px ui-monospace, Menlo, Consolas, monospace';
	g.fillStyle = 'rgba(214,220,232,0.45)';
	g.fillText('2GB  32Gbps', 14, 62);
	g.fillText('ONX-2611', 14, 84);
	g.beginPath(); g.arc(w - 18, h - 18, 6, 0, 7); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fill();
});
// Brushed gunmetal with the memory's name, for the sticks' heat spreaders.
const spreaderTexture = () => canvasTexture('spreader', 512, 104, (g, w, h) => {
	const rnd = seeded(5);
	g.fillStyle = '#262a31';
	g.fillRect(0, 0, w, h);
	for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${0.015 + rnd() * 0.035})`; g.fillRect(rnd() * w, rnd() * h, 30 + rnd() * 120, 1); }
	g.fillStyle = 'rgba(255,255,255,0.08)';
	g.fillRect(0, h * 0.18, w, 2);
	g.fillRect(0, h * 0.82, w, 2);
	g.font = '800 26px ui-sans-serif, system-ui, sans-serif';
	g.fillStyle = 'rgba(236,240,248,0.72)';
	g.fillText('ONYX', 24, h * 0.62);
	g.font = '600 15px ui-monospace, Menlo, Consolas, monospace';
	g.fillStyle = 'rgba(236,240,248,0.42)';
	g.fillText('DDR5-5600  CL36', 112, h * 0.6);
});
// The spectrum, for the light strip on the card and the idle glow on the sticks.
const spectrumTexture = () => canvasTexture('spectrum', 256, 4, (g, w, h) => {
	const r = g.createLinearGradient(0, 0, w, 0);
	[...SPECTRUM, SPECTRUM[0]].forEach((c, i, a) => r.addColorStop(i / (a.length - 1), c));
	g.fillStyle = r;
	g.fillRect(0, 0, w, h);
}, { repeat: [1, 1] });

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
const rectPath = (path, x, y, w, h) => { path.moveTo(x, y); path.lineTo(x + w, y); path.lineTo(x + w, y + h); path.lineTo(x, y + h); path.closePath(); return path; };

/** Many copies of one small part: `at(i, object)` places copy i. */
function Many({ count, at, children, ...props }) {
	const ref = useRef();
	useLayoutEffect(() => {
		const o = new THREE.Object3D();
		for (let i = 0; i < count; i++) {
			o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1);
			at(i, o);
			o.updateMatrix();
			ref.current.setMatrixAt(i, o.matrix);
		}
		ref.current.instanceMatrix.needsUpdate = true;
	}, [count, at]);
	const { geometry, ...rest } = props;
	return <instancedMesh ref={ref} args={[geometry ?? null, null, count]} {...rest}>{children}</instancedMesh>;
}

/**
 * How full a chip or segment is: a strip of light along it for each run (reserve, then the model), its body glowing
 * as it fills, and a soft halo above. `levels[index]` (0 to 1, updated every frame) grows the model's runs in.
 */
function Fill({ size, runs, color, index, levels, lit, body }) {
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
			bar.scale.x = len * w * 0.94;
			bar.position.x = (-0.5 + run.from + len / 2) * w * 0.94;
			bar.visible = amount > 0.001;
		});
		const model = runs.find((r) => r.kind === 'model');
		const amount = model ? (model.to - model.from) * k : 0;
		if (halo.current) {
			halo.current.material.opacity = 0.55 * amount * lit;
			halo.current.visible = amount > 0.001;
		}
		if (body?.current) body.current.emissiveIntensity = 0.85 * amount * lit;
	});
	return (
		<group>
			{runs.map((run, i) => (
				<mesh key={i} ref={(m) => { bars.current[i] = m; }} position={[0, h + 0.006, d * 0.36]}>
					<boxGeometry args={[1, 0.014, d * 0.18]} />
					{run.kind === 'model'
						? <meshBasicMaterial color={tint} toneMapped={false} />
						: <meshBasicMaterial color={RESERVE} />}
				</mesh>
			))}
			<mesh ref={halo} position={[0, h + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
				<planeGeometry args={[w * 2.6, d * 3.2]} />
				<meshBasicMaterial map={glowTexture()} color={tint} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
			</mesh>
		</group>
	);
}

/** A memory chip on the card: marked like a real one, glowing as the model fills it. */
function Chip({ runs, color, index, levels }) {
	const body = useRef();
	const size = [0.7, 0.07, 0.5];
	return (
		<group>
			<mesh position={[0, size[1] / 2, 0]}>
				<boxGeometry args={size} />
				<meshStandardMaterial ref={body} map={chipTexture()} roughness={0.42} metalness={0.25} emissive={color} emissiveIntensity={0} />
			</mesh>
			<Fill size={size} runs={runs} color={color} index={index} levels={levels} lit={1} body={body} />
		</group>
	);
}

function Fan({ x, spin, detail }) {
	const rotor = useRef();
	const blade = useMemo(() => {
		const s = new THREE.Shape();
		s.moveTo(0.34, -0.06);
		s.bezierCurveTo(0.62, -0.26, 0.98, -0.28, 1.2, -0.06);
		s.lineTo(1.2, 0.19);
		s.bezierCurveTo(0.98, 0.04, 0.66, 0.02, 0.34, 0.12);
		s.closePath();
		return new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false, curveSegments: 10 });
	}, []);
	useFrame((_, dt) => { if (rotor.current) rotor.current.rotation.z -= spin.current * dt; });
	const blades = 11;
	return (
		<group position={[x, 0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
			{/* The frame: a chrome ring and the stator's spokes behind the blades. */}
			<mesh>
				<torusGeometry args={[1.3, 0.035, 10, 96]} />
				<meshStandardMaterial color="#e3e7ef" metalness={1} roughness={0.18} />
			</mesh>
			<mesh position={[0, 0, -0.02]}>
				<torusGeometry args={[1.26, 0.012, 6, 96]} />
				<meshStandardMaterial color="#20252e" metalness={0.6} roughness={0.4} />
			</mesh>
			<Many count={4} at={(i, o) => { o.rotation.z = (i / 4) * Math.PI * 2 + 0.4; o.position.set(Math.cos(o.rotation.z) * 0.78, Math.sin(o.rotation.z) * 0.78, -0.06); }}>
				<boxGeometry args={[0.9, 0.035, 0.02]} />
				<meshStandardMaterial color="#2a303a" metalness={0.7} roughness={0.35} />
			</Many>
			<group ref={rotor}>
				{/* Blades pitched like a real fan's, smoked glass with a thin-film sheen. */}
				<Many count={blades} geometry={blade} at={(i, o) => { o.rotation.order = 'ZYX'; o.rotation.set(0.42, 0, (i / blades) * Math.PI * 2); }}>
					<meshPhysicalMaterial color="#1c2230" metalness={0.35} roughness={0.28} transparent opacity={detail ? 0.82 : 0.75} iridescence={0.9} iridescenceIOR={1.7} iridescenceThicknessRange={[180, 620]} side={THREE.DoubleSide} />
				</Many>
				<mesh rotation={[Math.PI / 2, 0, 0]}>
					<cylinderGeometry args={[0.34, 0.36, 0.14, 48]} />
					<meshStandardMaterial color="#d9dee8" metalness={1} roughness={0.16} />
				</mesh>
				<mesh position={[0, 0, 0.075]}>
					<torusGeometry args={[0.16, 0.022, 8, 40]} />
					<meshPhysicalMaterial color="#ffffff" metalness={1} roughness={0.1} iridescence={1} iridescenceIOR={1.8} />
				</mesh>
			</group>
		</group>
	);
}

/** The metal bracket at the end of the card: DisplayPort and HDMI cut-outs, vents, the screw tab, and the ports. */
function Bracket({ ghost }) {
	const geometry = useMemo(() => {
		const s = rectPath(new THREE.Shape(), -2.15, 0, 4.3, 1.5);
		const holes = [];
		// Three DisplayPorts (one corner cut) and an HDMI (a trapezoid), along the bottom half.
		for (const z of [-1.62, -0.86, -0.1]) {
			const p = new THREE.Path();
			p.moveTo(z, 0.32); p.lineTo(z + 0.6, 0.32); p.lineTo(z + 0.6, 0.5); p.lineTo(z + 0.5, 0.56); p.lineTo(z, 0.56); p.closePath();
			holes.push(p);
		}
		const hd = new THREE.Path();
		hd.moveTo(0.66, 0.32); hd.lineTo(1.24, 0.32); hd.lineTo(1.3, 0.42); hd.lineTo(1.3, 0.54); hd.lineTo(0.6, 0.54); hd.lineTo(0.6, 0.42); hd.closePath();
		holes.push(hd);
		// Vent slots above the ports.
		for (let k = 0; k < 9; k++) holes.push(rectPath(new THREE.Path(), -1.86 + k * 0.42, 0.78, 0.26, 0.5));
		s.holes = holes;
		return new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false }).rotateY(Math.PI / 2);
	}, []);
	return (
		<group position={[-5.07, -0.1, 0]}>
			<mesh geometry={geometry}>
				<meshStandardMaterial color="#8c929c" metalness={1} roughness={0.32} transparent={ghost} opacity={ghost ? 0.3 : 1} />
			</mesh>
			{/* The screw tab folded over the top, and its screw. */}
			<mesh position={[0.18, 1.5, -1.4]}>
				<boxGeometry args={[0.4, 0.04, 1.0]} />
				<meshStandardMaterial color="#8c929c" metalness={1} roughness={0.32} transparent={ghost} opacity={ghost ? 0.3 : 1} />
			</mesh>
			{!ghost && (
				<>
					<mesh position={[0.2, 1.54, -1.4]}>
						<cylinderGeometry args={[0.09, 0.09, 0.05, 24]} />
						<meshStandardMaterial color="#d7dbe2" metalness={1} roughness={0.2} />
					</mesh>
					{/* The connectors behind the cut-outs. */}
					<Many count={4} at={(i, o) => { o.position.set(0.2, 0.44, -(i < 3 ? [-1.32, -0.56, 0.2][i] : 0.95)); }}>
						<boxGeometry args={[0.36, 0.2, 0.56]} />
						<meshStandardMaterial color="#14161a" metalness={0.5} roughness={0.5} />
					</Many>
				</>
			)}
		</group>
	);
}

function GraphicsCard({ spec, map, levels, spin, intro, detail }) {
	const shroud = useRef();
	const strip = useRef();
	const slots = useMemo(() => cardSlots(map.card.length), [map.card.length]);
	const glass = useMemo(() => new THREE.ExtrudeGeometry(roundedRect(10.2, 4.4, 0.45), { depth: 1.0, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 1, curveSegments: 10 }).rotateX(-Math.PI / 2), []);
	const edges = useMemo(() => new THREE.EdgesGeometry(glass, 30), [glass]);
	const frame = useMemo(() => {
		const s = roundedRect(10.24, 4.44, 0.47);
		s.holes = [roundedRect(9.7, 3.9, 0.3)];
		return new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false, curveSegments: 10 }).rotateX(-Math.PI / 2);
	}, []);
	const pipes = useMemo(() => [-2.0, -1.88, 1.88, 2.0].map((z) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
		new THREE.Vector3(-4.75, 0.42, z), new THREE.Vector3(-2.5, 0.42, z), new THREE.Vector3(-1.2, 0.5, z), new THREE.Vector3(1.2, 0.5, z), new THREE.Vector3(2.5, 0.42, z), new THREE.Vector3(4.75, 0.42, z),
	]), 64, 0.045, 10, false)), []);
	const board = useMemo(() => pcbTexture('card-pcb', 3, { words: [['ONYX  RTX-READY  REV 1.0', 0.6, 0.92], ['PCIE 5.0 x16', 0.08, 0.95]] }), []);
	const spectrum = useMemo(() => spectrumTexture(), []);
	useFrame((_, dt) => {
		if (shroud.current) {
			const t = smooth(clamp01(intro.current));
			shroud.current.position.y = 0.2 + (1 - t) * 1.6;
			shroud.current.traverse((c) => { if (c.material && c.userData.opacity !== undefined) c.material.opacity = c.userData.opacity * t; });
		}
		if (strip.current) spectrum.offset.x = (spectrum.offset.x + dt * 0.06) % 1;
	});
	const ghost = !spec.vramGb;
	const fins = detail ? 30 : 16;
	const smd = useMemo(() => {
		// Small parts, kept out of the chips' ring and the components' rows.
		const out = [];
		const r = seeded(17);
		while (out.length < (detail ? 150 : 60)) {
			const x = -4.8 + r() * 9.6, z = -2.0 + r() * 4.0;
			const inRing = Math.abs(x) < 2.35 && Math.abs(z) < 1.95;
			const inVrm = x > 2.3 && Math.abs(z) < 1.2;
			if (inRing && !(Math.abs(x) < 1.15 && Math.abs(z) < 1.15)) continue;
			if (inVrm || (Math.abs(x) < 1.1 && Math.abs(z) < 1.1)) continue;
			out.push([x, z, r() > 0.5, 0.6 + r() * 0.8]);
		}
		return out;
	}, [detail]);
	return (
		<group>
			{/* The board: a circuit board under a dark backplate, on four standoffs. */}
			<mesh position={[0, -0.05, 0]}>
				<boxGeometry args={[10, 0.1, 4.2]} />
				<meshStandardMaterial map={board} color={ghost ? '#4a4f56' : '#ffffff'} roughness={0.55} metalness={0.25} transparent={ghost} opacity={ghost ? 0.3 : 1} />
			</mesh>
			<mesh position={[0, -0.13, 0]}>
				<boxGeometry args={[10.1, 0.05, 4.3]} />
				<meshStandardMaterial color="#1a1d22" metalness={0.85} roughness={0.38} transparent={ghost} opacity={ghost ? 0.3 : 1} />
			</mesh>
			<Many count={4} at={(i, o) => o.position.set(i % 2 ? 4.55 : -4.55, -0.27, i < 2 ? -1.8 : 1.8)}>
				<cylinderGeometry args={[0.08, 0.08, 0.24, 16]} />
				<meshStandardMaterial color="#c9ced6" metalness={1} roughness={0.25} />
			</Many>
			{/* The connector's gold pins, with the key notch. */}
			<Many count={detail ? 72 : 36} at={(i, o) => { const n = detail ? 72 : 36, x = -3.95 + (i / (n - 1)) * 5.7; o.position.set(x + (x > -2.65 ? 0.12 : 0), -0.035, 2.06); }}>
				<boxGeometry args={[detail ? 0.055 : 0.11, 0.012, 0.22]} />
				<meshStandardMaterial color="#d8ae55" metalness={1} roughness={0.28} />
			</Many>
			<Bracket ghost={ghost} />
			{!ghost && (
				<>
					{/* The graphics processor: a substrate ringed with tiny capacitors, and a die with a thin-film sheen. */}
					<mesh position={[0, 0.03, 0]}>
						<boxGeometry args={[2.1, 0.06, 2.1]} />
						<meshStandardMaterial color="#1f3a2d" roughness={0.55} metalness={0.2} />
					</mesh>
					<mesh position={[0, 0.1, 0]}>
						<boxGeometry args={[1.2, 0.08, 1.2]} />
						<meshPhysicalMaterial color="#9aa0aa" metalness={1} roughness={0.14} iridescence={1} iridescenceIOR={1.6} iridescenceThicknessRange={[220, 720]} emissive={spec.color} emissiveIntensity={map.onCard > 0 ? 0.12 : 0} />
					</mesh>
					<Many count={24} at={(i, o) => { const side = Math.floor(i / 6), k = (i % 6) / 5 - 0.5; const a = 0.78; o.position.set(side < 2 ? k * 1.3 : (side === 2 ? -a : a), 0.075, side < 2 ? (side ? -a : a) : k * 1.3); }}>
						<boxGeometry args={[0.07, 0.03, 0.04]} />
						<meshStandardMaterial color="#c8a25a" metalness={0.9} roughness={0.3} />
					</Many>
					{slots.map((slot, i) => (
						<group key={`${map.card.length}-${i}`} position={[slot.x, 0, slot.z]}>
							<Chip runs={map.card[i]} color={spec.color} index={i} levels={levels} />
						</group>
					))}
					{/* Power: two rows of chokes, their transistors, a bank of capacitors, and the 12-pin connector. */}
					<Many count={14} at={(i, o) => o.position.set(2.5 + (i % 7) * 0.33, 0.13, i < 7 ? -0.72 : 0.72)}>
						<boxGeometry args={[0.28, 0.26, 0.3]} />
						<meshStandardMaterial color="#5b616b" metalness={0.8} roughness={0.42} />
					</Many>
					<Many count={14} at={(i, o) => o.position.set(2.5 + (i % 7) * 0.33, 0.035, i < 7 ? -0.34 : 0.34)}>
						<boxGeometry args={[0.2, 0.06, 0.16]} />
						<meshStandardMaterial color="#121418" metalness={0.3} roughness={0.5} />
					</Many>
					<Many count={9} at={(i, o) => o.position.set(4.72, 0.13, -1.2 + i * 0.3)}>
						<cylinderGeometry args={[0.1, 0.1, 0.26, 20]} />
						<meshStandardMaterial color="#2a2f38" metalness={0.6} roughness={0.35} />
					</Many>
					<Many count={9} at={(i, o) => o.position.set(4.72, 0.262, -1.2 + i * 0.3)}>
						<cylinderGeometry args={[0.095, 0.095, 0.01, 20]} />
						<meshStandardMaterial color="#cfd4dc" metalness={1} roughness={0.25} />
					</Many>
					<mesh position={[3.95, 0.16, -1.75]}>
						<boxGeometry args={[0.92, 0.32, 0.36]} />
						<meshStandardMaterial color="#0e0f12" roughness={0.6} metalness={0.1} />
					</mesh>
					<Many count={12} at={(i, o) => o.position.set(3.6 + (i % 6) * 0.14, 0.325, i < 6 ? -1.83 : -1.67)}>
						<boxGeometry args={[0.09, 0.012, 0.09]} />
						<meshStandardMaterial color="#3a3f47" roughness={0.7} />
					</Many>
					<Many count={smd.length} at={(i, o) => { const [x, z, turn, k] = smd[i]; o.position.set(x, 0.02, z); o.rotation.y = turn ? Math.PI / 2 : 0; o.scale.set(k, 1, k); }}>
						<boxGeometry args={[0.1, 0.04, 0.06]} />
						<meshStandardMaterial color="#2c3138" metalness={0.4} roughness={0.5} />
					</Many>
				</>
			)}
			{/* A soft shadow under it all */}
			<mesh position={[0, -0.384, -1.2]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
				<planeGeometry args={[16, 10.5]} />
				<meshBasicMaterial map={glowTexture()} color="#000000" transparent opacity={0.8} depthWrite={false} />
			</mesh>
			{/* The cooler: fin stacks and copper heat pipes under a glass cover with a chrome frame, two fans, a light strip. */}
			<group ref={shroud}>
				{!ghost && (
					<>
						<Many count={fins * 2} at={(i, o) => { const k = i % fins, side = i < fins ? -1 : 1; o.position.set(side * (2.45 + (k / (fins - 1)) * 2.3), 0.42, 0); }}>
							<boxGeometry args={[detail ? 0.022 : 0.04, 0.56, 3.55]} />
							<meshStandardMaterial color="#aeb5bf" metalness={1} roughness={0.34} />
						</Many>
						{pipes.map((geometry, i) => (
							<mesh key={i} geometry={geometry}>
								<meshStandardMaterial color="#c07a48" metalness={1} roughness={0.24} />
							</mesh>
						))}
					</>
				)}
				<mesh geometry={glass} userData={{ opacity: ghost ? 0.035 : 0.07 }} renderOrder={2}>
					<meshStandardMaterial color="#c4cede" transparent opacity={0.07} roughness={0.06} metalness={0.1} depthWrite={false} />
				</mesh>
				<lineSegments geometry={edges} userData={{ opacity: ghost ? 0.14 : 0.36 }} renderOrder={2}>
					<lineBasicMaterial color="#e6ebf5" transparent opacity={0.36} depthWrite={false} />
				</lineSegments>
				<mesh geometry={frame} position={[0, 1.04, 0]} userData={{ opacity: ghost ? 0.25 : 1 }}>
					<meshStandardMaterial color="#e1e5ec" metalness={1} roughness={0.16} transparent opacity={1} />
				</mesh>
				{!ghost && (
					<>
						{/* Chrome accents between the fans, and the spectrum strip along the front. */}
						{[-1, 1].map((side) => (
							<mesh key={side} position={[side * 1.1, 1.07, 0]} rotation={[0, side * 0.35, 0]}>
								<boxGeometry args={[1.4, 0.03, 0.06]} />
								<meshStandardMaterial color="#e8ecf2" metalness={1} roughness={0.12} />
							</mesh>
						))}
						<mesh ref={strip} position={[0, 0.55, 2.27]}>
							<planeGeometry args={[4.6, 0.1]} />
							<meshBasicMaterial map={spectrum} toneMapped={false} />
						</mesh>
						<mesh position={[0, 0.55, 2.29]}>
							<planeGeometry args={[5.4, 0.7]} />
							<meshBasicMaterial map={glowTexture()} color="#9fb8ff" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
						</mesh>
						<Fan x={-3.6} spin={spin} detail={detail} />
						<Fan x={3.6} spin={spin} detail={detail} />
					</>
				)}
			</group>
		</group>
	);
}

/** A DDR5 stick in its slot: heat spreaders, gold pins, and a light bar whose eight segments show what's in it. */
function MemoryStick({ x, runs, offset, spec, levels, detail }) {
	const spreader = useMemo(() => spreaderTexture(), []);
	const pins = detail ? 46 : 23;
	return (
		<group position={[x, 0, 0]}>
			{/* The slot, with a latch at each end. */}
			<mesh position={[0, 0.0, 0]}>
				<boxGeometry args={[5.6, 0.22, 0.26]} />
				<meshStandardMaterial color="#121317" roughness={0.6} metalness={0.15} />
			</mesh>
			{[-1, 1].map((side) => (
				<mesh key={side} position={[side * 2.86, 0.22, 0]} rotation={[0, 0, side * -0.18]}>
					<boxGeometry args={[0.12, 0.42, 0.3]} />
					<meshStandardMaterial color="#c9ccd3" roughness={0.5} metalness={0.1} />
				</mesh>
			))}
			<mesh position={[0, 0.78, 0]}>
				<boxGeometry args={[5.2, 1.36, 0.05]} />
				<meshStandardMaterial color="#10241c" roughness={0.65} metalness={0.15} />
			</mesh>
			<Many count={pins * 2} at={(i, o) => { const k = i % pins, xx = -2.45 + (k / (pins - 1)) * 4.9; o.position.set(xx + (xx > -0.3 ? 0.08 : 0), 0.2, i < pins ? 0.028 : -0.028); }}>
				<boxGeometry args={[detail ? 0.05 : 0.1, 0.13, 0.008]} />
				<meshStandardMaterial color="#d8ae55" metalness={1} roughness={0.28} />
			</Many>
			{[-1, 1].map((side) => (
				<mesh key={side} position={[0, 0.86, side * 0.046]}>
					<boxGeometry args={[5.0, 1.0, 0.035]} />
					<meshStandardMaterial map={spreader} roughness={0.32} metalness={0.9} />
				</mesh>
			))}
			<mesh position={[0, 1.39, 0]}>
				<boxGeometry args={[5.0, 0.1, 0.13]} />
				<meshStandardMaterial color="#1d2026" roughness={0.4} metalness={0.8} />
			</mesh>
			{/* The light bar: frosted, one segment per eighth of the stick. */}
			<mesh position={[0, 1.5, 0]}>
				<boxGeometry args={[5.0, 0.14, 0.11]} />
				<meshStandardMaterial color="#d9dde6" transparent opacity={0.16} roughness={0.2} depthWrite={false} />
			</mesh>
			{runs.map((r, i) => (
				<Segment key={i} x={-2.19 + i * 0.625} runs={r} spec={spec} index={offset + i} levels={levels} hue={SPECTRUM[(offset + i) % SPECTRUM.length]} />
			))}
		</group>
	);
}

/** One segment of a stick's light bar: a faint idle colour when free, grey when reserved, the model's colour when used. */
function Segment({ x, runs, spec, index, levels, hue }) {
	const body = useRef();
	const model = runs.find((r) => r.kind === 'model');
	const reserved = runs.some((r) => r.kind === 'reserve');
	const colour = useMemo(() => new THREE.Color(model ? spec.color : reserved ? RESERVE : hue), [model, reserved, spec.color, hue]);
	useFrame(() => {
		if (!body.current) return;
		const k = levels[index] ?? 1;
		body.current.emissive.copy(colour);
		body.current.emissiveIntensity = model ? 0.2 + 1.1 * (model.to - model.from) * k : reserved ? 0.55 : 0.16;
	});
	return (
		<group position={[x, 1.5, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
			<mesh>
				<boxGeometry args={[0.58, 0.02, 0.1]} />
				<meshStandardMaterial ref={body} color="#15171c" roughness={0.5} toneMapped={false} />
			</mesh>
			<Fill size={[0.58, 0.012, 0.1]} runs={runs} color={spec.color} index={index} levels={levels} lit={0.85} />
		</group>
	);
}

// The camera: framed to fit the aspect, drifting a little with the pointer and on its own.
function Rig({ pointer, calm, anchors }) {
	const { camera, size } = useThree();
	const look = useMemo(() => new THREE.Vector3(0, 0.3, -1.7), []);
	const pos = useMemo(() => new THREE.Vector3(), []);
	const probe = useMemo(() => new THREE.Vector3(), []);
	useFrame((state) => {
		const aspect = size.width / Math.max(1, size.height);
		// Fit about 12.5 units across, and the whole height on tall screens.
		const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
		const dist = Math.max(12.8 / 2 / (half * aspect), 9 / 2 / half) * 1.04;
		const t = calm ? 0 : state.clock.elapsedTime;
		const yaw = (calm ? 0 : pointer.current.x * 0.2 + Math.sin(t * 0.25) * 0.06) - 0.12;
		const pitch = 0.74 + (calm ? 0 : -pointer.current.y * 0.07 + Math.sin(t * 0.31) * 0.02);
		pos.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(dist).add(look);
		if (calm) camera.position.copy(pos); else camera.position.lerp(pos, 0.08);
		camera.lookAt(look);
		// Where the page's two labels go, in CSS pixels.
		const at = (x, y, z) => { probe.set(x, y, z).project(camera); return [(probe.x * 0.5 + 0.5) * size.width, (-probe.y * 0.5 + 0.5) * size.height]; };
		anchors.current = { card: at(-4.4, 0.2, 2.3), ram: at(-5.4, 1.5, -4.3) };
	});
	return null;
}

function Motherboard() {
	const texture = useMemo(() => pcbTexture('board', 29, { base: '#0a0f0d', words: [['ONYX  AI WORKSTATION', 0.06, 0.1], ['DDR5  DIMM A1  A2', 0.36, 0.3]] }), []);
	return (
		<mesh position={[0, -0.42, -1.8]}>
			<boxGeometry args={[17, 0.06, 12.5]} />
			<meshStandardMaterial map={texture} color="#9aa3a0" roughness={0.6} metalness={0.3} />
		</mesh>
	);
}

function Scene({ spec, active, calm, detail, pointer, anchors, onFrame }) {
	const map = useMemo(() => memoryMap(spec), [spec]);
	const { gl, scene, invalidate } = useThree();
	// The room's light, made on the GPU once: no image is downloaded.
	useLayoutEffect(() => {
		const pmrem = new THREE.PMREMGenerator(gl);
		const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		scene.environment = env;
		scene.environmentIntensity = 0.6;
		pmrem.dispose();
		return () => { env.dispose(); scene.environment = null; };
	}, [gl, scene]);

	// Each chip's and segment's reveal, 0 to 1; the model's runs grow in one by one after every change.
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
	return (
		<>
			<Rig pointer={pointer} calm={calm} anchors={anchors} />
			<ambientLight intensity={0.15} />
			<directionalLight position={[4, 8, 6]} intensity={1.6} />
			<directionalLight position={[-6, 3, -4]} intensity={0.8} color="#9fb4ff" />
			<pointLight position={[0, 0.8, 3.2]} intensity={2.2} distance={6} color="#c9b6ff" />
			<Motherboard />
			<GraphicsCard spec={spec} map={map} levels={reveal.current.card} spin={spin} intro={intro} detail={detail} />
			<group position={[0, -0.28, -4.3]} rotation={[-0.16, 0, 0]}>
				<MemoryStick x={-2.75} runs={map.ram.slice(0, 8)} offset={0} spec={spec} levels={reveal.current.ram} detail={detail} />
				<MemoryStick x={2.75} runs={map.ram.slice(8)} offset={8} spec={spec} levels={reveal.current.ram} detail={detail} />
			</group>
		</>
	);
}

/**
 * Mounts the scene into a canvas (its parent sets the size). Returns { show(spec), memoryMap, destroy }, or null
 * without WebGL. spec: { vramGb, ramGb, needGb, gpuShare, tokensPerSec, color }. `onFrame(anchors)` gets the
 * labels' positions in CSS pixels whenever a frame is drawn. Phones get fewer of the tiny parts.
 */
export async function mountVram(canvas, { spec, onFrame } = {}) {
	const probe = document.createElement('canvas');
	if (!probe.getContext('webgl2')) return null;
	const calmQuery = matchMedia('(prefers-reduced-motion: reduce)');
	const small = matchMedia('(max-width: 760px)').matches || matchMedia('(pointer: coarse)').matches;
	const root = createRoot(canvas);
	const pointer = { current: { x: 0, y: 0 } };
	const anchors = { current: null };
	let current = spec, inView = false;
	const box = () => { const r = canvas.parentElement.getBoundingClientRect(); return { width: r.width, height: r.height, top: r.top, left: r.left }; };
	// configure() puts back the default for anything it isn't given, so it always gets the whole set.
	const settings = () => ({
		gl: { antialias: true, alpha: true, powerPreference: 'high-performance' },
		dpr: small ? [1, 1.5] : [1, 2],
		camera: { fov: 30, near: 0.5, far: 80, position: [0, 8, 14] },
		frameloop: 'demand',
		size: box(),
	});
	await root.configure(settings());
	const draw = () => {
		if (!current) return;
		root.render(<Scene spec={current} active={inView && !document.hidden} calm={calmQuery.matches} detail={!small} pointer={pointer} anchors={anchors} onFrame={onFrame} />);
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

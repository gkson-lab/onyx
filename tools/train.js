// Trains Onyx 2's neural intent model and writes its open weights to src/onyx-weights.js.
//   node tools/train.js
// The training data is every example phrase in onyx-data.js (English) and onyx-languages.js (Spanish and French),
// plus copies with a typo, a dropped word or a filler word, so the model learns to read messy messages. Training is
// deterministic: the same phrases give the same weights. The phrasings test.js holds out are never trained on.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
for (const f of ['host/host.js', 'src/onyx-math.js', 'src/onyx-dictionary.js', 'src/onyx-languages.js', 'src/onyx-data.js', 'src/onyx-model.js', 'src/onyx.js']) require(path.join(ROOT, f));

const HIDDEN = 48;
const EPOCHS = 36;
const RATE = 0.004;
const DECAY = 1e-5;
const { DIM, features } = Omni.onyxModel;
const normalize = Omni.onyx.normalize;

// A small seeded random number generator, so every run is the same.
function mulberry32(seed) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const rand = mulberry32(20261106);
const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand());

/* ---------- Data ---------- */

const sets = { en: Omni.onyxData.INTENTS, es: Omni.onyxLanguages.LANGS.es.intents, fr: Omni.onyxLanguages.LANGS.fr.intents };
const labels = [...new Set(Object.values(sets).flatMap((list) => list.map((i) => i.id)))].sort();
const index = new Map(labels.map((l, i) => [l, i]));
const FILLERS = { en: ['please', 'hey', 'um', 'so', 'just', 'onyx'], es: ['por favor', 'oye', 'pues', 'bueno'], fr: ['s il te plait', 'alors', 'bon', 'euh'] };

function typo(word) {
	if (word.length < 4) return word;
	const i = 1 + Math.floor(rand() * (word.length - 2));
	const kind = Math.floor(rand() * 3);
	if (kind === 0) return word.slice(0, i) + word.slice(i + 1);
	if (kind === 1) return word.slice(0, i - 1) + word[i] + word[i - 1] + word.slice(i + 1);
	return word.slice(0, i) + 'aeiou'[Math.floor(rand() * 5)] + word.slice(i + 1);
}

const samples = [];
for (const [lang, intents] of Object.entries(sets)) {
	for (const intent of intents) {
		for (const ex of intent.examples) {
			const base = normalize(ex);
			const y = index.get(intent.id);
			const words = base.split(' ');
			const variants = [base, base];
			for (let k = 0; k < 2; k++) {
				const w = [...words];
				const j = Math.floor(rand() * w.length);
				w[j] = typo(w[j]);
				variants.push(w.join(' '));
			}
			if (words.length >= 3) variants.push(words.filter((_, j) => j !== Math.floor(rand() * words.length)).join(' '));
			const filler = FILLERS[lang][Math.floor(rand() * FILLERS[lang].length)];
			variants.push(rand() < 0.5 ? `${filler} ${base}` : `${base} ${filler}`);
			for (const v of variants) samples.push({ x: [...features(v)], y });
		}
	}
}

/* ---------- Model: DIM -> HIDDEN (ReLU) -> labels (softmax), trained with Adam ---------- */

const K = labels.length;
const W1 = Float32Array.from({ length: DIM * HIDDEN }, () => gauss() * 0.08);
const b1 = new Float32Array(HIDDEN);
const W2 = Float32Array.from({ length: HIDDEN * K }, () => gauss() * Math.sqrt(2 / HIDDEN) * 0.5);
const b2 = new Float32Array(K);
const adam = (n) => ({ m: new Float32Array(n), v: new Float32Array(n) });
const A = { W1: adam(W1.length), b1: adam(HIDDEN), W2: adam(W2.length), b2: adam(K) };
const B1 = 0.9;
const B2 = 0.999;
let step = 0;

function update(param, state, i, g, lr) {
	g += DECAY * param[i];
	state.m[i] = B1 * state.m[i] + (1 - B1) * g;
	state.v[i] = B2 * state.v[i] + (1 - B2) * g * g;
	const mh = state.m[i] / (1 - Math.pow(B1, step));
	const vh = state.v[i] / (1 - Math.pow(B2, step));
	param[i] -= (lr * mh) / (Math.sqrt(vh) + 1e-8);
}

function forward(x) {
	const h = new Float32Array(HIDDEN);
	for (let j = 0; j < HIDDEN; j++) h[j] = b1[j];
	for (const [i, v] of x) for (let j = 0; j < HIDDEN; j++) h[j] += v * W1[i * HIDDEN + j];
	for (let j = 0; j < HIDDEN; j++) if (h[j] < 0) h[j] = 0;
	const z = new Float32Array(K);
	let max = -Infinity;
	for (let k = 0; k < K; k++) {
		let s = b2[k];
		for (let j = 0; j < HIDDEN; j++) s += h[j] * W2[j * K + k];
		z[k] = s;
		if (s > max) max = s;
	}
	let sum = 0;
	for (let k = 0; k < K; k++) sum += z[k] = Math.exp(z[k] - max);
	for (let k = 0; k < K; k++) z[k] /= sum;
	return { h, p: z };
}

for (let epoch = 1; epoch <= EPOCHS; epoch++) {
	for (let i = samples.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[samples[i], samples[j]] = [samples[j], samples[i]];
	}
	const lr = RATE * (epoch <= 4 ? epoch / 4 : 1 - (epoch - 4) / (EPOCHS - 3));
	let loss = 0;
	let right = 0;
	for (const { x, y } of samples) {
		step++;
		const { h, p } = forward(x);
		loss -= Math.log(p[y] + 1e-12);
		if (p.indexOf(Math.max(...p)) === y) right++;
		const dz = Float32Array.from(p);
		dz[y] -= 1;
		const dh = new Float32Array(HIDDEN);
		for (let j = 0; j < HIDDEN; j++) {
			if (h[j] <= 0) continue;
			let s = 0;
			for (let k = 0; k < K; k++) s += dz[k] * W2[j * K + k];
			dh[j] = s;
		}
		for (let j = 0; j < HIDDEN; j++) for (let k = 0; k < K; k++) update(W2, A.W2, j * K + k, dz[k] * h[j], lr);
		for (let k = 0; k < K; k++) update(b2, A.b2, k, dz[k], lr);
		for (const [i, v] of x) for (let j = 0; j < HIDDEN; j++) if (dh[j]) update(W1, A.W1, i * HIDDEN + j, dh[j] * v, lr);
		for (let j = 0; j < HIDDEN; j++) update(b1, A.b1, j, dh[j], lr);
	}
	if (epoch % 6 === 0 || epoch === 1) console.log(`epoch ${epoch}: loss ${(loss / samples.length).toFixed(4)}, accuracy ${((100 * right) / samples.length).toFixed(1)}%`);
}

/* ---------- Write the weights: int8 with one scale per matrix ---------- */

function pack(w) {
	let max = 0;
	for (const x of w) max = Math.max(max, Math.abs(x));
	const scale = max / 127 || 1;
	const bytes = Buffer.alloc(w.length);
	for (let i = 0; i < w.length; i++) bytes.writeInt8(Math.max(-127, Math.min(127, Math.round(w[i] / scale))), i);
	return { b64: bytes.toString('base64'), scale: +scale.toPrecision(8) };
}
const p1 = pack(W1);
const p2 = pack(W2);
const round = (a) => Array.from(a, (x) => +x.toFixed(5));
const weights = { version: '2.0', dim: DIM, hidden: HIDDEN, labels, s1: p1.scale, s2: p2.scale, b1: round(b1), b2: round(b2), w1: p1.b64, w2: p2.b64 };
const params = DIM * HIDDEN + HIDDEN + HIDDEN * K + K;
const out = `// Onyx 2's open weights: the trained parameters of the neural intent model in onyx-model.js (${params.toLocaleString('en-US')} of them,
// ${DIM} inputs -> ${HIDDEN} hidden units -> ${K} intents, stored as int8 with one scale per matrix). Generated by tools/train.js
// from ${samples.length.toLocaleString('en-US')} training phrases; don't edit by hand, retrain instead.
(function (root) {
	(root.Omni = root.Omni || {}).onyxWeights = ${JSON.stringify(weights)};
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(path.join(ROOT, 'src', 'onyx-weights.js'), out);
console.log(`wrote src/onyx-weights.js: ${params.toLocaleString('en-US')} parameters, ${K} intents, ${samples.length} training phrases, ${(out.length / 1024).toFixed(0)} KB`);

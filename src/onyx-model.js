// Onyx 2's neural intent model: a small, two-layer network with open weights. It reads a message as hashed features
// (words, word pairs and three-letter pieces of words, so "helo" still looks like "hello") and gives a probability for
// each intent, in English, Spanish and French. The weights are in onyx-weights.js, trained by tools/train.js from the
// example phrases in onyx-data.js and onyx-languages.js; anyone can retrain them. The engine combines this model with
// its TF-IDF phrase matcher, and works without it if the weights file isn't loaded.
(function (root) {
	'use strict';

	const DIM = 4096;

	/** FNV-1a, folded into DIM buckets. */
	function hash(s) {
		let h = 0x811c9dc5;
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 0x01000193);
		}
		return (h >>> 0) % DIM;
	}

	const stem = (w) => (w.length > 5 && w.endsWith('ing') ? w.slice(0, -3) : w.length > 4 && w.endsWith('ed') ? w.slice(0, -2) : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);

	/**
	 * A message as sparse features: Map(bucket -> value), scaled to unit length. `text` should already be normalized
	 * (lowercase, no accents or punctuation); the engine and the trainer both pass it through Omni.onyx.normalize.
	 */
	function features(text) {
		const words = String(text).split(/\s+/).filter(Boolean).map(stem);
		const f = new Map();
		const add = (key, v) => {
			const b = hash(key);
			f.set(b, (f.get(b) || 0) + v);
		};
		words.forEach((w, i) => {
			add('w:' + w, 1);
			if (i + 1 < words.length) add('b:' + w + '_' + words[i + 1], 0.8);
			const padded = '#' + w + '#';
			if (w.length >= 3) for (let j = 0; j + 3 <= padded.length; j++) add('c:' + padded.slice(j, j + 3), 0.35);
		});
		if (!words.length) add('empty', 1);
		let norm = 0;
		f.forEach((v) => (norm += v * v));
		norm = Math.sqrt(norm) || 1;
		f.forEach((v, k) => f.set(k, v / norm));
		return f;
	}

	/** Weights stored as int8, base64, with one scale per matrix: { dim, hidden, labels, w1, s1, b1, w2, s2, b2 }. */
	function decode(packed) {
		const bytes = (b64) => {
			const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
			const out = new Int8Array(bin.length);
			for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) << 24 >> 24;
			return out;
		};
		const toFloat = (b64, scale) => Float32Array.from(bytes(b64), (x) => x * scale);
		return { dim: packed.dim, hidden: packed.hidden, labels: packed.labels, w1: toFloat(packed.w1, packed.s1), b1: Float32Array.from(packed.b1), w2: toFloat(packed.w2, packed.s2), b2: Float32Array.from(packed.b2) };
	}

	/** Probabilities for each label: { label: p }. `net` is decoded weights; `only` limits the labels considered. */
	function predict(net, feats, only) {
		const H = net.hidden;
		const h = new Float32Array(H);
		for (let j = 0; j < H; j++) h[j] = net.b1[j];
		feats.forEach((v, i) => {
			const row = i * H;
			for (let j = 0; j < H; j++) h[j] += v * net.w1[row + j];
		});
		for (let j = 0; j < H; j++) if (h[j] < 0) h[j] = 0;
		const K = net.labels.length;
		const z = new Float32Array(K);
		let max = -Infinity;
		for (let k = 0; k < K; k++) {
			if (only && !only.has(net.labels[k])) {
				z[k] = -Infinity;
				continue;
			}
			let s = net.b2[k];
			for (let j = 0; j < H; j++) s += h[j] * net.w2[j * K + k];
			z[k] = s;
			if (s > max) max = s;
		}
		let sum = 0;
		for (let k = 0; k < K; k++) {
			z[k] = z[k] === -Infinity ? 0 : Math.exp(z[k] - max);
			sum += z[k];
		}
		const out = {};
		for (let k = 0; k < K; k++) if (z[k]) out[net.labels[k]] = z[k] / sum;
		return out;
	}

	let net = null;
	const loaded = () => {
		if (!net && root.Omni && root.Omni.onyxWeights) net = decode(root.Omni.onyxWeights);
		return net;
	};

	(root.Omni = root.Omni || {}).onyxModel = {
		DIM,
		features,
		decode,
		predict: (text, only) => (loaded() ? predict(net, features(text), only) : null),
		ready: () => !!loaded(),
		info: () => (loaded() ? { labels: net.labels.length, hidden: net.hidden, parameters: net.dim * net.hidden + net.hidden + net.hidden * net.labels.length + net.labels.length } : null),
	};
})(typeof window !== 'undefined' ? window : globalThis);

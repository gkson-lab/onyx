// Onyx 2.5's prediction network: guesses the next words of what someone is typing, from the last four words. The weights
// are open (onyx-predict-weights.js, trained by tools/train-predict.py on what people say to Onyx); this file runs them.
//
//   Omni.onyxPredict.next('how do you say')          ->  [{ word: 'happy', p: 0.08 }, ...]   the likeliest next words
//   Omni.onyxPredict.next('write a hai')             ->  [{ word: 'haiku', ... }]            the word being typed
//   Omni.onyxPredict.complete('i have an exam on')   ->  'friday'                            the likeliest rest of it
//   Omni.onyxPredict.suggest('write a haiku about')  ->  ['the sea', 'autumn', 'the moon']   a few different endings
(function (root) {
	'use strict';

	const Omni = (root.Omni = root.Omni || {});
	let net = null;

	/** Decodes the 8-bit weights into numbers, once. */
	function load() {
		if (net) return net;
		const W = Omni.onyxPredictWeights;
		if (!W) return null;
		const decode = ({ scale, data }) => {
			const bin = typeof atob === 'function' ? atob(data) : Buffer.from(data, 'base64').toString('binary');
			const out = new Float32Array(bin.length);
			for (let i = 0; i < bin.length; i++) {
				const b = bin.charCodeAt(i);
				out[i] = (b > 127 ? b - 256 : b) * scale;
			}
			return out;
		};
		const vocab = W.vocab.split(' ');
		net = { vocab, index: new Map(vocab.map((w, i) => [w, i])), C: W.context, D: W.embed, H: W.hidden, E: decode(W.E), W1: decode(W.W1), b1: decode(W.b1), W2: decode(W.W2), b2: decode(W.b2), bo: decode(W.bo), report: W.report };
		return net;
	}

	// The same words the trainer saw: lower case, apostrophes kept ("i'm"), no punctuation.
	const TOKEN = /[a-z0-9àâäçéèêëîïôöùûüÿñœæáíóú#+]+(?:'[a-zàâäçéèêëîïôöùûüÿñœæáíóú]+)?/g;
	const tokens = (text) => String(text).toLowerCase().replace(/[’]/g, "'").match(TOKEN) || [];

	/** Probabilities of every word coming next after `ids` (the words so far, as vocabulary numbers). */
	function probabilities(ids) {
		const n = net;
		const ctx = ids.slice(-n.C);
		while (ctx.length < n.C) ctx.unshift(0);
		const x = new Float32Array(n.C * n.D);
		ctx.forEach((id, k) => x.set(n.E.subarray(id * n.D, id * n.D + n.D), k * n.D));
		const h = new Float32Array(n.H);
		for (let j = 0; j < n.H; j++) h[j] = n.b1[j];
		for (let i = 0; i < x.length; i++) {
			const xi = x[i];
			if (!xi) continue;
			const row = i * n.H;
			for (let j = 0; j < n.H; j++) h[j] += xi * n.W1[row + j];
		}
		for (let j = 0; j < n.H; j++) h[j] = Math.tanh(h[j]);
		const p = new Float32Array(n.D);
		for (let d = 0; d < n.D; d++) p[d] = n.b2[d];
		for (let j = 0; j < n.H; j++) {
			const hj = h[j];
			const row = j * n.D;
			for (let d = 0; d < n.D; d++) p[d] += hj * n.W2[row + d];
		}
		const V = n.vocab.length;
		const logits = new Float32Array(V);
		let max = -Infinity;
		for (let v = 0; v < V; v++) {
			let s = n.bo[v];
			const row = v * n.D;
			for (let d = 0; d < n.D; d++) s += n.E[row + d] * p[d];
			logits[v] = s;
			if (s > max) max = s;
		}
		let sum = 0;
		for (let v = 0; v < V; v++) sum += logits[v] = Math.exp(logits[v] - max);
		for (let v = 0; v < V; v++) logits[v] /= sum;
		return logits;
	}

	const SPECIAL = 3; // <s>, </s>, <unk>
	const ids = (words) => words.map((w) => (net.index.has(w) ? net.index.get(w) : 2));
	// Words that are written with a capital: I, the days, the months, languages, and the places in the dictionary.
	const CAPITAL = new Set('monday tuesday wednesday thursday friday saturday sunday january february march april may june july august september october november december english spanish french german italian chinese japanese python javascript rust onyx omnitool'.split(' '));
	const shown = (w) => {
		if (/^i(?:'|$)/.test(w)) return 'I' + w.slice(1);
		if (CAPITAL.has(w) && w !== 'may' && w !== 'march') return w[0].toUpperCase() + w.slice(1);
		const d = Omni.onyxDictionary;
		const e = d && (d.lookup(w) || [])[0];
		return e && /^[A-Z]/.test(e.e.w) && e.e.w.toLowerCase() === w ? e.e.w : w;
	};

	/**
	 * The likeliest next words after `text`, or, when the text ends in the middle of a word, the likeliest ways to
	 * finish that word: [{ word, p }], best first.
	 */
	function next(text, k = 5) {
		if (!load()) return [];
		const raw = String(text);
		const words = tokens(raw);
		const partial = /[A-Za-zÀ-ÿ0-9']$/.test(raw) && words.length ? words.pop() : '';
		const pr = probabilities(ids(words));
		const out = [];
		for (let v = SPECIAL; v < net.vocab.length; v++) {
			const w = net.vocab[v];
			if (partial && (!w.startsWith(partial) || w === partial)) continue;
			out.push({ word: w, p: pr[v] });
		}
		out.sort((a, b) => b.p - a.p);
		// Renormalized among the words that fit what's typed so far.
		const total = partial ? out.reduce((s, x) => s + x.p, 0) || 1 : 1;
		return out.slice(0, k).map((x) => ({ word: shown(x.word), p: x.p / total, completes: partial || null }));
	}

	/** The likeliest few words after `text`, one at a time, until the sentence seems to end. */
	function complete(text, maxWords = 6) {
		if (!load()) return '';
		const words = tokens(text);
		const added = [];
		for (let i = 0; i < maxWords; i++) {
			const pr = probabilities(ids(words));
			let best = 1;
			for (let v = SPECIAL; v < net.vocab.length; v++) if (pr[v] > pr[best]) best = v;
			// The sentence ends, or it would only repeat itself.
			if (best === 1 || (added.length >= 2 && added.slice(-2).includes(net.vocab[best]))) break;
			words.push(net.vocab[best]);
			added.push(net.vocab[best]);
		}
		return added.map(shown).join(' ');
	}

	/** A few different likely endings for `text` (a small beam search): ['the sea', 'autumn', ...]. */
	function suggest(text, n = 3, maxWords = 4) {
		if (!load()) return [];
		const start = tokens(text);
		let beams = [{ words: [], score: 0, done: false }];
		for (let step = 0; step < maxWords; step++) {
			const grown = [];
			for (const b of beams) {
				if (b.done) {
					grown.push(b);
					continue;
				}
				const pr = probabilities(ids(start.concat(b.words)));
				const top = [];
				for (let v = 1; v < net.vocab.length; v++) {
					if (v === 2 || b.words.includes(net.vocab[v])) continue;
					top.push(v);
					if (top.length > 6) {
						top.sort((x, y) => pr[y] - pr[x]);
						top.pop();
					}
				}
				for (const v of top) grown.push(v === 1 ? { words: b.words, score: b.score + Math.log(pr[v]), done: true } : { words: b.words.concat(net.vocab[v]), score: b.score + Math.log(pr[v]), done: false });
			}
			// Keep the best, but no two beams starting with the same word, so the endings differ.
			grown.sort((a, b) => b.score / Math.max(1, a.words.length) ** 0.3 - a.score / Math.max(1, b.words.length) ** 0.3);
			const firsts = new Set();
			beams = [];
			for (const g of grown) {
				const key = g.words[0] || '';
				if (!key || firsts.has(key)) continue;
				firsts.add(key);
				beams.push(g);
				if (beams.length >= n * 2) break;
			}
			if (beams.every((b) => b.done)) break;
		}
		return beams.slice(0, n).map((b) => b.words.map(shown).join(' ')).filter(Boolean);
	}

	/**
	 * Lets the network run on from `text`, choosing each next word at random in proportion to how likely it finds it
	 * (sharpened by `temperature` below 1). It has no plan and no memory beyond four words, so it wanders.
	 */
	function sample(text, words = 24, temperature = 0.7, rand = Math.random) {
		if (!load()) return '';
		const seq = tokens(text);
		const out = [];
		for (let i = 0; i < words; i++) {
			const pr = probabilities(ids(seq));
			let total = 0;
			const w = new Float32Array(net.vocab.length);
			for (let v = 1; v < net.vocab.length; v++) {
				if (v === 2) continue;
				// The end of a sentence only once there is something to end.
				if (v === 1 && out.length < 4) continue;
				total += w[v] = Math.pow(pr[v], 1 / temperature);
			}
			let r = rand() * total;
			let pickV = 1;
			for (let v = 1; v < net.vocab.length; v++) {
				r -= w[v];
				if (r <= 0) {
					pickV = v;
					break;
				}
			}
			if (pickV === 1) {
				if (out.length >= words - 6) break;
				out.push('.');
				seq.length = 0;
				continue;
			}
			seq.push(net.vocab[pickV]);
			out.push(shown(net.vocab[pickV]));
		}
		return out.join(' ').replace(/ \./g, '.').replace(/(^|\. )([a-zà-ÿ])/g, (m, a, c) => a + c.toUpperCase()).replace(/\.$/, '') + '.';
	}

	Omni.onyxPredict = { next, complete, suggest, sample, tokens, get report() { return load() ? net.report : null; }, get size() { return load() ? net.vocab.length : 0; } };
})(typeof window !== 'undefined' ? window : globalThis);

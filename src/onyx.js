// Onyx: Omni Agent's local engine. A small intent model (TF-IDF over example phrases, typo-tolerant), a little memory,
// a glossary and mini dictionary, a tool finder and OmniTool's offline commands. Runs on this device: no network, no
// model download. The internet port below is prepared for a host to fill in; nothing fills it today.
(function () {
	'use strict';

	/* ---------- Text ---------- */

	const CONTRACTIONS = [
		[/\bwhat's\b|\bwhats\b/g, 'what is'], [/\bi'm\b|\bim\b/g, 'i am'], [/\bcan't\b|\bcant\b/g, 'can not'], [/\bwon't\b/g, 'will not'],
		[/n't\b/g, ' not'], [/'re\b/g, ' are'], [/'ve\b/g, ' have'], [/'ll\b/g, ' will'], [/'d\b/g, ' would'], [/\b(it|that|there|how|who|where|when)'s\b/g, '$1 is'],
		[/\blet's\b/g, 'let us'], [/\bu\b/g, 'you'], [/\bur\b/g, 'your'], [/\br\b/g, 'are'], [/\bpls\b|\bplz\b/g, 'please'], [/\bthx\b|\bthnx\b/g, 'thanks'],
		[/\bwanna\b/g, 'want to'], [/\bgonna\b/g, 'going to'], [/\bgotta\b/g, 'got to'], [/\bhru\b/g, 'how are you'], [/\bwyd\b/g, 'what are you doing'],
		[/\bidk\b/g, 'i do not know'], [/\bomg\b/g, 'oh'], [/\bya\b/g, 'you'], [/\bcuz\b|\bcos\b/g, 'because'],
		[/\bchat ?gpt\b/g, 'chatgpt'], [/\bgoodnight\b|\bgood nite\b|\bnite\b/g, 'good night'], [/\bback up\b/g, 'backup'], [/\bgoodbye\b/g, 'good bye'], [/\bthank u\b/g, 'thank you'],
	];
	const STOP = new Set(['a', 'an', 'the', 'um', 'uh', 'so', 'just', 'really', 'very', 'please', 'well', 'quite', 'actually', 'kind', 'of', 'to', 'be', 'me', 'my', 'and']);

	function normalize(raw) {
		let t = String(raw).toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”]/g, '"');
		// "Onyx" as a form of address carries no meaning; elsewhere ("what is onyx") it means me.
		t = t.replace(/^(\W*(?:hey|hi|hello|ok|okay|yo)?\W*)onyx\b[\s,!:.]*/, '$1').replace(/[\s,]+onyx\W*$/, '').replace(/\bonyx\b/g, 'you');
		for (const [re, rep] of CONTRACTIONS) t = t.replace(re, rep);
		return t.replace(/'/g, '').replace(/[^a-z0-9%+\-*/^.=\s]/g, ' ').replace(/\s+/g, ' ').trim();
	}

	function stem(w) {
		if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
		if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
		if (w.length > 4 && w.endsWith('ly')) return w.slice(0, -2);
		if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
		return w;
	}

	const words = (text) => normalize(text).replace(/[^a-z0-9\s]/g, ' ').split(' ').filter(Boolean);
	const tokens = (text) => words(text).filter((w) => !STOP.has(w)).map(stem);

	/* ---------- Intent model ---------- */

	let model = null;
	/** Builds TF-IDF vectors (words and word pairs) for every example phrase of every intent. */
	function build() {
		const docs = [];
		for (const intent of Omni.onyxData.INTENTS) for (const ex of intent.examples) docs.push({ id: intent.id, feats: features(tokens(ex)) });
		const df = new Map();
		docs.forEach((d) => new Set(d.feats).forEach((f) => df.set(f, (df.get(f) || 0) + 1)));
		const idf = new Map([...df].map(([f, n]) => [f, Math.log((docs.length + 1) / (n + 1)) + 1]));
		docs.forEach((d) => (d.vec = vector(d.feats, idf)));
		const vocab = new Map();
		docs.forEach((d) => d.feats.filter((f) => !f.includes('_')).forEach((f) => vocab.set(f, (vocab.get(f) || 0) + 1)));
		model = { docs, idf, vocab };
	}

	function features(toks) {
		const out = [...toks];
		for (let i = 0; i < toks.length - 1; i++) out.push(toks[i] + '_' + toks[i + 1]);
		return out;
	}

	function vector(feats, idf) {
		const v = new Map();
		feats.forEach((f) => v.set(f, (v.get(f) || 0) + (idf.get(f) || 0)));
		const norm = Math.hypot(...v.values()) || 1;
		v.forEach((x, f) => v.set(f, x / norm));
		return v;
	}

	function distance(a, b) {
		if (Math.abs(a.length - b.length) > 2) return 3;
		const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
		for (let j = 1; j <= b.length; j++) d[0][j] = j;
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
				if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
			}
		}
		return d[a.length][b.length];
	}

	/** Maps a misspelled word to the closest word Onyx knows ("helo" to "hello"), if one is close enough. */
	function correct(tok) {
		if (model.vocab.has(tok) || tok.length < 4 || /\d/.test(tok) || (Omni.onyxDictionary && Omni.onyxDictionary.lookup(tok))) return tok;
		const limit = tok.length >= 7 ? 2 : 1;
		let best = tok;
		let bestD = limit + 1;
		let bestN = 0;
		for (const [w, n] of model.vocab) {
			const dd = distance(tok, w);
			const better = dd < bestD || (dd === bestD && (w.endsWith(tok.slice(-1)) && !best.endsWith(tok.slice(-1)) || (w.endsWith(tok.slice(-1)) === best.endsWith(tok.slice(-1)) && n > bestN)));
			if (better) {
				best = w;
				bestD = dd;
				bestN = n;
			}
		}
		return bestD <= limit ? best : tok;
	}

	/** Scores every intent for a message; returns them best first as { id, score }. */
	function classify(text) {
		if (!model) build();
		const toks = tokens(text).map(correct);
		if (!toks.length) return [];
		const v = vector(features(toks), model.idf);
		const maxIdf = Math.max(...model.idf.values());
		const weight = (t) => model.idf.get(t) || maxIdf;
		const total = toks.reduce((n, t) => n + weight(t), 0);
		const best = new Map();
		for (const d of model.docs) {
			let s = 0;
			v.forEach((x, f) => d.vec.has(f) && (s += x * d.vec.get(f)));
			if (!s) continue;
			const covered = toks.reduce((n, t) => n + (d.vec.has(t) ? weight(t) : 0), 0);
			s *= Math.sqrt(covered / total);
			if (s > (best.get(d.id) || 0)) best.set(d.id, s);
		}
		return [...best].map(([id, score]) => ({ id, score })).sort((a, b) => b.score - a.score);
	}

	/* ---------- Tool finder ---------- */

	let toolIndex = null;
	/** Finds the tools a sentence like "I need to pretty print some JSON" is about, by weighted word overlap. */
	function findTools(text) {
		if (!toolIndex) {
			const df = new Map();
			const entries = Omni.tools.map((t) => {
				const name = new Set(tokens(t.name));
				const keys = new Set(t.keywords.flatMap(tokens));
				const desc = new Set(tokens(t.description || ''));
				new Set([...name, ...keys, ...desc]).forEach((w) => df.set(w, (df.get(w) || 0) + 1));
				return { t, name, keys, desc };
			});
			toolIndex = { entries, idf: (w) => Math.log((entries.length + 1) / ((df.get(w) || 0) + 1)) };
		}
		const IGNORE = new Set(['need', 'want', 'how', 'can', 'you', 'i', 'do', 'some', 'help', 'tool', 'for', 'with', 'this', 'that', 'there', 'thing', 'something', 'make', 'get', 'use', 'like', 'would', 'should', 'could', 'have', 'got', 'in', 'on', 'at', 'what', 'which', 'way', 'way']);
		const q = [...new Set(tokens(text))].filter((w) => !IGNORE.has(w) && w.length > 1);
		if (!q.length) return [];
		return toolIndex.entries
			.map((e) => {
				let s = 0;
				let hits = 0;
				for (const w of q) {
					const weight = toolIndex.idf(w);
					if (e.name.has(w)) s += weight * 2;
					else if (e.keys.has(w)) s += weight * 1.6;
					else if (e.desc.has(w)) s += weight * 0.8;
					else continue;
					hits++;
				}
				return { tool: e.t, score: s, hits };
			})
			.filter((r) => r.score >= 2.4 && r.hits >= Math.min(2, q.length))
			.sort((a, b) => b.score - a.score || a.tool.no - b.tool.no)
			.slice(0, 3);
	}

	/* ---------- Memory and conversation ---------- */

	const MEMORY_KEY = 'onyx.memory';
	const memory = () => Object.assign({ name: null, facts: [], met: null }, Omni.store.get(MEMORY_KEY, {}));
	const saveMemory = (m) => Omni.store.set(MEMORY_KEY, m);

	/* ---------- Settings ---------- */

	// How Onyx answers what people tell it. People change these by asking ("be brief", "stop asking questions"); a
	// host can use Omni.onyx.settings. Stored next to the memory, on this device only.
	const SETTINGS_KEY = 'onyx.settings';
	const DEFAULTS = { tone: 'warm', questions: true, tips: true, useName: true, reader: true };
	const TONES = ['warm', 'brief', 'playful'];
	const settings = () => Object.assign({}, DEFAULTS, Omni.store.get(SETTINGS_KEY, {}));
	function setSetting(key, value) {
		if (!(key in DEFAULTS) || (key === 'tone' ? !TONES.includes(value) : typeof value !== 'boolean')) return false;
		Omni.store.set(SETTINGS_KEY, Object.assign(settings(), { [key]: value }));
		return true;
	}

	// [what people say, the setting it changes, what Onyx says back]. Matched against normalized text.
	const SETTING_COMMANDS = [
		[/\b(?:be|talk|reply|answer|keep (?:it|replies|answers))\s+(?:more\s+)?(?:brief|short|shorter|concise)\b|\bshorter (?:replies|answers)\b/, ['tone', 'brief'], 'I\'ll keep my replies short.'],
		[/\b(?:be|talk|reply)\s+(?:more\s+)?(?:playful|fun|silly)\b/, ['tone', 'playful'], 'I\'ll be a bit more playful.'],
		[/\b(?:be|talk|reply)\s+(?:more\s+)?(?:warm|normal|yourself)\b|\b(?:normal|default|warm) tone\b/, ['tone', 'warm'], 'Back to my usual self.'],
		[/\b(?:stop|do not|dont|no more|quit)\s+ask(?:ing)?\s+(?:me\s+)?(?:so many\s+)?(?:questions|follow ups?)\b/, ['questions', false], 'I\'ll stop asking follow-up questions.'],
		[/\b(?:you can|feel free to|start|go ahead and)\s+ask(?:ing)?\s+(?:me\s+)?(?:questions|follow ups?)\b/, ['questions', true], 'Okay, I\'ll ask follow-up questions again.'],
		[/\b(?:no|stop(?: giving)?|do not give|dont give|turn off|without)\s+(?:me\s+)?(?:the\s+)?tips\b|\btips off\b/, ['tips', false], 'No more tips.'],
		[/\b(?:turn on|start giving|bring back)\s+(?:the\s+)?tips\b|\btips on\b/, ['tips', true], 'Tips are back on.'],
		[/\b(?:do not|dont|stop|quit)\s+(?:use|using|say|saying)\s+my name\b/, ['useName', false], 'I\'ll stop using your name.'],
		[/\b(?:use|say) my name\b/, ['useName', true], 'I\'ll use your name again.'],
		[/\b(?:turn off|disable|stop|no)\s+(?:dynamic|smart|personal)\s+(?:replies|responses|answers)\b/, ['reader', false], 'I\'ll stick to my fixed replies.'],
		[/\b(?:turn on|enable|start)\s+(?:dynamic|smart|personal)\s+(?:replies|responses|answers)\b/, ['reader', true], 'I\'ll reply to what you tell me again.'],
	];

	function describeSettings() {
		const s = settings();
		const onOff = (v) => (v ? 'on' : 'off');
		return [
			'Here\'s how I reply to what you tell me:',
			'',
			`- **Tone**: ${s.tone} (say ${s.tone === 'warm' ? '"be brief" or "be playful"' : s.tone === 'brief' ? '"be playful" or "be warm"' : '"be brief" or "be warm"'})`,
			`- **Follow-up questions**: ${onOff(s.questions)} (${s.questions ? '"stop asking questions"' : '"you can ask questions"'})`,
			`- **Tips**: ${onOff(s.tips)} (${s.tips ? '"no tips"' : '"tips on"'})`,
			`- **Using your name**: ${onOff(s.useName)} (${s.useName ? '"don\'t use my name"' : '"use my name"'})`,
			`- **Replies built from what you say**: ${onOff(s.reader)} (${s.reader ? '"turn off dynamic replies"' : '"turn on dynamic replies"'})`,
			'',
			'Say "reset settings" to go back to the defaults.',
		].join('\n');
	}

	/** A reply to a settings request ("be brief", "settings"), or null if the message isn't one. */
	function settingsCommand(norm) {
		if (/^(?:show |open |my |your |onyx )?settings$|^what are (?:my|your) settings$|^(?:how do i )?change (?:your |the |my )?settings$/.test(norm)) return answer(describeSettings());
		if (/^reset (?:my |your |the )?settings$/.test(norm)) {
			Omni.store.remove(SETTINGS_KEY);
			return answer('Settings are back to the defaults: a warm tone, follow-up questions, tips, your name, and replies built from what you say.');
		}
		for (const [re, [key, value], said] of SETTING_COMMANDS) if (re.test(norm) && setSetting(key, value)) return answer(`${said} Say "settings" to see or change the rest.`);
		return null;
	}

	/** "How did the exam go?" with follow-up questions off becomes "I hope the exam went well." */
	function asStatement(q) {
		let m;
		if ((m = q.match(/^How did (.+?) (?:go|turn out)\?$/))) return `I hope ${m[1]} went well.`;
		if ((m = q.match(/^How was (.+?)\?/))) return `I hope ${m[1]} was good.`;
		if (/^How's it going\?$/.test(q)) return 'I hope it\'s going well.';
		if (/talk about it\?$/.test(q)) return 'I\'m here if you want to talk about it.';
		return 'Thanks for telling me.';
	}

	/** Applies the settings to a reply Onyx built from what someone said: questions, length and tone. */
	function shape(r) {
		const s = settings();
		let parts = (r.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [r.text]).map((x) => x.trim()).filter(Boolean);
		if (!s.questions) {
			const kept = parts.filter((x) => !x.endsWith('?'));
			parts = kept.length ? kept : [asStatement(parts[parts.length - 1])];
		}
		if (s.tone === 'brief') parts = parts.slice(0, 1);
		let text = parts.join(' ');
		// Playful only where it fits: never on bad news.
		if (s.tone === 'playful' && !/sorry|oh no|ouch|heavy|no fun|sounds hard|normal\./i.test(text)) text = pick('playful', ['Ooh! ', 'Yay! ', 'Love it! ', 'Nice! ']) + text;
		return Object.assign({}, r, { text });
	}

	const fresh = () => ({ lastAnswer: null, pending: null, expect: null, lastIntent: null, lastReply: '', lastKind: null, lastCommand: null, why: null, recent: {}, bags: {}, misses: 0, sentence: { word: null, n: 0, said: [] } });
	let convo = fresh();

	const part = () => {
		const h = new Date().getHours();
		return h < 5 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
	};

	/** Picks a variant, avoiding the ones used most recently under the same key. */
	function pick(key, list) {
		const recent = convo.recent[key] || [];
		const options = list.filter((x) => !recent.includes(x));
		const choice = (options.length ? options : list)[Math.floor(Math.random() * (options.length || list.length))];
		convo.recent[key] = [choice, ...recent].slice(0, Math.max(1, Math.floor(list.length / 2)));
		return choice;
	}

	/** Deals from a shuffled bag, so every joke (or tip, or fact) comes up once before any repeats. */
	function draw(key, list) {
		if (!convo.bags[key] || !convo.bags[key].length) convo.bags[key] = Omni.random.shuffle(Omni.random.source(), list.map((_, i) => i));
		convo.lastKind = key;
		return list[convo.bags[key].pop()];
	}

	const fill = (text, mem) => String(text).replace(/\{name\}/g, mem.name && settings().useName ? `, ${mem.name}` : '');

	const YES = /^(y|yes|yeah|yep|yup|sure|ok|okay|please|yes please|go ahead|do it|please do|definitely|absolutely|of course|sounds good|why not|alright|sure thing|go for it)\b[\s!.]*$/i;
	const NO = /^(n|no|nope|nah|no thanks|no thank you|not now|maybe later|never mind|nevermind|cancel|stop|don't|dont)\b[\s!.]*$/i;
	const CRISIS = /\b(kill myself|killing myself|suicid|end my life|want to die|wanna die|don'?t want to live|hurt myself|self[- ]harm)\b/i;
	const FOREIGN = /^(hola|bonjour|salut|hallo|ciao|ol[aá]|konnichiwa|namaste|privet|merci|gracias|danke|obrigad[oa])\b|[Ѐ-ӿ֐-ۿऀ-ॿ぀-ヿ一-鿿가-힯]/i;
	const NOT_NAMES = new Set(['fine', 'good', 'ok', 'okay', 'tired', 'sad', 'happy', 'bored', 'here', 'back', 'done', 'sorry', 'busy', 'great', 'well', 'not', 'just', 'so', 'very', 'ready', 'hungry', 'stressed', 'angry', 'confused', 'lost', 'new', 'onyx', 'a', 'an', 'the', 'no', 'yes', 'cool', 'hi', 'hello', 'hey', 'yo', 'hiya', 'what', 'why', 'who', 'how', 'help', 'thanks', 'thank', 'nothing', 'none', 'nope', 'nah', 'idk', 'whatever', 'later', 'bye', 'test', 'nobody', 'me', 'you', 'i', 'my', 'is', 'are', 'can', 'do', 'tell', 'lol', 'haha', 'sure', 'maybe', 'please']);

	/** A name from "my name is Sam", "call me Sam", "I'm Sam" (capitalized), or a bare answer to "what should I call you?". */
	function nameFrom(raw, expecting) {
		const clean = (n) => n && n.replace(/[^A-Za-z'\- ]/g, '').trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
		let m = raw.match(/\b(?:my name is|my name's|call me|i go by|you can call me|i am called|i'm called|name's)\s+([A-Za-z][A-Za-z'-]{0,30}(?:\s+[A-Za-z][A-Za-z'-]{0,30})?)/i);
		if (m && !NOT_NAMES.has(m[1].toLowerCase().split(' ')[0])) return clean(m[1]);
		m = raw.match(/^(?:hi,?\s+|hello,?\s+|hey,?\s+)?(?:i am|i'm|im)\s+([A-Z][a-z'-]{1,30})\s*[.!]?$/);
		if (m && !NOT_NAMES.has(m[1].toLowerCase())) return clean(m[1]);
		if (expecting && !/onyx/i.test(raw)) {
			m = raw.trim().match(/^(?:it's\s+|its\s+|just\s+)?([A-Za-z][A-Za-z'-]{0,30}(?:\s+[A-Za-z][A-Za-z'-]{0,30})?)[.!]?$/);
			if (m && !NOT_NAMES.has(m[1].toLowerCase().split(' ')[0])) return clean(m[1]);
		}
		return null;
	}

	/** "twelve times 7", "15% of 80", "5 plus 3" become something the scientific calculator reads. */
	function wordsToMath(text) {
		let t = ' ' + text.toLowerCase().replace(/\?+\s*$/, '') + ' ';
		if (!/\d/.test(t)) return null;
		t = t.replace(/^\s*(what is|whats|what's|calculate|compute|how much is|solve|work out|evaluate)\s+/, ' ');
		t = t.replace(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s+of\s+(\d+(?:\.\d+)?)/g, '($1/100*$2)');
		t = t.replace(/\bplus\b/g, '+').replace(/\bminus\b/g, '-').replace(/\b(times|multiplied by|x)\b/g, '*').replace(/\b(divided by|over)\b/g, '/');
		t = t.replace(/\bsquared\b/g, '^2').replace(/\bcubed\b/g, '^3').replace(/\bto the power of\b/g, '^').replace(/\bsquare root of\b/g, 'sqrt');
		t = t.trim();
		return /^[-+*/^().\d\s]+$|^sqrt[\s(]*[\d.]+\)?$/.test(t) && /[-+*/^]|sqrt/.test(t) ? t : null;
	}

	/** Small things Onyx does with words: count letters or words, reverse, spell, change case, numbers in words. */
	function wordTrick(text) {
		const q = (s) => s.trim().replace(/^["'“]|["'”.?!]$/g, '').trim();
		let m;
		if ((m = text.match(/^how many (?:letters|characters|chars) (?:are )?(?:in|does) (.+?)(?: have)?\??$/i))) {
			const w = q(m[1]);
			const letters = (w.match(/\p{L}/gu) || []).length;
			return `"${w}" has ${letters} letter${letters === 1 ? '' : 's'}${letters !== w.length ? ` (${w.length} characters with spaces and symbols)` : ''}.`;
		}
		if ((m = text.match(/^how many (?:times (?:does|is) )?(?:the letter )?["']?(\p{L})["']? (?:appear )?(?:are )?in (.+?)\??$/iu)) && !/^(times|words?)$/i.test(m[1])) {
			const n = (q(m[2]).toLowerCase().match(new RegExp(m[1].toLowerCase(), 'g')) || []).length;
			return `"${m[1]}" appears ${n} time${n === 1 ? '' : 's'} in "${q(m[2])}".`;
		}
		if ((m = text.match(/^(?:count|how many) (?:the )?words (?:are )?in (.+)$/i))) {
			const n = q(m[1]).split(/\s+/).filter(Boolean).length;
			return `That's ${n} word${n === 1 ? '' : 's'}.`;
		}
		if ((m = text.match(/^(?:reverse|say|spell|write) (.+?) backwards?$/i)) || (m = text.match(/^reverse (.+)$/i))) return `${[...q(m[1])].reverse().join('')}`;
		if ((m = text.match(/^(?:how do you )?spell (?:out )?(.+?)\??$/i)) && !/\d/.test(m[1])) return [...q(m[1]).toUpperCase()].filter((c) => c.trim()).join('-');
		if ((m = text.match(/^(?:uppercase|upper case|capitali[sz]e|make uppercase) (.+)$/i))) return q(m[1]).toUpperCase();
		if ((m = text.match(/^(?:lowercase|lower case|make lowercase) (.+)$/i))) return q(m[1]).toLowerCase();
		if ((m = text.match(/^(?:title case) (.+)$/i))) return q(m[1]).toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());
		if ((m = text.match(/^(?:write|say|spell|how do you (?:write|say)) (-?[\d,]+) (?:in|as) words\??$/i)) || (m = text.match(/^(-?[\d,]+) in words\??$/i))) {
			const words = Omni.onyxMath && Omni.onyxMath.numberToWords(Number(m[1].replace(/,/g, '')));
			return words ? `${m[1]} is "${words}".` : 'That number is too big for me to write out.';
		}
		if ((m = text.match(/^is (.+?) a palindrome\??$/i))) {
			const w = q(m[1]).toLowerCase().replace(/[^\p{L}\d]/gu, '');
			return w === [...w].reverse().join('') ? `Yes, "${q(m[1])}" reads the same backwards.` : `No, "${q(m[1])}" backwards is "${[...q(m[1])].reverse().join('')}".`;
		}
		return null;
	}

	/** Questions about a word that aren't its definition: other words for it, its opposite, its part of speech, a sentence with it. */
	function wordQuery(text) {
		const d = Omni.onyxDictionary;
		if (!d) return null;
		const t = text.trim().replace(/[?!.]+$/, '');
		const unknown = (w) => `"${w.replace(/^["'“]|["'”]$/g, '')}" isn't in my dictionary. I know ${d.size} everyday words and can't look up new ones.`;
		let m;
		if ((m = t.match(/^(?:what(?:'s| is|s| are)? )?(?:an?(?:nother)? |some |the )?(?:synonyms?|other words?|another word|different word) (?:for|of|to|like) (.+)$/i))) return answer(d.related(m[1]) || unknown(m[1]));
		if ((m = t.match(/^(?:what(?:'s| is|s| are)? )?(?:an? |some |the )?(?:opposite|antonyms?) (?:of|for|to) (.+)$/i))) return answer(d.related(m[1], true) || unknown(m[1]));
		if ((m = t.match(/^(?:what|which) (?:part of speech|kind of word|type of word|word class) is (.+)$/i)) || (m = t.match(/^is (.+?) an? (?:noun|verb|adjective|adverb)$/i))) return answer(d.partOfSpeech(m[1]) || unknown(m[1]));
		const withWord = t.match(/^(?:can you |could you |please )?(?:use|put) (?:the word )?(.+?) in (?:a|another) sentence(?: please)?$/i) || t.match(/^(?:can you |could you |please )?(?:make|write|give me|create|form|build|say|generate|tell me)(?: me)? (?:a |another |one )?(?:new )?sentence (?:with|using|about|containing|that uses|that has|for) (?:the word )?(.+)$/i);
		if (withWord) {
			const named = /^(it|that|that word|this word|this)$/i.test(withWord[1]) ? convo.sentence.word : withWord[1];
			if (!named) return answer('Which word? Try "use happy in a sentence".');
			const s = d.sentence(named);
			if (s.missing) return answer(unknown(s.missing));
			convo.sentence = { word: s.word, n: 1, said: [s.text] };
			convo.lastKind = 'sentence';
			return answer(s.text);
		}
		if (/^(?:can you |could you |please )?(?:make|write|give me|create|form|build|say|generate|tell me|make up)(?: me)? (?:a |another |one |some )?(?:random |new |made up )?sentences?(?: please)?$|^say something random$/i.test(t)) {
			const same = /\banother\b/i.test(t) && convo.lastKind === 'sentence' ? convo.sentence.word : null;
			return answer((/^(can|could) you\b/i.test(t) ? 'Sure. ' : '') + nextSentence(same));
		}
		return null;
	}

	/** Another sentence: for the last word asked about, or a random one. Skips the ones it has just said. */
	function nextSentence(word) {
		const prev = convo.sentence.word === word ? convo.sentence : { n: 0, said: [] };
		const make = () => Omni.onyxDictionary.sentence(word, word ? prev.n : 1);
		// A word has only a few templates, so once they're all used, settle for not repeating the last one.
		let s = make();
		for (let i = 0; i < 12 && prev.said.includes(s.text) && (i < 8 || s.text === prev.said[0]); i++) s = make();
		convo.sentence = { word, n: prev.n + 1, said: [s.text, ...prev.said].slice(0, 6) };
		convo.lastKind = 'sentence';
		return s.only ? `That's the only sentence I have for **${word}**: ${s.text}` : s.text;
	}

	/* ---------- Reading what people tell me ---------- */

	/*
	 * When no intent fits, Onyx reads a message with the dictionary: a feeling ("I'm nervous"), an event ("an exam
	 * tomorrow"), an activity, a pet, food, a place or a person, plus negation, tense and whose it is ("my sister's
	 * wedding"). The reply is built from those parts. Only dictionary words are echoed back, never the raw message.
	 */
	const LIGHT = new Set('i me my mine we us our you your he him his she her they them their it its a an the this that these those is am are was were be been being have has had do does did will would can could should may might must to of in on at by for with about from as and or but so if then than just really very too also not no yes oh well get got go going gone went want wanted need needed feel feeling felt like liked love loved hate think thought know knew make made take took give gave put see saw say said tell told come came look use try keep let ask still now today ok okay'.split(' '));
	const NEG = new Set(['not', 'never', 'no', 'hardly', 'dont', 'didnt', 'isnt', 'wasnt', 'arent', 'cant', 'wont', 'havent', 'aint', 'nothing']);
	const TIMES = [
		[/\btomorrow\b/, ' tomorrow', 'future'], [/\btonight\b/, ' tonight', 'future'], [/\bthis weekend\b/, ' this weekend', 'future'],
		[/\bnext (week|weekend|month|year)\b/, ' next $1', 'future'], [/\blater\b/, ' later', 'future'], [/\bsoon\b/, ' soon', 'future'],
		[/\bon (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/, (d) => ` on ${d[0].toUpperCase()}${d.slice(1)}`, null],
		[/\btoday\b/, ' today', 'now'], [/\bthis (morning|afternoon|evening)\b/, ' this $1', null],
		[/\byesterday\b/, ' yesterday', 'past'], [/\blast (night|week|weekend|month|year)\b/, ' last $1', 'past'], [/\b\w+ ago\b/, '', 'past'],
	];
	// Verbs whose result can be asked about: "I baked a cake" -> "How did the cake turn out?"
	const MAKING = new Set(['bake', 'cook', 'make', 'build', 'paint', 'draw', 'knit', 'sew', 'design', 'write', 'grow', 'fix', 'repair', 'decorate', 'sketch', 'invent']);
	// Verbs too general to reply to on their own ("I keep thinking about it").
	const VAGUE = new Set(['think', 'know', 'believe', 'hope', 'wish', 'want', 'need', 'feel', 'like', 'love', 'hate', 'say', 'tell', 'ask', 'see', 'look', 'get', 'give', 'take', 'put', 'come', 'go', 'make', 'use', 'try', 'keep', 'show', 'understand', 'decide', 'agree', 'remember', 'wait', 'stay', 'start', 'stop', 'begin', 'finish', 'change', 'move', 'have', 'eat', 'drink']);
	const ILL = new Set(['headache', 'cold', 'flu', 'fever', 'pain']);
	// "I'm cold" is a feeling, though "cold" usually describes a place or the weather.
	const BODILY = { cold: 'An extra layer or a warm drink might help.', hot: 'Some cold water and a bit of shade might help.', warm: 'Some cold water might help.', freezing: 'An extra layer or a warm drink might help.' };
	const PAST = /\b(was|were|had|did|went|got|made|took|saw|came|ate|drank|left|yesterday)\b/;

	const upper = (s) => s[0].toUpperCase() + s.slice(1);
	// Short forms that are written in capitals.
	const SHOUT = { tv: 'TV', usa: 'USA', us: 'US', nyc: 'NYC', cv: 'CV', pjs: 'PJs', bbq: 'BBQ', ok: 'OK' };
	// "the beach", but "Japan" and "Christmas".
	const the = (e) => (/^[A-Z]/.test(e.w) ? e.w : `the ${e.w}`);

	/** What a word is, as a clause: "a cat is a small, furry animal...", "to run is to move quickly...". */
	function describe(e, d) {
		const def = e.def;
		if (e.pos === 'noun') return /^(an?|the) /.test(def) ? `${e.mass || e.kind === 'time' ? e.w : d.a(e.w)} is ${def}` : `"${e.w}" means ${def}`;
		if (e.pos === 'verb') return `to ${e.w} is ${def}`;
		return `"${e.w}" means ${def}`;
	}

	function read(raw, mem) {
		const d = Omni.onyxDictionary;
		if (!d) return null;
		const t = normalize(raw).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
		const ws = t.split(' ');
		if (ws.length > 30) return null;
		const hits = [];
		for (let i = 0; i < ws.length; i++) {
			// Two-word entries ("ice cream"), but not "an apple": lookup drops a leading article.
			const pair = i + 1 < ws.length && !LIGHT.has(ws[i]) && d.lookup(`${ws[i]} ${ws[i + 1]}`);
			if (pair) {
				hits.push({ i, word: `${ws[i]} ${ws[i + 1]}`, senses: pair });
				i++;
			} else if (!LIGHT.has(ws[i]) && d.lookup(ws[i])) hits.push({ i, word: ws[i], senses: d.lookup(ws[i]) });
		}
		/** The first word with a sense that passes `test(entry, hit)`, as { i, word, e, label, senses }. */
		const find = (test, from = 0) => {
			for (const h of hits) {
				if (h.i < from) continue;
				const s = h.senses.find((x) => test(x.e, h));
				if (s) return { i: h.i, word: h.word, e: s.e, label: s.label, senses: h.senses };
			}
			return null;
		};
		const negated = (h) => ws.slice(Math.max(0, h.i - 3), h.i).some((w) => NEG.has(w));
		/** A noun as the person said it, with their determiner and adjectives: "a good book", "your favorite show". */
		const phrase = (h, fallback = 'the') => {
			const e = h.senses.find((x) => x.e.pos === 'noun').e;
			const word = /^[A-Z]/.test(e.w) ? e.w : SHOUT[h.word] || h.word;
			for (let j = h.i - 1; j >= Math.max(0, h.i - 3); j--) {
				const owner = hits.find((x) => x.i === j && x.senses.some((y) => y.e.rel && y.label === 'plural'));
				if (owner && ws[j - 1] === 'my') return `your ${owner.senses[0].e.w}'s ${ws.slice(j + 1, h.i).concat(word).join(' ')}`;
				if (/^(a|an|the|my|our|this|that|some|his|her|their)$/.test(ws[j])) return [{ my: 'your', our: 'your' }[ws[j]] || ws[j], ...ws.slice(j + 1, h.i), word].join(' ');
				if (!(hits.find((x) => x.i === j) || { senses: [] }).senses.some((x) => x.e.pos === 'adjective')) break;
			}
			return /^[A-Z]/.test(e.w) || e.mass || h.label === 'plural' || !fallback ? word : `${fallback} ${word}`;
		};
		const mine = (h) => h && ws[h.i - 1] === 'my';
		const self = /\b(i|me|my|we|our|us)\b/.test(t);
		// Whether the person did it themselves: "I called" is, "my mom called" isn't.
		const doer = /\b(i|we)\b/.test(t);
		const [, when = '', tense = null] = TIMES.map(([re, say, tn]) => {
			const m = t.match(re);
			return m && [m, typeof say === 'function' ? say(m[1]) : say.replace('$1', m[1] || ''), tn];
		}).find(Boolean) || [];
		const past = tense === 'past' || PAST.test(t) || hits.some((h) => h.senses.every((x) => x.label === 'past tense'));
		const future = tense === 'future' || /\b(will|going to|gonna|plan to|planning to|about to)\b/.test(t);
		const must = /\b(have to|has to|need to|got to|must)\b/.test(t);
		const prefs = settings();
		const name = mem.name && prefs.useName ? `, ${mem.name}` : '';
		const say = (key, list) => answer(pick(key, list));
		const hint = (tip) => (tip && prefs.tips ? ` ${tip}` : '');

		// "Do you like cats?" I have no likes of my own, but I can say what the word means.
		const asked = t.match(/^(?:do|did) you (?:like|love|enjoy|hate) (.+)$|^what do you think (?:of|about) (.+)$/);
		if (asked) {
			const h = find((e) => e.pos === 'noun' || e.pos === 'verb', ws.indexOf(asked[1] ? 'you' : 'think') + 2);
			return h ? { strong: true, sure: true, reply: answer(`I don't have likes or dislikes of my own, but in my dictionary, ${describe(h.e, d)}.`) } : null;
		}
		if (/^(who|what|when|where|why|how|which|is|are|does|do|did|can|could|will|would)\b/.test(t)) return null;

		const bodily = (e, h) => e.w in BODILY && /\b(am|feel|feeling|felt)( so| really| very| a bit| kind of)?$/.test(ws.slice(0, h.i).join(' '));
		const feelHit = find((e, h) => e.pos === 'adjective' && (e.use === 'feel' || bodily(e, h)));
		// "Lost" in "I lost my keys" is a verb, not a feeling: a feeling word followed by "my" or "the" is an action.
		const acting = feelHit && feelHit.senses.some((x) => x.e.pos === 'verb') && /^(my|the|a|an|his|her|our|their)$/.test(ws[feelHit.i + 1] || '');
		const describing = feelHit && hits.some((h) => h.i < feelHit.i && feelHit.i - h.i <= 4 && h.senses.some((x) => x.e.pos === 'noun' && !['person', 'animal', 'time'].includes(x.e.kind)) && /\b(is|are|was|were)\b/.test(ws.slice(h.i, feelHit.i).join(' ')));
		const feel = acting || describing ? null : feelHit;
		const ill = find((e) => (e.kind === 'body' && /\b(hurts?|hurting|aches?|aching|sore|broke|broken|injured|sprained)\b/.test(t)) || (e.pos === 'noun' && ILL.has(e.w) && /\b(have|has|got|caught|getting)\b/.test(t)));
		const event = find((e) => e.kind === 'event');
		const owner = event && hits.find((h) => h.i === event.i - 1 && h.senses.some((x) => x.e.rel && x.label === 'plural'));
		const np = event && (owner ? `your ${owner.senses[0].e.w}'s ${event.e.w}` : mine(event) ? `your ${event.e.w}` : the(event.e));

		// "Not hungry" says nothing worth answering; "not happy" does.
		if (feel && !(feel.e.mood === '0' && negated(feel))) {
			const w = feel.e.w;
			const not = negated(feel);
			const mood = not ? { '+': '-', '-': '+', '--': '+' }[feel.e.mood] : feel.e.mood || '0';
			const tip = feel.e.tip || BODILY[w];
			// Whose feeling: "my dog is sick" is about the dog, not the person typing.
			const subject = hits.find((h) => h.i < feel.i && feel.i - h.i <= 4 && mine(h) && h.senses.some((x) => ['person', 'animal'].includes(x.e.kind)));
			if (subject) {
				const who = `your ${subject.senses.find((x) => ['person', 'animal'].includes(x.e.kind)).e.w}`;
				const is = past ? 'was' : 'is';
				if (mood === '+') return { strong: true, reply: answer(`That's lovely to hear about ${who}.`) };
				if (mood === '-' || mood === '--') return { strong: true, reply: say('dyn-other', [`I'm sorry ${who} ${is} ${not ? 'not ' : ''}${w}. I hope things get better soon.`, `Oh no, I'm sorry ${who} ${is} ${not ? 'not ' : ''}${w}. Is there anything that would help?`]) };
			} else if (self) {
				const feeling = `${not ? 'not ' : ''}feeling ${w}`;
				if (event && event.e.event !== 'sorry' && !past) {
					if (mood === '-') return { strong: true, reply: answer(`Feeling ${w} before ${np} is completely normal. Good luck${when}${name}!${hint(tip)}`) };
					if (mood === '+') return { strong: true, reply: answer(`I love that you're ${feeling} about ${np}${when}!`) };
				}
				if (mood === '--') return { strong: true, reply: answer(`I'm really sorry you're ${feeling}${name}. That's a heavy thing to carry. If it's been going on for a while, talking to someone you trust, or a doctor, can really help, and I'm here to listen too.`) };
				if (mood === '-') return { strong: true, reply: answer(pick('dyn-bad', [`I'm sorry you're ${feeling}${name}. Do you want to talk about it?`, `Feeling ${not ? 'anything but ' : ''}${w} is no fun. What's going on?`, `That sounds hard. What's making you feel ${not ? 'that way' : w}?`]) + (!not ? hint(tip) : '')) };
				if (mood === '+') return { strong: true, reply: not ? answer(`Good, I'm glad you're not feeling ${w}.`) : say('dyn-good', [`Glad you're feeling ${w}${name}! What's behind it?`, `That's good to hear. What's got you feeling ${w}?`, `Love that. Feeling ${w} is the best.`]) };
				if (mood === '0') return { strong: true, reply: answer(`Sounds like you're ${feeling}.${hint(tip) || ' What\'s going on?'}`) };
			}
		}

		// Losing someone: the most important thing to get right, so it comes first.
		const someone = hits.find((h) => mine(h) && h.senses.some((x) => ['person', 'animal'].includes(x.e.kind)));
		if (someone && /\b(died|passed away|passed|lost)\b/.test(t)) {
			const who = someone.senses.find((x) => ['person', 'animal'].includes(x.e.kind)).e.w;
			return { strong: true, reply: answer(`I'm so sorry about your ${who}${name}. That's a huge loss. Take all the time you need, and I'm here if you want to talk.`) };
		}
		const starting = doer && t.match(/\b(?:start|starting|started|begin|beginning) (?:my |a |the )?(new )?(job|school|college|university|class|course|role)\b/);
		if (starting) {
			const np2 = `${starting[1] ? 'the new ' : ''}${starting[2]}`;
			if (past && !future) return { strong: true, topic: { kind: 'went', np: 'the first day' }, reply: answer(`How was the first day at the ${starting[2]}?`) };
			return { strong: true, topic: { kind: 'ahead', np: np2 }, reply: answer(`Good luck with ${np2}${when}${name}! First days can be a lot, but you've got this.`) };
		}
		if (doer && /\b(?:moving|move|moved)\b/.test(t) && !/\bmove (?:it|that|this|the)\b/.test(t)) {
			if (past && !future) return { strong: true, topic: { kind: 'went', np: 'the move' }, reply: answer(`A new place! How are you settling in?`) };
			return { strong: true, reply: answer(`Moving is a big change. Good luck with the move${when}${name}!`) };
		}
		if (/\b(?:so |completely )?done with (?:today|this day|this week|everything|it all)\b|\bwhat a (?:day|week)\b|\b(?:long|rough|tough|bad|hard) (?:day|week)\b/.test(t)) {
			return { strong: true, reply: answer(`Sounds like it's been a long one${name}. Do you want to talk about it, or would a joke help?`) };
		}

		// Something of theirs went wrong: "my phone died", "my flight got cancelled".
		const broken = find((e) => e.pos === 'verb' && (e.mood === '-' || e.mood === '--'));
		const owned = broken && hits.find((h) => mine(h) && h.i < broken.i && h.senses.some((x) => x.e.pos === 'noun' && !['person', 'animal', 'body'].includes(x.e.kind)));
		if (owned) return { strong: true, reply: answer(`Oh no, sorry about your ${owned.word}${name}. That's really annoying.`) };
		if (event && broken && broken.i > event.i) return { strong: true, reply: answer(`Oh no, sorry about ${np}${name}. That's disappointing.`) };

		// Someone close in the hospital.
		if (someone && hits.some((h) => h.senses.some((x) => x.e.w === 'hospital'))) {
			return { strong: true, reply: answer(`I'm sorry your ${someone.senses.find((x) => ['person', 'animal'].includes(x.e.kind)).e.w} is in the hospital${name}. I hope they get good care and feel better soon.`) };
		}

		if (ill && self && !negated(ill)) {
			if (ill.e.kind === 'body') return { strong: true, reply: answer(`Ouch, sorry your ${ill.e.w} ${ill.label === 'plural' ? 'hurt' : 'hurts'}${name}. Rest it if you can, and see a doctor if it doesn't get better.`) };
			return { strong: true, reply: answer(`Sorry to hear about the ${ill.e.w}${name}. Rest, plenty of water, and a doctor if it gets worse or doesn't go away.`) };
		}

		if (event && event.e.event !== 'sorry' && /\b(?:is|are) (?:finally |all )?(?:over|done|finished)\b/.test(t)) {
			const many = event.label === 'plural';
			const these = mine(event) ? `your ${event.word}` : `the ${event.word}`;
			return { strong: true, topic: { kind: 'went', np: these }, reply: answer(`${upper(these)} ${many ? 'are' : 'is'} over? That must be a relief${name}! How did ${many ? 'they' : 'it'} go?`) };
		}

		if (event && !negated(event)) {
			const kind = event.e.event;
			if (kind === 'sorry') return { strong: true, reply: answer(`I'm so sorry. ${upper(d.forms.plural(event.e))} are hard. I'm here if you want to talk.`) };
			if (kind === 'news') return { strong: true, topic: { kind: 'ahead', np }, reply: answer(`Congratulations on ${np}${name}! That's great news.`) };
			if (event.e.w === 'birthday' && mine(event) && !past) return { strong: true, reply: answer(tense === 'now' ? `Happy birthday${name}! I hope it's a great one.` : `Happy early birthday${name}! Any plans?`) };
			if (past) return { strong: true, topic: { kind: 'went', np }, reply: say('dyn-event-past', kind === 'luck' ? [`How did ${np} go?`, `How was ${np}? I hope it went well.`] : [`How was ${np}?`, `Sounds lovely. How was ${np}?`]) };
			const lead = upper(np) + when;
			if (kind === 'luck') return { strong: true, topic: { kind: 'ahead', np }, reply: say('dyn-luck', [`Good luck with ${np}${when}${name}! How are you feeling about it?`, `${lead}? You've got this. Good luck!`]) };
			return { strong: true, topic: { kind: 'ahead', np }, reply: say('dyn-joy', [`${lead}? That sounds fun!`, `Ooh, ${np}${when}. I hope it's a great one.`]) };
		}

		const verdict = find((e, h) => e.pos === 'adjective' && e.mood && e.mood !== '0' && (e.use !== 'feel' || describing) && /\b(?:is|was|were|are|been|s|felt|looks|looked|seems|seemed)( so| really| very| pretty| super| kind of| quite)?$/.test(ws.slice(0, h.i).join(' ')));
		if (verdict) {
			const subject = [...hits].reverse().find((h) => h.i < verdict.i && h.senses.some((x) => x.e.pos === 'noun' && x.e.kind !== 'time'));
			const day = ws.slice(0, verdict.i).find((w) => ['today', 'tonight', 'yesterday', 'it', 'that', 'this'].includes(w));
			const was = /\b(?:was|were|been|felt|looked|seemed)\b/.test(ws.slice(0, verdict.i).join(' '));
			let what = null;
			if (subject) what = phrase(subject);
			else if (day === 'today' || day === 'tonight' || day === 'yesterday') what = day;
			if (what) {
				const many = subject && subject.senses.some((x) => x.label === 'plural');
				const be = was ? (many ? 'were' : 'was') : many ? 'are' : 'is';
				const w = verdict.e.w;
				const sure = subject && subject.senses.some((x) => x.e.w === 'weather');
				if (verdict.e.mood === '+') return { strong: true, sure, reply: answer(`Glad ${what} ${be} ${w}${name}!`) };
				return { strong: true, sure, reply: answer(`Sorry ${what} ${be} ${w}${name}. Do you want to talk about it?`) };
			}
		}

		// Missing someone or somewhere.
		const missed = /\bmiss(?:ing|ed)?\b/.test(t) && hits.find((h) => (mine(h) || h.word === 'home') && h.senses.some((x) => x.e.rel || ['person', 'animal', 'place'].includes(x.e.kind)));
		if (missed) {
			const who = missed.word === 'home' ? 'home' : `your ${missed.word}`;
			return { strong: true, reply: answer(`Missing ${who} is hard${name}.${missed.word === 'home' ? ' A call to someone there can help.' : ' Maybe send them a message, or give them a call?'}`) };
		}

		// Finishing something: "I just finished my homework".
		const finishing = doer && t.match(/\b(?:finished|done with|completed|handed in|submitted|turned in)\b/);
		const finished = finishing && find((e) => e.pos === 'noun' && ['idea', 'event', 'thing', 'media'].includes(e.kind), ws.indexOf(finishing[0].split(' ')[0]) + 1);
		if (finished) return { strong: false, reply: answer(`Nice work finishing ${mine(finished) ? 'your' : 'the'} ${finished.word}${name}! Time for a break.`) };

		const fresh = doer && t.match(/\b(?:got|bought|have|found|started) (?:a|my|our) new (\w+)/);
		const gotten = fresh && find((e) => e.pos === 'noun' && !e.mass, ws.indexOf('new') + 1);
		if (gotten && gotten.e.kind !== 'animal') {
			const w = gotten.label === 'spelling' ? gotten.word : gotten.e.w;
			return { strong: false, reply: answer(['job', 'house', 'home', 'apartment', 'car', 'career'].includes(w) ? `Congratulations on the new ${w}${name}! How does it feel?` : `Ooh, a new ${w}! Enjoy it.`) };
		}
		if (doer && /\bgot the (job|part|place)\b/.test(t)) return { strong: true, reply: answer(`Congratulations${name}! That's great news.`) };

		const verb = find((e) => e.pos === 'verb' && !VAGUE.has(e.w));
		const thing = verb && find((x) => x.pos === 'noun' && ['food', 'thing', 'furniture', 'media'].includes(x.kind), verb.i + 1);
		// Eating something is about the food, which the food reply below handles; making it is about the making.
		if (verb && !negated(verb) && (doer || must) && !(thing && thing.e.kind === 'food' && !MAKING.has(verb.e.w))) {
			const e = verb.e;
			const ing = d.forms.ing(e);
			const theirs = hits.find((h) => h.i > verb.i && h.i - verb.i <= 3 && mine(h));
			const done = past || verb.label === 'past tense';
			if (e.mood === '-' && (done || verb.label === '-ing form' || !future)) {
				return { strong: false, reply: answer(theirs ? `Oh no, sorry to hear about your ${theirs.word}. I hope it gets sorted out soon.` : 'Oh no, sorry to hear that. I hope it gets better from here.') };
			}
			if (must) return { strong: false, reply: say('dyn-must', [`Good luck with the ${ing}. You've got this.`, `Hope the ${ing} goes quickly.`]) };
			if (done) return { strong: false, topic: thing && MAKING.has(e.w) ? { kind: 'went', np: `the ${thing.e.w}`, verb: 'turned out' } : { kind: 'went', np: 'it' }, reply: thing && MAKING.has(e.w) ? answer(`How did the ${thing.e.w} turn out?`) : say('dyn-did', [`${upper(ing)}, nice. How did it go?`, `Sounds good. How was the ${ing}?`]) };
			if (future) return { strong: false, reply: answer((thing ? `${upper(thing.e.mass ? thing.e.w : d.a(thing.e.w))}? ` : '') + pick('dyn-will', [`${upper(ing)} sounds like a good plan.`, `Enjoy the ${ing}${when}!`])) };
			if (verb.label === '-ing form') {
				const what = find((x) => x.pos === 'noun' && !['person', 'time'].includes(x.kind), verb.i + 1);
				if (what && what.i - verb.i <= 3) {
					const it = phrase(what, null);
					if (e.w === 'play' && what.e.mass) return { strong: false, reply: answer(`Have fun playing ${it}${name}!`) };
					return { strong: false, reply: say('dyn-doing-it', [`${upper(ing)} ${it}, nice. Enjoy!`, `Ooh, ${ing} ${it}. How's it going?`]) };
				}
				return { strong: false, reply: say('dyn-doing', [`${upper(ing)}, nice. How's it going?`, `Ooh, ${ing}. Enjoy it!`]) };
			}
		}

		// The weather outside.
		if (/\b(?:it is|its|it s) (?:raining|pouring|drizzling)\b|\braining (?:here|outside)\b/.test(t)) return { strong: false, reply: answer(`Stay dry out there${name}!`) };
		if (/\b(?:it is|its|it s) snowing\b|\bsnowing (?:here|outside)\b/.test(t)) return { strong: false, reply: answer(`Snow! Stay warm${name}.`) };

		const animal = find((e) => e.kind === 'animal' && !e.nogen);
		if (animal && self) {
			const w = animal.e.w;
			if (mine(animal)) return { strong: false, topic: { kind: 'name', np: `your ${w}` }, reply: answer(`What's your ${w}'s name?`) };
			if (/\b(got|new|adopted|adopt|getting)\b/.test(t)) return { strong: false, topic: { kind: 'name', np: `your new ${w}` }, reply: answer(`${upper(d.a(w))}! What's its name?`) };
			if (/\b(love|like|adore)\b/.test(t)) return { strong: false, reply: answer(`${upper(d.forms.plural(animal.e))} are wonderful. In my dictionary, ${describe(animal.e, d)}.`) };
		}

		const food = find((e) => e.kind === 'food' && !e.nogen);
		if (food && self && /\b(eat|eating|ate|having|had|have|made|making|cooking|cooked|baking|baked|love|like|for (breakfast|lunch|dinner))\b/.test(t)) {
			const many = food.label === 'plural';
			const dish = food.e.mass ? food.e.w : many ? d.forms.plural(food.e) : /^(a|an)$/.test(ws[food.i - 1]) ? d.a(food.e.w) : food.e.w;
			if (/\b(love|like)\b/.test(t)) return { strong: false, reply: answer(`${upper(dish)}? Good choice.`) };
			if (past) return { strong: false, topic: { kind: 'went', np: 'it' }, reply: answer(`Mm, ${dish}. Was it good?`) };
			return { strong: false, reply: say('dyn-food', [`${upper(dish)} ${many ? 'sound' : 'sounds'} good right now.`, `Mm, ${dish}. Enjoy!`]) };
		}

		const place = find((e) => e.kind === 'place' && !e.mass);
		if (place && doer && (/\b(at|in|to|on|visiting|visit|went|going|heading|back)\b/.test(t) || place.e.w === 'home')) {
			const w = place.e.w;
			if (w === 'home') return { strong: false, reply: answer(past ? 'Nice to be home.' : future ? 'Enjoy being home.' : `Welcome home${name}.`) };
			const there = the(place.e);
			if (past) return { strong: false, topic: { kind: 'went', np: there }, reply: answer(`How was ${there}?`) };
			if (future) return { strong: false, reply: answer(`Enjoy ${there}${when}!`) };
			return { strong: false, reply: say('dyn-place', [`${upper(there)} sounds nice. What are you up to there?`, `Ooh, ${there}. Enjoy it!`]) };
		}

		const person = find((e) => e.rel);
		if (person && mine(person)) return { strong: false, reply: answer(`Tell me more about your ${person.e.w}.`) };

		// A word worth talking about, like "serendipity": offer to define it.
		const notable = ws.length <= 12 && find((e) => e.pos === 'noun' && ['idea', 'media'].includes(e.kind) && e.w.length >= 6 && !ILL.has(e.w) && !/^[A-Z]/.test(e.w));
		if (notable) return { strong: false, reply: answer(`You mentioned **${notable.e.w}**.`, { offer: { kind: 'define', word: notable.e.w, ask: 'Want me to define it?' } }) };
		return null;
	}

	/** Whether a short answer is good news, bad news or neither, from the moods of its words; null if it has none. */
	function sentiment(ws) {
		const d = Omni.onyxDictionary;
		const text = ws.join(' ');
		if (/\bnot (?:too |that |so )?bad\b/.test(text) || /\b(?:passed|won|nailed|aced|smashed)\b/.test(text)) return '+';
		if (/\b(?:failed|bombed|flunked|blew it)\b/.test(text)) return '-';
		let score = 0;
		let seen = false;
		ws.forEach((w, i) => {
			const mood = ((d && d.lookup(w)) || []).map((x) => x.e.mood).find(Boolean);
			if (!mood) return;
			seen = true;
			const v = { '+': 1, '-': -1, '--': -2, 0: 0 }[mood];
			score += ws.slice(Math.max(0, i - 2), i).some((x) => NEG.has(x)) ? -v : v;
		});
		return !seen ? null : score > 0 ? '+' : score < 0 ? '-' : '0';
	}

	/**
	 * The answer to a question Onyx just asked about what someone told it: "How did the exam go?" "Pretty well!"
	 * gets a reply about the exam. `topic` is { kind: 'went' | 'ahead' | 'name', np }; null when the answer doesn't fit.
	 */
	function followUp(raw, topic, mem) {
		const t = normalize(raw).replace(/[^a-z0-9\s'-]/g, ' ').replace(/\s+/g, ' ').trim();
		const ws = t.split(' ');
		if (ws.length > 12) return null;
		const prefs = settings();
		const name = mem.name && prefs.useName ? `, ${mem.name}` : '';
		const np = topic.np;
		const went = topic.verb || 'went';
		// A message that brings up something new ("my dog is sick") is news, not an answer.
		const fresh = ws.some((w) => !np.includes(w) && !['day', 'one', 'bit', 'lot', 'time'].includes(w) && (Omni.onyxDictionary.lookup(w) || []).some((x) => x.e.pos === 'noun' && x.e.kind !== 'time'));
		if (fresh && topic.kind !== 'name') return null;
		if (topic.kind === 'name') {
			const m = raw.trim().match(/^(?:(?:her|his|its|their) name is |it'?s |(?:she|he|it|they)(?:'s| is| are) called |(?:we )?call(?:ed)? (?:her |him |it |them )?)?([A-Z][a-z'-]+(?: [A-Z][a-z'-]+)?)[.!]*$/);
			return m && !NOT_NAMES.has(m[1].toLowerCase()) ? answer(`${m[1]} is a great name for ${np}!`) : null;
		}
		const mood = sentiment(ws);
		if (mood === null) return null;
		if (topic.kind === 'ahead') {
			const feel = ws.map((w) => (Omni.onyxDictionary.lookup(w) || []).find((x) => x.e.use === 'feel')).find(Boolean);
			if (mood === '+') return answer(`Love that. I hope ${np} goes brilliantly${name}!`);
			if (mood === '-' || mood === '--') return answer(`That makes sense.${feel && feel.e.tip && prefs.tips ? ' ' + feel.e.tip : ' Take it one step at a time.'} Good luck with ${np}${name}!`);
			return answer(`Fair enough. Good luck with ${np}!`);
		}
		if (mood === '+') return answer(np === 'it' ? `Glad it ${went} well${name}!` : pick('went-good', [`Glad ${np} ${went} well${name}!`, `That's great to hear about ${np}.`]));
		if (mood === '-' || mood === '--') return answer(`Sorry ${np} didn't ${went === 'went' ? 'go' : 'turn out'} the way you hoped${name}. Do you want to talk about it?`);
		return answer(`Fair enough. Thanks for telling me how ${np} ${went}.`);
	}

	/* ---------- Internet port (prepared, not connected) ---------- */

	/*
	 * The one place Onyx would reach beyond this device. A host may set Omni.net = { enabled: true, ask(request) } where
	 * request is { kind, query } (kind: 'weather', 'news', 'search' or 'define') and ask resolves to { text } or null.
	 * Nothing provides one today: host.js ships it disabled and Onyx itself makes no network requests. Any failure, a
	 * slow answer or an empty one falls back to what Onyx would have said offline.
	 */
	const NET_KINDS = ['weather', 'news', 'search', 'define'];
	const NET_TIMEOUT = 8000;
	async function online(kind, query) {
		const net = Omni.net;
		if (!net || net.enabled !== true || typeof net.ask !== 'function' || !NET_KINDS.includes(kind)) return null;
		let timer;
		try {
			const r = await Promise.race([net.ask({ kind, query }), new Promise((done) => (timer = setTimeout(done, NET_TIMEOUT, null)))]);
			return r && typeof r.text === 'string' && r.text.trim() ? answer(r.text.trim()) : null;
		} catch {
			return null;
		} finally {
			clearTimeout(timer);
		}
	}

	/* ---------- Deciding the reply ---------- */

	const answer = (text, extra) => Object.assign({ text }, extra || {});
	const asksMeaning = /^(?:what(?: is| are| does)|whats|define|definition of|explain|meaning of|tell me about|what do you mean by|whats an?)\s+(?:an?\s+|the\s+)?(.+?)(?:\s+mean|\s+stand for)?\s*[?.!]*$/i;

	// "define X" and "what does X mean" are clearly about words; "what is X" might be about anything, so it only reaches
	// the dictionary when no intent claims it ("what is new" is small talk, not a definition of "new").
	const asksWord = /^(?:define|definition of|what is the definition of|whats the definition of|what does .+ mean|what is the meaning of|whats the meaning of|meaning of)\b/i;

	/** A definition from the tech glossary, then (if `dictionary`) the everyday dictionary; null if neither has it. */
	function define(term, dictionary) {
		const t = term.toLowerCase().replace(/[?.!"“”]/g, '').replace(/^(?:the word\s+)?(?:an?|the)\s+/, '').trim();
		const hit = Omni.onyxData.GLOSSARY.find((g) => g.terms.includes(t) || g.terms.includes(t.replace(/s$/, '')));
		if (!hit) {
			const entry = dictionary && Omni.onyxDictionary && Omni.onyxDictionary.define(t);
			if (!entry) return null;
			convo.lastKind = null;
			convo.sentence = { word: t, n: 0, said: [] };
			return answer(entry);
		}
		const text = typeof hit.text === 'function' ? hit.text() : hit.text;
		convo.lastKind = null;
		if (hit.tool && Omni.byId[hit.tool]) return answer(`${text}\n\n${Omni.onyxData.toolLink(hit.tool)} works with it.`, { offer: { kind: 'open', id: hit.tool, ask: 'Want me to open it?' } });
		if (hit.tool) return answer(`${text}\n\nThe tool for it is in the desktop edition.`);
		return answer(text);
	}

	/** What to do with an affirmative answer to an offer. */
	async function accept(offer) {
		if (offer.kind === 'open') return answer(`Opening ${Omni.onyxData.toolLink(offer.id)}.`, { action: 'open:' + offer.id });
		if (offer.kind === 'settings') return answer('Opening Settings.', { action: 'settings' });
		if (offer.kind === 'forget') {
			Omni.store.remove(MEMORY_KEY);
			return answer('Done. I\'ve forgotten your name and everything you asked me to keep.');
		}
		if (offer.kind === 'games') {
			const games = ['game-2048', 'minesweeper', 'snake', 'typing-test'].filter((id) => Omni.byId[id]);
			const id = games[Math.floor(Math.random() * games.length)];
			return answer(`Let's go with ${Omni.onyxData.toolLink(id)}.`, { action: 'open:' + id });
		}
		if (offer.kind === 'joke') return answer(draw('joke', Omni.onyxData.JOKES));
		if (offer.kind === 'define') return define(offer.word, true) || answer('I seem to have lost that one.');
		if (offer.kind === 'command') {
			convo.lastCommand = offer.command;
			convo.lastKind = 'command';
			return answer('', { command: offer.command });
		}
		return answer('Okay.');
	}

	/**
	 * Decides Onyx's reply to one message. Returns { text, offer?, action?, command? }; `command` means the text should
	 * run through OmniTool's offline commands. Pure apart from memory writes, so tests can call it directly.
	 */
	async function respond(raw) {
		const r = await decide(raw);
		// The next message is read against this reply: its yes/no offer, or the name it asked for.
		if (r) {
			convo.pending = r.offer || null;
			convo.expect = r.expect || null;
			convo.lastReply = r.text + (r.offer ? `

${r.offer.ask}` : '');
		}
		return r;
	}

	async function decide(raw) {
		const text = String(raw || '').trim();
		if (!text) return null;
		const mem = memory();
		const norm = normalize(text);
		const pending = convo.pending;
		const expect = convo.expect;
		convo.pending = null;
		convo.expect = null;

		if (CRISIS.test(text)) {
			return answer('I\'m really sorry you\'re feeling this way. I\'m only a small program, so please talk to a person who can help right now: in the US you can call or text **988** (Suicide & Crisis Lifeline), and anywhere else your local emergency number or a line listed at **findahelpline.com** will reach someone. If you\'re in danger, call emergency services. You don\'t have to go through this alone.');
		}
		if (FOREIGN.test(norm) || FOREIGN.test(text)) return answer('I only understand English, sorry.');
		const asked = convo.topic;
		convo.topic = null;
		const setting = settingsCommand(norm);
		if (setting) return setting;

		if (pending) {
			if (YES.test(text)) return accept(pending);
			if (NO.test(text)) return answer(pending.kind === 'forget' ? 'Okay, I\'ll keep it.' : 'Okay.');
		}

		const name = nameFrom(text, expect === 'name');
		if (name) {
			if (/^onyx$/i.test(name)) return answer('That\'s my name. What should I call you?', { expect: 'name' });
			saveMemory(Object.assign(mem, { name, met: mem.met || new Date().toISOString() }));
			return answer(mem.met && mem.name !== name ? `Got it, ${name}. I'll remember that on this device.` : `Nice to meet you, ${name}. I'll remember your name on this device.`);
		}

		const rem = text.match(/^(?:please\s+)?(?:can you\s+|could you\s+)?remember(?:\s+that)?\s+(.{3,200})$/i);
		if (rem) {
			const fact = rem[1].replace(/[.!]+$/, '').replace(/\bmy\b/gi, 'your').replace(/\bi am\b/gi, 'you are').replace(/\bi\b/g, 'you');
			mem.facts = [{ text: fact, at: new Date().toISOString() }, ...mem.facts].slice(0, 30);
			saveMemory(mem);
			return answer(`I'll remember: ${fact}.`);
		}

		const followed = asked && settings().reader && followUp(text, asked, mem);
		if (followed) return shape(followed);

		// "Hi Onyx, what can you do?" gets a short greeting in front of the real answer.
		let greet = '';
		let body = text;
		const g = text.match(/^(hi|hello|hey|heya|hiya|yo|howdy|good (?:morning|afternoon|evening))(?:\s+there)?(?:\s+onyx)?[\s,!.]+(.+)$/i);
		if (g && g[2].trim().length > 1 && !/^(onyx|you|there)[\s!.?]*$/i.test(g[2].trim())) {
			greet = `${g[1][0].toUpperCase()}${g[1].slice(1).toLowerCase()}${mem.name ? ', ' + mem.name : ''}. `;
			body = g[2];
		}
		const withGreet = (r) => (r && greet ? Object.assign({}, r, { text: greet + r.text }) : r);

		const decision = /^(?:should i|shall i|do i)\s+(.+?)\s+or\s+(.+?)\??$/i.exec(body) || /^(?:pick|choose)(?: one)?(?: between|:)?\s+(.+?)\s+(?:or|and)\s+(.+?)\??$/i.exec(body);
		if (decision) {
			const options = [decision[1], ...decision[2].split(/,\s*|\s+or\s+/)].map((s) => s.trim()).filter(Boolean);
			const choice = options[Math.floor(Math.random() * options.length)];
			return withGreet(answer(`Go with **${choice}**. I picked at random, so if your stomach disagrees, listen to it.`));
		}
		const word = wordTrick(body);
		if (word) return withGreet(answer(word));
		const aboutWords = wordQuery(body);
		if (aboutWords) return withGreet(aboutWords);
		// Arithmetic is answered directly, and the answer is kept so "times 3" or "that squared" can follow.
		const sum = Omni.onyxMath && Omni.onyxMath.answer(body, convo.lastAnswer);
		if (sum) {
			if (sum.value != null) convo.lastAnswer = sum.value;
			convo.lastKind = null;
			return withGreet(answer(sum.text));
		}
		const pickNum = body.match(/\bpick (?:a|one) number (?:between|from) (-?\d+) (?:and|to) (-?\d+)/i);
		const math = wordsToMath(body);
		const commandText = pickNum ? `random number between ${pickNum[1]} and ${pickNum[2]}` : math || body;
		if (Omni.offline.plan(commandText)) {
			convo.lastCommand = commandText;
			convo.lastKind = 'command';
			return withGreet(answer('', { command: commandText }));
		}

		const ranked = classify(body);
		const top = ranked[0] || { id: null, score: 0 };
		const meaning = body.match(asksMeaning);
		const reading = meaning || !settings().reader ? null : read(body, mem);
		// Remember what a reading asked about, so the answer to "How did the exam go?" is read against the exam.
		const useReading = () => {
			convo.topic = reading.topic || null;
			return withGreet(shape(reading.reply));
		};
		// A reading beats a weak intent match: "I'm going to bake a cake" isn't "going to bed".
		// "Do you like dogs" reads to the intent model like "do you like me"; the dictionary knows better.
		if (reading && ((reading.sure && ['love', 'weather'].includes(top.id)) || top.score < (reading.strong ? 0.7 : 0.6))) return useReading();
		const aboutWord = asksWord.test(body.trim());
		if (meaning && !(top.score > 0.75 && ['identity', 'omnitool', 'meaning', 'date', 'time', 'weather', 'news'].includes(top.id))) {
			const gl = define(meaning[1], aboutWord);
			if (gl) return withGreet(gl);
		}
		if (top.score >= 0.5 || (top.score >= 0.38 && top.score - ((ranked[1] && ranked[1].score) || 0) >= 0.12)) {
			const intent = Omni.onyxData.INTENTS.find((i) => i.id === top.id);
			const searching = intent.id === 'limits' && /\b(web|internet|google|search|look (this|it) up|online|browse)\b/.test(normalize(body));
			const net = ['weather', 'news'].includes(intent.id) ? await online(intent.id, body) : searching ? await online('search', body) : null;
			if (net) return withGreet(net);
			// "Hey hey" is one greeting, not a greeting in front of another.
			return intent.id === 'greet' ? reply(intent, body, mem) : withGreet(await reply(intent, body, mem));
		}
		if (meaning) {
			const gl = define(meaning[1], true);
			if (gl) return withGreet(gl);
			if (aboutWord && !/^(that|it|this|these|those)$/i.test(meaning[1].trim())) {
				const word = meaning[1].replace(/[?.!"“”]/g, '').trim();
				return withGreet((await online('define', word)) || answer(`"${word}" isn't in my dictionary or glossary. I know ${Omni.onyxDictionary ? Omni.onyxDictionary.size + ' everyday words and ' : ''}${Omni.onyxData.GLOSSARY.length} tech terms, and I can't look up new ones.`));
			}
		}

		const found = /^(who|when|where|why)\b/i.test(body.trim()) ? [] : findTools(body);
		if (found.length) {
			const [first, second] = found;
			const more = second && second.score > first.score * 0.6 ? ` ${Omni.onyxData.toolLink(second.tool.id)} is close too.` : '';
			return withGreet(answer(`That sounds like ${Omni.onyxData.toolLink(first.tool.id)}: ${first.tool.description}${more}`, { offer: { kind: 'open', id: first.tool.id, ask: 'Want me to open it?' } }));
		}

		if (reading) return useReading();

		// "Howdy partner": the greeting is the message, even when the rest of it isn't something I understand.
		if (greet) return reply(Omni.onyxData.INTENTS.find((i) => i.id === 'greet'), g[1], mem);

		convo.misses++;
		if (/^(who|what|when|where|why|how|which|is|are|does|do|did|can|could|will|would)\b/i.test(body) || /\?\s*$/.test(body)) {
			const net = await online('search', body);
			if (net) return withGreet(net);
			return withGreet(answer(pick('dunno', [
				'I don\'t know that one. I only know about OmniTool and a few small things, and I can\'t look anything up.',
				'That\'s outside what I know. I\'m a small local assistant: no internet, no encyclopedia.',
				'No idea, honestly. Ask me about OmniTool, or tell me what you\'re trying to do and I\'ll find a tool.',
			]) + (convo.misses > 1 ? ' Type **help** to see what I can do.' : '')));
		}
		return withGreet(answer(pick('miss', [
			'I didn\'t catch that. Try rephrasing, or type **help** to see what I can do.',
			'I\'m not sure what you mean. You can ask me things like "what is a JWT" or "I need to convert a timestamp".',
			'That one went past me. Type **help** for the things I understand.',
		])));
	}

	/** Runs an intent's reply against the conversation so far. */
	async function reply(intent, body, mem) {
		const ctx = {
			text: normalize(body), raw: body, mem, part: part(), tools: Omni.tools.length, hasKey: (await Omni.ai.mode()) === 'claude',
			last: convo.lastIntent, lastKind: convo.lastKind, lastReply: convo.lastReply, why: convo.why, mayAskName: !convo.askedName,
			pick, draw,
			again: () => {
				if (convo.lastKind === 'command' && convo.lastCommand) return { text: '', command: convo.lastCommand };
				if (['joke', 'tip', 'fact'].includes(convo.lastKind)) return draw(convo.lastKind, Omni.onyxData[{ joke: 'JOKES', tip: 'TIPS', fact: 'FACTS' }[convo.lastKind]]);
				if (convo.lastKind === 'sentence') return nextSentence(convo.sentence.word);
				return 'Another what? I can do jokes, tips, facts, sentences, or repeat the last command.';
			},
		};
		let r = typeof intent.reply === 'function' ? intent.reply(ctx) : pick(intent.id, intent.reply);
		if (typeof r === 'string') r = answer(r);
		if (!['again', 'repeat', 'why', 'ack'].includes(intent.id) && !['joke', 'tip', 'fact'].includes(intent.id)) convo.lastKind = null;
		convo.lastIntent = intent.id;
		if (r.expect === 'name') convo.askedName = true;
		r.text = fill(r.text, mem);
		return r;
	}

	/* ---------- Talking in the agent panel ---------- */

	async function say(turn, text) {
		if (!text) return;
		// Short replies appear word by word over at most half a second; reduced motion shows them at once.
		const parts = text.split(/(\s+)/);
		if (Omni.motion && Omni.motion.ok() && parts.length > 2) {
			const chunk = Math.max(2, Math.ceil(parts.length / 18));
			for (let i = 0; i < parts.length; i += chunk) {
				turn.text(parts.slice(i, i + chunk).join(''));
				await new Promise((r) => setTimeout(r, 22));
			}
		} else turn.text(text);
		await turn.endText();
	}

	async function act(action, api) {
		if (!action) return;
		if (action === 'new-chat') return setTimeout(() => api.newChat(), 600);
		if (action.startsWith('theme:')) return Omni.setTheme(action.slice(6));
		if (action.startsWith('open:')) return Omni.open(action.slice(5));
		if (action === 'settings') return (location.hash = '#/settings');
		if (action.startsWith('engine:')) return Omni.store.set('agent.engine', action.slice(7));
	}

	/** Answers one message in the agent panel: words, steps for commands, and a yes/no offer when there is one. */
	async function handle(text, api) {
		const turn = api.addTurn('Onyx');
		let r = await respond(text);
		if (!r) return;
		if (r.command) {
			const reply = await Omni.offline.run(Omni.offline.plan(r.command), api, turn);
			r = Object.assign({}, r, { text: [r.text, reply].filter(Boolean).join('\n\n') });
		}
		const offer = r.offer ? `\n\n${r.offer.ask}` : '';
		await say(turn, r.text + offer);
		convo.lastReply = r.text + offer;
		convo.misses = r.text && !/didn't catch|not sure what you mean|went past me/.test(r.text) ? 0 : convo.misses;
		await act(r.action, api);
	}

	Omni.onyx = {
		respond,
		handle,
		classify: (text) => classify(text),
		findTools,
		normalize,
		memory,
		settings: { get: settings, set: setSetting, reset: () => Omni.store.remove(SETTINGS_KEY), describe: describeSettings },
		reset: () => {
			convo = fresh();
			Omni.offline.reset();
		},
	};
})();

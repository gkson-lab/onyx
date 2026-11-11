// Onyx 3's program writer: code from a prompt, composed rather than looked up. Three kinds:
//
//   - A data program: "take the numbers 1 to 20, keep the even ones, square them and print the sum", "read the lines of
//     names.txt, keep those longer than 4 letters, sort them and print each one". The prompt is read into a plan (where
//     the data comes from, the steps in order, what to print), and the plan is written in Python, JavaScript, Rust, C,
//     C# or C++. Any plan can be written in any of the six, and gives the same output in all of them:
//     tools/check-code.js writes hundreds of random plans, runs them in every language and compares.
//   - A web page: "a landing page for a bakery called Sweet Crumbs with a hero, three features, a contact form and a
//     footer", composed from sections, in one HTML file.
//   - An HTTP request: "a PUT request to https://api.example.com/users/42 with a bearer token and JSON body name=Sam".
//
//   Omni.onyxSynth.parse(text)          -> { kind: 'pipeline' | 'page' | 'request', ... , strength } or null
//   Omni.onyxSynth.write(plan, lang)    -> { code, lang, plan: [what each step does, in words], title }
(function (root) {
	'use strict';

	const q = (s) => JSON.stringify(String(s));
	const pyq = (s) => (String(s).includes("'") || String(s).includes('\\') ? q(s) : `'${s}'`);
	const cap = (s) => s[0].toUpperCase() + s.slice(1);
	const list = (xs) => (xs.length > 2 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : xs.join(' and '));

	/* ---------- Reading a data program from a prompt ---------- */

	const NUM_WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twenty: 20, fifty: 50, hundred: 100, 'a hundred': 100, 'one hundred': 100, thousand: 1000 };
	const N = '(-?\\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten|twenty|fifty|a hundred|one hundred|hundred|thousand)';
	const num = (s) => (/^-?\d+$/.test(s) ? +s : NUM_WORDS[s]);
	const NEGATE = { even: 'odd', odd: 'even', positive: 'nonpositive', negative: 'nonnegative', gt: 'le', lt: 'ge', ge: 'lt', le: 'gt', eq: 'ne', ne: 'eq', divisible: 'indivisible', longer: 'notlonger', shorter: 'notshorter', startswith: 'notstartswith', endswith: 'notendswith', contains: 'notcontains' };
	const DROP = '(?:remov|drop|discard|skip|exclud|delet|throw(?:s|ing)? (?:out|away)|filter(?:s|ing)? out|get(?:s|ting)? rid of|without|ignor|leav(?:e|es|ing) out)';

	// Each: [pattern, (match) => step]. Found anywhere in the prompt; their order in the text is the order of the steps.
	const NUMBER_OPS = [
		[/\b(even|odd|positive|negative)\b/, (m) => ({ op: 'filter', pred: { kind: m[1] } })],
		[new RegExp(`\\b(?:greater|more|bigger|larger|higher) than ${N}\\b|\\b(?:above|over|exceed(?:s|ing)?) ${N}\\b`), (m) => ({ op: 'filter', pred: { kind: 'gt', n: num(m[1] || m[2]) } })],
		[new RegExp(`\\b(?:less|smaller|lower|fewer) than ${N}\\b|\\b(?:below|under) ${N}\\b`), (m) => ({ op: 'filter', pred: { kind: 'lt', n: num(m[1] || m[2]) } })],
		[new RegExp(`\\bat least ${N}\\b|\\b${N} or (?:more|greater|higher|above)\\b`), (m) => ({ op: 'filter', pred: { kind: 'ge', n: num(m[1] || m[2]) } })],
		[new RegExp(`\\bat most ${N}\\b|\\b${N} or (?:less|fewer|lower|below)\\b`), (m) => ({ op: 'filter', pred: { kind: 'le', n: num(m[1] || m[2]) } })],
		[new RegExp(`\\b(?:divisible by|multiples? of) ${N}\\b`), (m) => ({ op: 'filter', pred: { kind: 'divisible', n: num(m[1]) || 1 } })],
		[/\bsquar(?:e|es|ed|ing)\b(?! root)/, () => ({ op: 'map', fn: { kind: 'square' } })],
		[/\bcub(?:e|es|ed|ing)\b/, () => ({ op: 'map', fn: { kind: 'cube' } })],
		[/\bdoubl(?:e|es|ed|ing)\b/, () => ({ op: 'map', fn: { kind: 'times', n: 2 } })],
		[/\btripl(?:e|es|ed|ing)\b/, () => ({ op: 'map', fn: { kind: 'times', n: 3 } })],
		[new RegExp(`\\bmultipl(?:y|ies|ied|ying)(?: (?:them|each(?: one)?|every one|it))? by ${N}\\b|\\btimes ${N}\\b`), (m) => ({ op: 'map', fn: { kind: 'times', n: num(m[1] || m[2]) } })],
		[new RegExp(`\\badd(?:s|ing)? ${N}\\b(?: to (?:them|each(?: one)?|every one|it))?|\\bplus ${N}\\b|\\bincreas(?:e|es|ing) (?:them|each(?: one)?|it) by ${N}\\b`), (m) => ({ op: 'map', fn: { kind: 'plus', n: num(m[1] || m[2] || m[3]) } })],
		[new RegExp(`\\bsubtract(?:s|ing)? ${N}\\b|\\bminus ${N}\\b|\\bdecreas(?:e|es|ing) (?:them|each(?: one)?|it) by ${N}\\b`), (m) => ({ op: 'map', fn: { kind: 'plus', n: -num(m[1] || m[2] || m[3]) } })],
		[/\babsolute values?\b/, () => ({ op: 'map', fn: { kind: 'abs' } })],
		[/\bnegat(?:e|es|ed|ing)\b/, () => ({ op: 'map', fn: { kind: 'times', n: -1 } })],
	];
	const WORD_OPS = [
		[new RegExp(`\\b(?:longer|more) than ${N}(?: (?:letters?|characters?|chars?))?\\b`), (m) => ({ op: 'filter', pred: { kind: 'longer', n: num(m[1]) } })],
		[new RegExp(`\\b(?:shorter|less|fewer) than ${N}(?: (?:letters?|characters?|chars?))?\\b`), (m) => ({ op: 'filter', pred: { kind: 'shorter', n: num(m[1]) } })],
		[/\b(?:start(?:s|ing)?|begin(?:s|ning)?) with (?:the letter )?["'“]?([a-z0-9]+)["'”]?/, (m) => ({ op: 'filter', pred: { kind: 'startswith', s: m[1] } })],
		[/\bend(?:s|ing)? (?:with|in) (?:the letter )?["'“]?([a-z0-9]+)["'”]?/, (m) => ({ op: 'filter', pred: { kind: 'endswith', s: m[1] } })],
		[/\b(?:contain(?:s|ing)?|includ(?:e|es|ing)|with) (?:the letter |the word |the text )?["'“]([a-z0-9 ]+)["'”]|\bcontain(?:s|ing)? (?:the letter )?([a-z0-9]+)\b/, (m) => ({ op: 'filter', pred: { kind: 'contains', s: m[1] || m[2] } })],
		[/\b(?:upper ?case|capital(?:s| letters)|capitali[sz]e[sd]?|shout(?:s|ing)?)\b/, () => ({ op: 'map', fn: { kind: 'upper' } })],
		[/\blower ?case\b/, () => ({ op: 'map', fn: { kind: 'lower' } })],
		[/\brevers(?:e|es|ed|ing) (?:each|every|the letters)\b|\b(?:each|every) (?:word|one|line|name) (?:backwards|reversed)\b|\bbackwards\b/, () => ({ op: 'map', fn: { kind: 'reverse' } })],
		[/\b(?:lengths?|how long each|number of letters)\b/, () => ({ op: 'map', fn: { kind: 'length' } })],
	];
	const LIST_OPS = [
		[new RegExp(`\\b(?:the )?${N} (largest|biggest|highest|greatest|smallest|lowest|longest|shortest)\\b|\\btop ${N}\\b`), (m) => ({ op: 'best', n: num(m[1] || m[3]), which: m[2] || 'largest' })],
		[/\bsort(?:s|ed|ing)?\b|\bin (?:ascending |descending |alphabetical |reverse )?order\b|\balphabeti[sz]e[sd]?\b|\border(?:s|ed|ing)? them\b/, (m, t) => ({ op: 'sort', desc: /\b(?:descending|largest first|biggest first|highest first|high(?:est)? to low(?:est)?|decreasing|reverse (?:alphabetical )?order|z to a|longest first)\b/.test(t) })],
		[/\b(?:unique|distinct|duplicates?|dedup(?:e|licate)?[sd]?|repeats?)\b/, () => ({ op: 'unique' })],
		[new RegExp(`\\b(?:the |only the |keep(?:s|ing)? the |take(?:s|ing)? the )?first ${N}\\b`), (m, t, at) => (new RegExp(`${DROP}\\w*(?: the)?\\s*$`).test(t.slice(0, at)) ? { op: 'skip', n: num(m[1]) } : { op: 'take', n: num(m[1]) })],
		[/\brevers(?:e|es|ed|ing) (?:the (?:list|order|array|result)|them|it)\b|\bin reverse\b|\bbackwards? order\b/, () => ({ op: 'reverse' })],
	];
	const SINKS = [
		[/\b(?:sum|total|add(?:s|ing)? (?:them|it all|everything) (?:all )?up|added (?:up|together))\b/, () => ({ type: 'sum' })],
		[/\b(?:average|mean)\b/, () => ({ type: 'average' })],
		[/\b(?:product|multipl(?:y|ies|ied|ying)\b[^.;]{0,60}?\btogether)\b/, () => ({ type: 'product' })],
		[/\b(?:count(?:s|ing)?|how many|the number of)\b(?! (?:from|to|up|down))/, () => ({ type: 'count' })],
		[/\b(?:largest|biggest|highest|greatest|maximum|max)\b/, () => ({ type: 'max' })],
		[/\b(?:smallest|lowest|least|minimum|min)\b/, () => ({ type: 'min' })],
		[/\blongest\b/, () => ({ type: 'longest' })],
		[/\bshortest\b/, () => ({ type: 'shortest' })],
		[/\bjoin(?:s|ed|ing)?(?: (?:them|the (?:words|names|lines|numbers|results?)))?(?: together)? with (?:an? )?["'“]?(commas?|spaces?|dashe?s?|hyphens?|semicolons?|[^"'”\s]{1,3})["'”]?|\b(comma|space|dash|semicolon)[- ]separated\b|\bseparated by (?:an? )?(commas?|spaces?|dashe?s?|semicolons?)\b|\bon one line\b/, (m) => ({ type: 'join', sep: { comma: ', ', commas: ', ', space: ' ', spaces: ' ', dash: '-', dashes: '-', dashs: '-', hyphen: '-', hyphens: '-', semicolon: '; ', semicolons: '; ' }[m[1] || m[2] || m[3]] || (m[1] && m[1].length <= 3 ? m[1] : ', ') })],
	];

	/** Where the data comes from: numbers written out, a range, a file, the keyboard, words, the lines of a file. */
	function sourceOf(t, raw) {
		const file = (raw.match(/[\w.-]+\.(?:txt|csv|log|md|dat|list)\b/i) || [])[0];
		const wordy = /\b(?:words?|names?|strings?|lines?|sentences?|letters?|fruits?|colou?rs?|cities|animals)\b/.test(t.replace(/\bon (?:one|a single|the same|its own|separate) lines?\b/g, ' '));
		if (file) return /\blines?\b|\bnames?\b|\bwords?\b|\bstrings?\b/.test(t) && !/\bnumbers?\b|\bintegers?\b/.test(t) ? { type: 'file-lines', file } : { type: 'file-nums', file };
		if (/\b(?:from|reads?|typed|entered|given)\b.*\b(?:input|stdin|keyboard|the user|standard input)\b|\buser (?:types|enters|inputs)\b/.test(t)) return { type: 'input-nums' };
		const quoted = raw.match(/["“]([^"”]{3,200})["”]|'([^']{3,200})'/);
		if (quoted && /\b(?:words?|sentence|text|string|phrase)\b/.test(t) && /\s/.test(quoted[1] || quoted[2])) return { type: 'text-words', text: quoted[1] || quoted[2] };
		const range = t.match(new RegExp(`\\b(?:numbers?|integers?)?\\s*(?:from |between )?${N} (?:to|through|and|up to|-) ${N}\\b`));
		if (range && num(range[1]) < num(range[2]) && num(range[2]) - num(range[1]) <= 1000000 && !wordy) return { type: 'range', from: num(range[1]), to: num(range[2]) };
		const upTo = t.match(new RegExp(`\\b(?:numbers?|integers?) (?:up to|below|under|until) ${N}\\b|\\bfirst ${N} (?:numbers|integers|positive integers|natural numbers)\\b`));
		if (upTo) return { type: 'range', from: 1, to: num(upTo[1] || upTo[2]) };
		const listed = raw.match(/(?::|\b(?:list|array|numbers|values|of)\b)\s*\[?\s*(-?\d+(?:\s*,\s*-?\d+){2,})\s*\]?/i) || raw.match(/\[\s*(-?\d+(?:\s*,\s*-?\d+)+)\s*\]/) || raw.match(/(-?\d+(?:\s*,\s*-?\d+){3,})/);
		if (listed) return { type: 'nums', values: listed[1].split(',').map((x) => +x.trim()).slice(0, 200) };
		const words = raw.match(/(?::|\b(?:words|names|strings|fruits|colou?rs|cities|animals|list)\b)\s*\[?\s*["'“]?([a-z][a-z'-]*["'”]?(?:\s*,\s*["'“]?[a-z][a-z'-]*["'”]?){2,})(?:\s*,?\s+and\s+["'“]?([a-z][a-z'-]*))?/i);
		if (words) return { type: 'words', values: words[1].split(',').map((x) => x.replace(/["'“”]/g, '').trim()).concat(words[2] ? [words[2]] : []).filter(Boolean).slice(0, 100) };
		if (wordy && !/\bnumbers?\b/.test(t)) return { type: 'words', values: ['pear', 'fig', 'banana', 'kiwi', 'apple', 'cherry', 'fig'], assumed: true };
		if (/\b(?:numbers?|integers?|list|array|values)\b/.test(t)) return { type: 'nums', values: [7, 2, 10, 5, 8, 2, 13, 4], assumed: true };
		return null;
	}

	/**
	 * Reads a data program from a prompt: { kind: 'pipeline', source, steps, sink, strength } or null. `strength` is how
	 * many things it recognized besides the source, so the caller can tell a plan from a passing mention of numbers.
	 */
	function pipeline(text) {
		const raw = String(text).trim();
		// Quoted text is data, not instructions: "the words in 'sort the even ones'" has nothing to sort.
		const quoted = raw.match(/["“][^"”]{3,200}["”]|'[^']{3,200}'/);
		const t = (quoted ? raw.replace(quoted[0], ' "" ') : raw).toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' ');
		const source = sourceOf(t, raw);
		if (!source) return null;
		const strings = /^(?:words|file-lines|text-words)$/.test(source.type);
		// The numbers of the source aren't arguments of the steps: blank them out before looking for steps.
		let body = t;
		if (source.type === 'range') body = body.replace(new RegExp(`(?:from |between )?${N} (?:to|through|and|up to|-) ${N}`), (m) => ' '.repeat(m.length));
		if (source.type === 'nums' && !source.assumed) body = body.replace(/\[?\s*-?\d+(?:\s*,\s*-?\d+)+\s*\]?/, (m) => ' '.repeat(m.length));
		const found = [];
		const scan = (ops, kind) => {
			for (const [re, make] of ops) {
				const m = body.match(re);
				if (!m) continue;
				const step = make(m, body, m.index);
				if (!step) continue;
				// "Remove the even ones", "without the negative ones": the opposite test.
				if (step.op === 'filter' && new RegExp(`${DROP}\\w*(?: all)?(?: the| any| every)?(?: (?:ones?|numbers?|words?|lines?|names?|values?|those|that are|which are|that))*\\s*$`).test(body.slice(0, m.index)) !== /(?:\bnot|n't|\bnever|\bnon)[- ]?(?:be )?$/.test(body.slice(0, m.index))) step.pred.kind = NEGATE[step.pred.kind];
				found.push({ at: m.index, step, kind });
				body = body.slice(0, m.index) + ' '.repeat(m[0].length) + body.slice(m.index + m[0].length);
			}
		};
		scan(LIST_OPS, 'step');
		if (strings) scan(WORD_OPS, 'step');
		// "The lengths of the words" turns words into numbers; number steps and number results apply after that.
		scan(NUMBER_OPS.filter(() => !strings || found.some((f) => f.step.fn && f.step.fn.kind === 'length')), 'step');
		const sinks = [];
		for (const [re, make] of SINKS) {
			const m = body.match(re);
			if (m) sinks.push({ at: m.index, sink: make(m) });
		}
		sinks.sort((a, b) => a.at - b.at);
		let steps = found.sort((a, b) => a.at - b.at);
		// "The sum of the squares of the even numbers": said inside out, so the steps run in reverse.
		const first = sinks[0];
		if (first && steps.length > 1 && steps.every((s) => s.at > first.at) && /\bof (?:the|all)\b/.test(body.slice(first.at))) steps = steps.reverse();
		// A test on the source itself comes first, wherever it was said: "square the even numbers" keeps the even ones, then squares.
		const out = [];
		for (const { step } of steps) {
			if (step.op === 'best') {
				out.push({ op: 'sort', desc: /largest|biggest|highest|greatest|longest/.test(step.which), byLength: /longest|shortest/.test(step.which) }, { op: 'take', n: step.n });
			} else out.push(step);
		}
		const filtersFirst = out.filter((s) => s.op === 'filter' && !['longer', 'shorter', 'notlonger', 'notshorter'].includes(s.pred.kind) && isNumberTest(s) === !strings);
		const ordered = /\b(?:then|after that|and then|next|finally)\b|,/.test(t) ? out : [...filtersFirst, ...out.filter((s) => !filtersFirst.includes(s))];
		let sink = (sinks.filter((s) => !(ordered.some((x) => x.op === 'take') && /max|min|longest|shortest/.test(s.sink.type) && out.length !== steps.length))[0] || {}).sink || { type: 'each' };
		const lengths = ordered.some((s) => s.op === 'map' && s.fn.kind === 'length');
		if (strings && !lengths && /^(?:sum|average|product|max|min)$/.test(sink.type)) sink = { type: sink.type === 'max' ? 'longest' : sink.type === 'min' ? 'shortest' : 'each' };
		if ((!strings || lengths) && /^(?:longest|shortest)$/.test(sink.type)) sink = { type: sink.type === 'longest' ? 'max' : 'min' };
		// Sorting by length only makes sense for words; a plain sort otherwise.
		for (const s of ordered) if (s.op === 'sort' && s.byLength && !strings) delete s.byLength;
		return { kind: 'pipeline', source, steps: ordered, sink, strength: ordered.length + (sink.type !== 'each' ? 1 : 0) };
	}
	const isNumberTest = (s) => ['even', 'odd', 'positive', 'negative', 'nonpositive', 'nonnegative', 'gt', 'lt', 'ge', 'le', 'eq', 'ne', 'divisible', 'indivisible'].includes(s.pred.kind);

	/* ---------- The plan, in words ---------- */

	const PRED_WORDS = { even: 'even', odd: 'odd', positive: 'positive', negative: 'negative', nonpositive: 'zero or negative', nonnegative: 'zero or positive', gt: (p) => `greater than ${p.n}`, lt: (p) => `less than ${p.n}`, ge: (p) => `${p.n} or more`, le: (p) => `${p.n} or less`, eq: (p) => `equal to ${p.n}`, ne: (p) => `not ${p.n}`, divisible: (p) => `divisible by ${p.n}`, indivisible: (p) => `not divisible by ${p.n}`, longer: (p) => `longer than ${p.n} letters`, shorter: (p) => `shorter than ${p.n} letters`, notlonger: (p) => `${p.n} letters or fewer`, notshorter: (p) => `${p.n} letters or more`, startswith: (p) => `that start with "${p.s}"`, endswith: (p) => `that end with "${p.s}"`, contains: (p) => `that contain "${p.s}"`, notstartswith: (p) => `that don't start with "${p.s}"`, notendswith: (p) => `that don't end with "${p.s}"`, notcontains: (p) => `that don't contain "${p.s}"` };
	const say = (table, x) => (typeof table[x.kind] === 'function' ? table[x.kind](x) : table[x.kind]);
	const FN_WORDS = { square: 'square each one', cube: 'cube each one', times: (f) => (f.n === 2 ? 'double each one' : f.n === 3 ? 'triple each one' : f.n === -1 ? 'negate each one' : `multiply each one by ${f.n}`), plus: (f) => (f.n < 0 ? `subtract ${-f.n} from each one` : `add ${f.n} to each one`), abs: 'take the absolute value of each one', upper: 'put each one in capitals', lower: 'put each one in lower case', reverse: 'spell each one backwards', length: 'take the length of each one' };
	const SINK_WORDS = { each: 'print each one on its own line', sum: 'print their sum', average: 'print their average', product: 'print their product', count: 'print how many there are', max: 'print the largest', min: 'print the smallest', longest: 'print the longest', shortest: 'print the shortest', join: (s) => `print them on one line, with ${s.sep === ', ' ? 'commas' : s.sep === ' ' ? 'spaces' : `"${s.sep}"`} between` };

	function describe(plan) {
		const s = plan.source;
		const out = [{ nums: () => `start with the numbers ${s.values.join(', ')}${s.assumed ? ' (an example list: put your own in)' : ''}`, range: () => `start with the numbers ${s.from} to ${s.to}`, 'file-nums': () => `read the numbers in ${s.file}`, 'input-nums': () => 'read numbers from the keyboard (standard input) until it ends', words: () => `start with the words ${s.values.join(', ')}${s.assumed ? ' (an example list: put your own in)' : ''}`, 'file-lines': () => `read the lines of ${s.file}, skipping empty ones`, 'text-words': () => `split "${s.text}" into words` }[s.type]()];
		for (const st of plan.steps) {
			if (st.op === 'filter') out.push(`keep the ones ${/^that/.test(say(PRED_WORDS, st.pred)) ? '' : 'that are '}${say(PRED_WORDS, st.pred)}`);
			else if (st.op === 'map') out.push(say(FN_WORDS, st.fn));
			else if (st.op === 'sort') out.push(`sort them${st.byLength ? ' by length' : ''}, ${st.byLength ? (st.desc ? 'longest first' : 'shortest first') : st.desc ? 'largest first' : 'smallest first'}`.replace(/(sort them), (largest|smallest) first$/, (m, a, b) => (/^(?:words|file-lines|text-words)$/.test(s.type) && !plan.steps.some((x) => x.op === 'map' && x.fn.kind === 'length') ? `${a}${b === 'largest' ? ', Z to A' : ' alphabetically'}` : m)));
			else if (st.op === 'unique') out.push('drop the repeats, keeping the first of each');
			else if (st.op === 'take') out.push(`keep the first ${st.n}`);
			else if (st.op === 'skip') out.push(`skip the first ${st.n}`);
			else if (st.op === 'reverse') out.push('reverse their order');
		}
		out.push(say(SINK_WORDS, { kind: plan.sink.type, sep: plan.sink.sep }));
		return out;
	}

	/* ---------- Writing the plan in six languages ---------- */

	// A test on one item `x`, per language.
	function pred(lang, p, x) {
		const eq = lang === 'javascript' ? '===' : '==';
		const ne = lang === 'javascript' ? '!==' : '!=';
		const len = { python: `len(${x})`, javascript: `${x}.length`, rust: `${x}.chars().count()`, c: `strlen(${x})`, csharp: `${x}.Length`, cpp: `${x}.size()` }[lang];
		const s = p.s === undefined ? '' : q(p.s);
		const starts = { python: `${x}.startswith(${pyq(p.s)})`, javascript: `${x}.startsWith(${q(p.s)})`, rust: `${x}.starts_with(${s})`, c: `strncmp(${x}, ${s}, ${String(p.s || '').length}) == 0`, csharp: `${x}.StartsWith(${s}, StringComparison.Ordinal)`, cpp: `${x}.rfind(${s}, 0) == 0` }[lang];
		const L = String(p.s || '').length;
		const ends = { python: `${x}.endswith(${pyq(p.s)})`, javascript: `${x}.endsWith(${q(p.s)})`, rust: `${x}.ends_with(${s})`, c: `strlen(${x}) >= ${L} && strcmp(${x} + strlen(${x}) - ${L}, ${s}) == 0`, csharp: `${x}.EndsWith(${s}, StringComparison.Ordinal)`, cpp: `${x}.size() >= ${L} && ${x}.compare(${x}.size() - ${L}, ${L}, ${s}) == 0` }[lang];
		const has = { python: `${pyq(p.s)} in ${x}`, javascript: `${x}.includes(${q(p.s)})`, rust: `${x}.contains(${s})`, c: `strstr(${x}, ${s}) != NULL`, csharp: `${x}.Contains(${s})`, cpp: `${x}.find(${s}) != std::string::npos` }[lang];
		const not = (e) => (lang === 'python' ? `not ${e.includes(' in ') ? e.replace(' in ', ' in ') : e}` : `!(${e})`);
		switch (p.kind) {
			case 'even': return `${x} % 2 ${eq} 0`;
			case 'odd': return `${x} % 2 ${ne} 0`;
			case 'positive': return `${x} > 0`;
			case 'negative': return `${x} < 0`;
			case 'nonpositive': return `${x} <= 0`;
			case 'nonnegative': return `${x} >= 0`;
			case 'gt': return `${x} > ${p.n}`;
			case 'lt': return `${x} < ${p.n}`;
			case 'ge': return `${x} >= ${p.n}`;
			case 'le': return `${x} <= ${p.n}`;
			case 'eq': return `${x} ${eq} ${p.n}`;
			case 'ne': return `${x} ${ne} ${p.n}`;
			case 'divisible': return `${x} % ${p.n} ${eq} 0`;
			case 'indivisible': return `${x} % ${p.n} ${ne} 0`;
			case 'longer': return `${len} > ${p.n}`;
			case 'shorter': return `${len} < ${p.n}`;
			case 'notlonger': return `${len} <= ${p.n}`;
			case 'notshorter': return `${len} >= ${p.n}`;
			case 'startswith': return starts;
			case 'endswith': return ends;
			case 'contains': return has;
			case 'notstartswith': return not(starts);
			case 'notendswith': return not(ends);
			case 'notcontains': return lang === 'python' ? `${pyq(p.s)} not in ${x}` : lang === 'c' ? `strstr(${x}, ${s}) == NULL` : lang === 'cpp' ? `${x}.find(${s}) == std::string::npos` : not(has);
			default: return 'true';
		}
	}
	// A number changed, per language.
	function fn(lang, f, x) {
		switch (f.kind) {
			case 'square': return `${x} * ${x}`;
			case 'cube': return `${x} * ${x} * ${x}`;
			case 'times': return f.n === -1 ? `-${x}` : `${x} * ${f.n}`;
			case 'plus': return f.n < 0 ? `${x} - ${-f.n}` : `${x} + ${f.n}`;
			case 'abs': return { python: `abs(${x})`, javascript: `Math.abs(${x})`, rust: `${x}.abs()`, c: `llabs(${x})`, csharp: `Math.Abs(${x})`, cpp: `std::llabs(${x})` }[lang];
			default: return x;
		}
	}
	const isStr = (type) => /^(?:words|file-lines|text-words)$/.test(type);

	const BACKENDS = {
		python(plan) {
			const s = plan.source;
			let str = isStr(s.type);
			let v = str ? (s.type === 'file-lines' ? 'lines' : 'words') : 'numbers';
			const L = [];
			const imports = new Set();
			if (s.type === 'nums') L.push(`numbers = [${s.values.join(', ')}]`);
			else if (s.type === 'range') L.push(`numbers = list(range(${s.from}, ${s.to + 1}))`);
			else if (s.type === 'file-nums') L.push(`with open(${pyq(s.file)}, encoding='utf-8') as f:`, '    numbers = [int(t) for t in f.read().split()]');
			else if (s.type === 'input-nums') (imports.add('sys'), L.push('numbers = [int(t) for t in sys.stdin.read().split()]'));
			else if (s.type === 'words') L.push(`words = [${s.values.map(pyq).join(', ')}]`);
			else if (s.type === 'file-lines') L.push(`with open(${pyq(s.file)}, encoding='utf-8') as f:`, "    lines = [line.rstrip('\\r\\n') for line in f]", 'lines = [line for line in lines if line]');
			else L.push(`words = ${pyq(s.text)}.split()`);
			const it = () => (str ? 'w' : 'n');
			for (const st of plan.steps) {
				if (st.op === 'filter') L.push(`${v} = [${it()} for ${it()} in ${v} if ${pred('python', st.pred, it())}]`);
				else if (st.op === 'map' && str) {
					if (st.fn.kind === 'length') (L.push(`lengths = [len(w) for w in ${v}]`), (v = 'lengths'), (str = false));
					else L.push(`${v} = [${{ upper: 'w.upper()', lower: 'w.lower()', reverse: 'w[::-1]' }[st.fn.kind]} for w in ${v}]`);
				} else if (st.op === 'map') L.push(`${v} = [${fn('python', st.fn, 'n')} for n in ${v}]`);
				else if (st.op === 'sort') L.push(`${v}.sort(${[st.byLength ? 'key=len' : '', st.desc ? 'reverse=True' : ''].filter(Boolean).join(', ')})`);
				else if (st.op === 'unique') L.push(`${v} = list(dict.fromkeys(${v}))`);
				else if (st.op === 'take') L.push(`${v} = ${v}[:${st.n}]`);
				else if (st.op === 'skip') L.push(`${v} = ${v}[${st.n}:]`);
				else if (st.op === 'reverse') L.push(`${v}.reverse()`);
			}
			const k = plan.sink;
			if (k.type === 'each') L.push(`for ${it()} in ${v}:`, `    print(${it()})`);
			else if (k.type === 'sum') L.push(`print(sum(${v}))`);
			else if (k.type === 'count') L.push(`print(len(${v}))`);
			else if (k.type === 'average') L.push(`print(sum(${v}) / len(${v}) if ${v} else 'empty')`);
			else if (k.type === 'product') (imports.add('math'), L.push(`print(math.prod(${v}))`));
			else if (k.type === 'max' || k.type === 'min') L.push(`print(${k.type}(${v}) if ${v} else 'empty')`);
			else if (k.type === 'longest' || k.type === 'shortest') L.push(`print(${k.type === 'longest' ? 'max' : 'min'}(${v}, key=len) if ${v} else 'empty')`);
			else if (k.type === 'join') L.push(`print(${pyq(k.sep)}.join(${str ? v : `str(n) for n in ${v}`}))`);
			return `${[...imports].sort().map((i) => `import ${i}\n`).join('')}${imports.size ? '\n' : ''}${L.join('\n')}\n`;
		},
		javascript(plan) {
			const s = plan.source;
			let str = isStr(s.type);
			let v = str ? (s.type === 'file-lines' ? 'lines' : 'words') : 'numbers';
			const L = [];
			let fs = false;
			if (s.type === 'nums') L.push(`let numbers = [${s.values.join(', ')}];`);
			else if (s.type === 'range') L.push(`let numbers = Array.from({ length: ${s.to - s.from + 1} }, (_, i) => ${s.from === 0 ? 'i' : `i + ${s.from}`.replace('+ -', '- ')});`);
			else if (s.type === 'file-nums') ((fs = true), L.push(`let numbers = fs.readFileSync(${q(s.file)}, 'utf8').split(/\\s+/).filter(Boolean).map(Number);`));
			else if (s.type === 'input-nums') ((fs = true), L.push("let numbers = fs.readFileSync(0, 'utf8').split(/\\s+/).filter(Boolean).map(Number);"));
			else if (s.type === 'words') L.push(`let words = [${s.values.map(q).join(', ')}];`);
			else if (s.type === 'file-lines') ((fs = true), L.push(`let lines = fs.readFileSync(${q(s.file)}, 'utf8').split(/\\r?\\n/).filter((line) => line !== '');`));
			else L.push(`let words = ${q(s.text)}.split(/\\s+/).filter(Boolean);`);
			const it = () => (str ? 'w' : 'n');
			for (const st of plan.steps) {
				if (st.op === 'filter') L.push(`${v} = ${v}.filter((${it()}) => ${pred('javascript', st.pred, it())});`);
				else if (st.op === 'map' && str) {
					if (st.fn.kind === 'length') (L.push(`let lengths = ${v}.map((w) => w.length);`), (v = 'lengths'), (str = false));
					else L.push(`${v} = ${v}.map((w) => ${{ upper: 'w.toUpperCase()', lower: 'w.toLowerCase()', reverse: "[...w].reverse().join('')" }[st.fn.kind]});`);
				} else if (st.op === 'map') L.push(`${v} = ${v}.map((n) => ${fn('javascript', st.fn, 'n')});`);
				else if (st.op === 'sort') L.push(str ? (st.byLength ? `${v}.sort((a, b) => ${st.desc ? 'b.length - a.length' : 'a.length - b.length'});` : `${v}.sort((a, b) => (a < b ? ${st.desc ? '1 : a > b ? -1' : '-1 : a > b ? 1'} : 0));`) : `${v}.sort((a, b) => ${st.desc ? 'b - a' : 'a - b'});`);
				else if (st.op === 'unique') L.push(`${v} = [...new Set(${v})];`);
				else if (st.op === 'take') L.push(`${v} = ${v}.slice(0, ${st.n});`);
				else if (st.op === 'skip') L.push(`${v} = ${v}.slice(${st.n});`);
				else if (st.op === 'reverse') L.push(`${v}.reverse();`);
			}
			const k = plan.sink;
			if (k.type === 'each') L.push(`for (const ${it()} of ${v}) {`, `  console.log(${it()});`, '}');
			else if (k.type === 'sum') L.push(`console.log(${v}.reduce((a, b) => a + b, 0));`);
			else if (k.type === 'count') L.push(`console.log(${v}.length);`);
			else if (k.type === 'average') L.push(`console.log(${v}.length ? ${v}.reduce((a, b) => a + b, 0) / ${v}.length : 'empty');`);
			else if (k.type === 'product') L.push(`console.log(${v}.reduce((a, b) => a * b, 1) + 0); // + 0 so that a product of zero never prints as -0`);
			else if (k.type === 'max' || k.type === 'min') L.push(`console.log(${v}.length ? Math.${k.type}(...${v}) : 'empty');`);
			else if (k.type === 'longest' || k.type === 'shortest') L.push(`console.log(${v}.length ? ${v}.reduce((best, w) => (w.length ${k.type === 'longest' ? '>' : '<'} best.length ? w : best)) : 'empty');`);
			else if (k.type === 'join') L.push(`console.log(${v}.join(${q(k.sep)}));`);
			return `${fs ? "const fs = require('fs');\n\n" : ''}${L.join('\n')}\n`;
		},
		rust(plan) {
			const s = plan.source;
			let str = isStr(s.type);
			let v = str ? (s.type === 'file-lines' ? 'lines' : 'words') : 'numbers';
			const T = () => (str ? 'Vec<String>' : 'Vec<i64>');
			const L = [];
			const uses = new Set();
			if (s.type === 'nums') L.push(`let numbers: Vec<i64> = vec![${s.values.join(', ')}];`);
			else if (s.type === 'range') L.push(`let numbers: Vec<i64> = (${s.from}..=${s.to}).collect();`);
			else if (s.type === 'file-nums') L.push(`let text = std::fs::read_to_string(${q(s.file)}).expect("couldn't read the file");`, 'let numbers: Vec<i64> = text.split_whitespace().filter_map(|t| t.parse().ok()).collect();');
			else if (s.type === 'input-nums') (uses.add('use std::io::Read;'), L.push('let mut text = String::new();', 'std::io::stdin().read_to_string(&mut text).expect("couldn\'t read the input");', 'let numbers: Vec<i64> = text.split_whitespace().filter_map(|t| t.parse().ok()).collect();'));
			else if (s.type === 'words') L.push(s.values.length ? `let words: Vec<String> = [${s.values.map(q).join(', ')}].iter().map(|w| w.to_string()).collect();` : 'let words: Vec<String> = Vec::new();');
			else if (s.type === 'file-lines') L.push(`let text = std::fs::read_to_string(${q(s.file)}).expect("couldn't read the file");`, 'let lines: Vec<String> = text.lines().filter(|line| !line.is_empty()).map(String::from).collect();');
			else L.push(`let words: Vec<String> = ${q(s.text)}.split_whitespace().map(String::from).collect();`);
			for (const st of plan.steps) {
				if (st.op === 'filter') L.push(`let ${v}: ${T()} = ${v}.into_iter().filter(|${str ? 'w' : '&n'}| ${pred('rust', st.pred, str ? 'w' : 'n')}).collect();`);
				else if (st.op === 'map' && str) {
					if (st.fn.kind === 'length') (L.push(`let lengths: Vec<i64> = ${v}.iter().map(|w| w.chars().count() as i64).collect();`), (v = 'lengths'), (str = false));
					else L.push(`let ${v}: Vec<String> = ${v}.iter().map(|w| ${{ upper: 'w.to_uppercase()', lower: 'w.to_lowercase()', reverse: 'w.chars().rev().collect::<String>()' }[st.fn.kind]}).collect();`);
				} else if (st.op === 'map') L.push(`let ${v}: Vec<i64> = ${v}.iter().map(|&n| ${fn('rust', st.fn, 'n')}).collect();`);
				else if (st.op === 'sort') L.push(`let mut ${v} = ${v};`, st.byLength ? `${v}.sort_by_key(|w| ${st.desc ? 'std::cmp::Reverse(w.chars().count())' : 'w.chars().count()'});` : st.desc ? `${v}.sort_by(|a, b| b.cmp(a));` : `${v}.sort();`);
				else if (st.op === 'unique') (uses.add('use std::collections::HashSet;'), L.push('let mut seen = HashSet::new();', `let ${v}: ${T()} = ${v}.into_iter().filter(|x| seen.insert(${str ? 'x.clone()' : '*x'})).collect();`));
				else if (st.op === 'take') L.push(`let ${v}: ${T()} = ${v}.into_iter().take(${st.n}).collect();`);
				else if (st.op === 'skip') L.push(`let ${v}: ${T()} = ${v}.into_iter().skip(${st.n}).collect();`);
				else if (st.op === 'reverse') L.push(`let ${v}: ${T()} = ${v}.into_iter().rev().collect();`);
			}
			const k = plan.sink;
			const it = str ? 'w' : 'n';
			if (k.type === 'each') L.push(`for ${it} in &${v} {`, `    println!("{}", ${it});`, '}');
			else if (k.type === 'sum') L.push(`println!("{}", ${v}.iter().sum::<i64>());`);
			else if (k.type === 'count') L.push(`println!("{}", ${v}.len());`);
			else if (k.type === 'average') L.push(`if ${v}.is_empty() {`, '    println!("empty");', '} else {', `    println!("{}", ${v}.iter().sum::<i64>() as f64 / ${v}.len() as f64);`, '}');
			else if (k.type === 'product') L.push(`println!("{}", ${v}.iter().product::<i64>());`);
			else if (k.type === 'max' || k.type === 'min') L.push(`match ${v}.iter().${k.type}() {`, '    Some(best) => println!("{}", best),', '    None => println!("empty"),', '}');
			else if (k.type === 'longest' || k.type === 'shortest') L.push('let mut best: Option<&String> = None;', `for w in &${v} {`, `    if best.map_or(true, |b| w.chars().count() ${k.type === 'longest' ? '>' : '<'} b.chars().count()) {`, '        best = Some(w);', '    }', '}', 'match best {', '    Some(w) => println!("{}", w),', '    None => println!("empty"),', '}');
			else if (k.type === 'join') L.push(str ? `println!("{}", ${v}.join(${q(k.sep)}));` : `let parts: Vec<String> = ${v}.iter().map(|n| n.to_string()).collect();`, ...(str ? [] : [`println!("{}", parts.join(${q(k.sep)}));`]));
			return `${[...uses].sort().join('\n')}${uses.size ? '\n\n' : ''}fn main() {\n${L.map((l) => '    ' + l).join('\n')}\n}\n`;
		},
		csharp(plan) {
			const s = plan.source;
			let str = isStr(s.type);
			let v = str ? (s.type === 'file-lines' ? 'lines' : 'words') : 'numbers';
			const L = [];
			let io = false;
			const split = '.Split((char[])null, StringSplitOptions.RemoveEmptyEntries)';
			if (s.type === 'nums') L.push(`var numbers = new List<long> { ${s.values.join(', ')} };`);
			else if (s.type === 'range') L.push(`var numbers = Enumerable.Range(${s.from}, ${s.to - s.from + 1}).Select(i => (long)i).ToList();`);
			else if (s.type === 'file-nums') ((io = true), L.push(`var numbers = File.ReadAllText(${q(s.file)})${split}.Select(long.Parse).ToList();`));
			else if (s.type === 'input-nums') L.push(`var numbers = Console.In.ReadToEnd()${split}.Select(long.Parse).ToList();`);
			else if (s.type === 'words') L.push(`var words = new List<string> { ${s.values.map(q).join(', ')} };`);
			else if (s.type === 'file-lines') ((io = true), L.push(`var lines = File.ReadAllLines(${q(s.file)}).Where(line => line != "").ToList();`));
			else L.push(`var words = ${q(s.text)}${split}.ToList();`);
			const it = () => (str ? 'w' : 'n');
			for (const st of plan.steps) {
				if (st.op === 'filter') L.push(`${v} = ${v}.Where(${it()} => ${pred('csharp', st.pred, it())}).ToList();`);
				else if (st.op === 'map' && str) {
					if (st.fn.kind === 'length') (L.push(`var lengths = ${v}.Select(w => (long)w.Length).ToList();`), (v = 'lengths'), (str = false));
					else L.push(`${v} = ${v}.Select(w => ${{ upper: 'w.ToUpperInvariant()', lower: 'w.ToLowerInvariant()', reverse: 'new string(w.Reverse().ToArray())' }[st.fn.kind]}).ToList();`);
				} else if (st.op === 'map') L.push(`${v} = ${v}.Select(n => ${fn('csharp', st.fn, 'n')}).ToList();`);
				else if (st.op === 'sort') L.push(st.byLength ? `${v} = ${v}.${st.desc ? 'OrderByDescending' : 'OrderBy'}(w => w.Length).ToList();` : str ? `${v}.Sort(StringComparer.Ordinal);` : `${v}.Sort();`, ...(st.desc && !st.byLength ? [`${v}.Reverse();`] : []));
				else if (st.op === 'unique') L.push(`${v} = ${v}.Distinct().ToList();`);
				else if (st.op === 'take') L.push(`${v} = ${v}.Take(${st.n}).ToList();`);
				else if (st.op === 'skip') L.push(`${v} = ${v}.Skip(${st.n}).ToList();`);
				else if (st.op === 'reverse') L.push(`${v}.Reverse();`);
			}
			const k = plan.sink;
			if (k.type === 'each') L.push(`foreach (var ${it()} in ${v})`, '{', `    Console.WriteLine(${it()});`, '}');
			else if (k.type === 'sum') L.push(`Console.WriteLine(${v}.Sum());`);
			else if (k.type === 'count') L.push(`Console.WriteLine(${v}.Count);`);
			else if (k.type === 'average') L.push(`if (${v}.Count == 0) Console.WriteLine("empty");`, `else Console.WriteLine(${v}.Average().ToString(System.Globalization.CultureInfo.InvariantCulture));`);
			else if (k.type === 'product') L.push(`Console.WriteLine(${v}.Aggregate(1L, (a, b) => a * b));`);
			else if (k.type === 'max' || k.type === 'min') L.push(`if (${v}.Count == 0) Console.WriteLine("empty");`, `else Console.WriteLine(${v}.${cap(k.type)}());`);
			else if (k.type === 'longest' || k.type === 'shortest') L.push(`if (${v}.Count == 0) Console.WriteLine("empty");`, `else Console.WriteLine(${v}.${k.type === 'longest' ? 'OrderByDescending' : 'OrderBy'}(w => w.Length).First());`);
			else if (k.type === 'join') L.push(`Console.WriteLine(string.Join(${q(k.sep)}, ${v}));`);
			return `using System;\nusing System.Collections.Generic;\n${io ? 'using System.IO;\n' : ''}using System.Linq;\n\nclass Program\n{\n    static void Main()\n    {\n${L.map((l) => '        ' + l).join('\n')}\n    }\n}\n`;
		},
		cpp(plan) {
			const s = plan.source;
			let str = isStr(s.type);
			let v = str ? (s.type === 'file-lines' ? 'lines' : 'words') : 'numbers';
			const inc = new Set(['<iostream>', '<vector>']);
			const T = () => (str ? 'std::string' : 'long long');
			const L = [];
			if (str) inc.add('<string>');
			if (s.type === 'nums') L.push(`std::vector<long long> numbers = {${s.values.join(', ')}};`);
			else if (s.type === 'range') (inc.add('<numeric>'), L.push(`std::vector<long long> numbers(${s.to - s.from + 1});`, `std::iota(numbers.begin(), numbers.end(), ${s.from}LL);`));
			else if (s.type === 'file-nums') (inc.add('<fstream>'), L.push(`std::ifstream file(${q(s.file)});`, 'std::vector<long long> numbers;', 'long long value;', 'while (file >> value) numbers.push_back(value);'));
			else if (s.type === 'input-nums') L.push('std::vector<long long> numbers;', 'long long value;', 'while (std::cin >> value) numbers.push_back(value);');
			else if (s.type === 'words') L.push(`std::vector<std::string> words = {${s.values.map(q).join(', ')}};`);
			else if (s.type === 'file-lines') (inc.add('<fstream>'), L.push(`std::ifstream file(${q(s.file)});`, 'std::vector<std::string> lines;', 'std::string line;', 'while (std::getline(file, line)) {', "    if (!line.empty() && line.back() == '\\r') line.pop_back();", '    if (!line.empty()) lines.push_back(line);', '}'));
			else (inc.add('<sstream>'), L.push(`std::istringstream in(${q(s.text)});`, 'std::vector<std::string> words;', 'std::string word;', 'while (in >> word) words.push_back(word);'));
			const all = () => `${v}.begin(), ${v}.end()`;
			const arg = () => (str ? 'const std::string &w' : 'long long n');
			for (const st of plan.steps) {
				if (st.op === 'filter') (inc.add('<algorithm>'), L.push(`${v}.erase(std::remove_if(${all()}, [](${arg()}) { return !(${pred('cpp', st.pred, str ? 'w' : 'n')}); }), ${v}.end());`));
				else if (st.op === 'map' && str) {
					if (st.fn.kind === 'length') (L.push('std::vector<long long> lengths;', `for (const auto &w : ${v}) lengths.push_back(static_cast<long long>(w.size()));`), (v = 'lengths'), (str = false));
					else if (st.fn.kind === 'reverse') (inc.add('<algorithm>'), L.push(`for (auto &w : ${v}) std::reverse(w.begin(), w.end());`));
					else (inc.add('<algorithm>'), inc.add('<cctype>'), L.push(`for (auto &w : ${v}) {`, `    std::transform(w.begin(), w.end(), w.begin(), [](unsigned char c) { return static_cast<char>(std::${st.fn.kind === 'upper' ? 'toupper' : 'tolower'}(c)); });`, '}'));
				} else if (st.op === 'map') (inc.add('<algorithm>'), st.fn.kind === 'abs' && inc.add('<cstdlib>'), L.push(`std::transform(${all()}, ${v}.begin(), [](long long n) { return ${fn('cpp', st.fn, 'n')}; });`));
				else if (st.op === 'sort') (inc.add('<algorithm>'), st.desc && !st.byLength && inc.add('<functional>'), L.push(st.byLength ? `std::stable_sort(${all()}, [](const std::string &a, const std::string &b) { return a.size() ${st.desc ? '>' : '<'} b.size(); });` : `std::sort(${all()}${st.desc ? ', std::greater<>()' : ''});`));
				else if (st.op === 'unique') (inc.add('<algorithm>'), inc.add('<unordered_set>'), L.push('{', `    std::unordered_set<${T()}> seen;`, `    ${v}.erase(std::remove_if(${all()}, [&seen](const ${T()} &x) { return !seen.insert(x).second; }), ${v}.end());`, '}'));
				else if (st.op === 'take') L.push(`if (${v}.size() > ${st.n}) ${v}.resize(${st.n});`);
				else if (st.op === 'skip') (inc.add('<algorithm>'), L.push(`${v}.erase(${v}.begin(), ${v}.begin() + static_cast<long>(std::min<std::size_t>(${st.n}, ${v}.size())));`));
				else if (st.op === 'reverse') (inc.add('<algorithm>'), L.push(`std::reverse(${all()});`));
			}
			const k = plan.sink;
			if (k.type === 'each') L.push(`for (const auto &${str ? 'w' : 'n'} : ${v}) std::cout << ${str ? 'w' : 'n'} << "\\n";`);
			else if (k.type === 'sum') (inc.add('<numeric>'), L.push(`std::cout << std::accumulate(${all()}, 0LL) << std::endl;`));
			else if (k.type === 'count') L.push(`std::cout << ${v}.size() << std::endl;`);
			else if (k.type === 'average') (inc.add('<numeric>'), inc.add('<iomanip>'), L.push(`if (${v}.empty()) std::cout << "empty" << std::endl;`, `else std::cout << std::setprecision(10) << static_cast<double>(std::accumulate(${all()}, 0LL)) / static_cast<double>(${v}.size()) << std::endl;`));
			else if (k.type === 'product') (inc.add('<numeric>'), inc.add('<functional>'), L.push(`std::cout << std::accumulate(${all()}, 1LL, std::multiplies<long long>()) << std::endl;`));
			else if (k.type === 'max' || k.type === 'min') (inc.add('<algorithm>'), L.push(`if (${v}.empty()) std::cout << "empty" << std::endl;`, `else std::cout << *std::${k.type}_element(${all()}) << std::endl;`));
			else if (k.type === 'longest' || k.type === 'shortest') (inc.add('<algorithm>'), L.push(`if (${v}.empty()) std::cout << "empty" << std::endl;`, `else std::cout << *std::${k.type === 'longest' ? 'max' : 'min'}_element(${all()}, [](const std::string &a, const std::string &b) { return a.size() < b.size(); }) << std::endl;`));
			else if (k.type === 'join') L.push(`for (std::size_t i = 0; i < ${v}.size(); i++) std::cout << (i ? ${q(k.sep)} : "") << ${v}[i];`, 'std::cout << std::endl;');
			return `${[...inc].sort().map((i) => `#include ${i}`).join('\n')}\n\nint main() {\n${L.map((l) => '    ' + l).join('\n')}\n    return 0;\n}\n`;
		},
		c(plan) {
			const s = plan.source;
			let str = isStr(s.type);
			const inc = new Set(['<stdio.h>']);
			const top = [];
			const L = [];
			const WORD = s.type === 'file-lines' ? 256 : 64;
			const COUNT = str ? 1000 : 10000;
			let v = str ? 'words' : 'numbers';
			if (str) (inc.add('<string.h>'), top.push(`#define MAX ${COUNT}`, `#define LENGTH ${WORD}`, '', 'static char words[MAX][LENGTH];'));
			else top.push(`#define MAX ${COUNT}`, '', 'static long long numbers[MAX];');
			L.push('int n = 0;');
			if (s.type === 'nums') L.push(`const long long start[] = {${s.values.join(', ')}};`, 'for (n = 0; n < (int)(sizeof start / sizeof start[0]); n++) numbers[n] = start[n];');
			else if (s.type === 'range') L.push(`for (long long value = ${s.from}; value <= ${s.to} && n < MAX; value++) numbers[n++] = value;`);
			else if (s.type === 'file-nums') L.push(`FILE *file = fopen(${q(s.file)}, "r");`, 'if (!file) {', `    perror(${q(s.file)});`, '    return 1;', '}', 'while (n < MAX && fscanf(file, "%lld", &numbers[n]) == 1) n++;', 'fclose(file);');
			else if (s.type === 'input-nums') L.push('while (n < MAX && scanf("%lld", &numbers[n]) == 1) n++;');
			else if (s.type === 'words') L.push(`const char *start[] = {${s.values.map(q).join(', ')}};`, 'for (n = 0; n < (int)(sizeof start / sizeof start[0]); n++) snprintf(words[n], LENGTH, "%s", start[n]);');
			else if (s.type === 'file-lines') L.push(`FILE *file = fopen(${q(s.file)}, "r");`, 'if (!file) {', `    perror(${q(s.file)});`, '    return 1;', '}', 'char line[LENGTH];', 'while (n < MAX && fgets(line, sizeof line, file)) {', '    line[strcspn(line, "\\r\\n")] = \'\\0\';', '    if (line[0]) snprintf(words[n++], LENGTH, "%s", line);', '}', 'fclose(file);');
			else L.push(`char text[] = ${q(s.text)};`, 'for (char *word = strtok(text, " \\t\\n"); word && n < MAX; word = strtok(NULL, " \\t\\n")) snprintf(words[n++], LENGTH, "%s", word);');
			const at = (i) => `${v}[${i}]`;
			const helpers = new Set();
			for (const st of plan.steps) {
				if (st.op === 'filter') {
					L.push('{', '    int kept = 0;', '    for (int i = 0; i < n; i++) {', `        if (${pred('c', st.pred, at('i'))}) {`, str ? '            if (kept != i) strcpy(words[kept], words[i]);' : '            numbers[kept] = numbers[i];'.replace('numbers', v).replace('numbers', v), '            kept++;', '        }', '    }', '    n = kept;', '}');
				} else if (st.op === 'map' && str) {
					if (st.fn.kind === 'length') (top.push('static long long lengths[MAX];'), L.push('for (int i = 0; i < n; i++) lengths[i] = (long long)strlen(words[i]);'), (v = 'lengths'), (str = false));
					else if (st.fn.kind === 'reverse') L.push('for (int i = 0; i < n; i++) {', '    size_t length = strlen(words[i]);', '    for (size_t j = 0; j < length / 2; j++) {', '        char t = words[i][j];', '        words[i][j] = words[i][length - 1 - j];', '        words[i][length - 1 - j] = t;', '    }', '}');
					else (inc.add('<ctype.h>'), L.push('for (int i = 0; i < n; i++) {', `    for (char *c = words[i]; *c; c++) *c = (char)${st.fn.kind === 'upper' ? 'toupper' : 'tolower'}((unsigned char)*c);`, '}'));
				} else if (st.op === 'map') (st.fn.kind === 'abs' && inc.add('<stdlib.h>'), L.push(`for (int i = 0; i < n; i++) ${at('i')} = ${fn('c', st.fn, at('i'))};`));
				else if (st.op === 'sort') {
					inc.add('<stdlib.h>');
					const name = str ? (st.byLength ? (st.desc ? 'longest_first' : 'shortest_first') : st.desc ? 'z_to_a' : 'a_to_z') : st.desc ? 'largest_first' : 'smallest_first';
					helpers.add(name);
					// qsort isn't stable; sorting words by length keeps their order with a plain insertion sort instead.
					if (st.byLength) L.push('for (int i = 1; i < n; i++) {', '    char word[LENGTH];', '    strcpy(word, words[i]);', '    int j = i - 1;', `    while (j >= 0 && strlen(words[j]) ${st.desc ? '<' : '>'} strlen(word)) {`, '        strcpy(words[j + 1], words[j]);', '        j--;', '    }', '    strcpy(words[j + 1], word);', '}');
					else L.push(`qsort(${v}, (size_t)n, sizeof ${v}[0], ${name});`);
				} else if (st.op === 'unique') L.push('{', '    int kept = 0;', '    for (int i = 0; i < n; i++) {', '        int seen = 0;', `        for (int j = 0; j < kept; j++) if (${str ? 'strcmp(words[j], words[i]) == 0' : `${v}[j] == ${v}[i]`}) seen = 1;`, '        if (!seen) {', str ? '            if (kept != i) strcpy(words[kept], words[i]);' : `            ${v}[kept] = ${v}[i];`, '            kept++;', '        }', '    }', '    n = kept;', '}');
				else if (st.op === 'take') L.push(`if (n > ${st.n}) n = ${st.n};`);
				else if (st.op === 'skip') (inc.add('<string.h>'), L.push('{', `    int skip = n < ${st.n} ? n : ${st.n};`, `    memmove(${v}, ${v} + skip, (size_t)(n - skip) * sizeof ${v}[0]);`, '    n -= skip;', '}'));
				else if (st.op === 'reverse') L.push('for (int i = 0; i < n / 2; i++) {', ...(str ? ['    char t[LENGTH];', '    strcpy(t, words[i]);', '    strcpy(words[i], words[n - 1 - i]);', '    strcpy(words[n - 1 - i], t);'] : [`    long long t = ${v}[i];`, `    ${v}[i] = ${v}[n - 1 - i];`, `    ${v}[n - 1 - i] = t;`]), '}');
			}
			const k = plan.sink;
			const fmt = str ? '%s' : '%lld';
			if (k.type === 'each') L.push(`for (int i = 0; i < n; i++) printf("${fmt}\\n", ${at('i')});`);
			else if (k.type === 'count') L.push('printf("%d\\n", n);');
			else if (k.type === 'sum' || k.type === 'product') L.push(`long long ${k.type === 'sum' ? 'sum = 0' : 'product = 1'};`, `for (int i = 0; i < n; i++) ${k.type === 'sum' ? 'sum +=' : 'product *='} ${at('i')};`, `printf("%lld\\n", ${k.type});`);
			else if (k.type === 'average') L.push('long long sum = 0;', `for (int i = 0; i < n; i++) sum += ${at('i')};`, 'if (n == 0) printf("empty\\n");', 'else printf("%.10g\\n", (double)sum / n);');
			else if (k.type === 'max' || k.type === 'min') L.push('if (n == 0) {', '    printf("empty\\n");', '} else {', `    long long best = ${at('0')};`, `    for (int i = 1; i < n; i++) if (${at('i')} ${k.type === 'max' ? '>' : '<'} best) best = ${at('i')};`, '    printf("%lld\\n", best);', '}');
			else if (k.type === 'longest' || k.type === 'shortest') L.push('if (n == 0) {', '    printf("empty\\n");', '} else {', '    int best = 0;', `    for (int i = 1; i < n; i++) if (strlen(words[i]) ${k.type === 'longest' ? '>' : '<'} strlen(words[best])) best = i;`, '    printf("%s\\n", words[best]);', '}');
			else if (k.type === 'join') L.push(`for (int i = 0; i < n; i++) printf("%s${fmt}", i ? ${q(k.sep)} : "", ${at('i')});`, 'printf("\\n");');
			const H = {
				smallest_first: 'static int smallest_first(const void *a, const void *b) {\n    long long x = *(const long long *)a, y = *(const long long *)b;\n    return (x > y) - (x < y);\n}',
				largest_first: 'static int largest_first(const void *a, const void *b) {\n    long long x = *(const long long *)a, y = *(const long long *)b;\n    return (x < y) - (x > y);\n}',
				a_to_z: 'static int a_to_z(const void *a, const void *b) {\n    return strcmp((const char *)a, (const char *)b);\n}',
				z_to_a: 'static int z_to_a(const void *a, const void *b) {\n    return strcmp((const char *)b, (const char *)a);\n}',
			};
			const fns = [...helpers].filter((h) => H[h]).map((h) => H[h]).join('\n\n');
			return `${[...inc].sort().map((i) => `#include ${i}`).join('\n')}\n\n${top.join('\n')}\n\n${fns ? fns + '\n\n' : ''}int main(void) {\n${L.map((l) => '    ' + l).join('\n')}\n    return 0;\n}\n`;
		},
	};

	/* ---------- Web pages, from sections ---------- */

	const COLORS = { blue: '#2563eb', green: '#15803d', red: '#b91c1c', purple: '#7c3aed', orange: '#c2410c', pink: '#be185d', teal: '#0f766e', black: '#111827', gold: '#a16207', brown: '#78350f', yellow: '#a16207', navy: '#1e3a8a' };
	const SECTION_WORDS = [
		['nav', /\b(?:nav(?:igation)?(?: bar)?|menu bar|top bar|header links)\b/], ['hero', /\b(?:hero|banner|headline|big heading|intro(?:duction)? section)\b/], ['about', /\babout(?: us| me| section)?\b/],
		['features', /\b(?:features?|services?|benefits?|offerings?|what we (?:do|offer))\b/], ['gallery', /\b(?:gallery|photos?|portfolio|pictures|images)\b/], ['pricing', /\b(?:pricing|prices|plans|price list)\b/],
		['menu', /\bmenu\b(?! bar)/], ['quotes', /\b(?:testimonials?|reviews|quotes?)\b/], ['faq', /\b(?:faq|questions)\b/], ['hours', /\b(?:opening hours|hours|opening times)\b/], ['contact', /\b(?:contact(?: form| us| section)?|form|sign[- ]?up|newsletter)\b/], ['footer', /\bfooter\b/],
	];

	/** Reads a page from a prompt: its name, what it is for, its sections in the order asked, its color. */
	function page(text) {
		const raw = String(text).trim().replace(/[.!?]+$/, '');
		const t = raw.toLowerCase();
		if (!/\b(?:page|website|site|homepage|landing)\b/.test(t)) return null;
		const name = (raw.match(/\b(?:called|named|titled)\s+["“']?([A-Z][\w'&-]*(?:\s+[A-Z&][\w'&-]*){0,3})/) || raw.match(/["“]([^"”]{2,40})["”]/) || [])[1] || null;
		const forWhat = (t.match(/\b(?:page|website|site|homepage)\s+(?:for|about|of)\s+(?:an? |the |my |our )?([a-z' ]+?)(?:\s+(?:called|named|titled|with|that|in|using)\b|$)/) || [])[1] || null;
		const found = [];
		for (const [id, re] of SECTION_WORDS) {
			const m = t.match(re);
			if (m) found.push({ id, at: m.index });
		}
		const sections = found.sort((a, b) => a.at - b.at).map((f) => f.id);
		const count = (t.match(new RegExp(`\\b${N} (?:features?|services?|benefits?|plans|photos?|pictures|images|questions|testimonials?|reviews|quotes?)\\b`)) || [])[1];
		const color = Object.keys(COLORS).find((c) => new RegExp(`\\b${c}\\b`).test(t)) || null;
		return { kind: 'page', name, what: forWhat ? forWhat.trim() : null, sections, count: count ? Math.max(1, Math.min(num(count) || 3, 8)) : 3, color, dark: /\bdark\b/.test(t), strength: sections.length + (name ? 1 : 0) + (forWhat ? 1 : 0) };
	}

	const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

	function writePage(p) {
		const D = root.Omni && root.Omni.onyxDictionary;
		const what = p.what || 'business';
		const name = p.name || cap(what).replace(/\b[a-z]/g, (c) => c.toUpperCase());
		const e = D && ((D.lookupAll ? D.lookupAll(what) : D.lookup(what)) || []).map((h) => h.e).find((x) => x.pos === 'noun');
		const article = (w) => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
		const tagline = e && e.def ? cap(e.def.replace(/;.*$/, '')) + '.' : `Welcome to ${name}.`;
		const sections = p.sections.length ? p.sections : ['hero', 'about', 'contact', 'footer'];
		const accent = COLORS[p.color] || '#2563eb';
		const id = (s) => s;
		const links = sections.filter((s) => !['nav', 'hero', 'footer'].includes(s));
		const title = { about: 'About', features: 'What we offer', gallery: 'Gallery', pricing: 'Pricing', menu: 'Menu', quotes: 'What people say', faq: 'Questions', hours: 'Opening hours', contact: 'Get in touch' };
		const n = p.count;
		const S = {
			nav: () => `  <nav>\n    <strong>${esc(name)}</strong>\n    <div>\n${links.map((s) => `      <a href="#${id(s)}">${title[s]}</a>`).join('\n')}\n    </div>\n  </nav>`,
			hero: () => `  <header class="hero">\n    <h1>${esc(name)}</h1>\n    <p>${esc(tagline)}</p>\n${sections.includes('contact') ? '    <a class="button" href="#contact">Get in touch</a>\n' : ''}  </header>`,
			about: () => `  <section id="about">\n    <h2>About</h2>\n    <p>${esc(name)} is ${esc(article(what))}${e && e.def ? `: ${esc(e.def.replace(/;.*$/, ''))}` : ''}. Tell your story here: who you are, how you started, and what you care about.</p>\n  </section>`,
			features: () => `  <section id="features">\n    <h2>What we offer</h2>\n    <div class="grid">\n${Array.from({ length: n }, (_, i) => `      <article>\n        <h3>${['Made with care', 'Here when you need us', 'Fair prices', 'Local and friendly', 'Fresh every day', 'Easy to reach', 'Built to last', 'Something for everyone'][i]}</h3>\n        <p>Describe this in a sentence or two.</p>\n      </article>`).join('\n')}\n    </div>\n  </section>`,
			gallery: () => `  <section id="gallery">\n    <h2>Gallery</h2>\n    <div class="grid">\n${Array.from({ length: n }, (_, i) => `      <div class="photo" role="img" aria-label="Photo ${i + 1}">Photo ${i + 1}</div>`).join('\n')}\n    </div>\n  </section>`,
			pricing: () => `  <section id="pricing">\n    <h2>Pricing</h2>\n    <div class="grid">\n${['Basic', 'Standard', 'Premium', 'Family', 'Team', 'Custom', 'Plus', 'Pro'].slice(0, n).map((plan, i) => `      <article>\n        <h3>${plan}</h3>\n        <p class="price">$${(i + 1) * 10}</p>\n        <p>What this plan includes.</p>\n      </article>`).join('\n')}\n    </div>\n  </section>`,
			menu: () => `  <section id="menu">\n    <h2>Menu</h2>\n    <table>\n      <tbody>\n${['House special', 'Seasonal favorite', 'Something sweet', 'Something to drink'].map((item, i) => `        <tr><td>${item}</td><td>$${4 + i * 2}.00</td></tr>`).join('\n')}\n      </tbody>\n    </table>\n  </section>`,
			quotes: () => `  <section id="quotes">\n    <h2>What people say</h2>\n    <div class="grid">\n${Array.from({ length: n }, () => '      <blockquote>Put a real customer\'s words here, with their name.</blockquote>').join('\n')}\n    </div>\n  </section>`,
			faq: () => `  <section id="faq">\n    <h2>Questions</h2>\n${['When are you open?', 'Where can I find you?', 'How do I get in touch?', 'Do you take orders ahead?', 'What does it cost?', 'Can I bring a group?', 'Is there parking?', 'Do you deliver?'].slice(0, n).map((qn) => `    <details>\n      <summary>${qn}</summary>\n      <p>Answer it here.</p>\n    </details>`).join('\n')}\n  </section>`,
			hours: () => `  <section id="hours">\n    <h2>Opening hours</h2>\n    <table>\n      <tbody>\n        <tr><td>Monday to Friday</td><td>9:00 to 18:00</td></tr>\n        <tr><td>Saturday</td><td>10:00 to 16:00</td></tr>\n        <tr><td>Sunday</td><td>Closed</td></tr>\n      </tbody>\n    </table>\n  </section>`,
			contact: () => `  <section id="contact">\n    <h2>Get in touch</h2>\n    <form method="post">\n      <label for="name">Name</label>\n      <input id="name" name="name" type="text" required>\n      <label for="email">Email</label>\n      <input id="email" name="email" type="email" required>\n      <label for="message">Message</label>\n      <textarea id="message" name="message" rows="4" required></textarea>\n      <button class="button" type="submit">Send</button>\n    </form>\n  </section>`,
			footer: () => `  <footer>\n    <p>&copy; ${esc(name)}</p>\n  </footer>`,
		};
		const bg = p.dark ? '#111318' : '#ffffff';
		const fg = p.dark ? '#f3f4f6' : '#1f2937';
		const soft = p.dark ? '#1c1f27' : '#f3f4f6';
		const css = `    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.6; color: ${fg}; background: ${bg}; }
    nav { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem 1.5rem; flex-wrap: wrap; }
    nav a { margin-left: 1rem; color: inherit; text-decoration: none; }
    .hero { padding: 5rem 1.5rem; text-align: center; background: ${accent}; color: #ffffff; }
    .hero h1 { margin: 0 0 0.5rem; font-size: clamp(2rem, 6vw, 3.5rem); }
    section { max-width: 60rem; margin: 0 auto; padding: 3rem 1.5rem; }
    h2 { color: ${p.dark ? '#ffffff' : accent}; }
    .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
    article, blockquote, .photo, details { margin: 0; padding: 1.25rem; border-radius: 0.75rem; background: ${soft}; }
    .photo { min-height: 10rem; display: grid; place-items: center; }
    .price { font-size: 1.75rem; font-weight: 700; margin: 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 0.5rem 0; border-bottom: 1px solid ${p.dark ? '#2b2f3a' : '#e5e7eb'}; }
    td:last-child { text-align: right; }
    form { display: grid; gap: 0.5rem; max-width: 28rem; }
    input, textarea { padding: 0.6rem; border: 1px solid ${p.dark ? '#3b4050' : '#d1d5db'}; border-radius: 0.5rem; font: inherit; background: ${bg}; color: inherit; }
    .button { display: inline-block; padding: 0.7rem 1.4rem; border: 0; border-radius: 999px; background: ${p.dark ? '#ffffff' : '#111827'}; color: ${p.dark ? '#111827' : '#ffffff'}; font: inherit; font-weight: 600; text-decoration: none; cursor: pointer; }
    footer { padding: 2rem 1.5rem; text-align: center; background: ${soft}; }`;
		const code = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>${esc(name)}</title>\n  <style>\n${css}\n  </style>\n</head>\n<body>\n${sections.map((s) => S[s]()).join('\n')}\n</body>\n</html>\n`;
		return { code, plan: [`a page for ${name}${p.what ? `, ${article(what)}` : ''}`, ...sections.map((s) => ({ nav: 'a navigation bar that links to the sections', hero: 'a hero with the name and a line about it', about: 'an "about" section', features: `${n} things you offer`, gallery: `a gallery of ${n} photo spaces`, pricing: `${Math.min(n, 8)} price plans`, menu: 'a menu with prices', quotes: `${n} spaces for customers' words (left for real ones)`, faq: `${Math.min(n, 8)} questions that open when clicked`, hours: 'opening hours', contact: 'a contact form', footer: 'a footer' })[s]), `styled in ${p.color || 'blue'}${p.dark ? ', dark' : ''}, and made to fit a phone`], title: `A web page for ${name}` };
	}

	/* ---------- HTTP requests, from their parts ---------- */

	/** Reads a request from a prompt: method, URL, headers, query, body. */
	function request(text) {
		const raw = String(text).trim().replace(/[.!?]+$/, '');
		const t = raw.toLowerCase();
		const method = (raw.match(/\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/i) || [])[1];
		const url = (raw.match(/https?:\/\/[^\s'"`,]+/) || [])[0];
		if (!method && !url) return null;
		if (!/\b(?:request|http|api|endpoint|call|curl)\b/.test(t) && !url) return null;
		const M = (method || 'GET').toUpperCase();
		const headers = [];
		const token = raw.match(/\b(?:bearer )?token\s+["']?([A-Za-z0-9._~+/=-]{4,})["']?/i);
		if (/\b(?:bearer|token|authori[sz]ation|auth)\b/.test(t)) headers.push(['Authorization', `Bearer ${token && !/^(?:and|with|in|the|a|header|body)$/i.test(token[1]) ? token[1] : 'YOUR_TOKEN'}`]);
		const key = raw.match(/\bapi[- ]?key\s+["']?([A-Za-z0-9._-]{4,})["']?/i);
		if (/\bapi[- ]?key\b/.test(t)) headers.push(['X-API-Key', key && !/^(?:and|with|in|header)$/i.test(key[1]) ? key[1] : 'YOUR_API_KEY']);
		for (const m of raw.matchAll(/\bheaders?\s+["']?([A-Za-z][A-Za-z0-9-]*)\s*[:=]\s*["']?([^"',]+?)["']?(?=,|\s+and\b|\s+with\b|$)/gi)) headers.push([m[1], m[2].trim()]);
		if (/\b(?:accept(?:s|ing)? json|json response|as json)\b/.test(t) && !headers.some((h) => /^accept$/i.test(h[0]))) headers.push(['Accept', 'application/json']);
		// "name Sam and age 30", "q=red shoes, page=2", 'title "Buy milk, eggs"': [key, value] pairs. A key alone gets a placeholder.
		const pairs = (text, placeholders) => {
			const kept = [];
			const flat = String(text).replace(/"[^"]*"|'[^']*'/g, (m) => `\u0001${kept.push(m.slice(1, -1)) - 1}\u0001`);
			const out = [];
			for (const item of flat.split(/\s*,\s*(?:and\s+)?|\s+and\s+|\s*&\s*/)) {
				const m = item.trim().replace(/^(?:with |containing )?(?:(?:a|an|the) )?(?:(?:fields?|keys?|values?|properties|property|parameters?) )?/i, '').match(/^([A-Za-z_][\w-]*)(?:\s*[=:]\s*|\s+(?:of |is |set to |as |equal to )?)?(.*)$/);
				if (!m) continue;
				const value = m[2].trim().replace(/\u0001(\d+)\u0001/g, (x, i) => kept[+i]);
				if (value) out.push([m[1], value]);
				else if (placeholders) out.push([m[1], 'value']);
			}
			return out.slice(0, 12);
		};
		const STOP = '(?=\\s+(?:and|with)\\s+(?:a |an |the )?(?:[A-Za-z-]+ )?(?:json|body|payload|headers?|bearer|token|api|query|params?|parameters?)\\b|$)';
		for (const m of raw.matchAll(/\b(?:an? |the )?([A-Z][A-Za-z0-9-]*) header (?:of |set to |with (?:the )?value |: ?|= ?)["']?([^"',\s]+)["']?/g)) if (!headers.some((h) => h[0].toLowerCase() === m[1].toLowerCase())) headers.push([m[1], m[2]]);
		const queryText = (raw.match(new RegExp(`\\b(?:query(?: string)?(?: param(?:eter)?s?)?|params?|parameters?)\\s+(?:of |with )?(.+?)${STOP}`, 'i')) || [])[1];
		const query = queryText ? pairs(queryText, false) : [];
		const bodyText = (raw.match(new RegExp(`\\b(?:json(?: body)?|body|payload|data)\\s+(?:of |with |containing )?(.+?)${STOP}`, 'i')) || [])[1];
		const body = bodyText && (/[=:]/.test(bodyText) || ['POST', 'PUT', 'PATCH'].includes(M)) ? pairs(bodyText, true).filter(([k]) => !/^(?:json|body|request|response)$/i.test(k)) : [];
		return { kind: 'request', method: M, url: url || 'https://api.example.com/items', headers, query, body, strength: headers.length + query.length + (body.length ? 1 : 0) + (method && !/^(?:GET|POST)$/i.test(method) ? 1 : 0) };
	}

	function writeRequest(r) {
		const m = r.url.match(/^(https?):\/\/([^/:?#]+)(?::(\d+))?([^#]*)$/i) || [null, 'https', 'api.example.com', null, '/'];
		let path = m[4] || '/';
		if (r.query.length) path += (path.includes('?') ? '&' : '?') + r.query.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
		const value = (v) => (/^-?\d+(?:\.\d+)?$/.test(v) ? v : /^(?:true|false|null)$/.test(v) ? v : JSON.stringify(v));
		const json = r.body.length ? '{' + r.body.map(([k, v]) => `${JSON.stringify(k)}: ${value(v)}`).join(', ') + '}' : '';
		const headers = [['Host', m[2] + (m[3] ? ':' + m[3] : '')], ...r.headers];
		if (json) headers.push(['Content-Type', 'application/json'], ['Content-Length', String(new TextEncoder().encode(json).length)]);
		headers.push(['Connection', 'close']);
		const code = `${r.method} ${path} HTTP/1.1\r\n${headers.map(([k, v]) => `${k}: ${v}`).join('\r\n')}\r\n\r\n${json}`;
		const fullUrl = `${m[1]}://${m[2]}${m[3] ? ':' + m[3] : ''}${path}`;
		const curl = `curl -i -X ${r.method} '${fullUrl}'${r.headers.map(([k, v]) => ` -H '${k}: ${v}'`).join('')}${json ? ` -H 'Content-Type: application/json' -d '${json.replace(/'/g, "'\\''")}'` : ''}`;
		return { code, curl, plan: [`${r.method} ${path}, to ${m[2]}`, ...r.headers.map(([k]) => `${/^[aeiou]/i.test(k) ? 'an' : 'a'} ${k} header`), ...(r.query.length ? [`the query ${r.query.map(([k, v]) => `${k}=${v}`).join(', ')}`] : []), ...(json ? [`a JSON body, ${new TextEncoder().encode(json).length} bytes, with ${list(r.body.map(([k]) => k))}`] : [])], title: `${r.method === 'GET' ? 'A' : `A ${r.method}`} request`.replace('A GET', 'A GET') };
	}

	/* ---------- Entry points ---------- */

	const LANGS = Object.keys(BACKENDS);

	/** Reads any of the three kinds from a prompt; the one that recognized most. Null if none fits. */
	function parse(text, lang) {
		if (lang === 'http') return request(text);
		if (lang === 'html') return page(text);
		const p = pipeline(text);
		return p && p.strength > 0 ? p : null;
	}

	/** Writes a plan: { code, lang, plan, title, curl? }. A pipeline needs one of the six programming languages. */
	function write(plan, lang) {
		if (plan.kind === 'page') return Object.assign(writePage(plan), { lang: 'html' });
		if (plan.kind === 'request') return Object.assign(writeRequest(plan), { lang: 'http' });
		if (!BACKENDS[lang]) return null;
		return { code: BACKENDS[lang](plan), lang, plan: describe(plan), title: 'A program' };
	}

	(root.Omni = root.Omni || {}).onyxSynth = { parse, write, pipeline, page, request, describe, LANGS };
})(typeof window !== 'undefined' ? window : globalThis);

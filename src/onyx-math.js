// Onyx's own arithmetic: reads numbers written as digits or words ("twelve times seven", "15% of 80", "what's that
// squared"), evaluates them with a small parser (never eval), and answers in a sentence. No tools, no network.
(function () {
	'use strict';

	/* ---------- Numbers written as words ---------- */

	const UNITS = { zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
	const TENS = { twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
	const SCALES = { hundred: 100, thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 };
	const NUMBER_WORD = new RegExp(`\\b(?:(?:${[...Object.keys(UNITS), ...Object.keys(TENS), ...Object.keys(SCALES), 'a', 'and', 'point'].join('|')})(?:[\\s-]+|$))+`, 'gi');

	/** "two hundred and five point three" -> 205.3; returns null if the words aren't a number. */
	function wordsToNumber(text) {
		const words = text.toLowerCase().replace(/-/g, ' ').split(/\s+/).filter(Boolean);
		let total = 0;
		let current = 0;
		let seen = false;
		let decimals = null;
		for (let i = 0; i < words.length; i++) {
			const w = words[i];
			if (decimals !== null) {
				if (!(w in UNITS)) return null;
				decimals += String(UNITS[w]);
				continue;
			}
			if (w === 'and') continue;
			if (w === 'a' && SCALES[words[i + 1]]) {
				current += 1;
				seen = true;
			} else if (w === 'point') decimals = '';
			else if (w in UNITS) {
				current += UNITS[w];
				seen = true;
			} else if (w in TENS) {
				current += TENS[w];
				seen = true;
			} else if (w === 'hundred') current = (current || 1) * 100;
			else if (w in SCALES) {
				total += (current || 1) * SCALES[w];
				current = 0;
				seen = true;
			} else return null;
		}
		if (!seen) return null;
		const n = total + current;
		return decimals ? Number(`${n}.${decimals}`) : n;
	}

	/** Replaces runs of number words with digits, leaving "a", "and" and "point" alone when they aren't part of a number. */
	function digitize(text) {
		return text.replace(NUMBER_WORD, (run) => {
			const trimmed = run.trim().replace(/\s+(and|a|point)$/i, '');
			const tail = run.slice(trimmed.length);
			const n = wordsToNumber(trimmed);
			return n == null || /^(a|and|point)$/i.test(trimmed) ? run : `${n}${tail}`;
		});
	}

	/* ---------- Turning a sentence into an expression ---------- */

	const NUM = '(-?\\d+(?:\\.\\d+)?)';
	const FUNCS = ['sqrt', 'cbrt', 'abs', 'fact', 'sin', 'cos', 'tan', 'log', 'ln'];
	const FUNC = new RegExp(`\\b(${FUNCS.join('|')})\\b`);
	const NAMED = new RegExp(`\\b(${FUNCS.join('|')}|pi)\\b`, 'g');

	/** Spoken operators and functions, shared by sums and equations. "x" as "times" is left to the caller. */
	const WORD_RULES = [
		[new RegExp(`\\b(?:the )?square root of ${NUM}`, 'g'), 'sqrt($1)'],
		[new RegExp(`\\b(?:the )?cube root of ${NUM}`, 'g'), 'cbrt($1)'],
		[new RegExp(`\\b(?:the )?square of ${NUM}`, 'g'), '($1^2)'],
		[new RegExp(`\\b(?:the )?cube of ${NUM}`, 'g'), '($1^3)'],
		[new RegExp(`\\blog(?:arithm)? base ${NUM} of ${NUM}`, 'g'), '(ln($2) / ln($1))'],
		[/\b(?:the )?natural log(?:arithm)?(?: of)?\b/g, 'ln'], [/\b(?:the )?log(?:arithm)? of\b/g, 'log'],
		[/\b(?:the )?sine(?: of)?\b|\bsin of\b/g, 'sin'], [/\b(?:the )?cosine(?: of)?\b|\bcos of\b/g, 'cos'], [/\b(?:the )?tangent(?: of)?\b|\btan of\b/g, 'tan'],
		[/\bdegrees?\b|°/g, ' '], [/π/g, 'pi'],
		[new RegExp(`${NUM}\\s*(?:%|percent)\\s+of\\s+${NUM}`, 'g'), '($1 / 100 * $2)'],
		// "80 - 15%" means 15% of 80, the way a pocket calculator reads it.
		[new RegExp(`${NUM}\\s*([-+])\\s*${NUM}\\s*(?:%|percent)(?!\\s*\\d)`, 'g'), '($1 $2 $1 * $3 / 100)'],
		[new RegExp(`\\bhalf of ${NUM}`, 'g'), '($1 / 2)'],
		[new RegExp(`\\b(?:a )?third of ${NUM}`, 'g'), '($1 / 3)'],
		[new RegExp(`\\b(?:a )?quarter of ${NUM}`, 'g'), '($1 / 4)'],
		[new RegExp(`\\bdouble ${NUM}`, 'g'), '($1 * 2)'],
		[new RegExp(`\\btriple ${NUM}`, 'g'), '($1 * 3)'],
		[new RegExp(`\\badd ${NUM} (?:to|and) ${NUM}`, 'g'), '($2 + $1)'],
		[new RegExp(`\\bsubtract ${NUM} from ${NUM}`, 'g'), '($2 - $1)'],
		[new RegExp(`\\bmultiply ${NUM} (?:by|and|with) ${NUM}`, 'g'), '($1 * $2)'],
		[new RegExp(`\\bdivide ${NUM} by ${NUM}`, 'g'), '($1 / $2)'],
		[new RegExp(`\\b(?:the )?difference between ${NUM} and ${NUM}`, 'g'), 'abs($1 - $2)'],
		[new RegExp(`${NUM} factorial|${NUM}!`, 'g'), (m, a, b) => `fact(${a || b})`],
		[/\bplus\b/g, '+'], [/\bminus\b|\btake away\b|\bless\b/g, '-'], [/\b(times|multiplied by)\b/g, '*'], [/\b(divided by|over|divided into)\b/g, '/'],
		[/\bsquared\b/g, '^2'], [/\bcubed\b/g, '^3'], [/\b(to the power of|to the|raised to)\b/g, '^'], [/\bmod(ulo)?\b/g, '%'],
		[/[×]/g, '*'], [/[÷]/g, '/'],
	];

	/** True when what's left after the words are stripped is only numbers, operators, known functions and `allowed` letters. */
	function readable(t, allowed) {
		if (!/^[-+*/^%().\d\s\w]*$/.test(t)) return false;
		const rest = t.replace(NAMED, '');
		return !/[a-z]/.test(allowed ? rest.replace(new RegExp(`(?<![a-z])${allowed}(?![a-z])`, 'g'), '') : rest);
	}

	/** "what is 5 plus 3" -> "5 + 3"; returns null when the message isn't arithmetic. */
	function toExpression(raw, last) {
		let t = digitize(' ' + raw.toLowerCase() + ' ').replace(/,(?=\d{3}\b)/g, '').replace(/[?!]+/g, ' ');
		t = t.replace(/\b(what is|whats|what's|how much is|calculate|compute|work out|solve|evaluate|tell me|can you|could you|please|equals?|the answer to|is equal to)\b/g, ' ');
		// Follow-ups lean on the last answer: "times 3", "what's that squared", "and divide it by 2".
		if (last != null) {
			t = t.replace(/\b(that|it|the answer|the result)\b/g, ` ${last} `);
			if (/^\s*(and\s+)?(plus|minus|times|multiplied by|divided by|over|squared|cubed|to the power)/.test(t)) t = ` ${last} ` + t.replace(/^\s*and\s+/, ' ');
		}
		for (const [re, rep] of WORD_RULES) t = t.replace(re, rep);
		t = t.replace(/\bx\b/g, '*');
		t = t.replace(/\b(and|by|of|the|is|a)\b/g, ' ').replace(/\s+/g, ' ').trim();
		if (!/\d|\bpi\b/.test(t) || !readable(t)) return null;
		// A lone number or constant ("what is pi") is a question about it, not a sum.
		if (!/[-+*/^%]/.test(t.replace(/^-/, '')) && !FUNC.test(t)) return null;
		return t;
	}

	/**
	 * "solve 2x + 3 = 11", "x^2 - 5x + 6 = 0", or a claim to check like "2 + 2 = 5". Handles one unknown, up to
	 * quadratics, by sampling the two sides: no symbolic algebra, so nothing it can't check numerically.
	 */
	function equation(raw) {
		if ((raw.match(/=/g) || []).length !== 1) return null;
		let t = digitize(' ' + raw.toLowerCase() + ' ').replace(/,(?=\d{3}\b)/g, '').replace(/[?!]+/g, ' ');
		t = t.replace(/^\s*(?:please\s+)?(?:can you\s+)?(?:solve|find|work out|calculate|what is|what's|whats|is it true that|is it true|check)?\s*(?:for\s+)?(?:(?:the value of\s+)?[a-z]\s*(?:[:,]|\bif\b|\bwhen\b|\bgiven\b|\bwhere\b|\bin\b))?/, ' ');
		t = t.replace(/\b(?:if|when|given|true|correct|right)\b/g, ' ').replace(/(\d)\s+x\s+(?=\d)/g, '$1 * ');
		for (const [re, rep] of WORD_RULES) t = t.replace(re, rep);
		t = t.replace(/\b(and|by|of|the|is|a)\b/g, ' ').replace(/\s+/g, ' ').trim();
		const unknowns = [...new Set((t.replace(NAMED, ' ').match(/(?<![a-z])[a-z](?![a-z])/g) || []))];
		if (unknowns.length > 1) return { text: 'I can only solve for one unknown at a time.' };
		const v = unknowns[0];
		const [lhs, rhs] = t.split('=').map((s) => s.trim());
		if (!lhs || !rhs || !readable(lhs, v) || !readable(rhs, v)) return null;
		try {
			if (!v) {
				const a = evaluate(lhs);
				const b = evaluate(rhs);
				const same = Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
				return same ? { text: `That's right: ${pretty(lhs)} is ${format(a)}.`, value: a } : { text: `Not quite: ${pretty(lhs)} is **${format(a)}**, not ${format(b)}.`, value: a };
			}
			const f = (x) => evaluate(lhs, { [v]: x }) - evaluate(rhs, { [v]: x });
			const c = f(0);
			const b = (f(1) - f(-1)) / 2;
			const a = (f(1) + f(-1)) / 2 - c;
			const fits = [2, -3, 5].every((x) => Math.abs(f(x) - (a * x * x + b * x + c)) <= 1e-7 * Math.max(1, Math.abs(f(x))));
			if (!fits) return { text: 'I can solve linear and quadratic equations, but not that kind.' };
			const eq = `${pretty(lhs)} = ${pretty(rhs)}`;
			const so = (x) => (eq === `${v} = ${format(x)}` ? `**${eq}**.` : `${eq}, so **${v} = ${format(x)}**.`);
			if (Math.abs(a) < 1e-12) {
				if (Math.abs(b) < 1e-12) return { text: Math.abs(c) < 1e-12 ? `${eq} is true for every ${v}.` : `${eq} has no solution.` };
				const x = -c / b;
				return { text: so(x), value: x };
			}
			const disc = b * b - 4 * a * c;
			if (disc < -1e-12) return { text: `${eq} has no real solutions.` };
			if (Math.abs(disc) <= 1e-12) {
				const x = -b / (2 * a);
				return { text: so(x), value: x };
			}
			const [x1, x2] = [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)].sort((p, q) => p - q);
			return { text: `${eq}, so **${v} = ${format(x1)}** or **${v} = ${format(x2)}**.`, value: x2 };
		} catch (err) {
			return { text: err.message };
		}
	}

	/* ---------- A small, safe evaluator ---------- */

	const trig = (fn) => (deg) => {
		const v = fn((deg * Math.PI) / 180);
		// sin 180 is 1.2e-16 in floating point; anything that small is a rounding error, not an answer.
		return Math.abs(v) < 1e-12 ? 0 : v;
	};
	const FN = { sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, sin: trig(Math.sin), cos: trig(Math.cos), tan: trig(Math.tan), log: Math.log10, ln: Math.log };

	/** Evaluates an expression from toExpression. `vars` binds single-letter unknowns, for equations. Angles are in degrees. */
	function evaluate(expr, vars = {}) {
		const tokens = expr.match(/\d+(?:\.\d+)?|[a-z]+|[-+*/^%()]/g) || [];
		const isName = (t) => t !== undefined && /^[a-z]/.test(t);
		let i = 0;
		const peek = () => tokens[i];
		const next = () => tokens[i++];
		const expect = (t) => {
			if (next() !== t) throw new Error('Unbalanced parentheses.');
		};
		function primary() {
			const t = next();
			if (t === undefined) throw new Error('The sum ended early.');
			if (t === '(') {
				const v = sum();
				expect(')');
				return v;
			}
			if (t === '-') return -power();
			if (t === '+') return power();
			if (FUNCS.includes(t)) {
				const hasParen = peek() === '(';
				if (hasParen) next();
				const v = hasParen ? sum() : primary();
				if (hasParen) expect(')');
				if (t === 'sqrt' && v < 0) throw new Error('A negative number has no real square root.');
				if ((t === 'log' || t === 'ln') && v <= 0) throw new Error('Logarithms are only defined for positive numbers.');
				if (t === 'tan' && Math.abs(((v % 180) + 180) % 180 - 90) < 1e-12) throw new Error(`tan ${format(v)}° is undefined.`);
				if (t !== 'fact') return FN[t](v);
				if (!Number.isInteger(v) || v < 0 || v > 170) throw new Error('I can do factorials of whole numbers from 0 to 170.');
				let f = 1;
				for (let k = 2; k <= v; k++) f *= k;
				return f;
			}
			if (/^\d/.test(t)) return Number(t);
			if (t === 'pi') return Math.PI;
			if (t in vars) return vars[t];
			throw new Error(`I don't know what "${t}" means here.`);
		}
		function power() {
			const base = primary();
			if (peek() === '^') {
				next();
				return Math.pow(base, power());
			}
			return base;
		}
		function product() {
			let v = power();
			// Juxtaposition multiplies: "2x", "3(4 + 1)", "2 pi", "2 sqrt 9".
			while (['*', '/', '%'].includes(peek()) || peek() === '(' || isName(peek())) {
				const op = ['*', '/', '%'].includes(peek()) ? next() : '*';
				const r = power();
				if ((op === '/' || op === '%') && r === 0) throw new Error('Dividing by zero has no answer.');
				v = op === '*' ? v * r : op === '/' ? v / r : v % r;
			}
			return v;
		}
		function sum() {
			let v = product();
			while (peek() === '+' || peek() === '-') v = next() === '+' ? v + product() : v - product();
			return v;
		}
		const v = sum();
		if (i < tokens.length) throw new Error('I couldn\'t read the whole sum.');
		if (!Number.isFinite(v)) throw new Error('That number is too big for me.');
		return v;
	}

	/** 84, 0.333333 (rounded to 10 significant digits), 1,234,567 for big whole numbers. */
	function format(n) {
		if (Number.isInteger(n)) return Math.abs(n) >= 1e4 && Math.abs(n) < 1e21 ? n.toLocaleString('en-US') : String(n);
		return String(Number(n.toPrecision(10)));
	}
	const unwrap = (expr) => {
		const e = expr.trim();
		if (!e.startsWith('(') || !e.endsWith(')')) return e;
		let depth = 0;
		for (let i = 0; i < e.length - 1; i++) if ((depth += e[i] === '(' ? 1 : e[i] === ')' ? -1 : 0) === 0) return e;
		return e.slice(1, -1);
	};
	const pretty = (expr) => unwrap(expr).replace(/\bpi\b/g, 'π').replace(/\*/g, ' × ').replace(/\//g, ' ÷ ').replace(/([+%^-])/g, ' $1 ').replace(/\(\s*/g, '(').replace(/\s*\)/g, ')').replace(/\s+/g, ' ').replace(/^ - /, '-').trim();

	/* ---------- Number facts ---------- */

	const isPrime = (n) => {
		if (n < 2 || !Number.isInteger(n)) return false;
		for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
		return true;
	};
	const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
	const listNumbers = (text) => (digitize(text).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

	/**
	 * Answers a math message, or returns null if it isn't one. `last` is the previous answer, for follow-ups.
	 * Returns { text, value } where value becomes the next `last`.
	 */
	function answer(raw, last) {
		raw = raw.replace(/[$£€](?=\d)/g, '');
		const t = digitize(raw.toLowerCase()).replace(/(\d),(?=\d{3}\b)/g, '$1');
		let m;
		if ((m = t.match(/\bis (-?\d+) (?:a )?prime\b/)) || (m = t.match(/\bis (-?\d+) prime\b/))) {
			const n = Number(m[1]);
			if (isPrime(n)) return { text: `Yes, ${format(n)} is prime.`, value: n };
			const f = n > 1 ? [...Array(Math.floor(Math.sqrt(n)))].map((_, k) => k + 2).find((k) => n % k === 0) : null;
			return { text: `No, ${format(n)} isn't prime${f ? `: it's ${f} × ${format(n / f)}` : ''}.`, value: n };
		}
		if ((m = t.match(/\bis (-?\d+) (?:an? )?(even|odd)\b/))) {
			const n = Number(m[1]);
			const even = n % 2 === 0;
			return { text: `${m[2] === 'even' ? (even ? 'Yes' : 'No') : even ? 'No' : 'Yes'}, ${format(n)} is ${even ? 'even' : 'odd'}.`, value: n };
		}
		if ((m = t.match(/\b(?:factors|divisors) of (\d+)\b/))) {
			const n = Number(m[1]);
			if (n > 1e7) return { text: 'That one is too big for me to factor quickly.' };
			const fs = [];
			for (let k = 1; k * k <= n; k++) if (n % k === 0) fs.push(k, n / k);
			return { text: `The factors of ${format(n)} are ${[...new Set(fs)].sort((a, b) => a - b).join(', ')}.`, value: n };
		}
		if ((m = t.match(/\b(?:gcd|greatest common divisor|highest common factor|hcf) of (\d+) and (\d+)/))) {
			const v = gcd(Number(m[1]), Number(m[2]));
			return { text: `The greatest common divisor of ${m[1]} and ${m[2]} is **${v}**.`, value: v };
		}
		if ((m = t.match(/\b(?:lcm|least common multiple|lowest common multiple) of (\d+) and (\d+)/))) {
			const a = Number(m[1]);
			const b = Number(m[2]);
			const v = (a * b) / gcd(a, b);
			return { text: `The least common multiple of ${m[1]} and ${m[2]} is **${format(v)}**.`, value: v };
		}
		if ((m = t.match(/\b(?:average|mean) of (.+)$/))) {
			const ns = listNumbers(m[1]);
			if (ns.length >= 2) {
				const v = ns.reduce((a, b) => a + b, 0) / ns.length;
				return { text: `The average of ${ns.join(', ')} is **${format(v)}**.`, value: v };
			}
		}
		if ((m = t.match(/\b(?:sum|total) of (.+)$/)) || (m = t.match(/^\s*add up (.+)$/))) {
			const ns = listNumbers(m[1]);
			if (ns.length >= 2) {
				const v = ns.reduce((a, b) => a + b, 0);
				return { text: `${ns.join(' + ')} = **${format(v)}**.`, value: v };
			}
		}
		if ((m = t.match(/\bproduct of (.+)$/))) {
			const ns = listNumbers(m[1]);
			if (ns.length >= 2) {
				const v = ns.reduce((a, b) => a * b, 1);
				return { text: `${ns.join(' × ')} = **${format(v)}**.`, value: v };
			}
		}
		if ((m = t.match(/\b(?:biggest|largest|highest|max(?:imum)?) of (.+)$/)) || (m = t.match(/\b(?:smallest|lowest|min(?:imum)?) of (.+)$/))) {
			const ns = listNumbers(m[1]);
			if (ns.length >= 2) {
				const big = /biggest|largest|highest|max/.test(t);
				const v = big ? Math.max(...ns) : Math.min(...ns);
				return { text: `The ${big ? 'largest' : 'smallest'} is **${format(v)}**.`, value: v };
			}
		}
		if ((m = t.match(/\bwhich is (?:bigger|larger|greater|more),? (-?\d+(?:\.\d+)?) or (-?\d+(?:\.\d+)?)/)) || (m = t.match(/\bis (-?\d+(?:\.\d+)?) (?:bigger|larger|greater|more) than (-?\d+(?:\.\d+)?)/))) {
			const a = Number(m[1]);
			const b = Number(m[2]);
			if (a === b) return { text: `They're equal: both ${format(a)}.`, value: a };
			if (/^which/.test(m[0])) return { text: `${format(Math.max(a, b))} is bigger.`, value: Math.max(a, b) };
			return { text: a > b ? `Yes, ${format(a)} is bigger than ${format(b)}.` : `No, ${format(a)} is smaller than ${format(b)}.`, value: a };
		}
		if ((m = t.match(/\bwhat percent(?:age)? (?:of (-?\d+(?:\.\d+)?) )?is (-?\d+(?:\.\d+)?)(?: of (-?\d+(?:\.\d+)?))?/))) {
			const part = Number(m[2]);
			const whole = Number(m[1] || m[3]);
			if (whole) {
				const v = (part / whole) * 100;
				return { text: `${format(part)} is **${format(v)}%** of ${format(whole)}.`, value: v };
			}
		}
		if ((m = t.match(/\bround (-?\d+(?:\.\d+)?)(?: to (\d+) (?:decimal places|places|decimals|dp))?/))) {
			const p = Number(m[2] || 0);
			const v = Number(Math.round(Number(m[1] + 'e' + p)) + 'e-' + p);
			return { text: `${m[1]} rounded to ${p ? `${p} decimal place${p === 1 ? '' : 's'}` : 'a whole number'} is **${format(v)}**.`, value: v };
		}
		if ((m = t.match(/\b(\d+) times table\b/)) || (m = t.match(/\btimes table (?:for|of) (\d+)\b/))) {
			const n = Number(m[1]);
			return { text: Array.from({ length: 12 }, (_, k) => `${k + 1} × ${n} = ${(k + 1) * n}`).join('\n'), value: n };
		}
		if ((m = t.match(/\bcount (?:from (\d+) )?to (\d+)\b/))) {
			const from = Number(m[1] || 1);
			const to = Number(m[2]);
			if (Math.abs(to - from) > 100) return { text: 'I\'ll count up to 100 numbers at a time.' };
			const step = to >= from ? 1 : -1;
			const out = [];
			for (let k = from; step > 0 ? k <= to : k >= to; k += step) out.push(k);
			return { text: out.join(', ') + '.', value: to };
		}
		const off = t.match(new RegExp(`\\b${NUM}\\s*(?:%|percent) off(?: of)? ${NUM}`));
		const discount = !off && t.match(new RegExp(`\\b${NUM} with (?:a )?${NUM}\\s*(?:%|percent) (?:off|discount)`));
		if (off || discount) {
			const [pct, price] = off ? [Number(off[1]), Number(off[2])] : [Number(discount[2]), Number(discount[1])];
			const v = price * (1 - pct / 100);
			return { text: `${format(pct)}% off ${format(price)} is **${format(v)}**. You save ${format(price - v)}.`, value: v };
		}
		if ((m = t.match(new RegExp(`\\b${NUM}\\s*(?:%|percent) tip (?:on|for) ${NUM}`))) || (m = t.match(new RegExp(`\\btip (?:of )?${NUM}\\s*(?:%|percent) (?:on|for) ${NUM}`)))) {
			const tip = (Number(m[1]) / 100) * Number(m[2]);
			return { text: `A ${format(Number(m[1]))}% tip on ${format(Number(m[2]))} is **${format(tip)}**, so the total is **${format(Number(m[2]) + tip)}**.`, value: tip };
		}
		const verbFirst = t.match(new RegExp(`\\b(increase|decrease|raise|reduce|lower) ${NUM} by ${NUM}\\s*(?:%|percent)`));
		const numFirst = !verbFirst && t.match(new RegExp(`\\b${NUM} (increased|decreased|raised|reduced|lowered) by ${NUM}\\s*(?:%|percent)`));
		if (verbFirst || numFirst) {
			const [verb, base, pct] = verbFirst ? [verbFirst[1], Number(verbFirst[2]), Number(verbFirst[3])] : [numFirst[2], Number(numFirst[1]), Number(numFirst[3])];
			const up = /^(increase|raise)/.test(verb);
			const v = base * (1 + ((up ? 1 : -1) * pct) / 100);
			return { text: `${format(base)} ${up ? 'increased' : 'decreased'} by ${format(pct)}% is **${format(v)}**.`, value: v };
		}
		if ((m = t.match(new RegExp(`\\b(?:percent(?:age)? )?(?:change|increase|decrease|difference) from ${NUM} to ${NUM}`))) || (m = t.match(new RegExp(`\\bfrom ${NUM} to ${NUM},? (?:is )?what percent`)))) {
			const [a, b] = [Number(m[1]), Number(m[2])];
			if (!a) return { text: 'A change from zero has no percentage.' };
			const v = ((b - a) / Math.abs(a)) * 100;
			return { text: v === 0 ? 'No change: 0%.' : `From ${format(a)} to ${format(b)} is ${v > 0 ? 'an increase' : 'a decrease'} of **${format(Math.abs(v))}%**.`, value: v };
		}
		if ((m = t.match(new RegExp(`${NUM}(?:\\s*/\\s*${NUM})? (?:as|in|to|into) (?:a )?(percent|percentage|%|fraction|decimal)`)))) {
			const v = m[2] ? Number(m[1]) / Number(m[2]) : Number(m[1]);
			if (!Number.isFinite(v)) return { text: 'Dividing by zero has no answer.' };
			const shown = m[2] ? `${m[1]}/${m[2]}` : m[1];
			if (/fraction/.test(m[3])) {
				const f = fraction(v);
				return { text: f ? `${shown} as a fraction is **${f}**.` : `${shown} doesn't make a tidy fraction.`, value: v };
			}
			if (/decimal/.test(m[3])) return { text: `${shown} as a decimal is **${format(v)}**.`, value: v };
			return { text: `${shown} is **${format(v * 100)}%**.`, value: v * 100 };
		}
		if ((m = t.match(/\b(\d+) choose (\d+)\b/)) || (m = t.match(/\bcombinations of (\d+) (?:from|out of|in) (\d+)\b/))) {
			const [n, k] = /choose/.test(m[0]) ? [Number(m[1]), Number(m[2])] : [Number(m[2]), Number(m[1])];
			if (k > n) return { text: `You can't choose ${k} things from ${n}.`, value: 0 };
			const v = choose(n, k);
			return { text: `${n} choose ${k} is **${format(v)}**: that many ways to pick ${k} from ${n} when order doesn't matter.`, value: v };
		}
		if ((m = t.match(/\bpermutations of (\d+) (?:from|out of|in) (\d+)\b/)) || (m = t.match(/\b(?:how many ways|in how many ways) (?:can you |to )?(?:arrange|order) (\d+)(?: things| items| people| objects)?\b/))) {
			const [k, n] = m[2] ? [Number(m[1]), Number(m[2])] : [Number(m[1]), Number(m[1])];
			if (k > n || n > 170) return { text: 'Those numbers are out of my range.' };
			let v = 1;
			for (let i = n - k + 1; i <= n; i++) v *= i;
			return { text: m[2] ? `There are **${format(v)}** ways to arrange ${k} from ${n} when order matters.` : `There are **${format(v)}** ways to put ${n} things in order.`, value: v };
		}
		if ((m = t.match(/\bmedian of (.+)$/))) {
			const ns = listNumbers(m[1]).sort((a, b) => a - b);
			if (ns.length >= 2) {
				const mid = ns.length >> 1;
				const v = ns.length % 2 ? ns[mid] : (ns[mid - 1] + ns[mid]) / 2;
				return { text: `In order: ${ns.join(', ')}. The median is **${format(v)}**.`, value: v };
			}
		}
		if ((m = t.match(/\bmode of (.+)$/))) {
			const ns = listNumbers(m[1]);
			if (ns.length >= 2) {
				const counts = new Map();
				ns.forEach((n) => counts.set(n, (counts.get(n) || 0) + 1));
				const top = Math.max(...counts.values());
				if (top === 1) return { text: 'Every number appears once, so there is no mode.' };
				const modes = [...counts].filter(([, c]) => c === top).map(([n]) => n).sort((a, b) => a - b);
				return { text: `The mode is **${modes.map(format).join('** and **')}** (${modes.length > 1 ? 'each appears' : 'appears'} ${top} times).`, value: modes[0] };
			}
		}
		if ((m = t.match(/\brange of (.+)$/))) {
			const ns = listNumbers(m[1]);
			if (ns.length >= 2) {
				const v = Math.max(...ns) - Math.min(...ns);
				return { text: `The range is ${format(Math.max(...ns))} - ${format(Math.min(...ns))} = **${format(v)}**.`, value: v };
			}
		}
		if ((m = t.match(/\b(?:standard deviation|std dev|stdev|sd) of (.+)$/))) {
			const ns = listNumbers(m[1]);
			if (ns.length >= 2) {
				const mean = ns.reduce((a, b) => a + b, 0) / ns.length;
				const sq = ns.reduce((a, b) => a + (b - mean) ** 2, 0);
				const pop = Math.sqrt(sq / ns.length);
				const sample = Math.sqrt(sq / (ns.length - 1));
				return { text: `For ${ns.join(', ')}: the population standard deviation is **${format(pop)}**, and the sample one is **${format(sample)}**.`, value: pop };
			}
		}
		if ((m = t.match(/\bprime factori[sz]ation of (\d+)\b/)) || (m = t.match(/\bprime factors of (\d+)\b/)) || (m = t.match(/\bfactori[sz]e (\d+)\b/))) {
			const n = Number(m[1]);
			if (n < 2) return { text: `${n} has no prime factors.`, value: n };
			if (n > 1e12) return { text: 'That one is too big for me to factor quickly.' };
			const fs = [];
			let r = n;
			for (let k = 2; k * k <= r; k++) while (r % k === 0) fs.push(k), (r /= k);
			if (r > 1) fs.push(r);
			return { text: fs.length === 1 ? `${format(n)} is prime, so it's its own only prime factor.` : `${format(n)} = **${fs.join(' × ')}**.`, value: n };
		}
		if ((m = t.match(/\bis (\d+) (?:a )?perfect square\b/))) {
			const n = Number(m[1]);
			const r = Math.round(Math.sqrt(n));
			return { text: r * r === n ? `Yes, ${format(n)} is ${r} squared.` : `No. It's between ${(r * r > n ? r - 1 : r) ** 2} and ${(r * r > n ? r : r + 1) ** 2}.`, value: n };
		}
		if ((m = t.match(/\bis (\d{1,5}) (?:a )?leap year\b/)) || (m = t.match(/\bwas (\d{1,5}) (?:a )?leap year\b/))) {
			const y = Number(m[1]);
			const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
			return { text: `${leap ? 'Yes' : 'No'}, ${y} ${leap ? 'is' : 'isn\'t'} a leap year${y % 100 === 0 ? ` (century years need to divide by 400)` : ''}.`, value: y };
		}
		const eq = equation(raw);
		if (eq) return eq;
		const expr = toExpression(raw, last);
		if (!expr) return null;
		try {
			const v = evaluate(expr);
			const f = /\//.test(expr) && !Number.isInteger(v) ? fraction(v) : null;
			const angles = /\b(sin|cos|tan)\b/.test(expr) ? ' (angles in degrees)' : '';
			return { text: `${pretty(expr)} = **${format(v)}**${f ? ` (${f})` : ''}${angles}`, value: v };
		} catch (err) {
			return { text: err.message };
		}
	}

	/** 0.75 -> "3/4", for denominators up to 1000; null when the number isn't a simple fraction. */
	function fraction(v) {
		for (let q = 2; q <= 1000; q++) {
			const p = Math.round(v * q);
			if (Math.abs(v - p / q) < 1e-9 && gcd(p, q) === 1) return `${p}/${q}`;
		}
		return null;
	}

	function choose(n, k) {
		let v = 1;
		for (let i = 1; i <= Math.min(k, n - k); i++) v = (v * (n - Math.min(k, n - k) + i)) / i;
		return Math.round(v);
	}

	/** Spells a whole number in English words (up to the trillions). */
	function numberToWords(n) {
		if (!Number.isInteger(n) || Math.abs(n) >= 1e15) return null;
		if (n === 0) return 'zero';
		if (n < 0) return 'minus ' + numberToWords(-n);
		const small = Object.keys(UNITS).filter((w) => w !== 'oh');
		const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
		const chunk = (x) => {
			const out = [];
			if (x >= 100) out.push(small[Math.floor(x / 100)] + ' hundred');
			const r = x % 100;
			if (r) out.push(r < 20 ? small[r] : tens[Math.floor(r / 10)] + (r % 10 ? '-' + small[r % 10] : ''));
			return out.join(' and ');
		};
		const names = ['', ' thousand', ' million', ' billion', ' trillion'];
		const parts = [];
		let k = 0;
		while (n > 0) {
			const c = n % 1000;
			if (c) parts.unshift(chunk(c) + names[k]);
			n = Math.floor(n / 1000);
			k++;
		}
		return parts.join(', ');
	}

	Omni.onyxMath = { answer, evaluate, toExpression, equation, fraction, wordsToNumber, numberToWords, digitize, isPrime };
})();

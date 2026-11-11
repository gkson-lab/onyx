// Checks the programs Onyx composes from a prompt (src/onyx-synth.js). Every plan is written in all six programming
// languages, each program is compiled with warnings as errors and run, and what it prints is compared with the answer
// worked out here, independently, straight from the plan. Plans come from prompts in English and from a seeded random
// generator, so the same plans are checked every time.
//
//   node tools/check-synth.js          the prompts, then 40 random plans
//   node tools/check-synth.js 200      more random plans
//
// Pages are checked for well-formed HTML, and HTTP requests are sent to a local server that checks what arrives.
// Needs python3, node, rustc, gcc, g++ and, for C#, mcs and mono; a language whose tools are missing is skipped.
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const net = require('net');
global.Omni = {};
require('../src/onyx-synth.js');
const S = Omni.onyxSynth;

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'onyx-synth-'));
const has = (cmd) => spawnSync('sh', ['-c', `command -v ${cmd}`]).status === 0;
const TOOLS = { python: has('python3'), javascript: has('node'), rust: has('rustc'), c: has('gcc'), cpp: has('g++'), csharp: has('mcs') && has('mono') };
const LANGS = Object.keys(TOOLS).filter((l) => TOOLS[l]);
const FILE = { python: 'main.py', javascript: 'main.js', rust: 'main.rs', c: 'main.c', cpp: 'main.cpp', csharp: 'Program.cs' };
const NUMBERS_FILE = '12 -4 7\n30 7 0 15\n\n-9 22 8\n';
const LINES_FILE = 'Maria\nBo\n\nalexander\nSam\nbeatrice\nBo\nOlu\nChristopher\n';

let checked = 0;
let failed = 0;
const fail = (label, why) => {
	failed++;
	console.log(`FAIL ${label}: ${String(why).trim().split('\n').slice(0, 14).join('\n     ')}`);
};
function sh(cmd, args, opts = {}) {
	const r = spawnSync(cmd, args, Object.assign({ timeout: 60000, encoding: 'utf8' }, opts));
	if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')}\n${r.stderr || ''}${r.stdout || ''}${r.error || ''}`);
	return r.stdout;
}
function run(lang, work) {
	const input = NUMBERS_FILE;
	if (lang === 'python') return sh('python3', ['-W', 'error', FILE.python], { cwd: work, input });
	if (lang === 'javascript') return sh('node', [FILE.javascript], { cwd: work, input });
	if (lang === 'rust') return sh('rustc', ['-D', 'warnings', '-o', 'main', FILE.rust], { cwd: work }), sh('./main', [], { cwd: work, input });
	if (lang === 'c') return sh('gcc', ['-std=c11', '-Wall', '-Wextra', '-Werror', '-D_DEFAULT_SOURCE', '-o', 'main', FILE.c], { cwd: work }), sh('./main', [], { cwd: work, input });
	if (lang === 'cpp') return sh('g++', ['-std=c++17', '-Wall', '-Wextra', '-Werror', '-o', 'main', FILE.cpp], { cwd: work }), sh('./main', [], { cwd: work, input });
	return sh('mcs', ['-warnaserror+', '-out:main.exe', FILE.csharp], { cwd: work }), sh('mono', ['main.exe'], { cwd: work, input });
}

/** What a plan should print, worked out here without any of the generated code. */
function expected(plan) {
	const s = plan.source;
	let xs = { nums: () => s.values.slice(), range: () => Array.from({ length: s.to - s.from + 1 }, (_, i) => s.from + i), 'file-nums': () => NUMBERS_FILE.split(/\s+/).filter(Boolean).map(Number), 'input-nums': () => NUMBERS_FILE.split(/\s+/).filter(Boolean).map(Number), words: () => s.values.slice(), 'file-lines': () => LINES_FILE.split('\n').filter(Boolean), 'text-words': () => s.text.split(/\s+/).filter(Boolean) }[s.type]();
	const TEST = { even: (x) => x % 2 === 0, odd: (x) => x % 2 !== 0, positive: (x) => x > 0, negative: (x) => x < 0, nonpositive: (x) => x <= 0, nonnegative: (x) => x >= 0, gt: (x, p) => x > p.n, lt: (x, p) => x < p.n, ge: (x, p) => x >= p.n, le: (x, p) => x <= p.n, eq: (x, p) => x === p.n, ne: (x, p) => x !== p.n, divisible: (x, p) => x % p.n === 0, indivisible: (x, p) => x % p.n !== 0, longer: (x, p) => x.length > p.n, shorter: (x, p) => x.length < p.n, notlonger: (x, p) => x.length <= p.n, notshorter: (x, p) => x.length >= p.n, startswith: (x, p) => x.startsWith(p.s), endswith: (x, p) => x.endsWith(p.s), contains: (x, p) => x.includes(p.s), notstartswith: (x, p) => !x.startsWith(p.s), notendswith: (x, p) => !x.endsWith(p.s), notcontains: (x, p) => !x.includes(p.s) };
	const FN = { square: (x) => x * x, cube: (x) => x * x * x, times: (x, f) => x * f.n, plus: (x, f) => x + f.n, abs: (x) => Math.abs(x), upper: (x) => x.toUpperCase(), lower: (x) => x.toLowerCase(), reverse: (x) => [...x].reverse().join(''), length: (x) => x.length };
	for (const st of plan.steps) {
		if (st.op === 'filter') xs = xs.filter((x) => TEST[st.pred.kind](x, st.pred));
		else if (st.op === 'map') xs = xs.map((x) => FN[st.fn.kind](x, st.fn));
		else if (st.op === 'sort') {
			const str = typeof xs[0] === 'string';
			const by = st.byLength ? (a, b) => a.length - b.length : str ? (a, b) => (a < b ? -1 : a > b ? 1 : 0) : (a, b) => a - b;
			xs = xs.map((x, i) => [x, i]).sort((a, b) => (st.desc ? by(b[0], a[0]) : by(a[0], b[0])) || a[1] - b[1]).map((p) => p[0]);
		} else if (st.op === 'unique') xs = [...new Set(xs)];
		else if (st.op === 'take') xs = xs.slice(0, st.n);
		else if (st.op === 'skip') xs = xs.slice(st.n);
		else if (st.op === 'reverse') xs.reverse();
	}
	const k = plan.sink.type;
	const first = (better) => xs.reduce((a, b) => (better(b, a) ? b : a));
	if (k === 'each') return xs.join('\n');
	if (k === 'join') return xs.join(plan.sink.sep);
	if (k === 'count') return String(xs.length);
	if (k === 'sum') return String(xs.reduce((a, b) => a + b, 0));
	if (k === 'product') return String(xs.reduce((a, b) => a * b, 1));
	if (!xs.length) return 'empty';
	if (k === 'average') return String(xs.reduce((a, b) => a + b, 0) / xs.length);
	if (k === 'max') return String(Math.max(...xs));
	if (k === 'min') return String(Math.min(...xs));
	if (k === 'longest') return first((b, a) => b.length > a.length);
	return first((b, a) => b.length < a.length);
}
// An average may print as 6, 6.0 or 6.000000; everything else must match to the letter.
const same = (got, want, plan) => {
	const g = got.replace(/\r/g, '').replace(/\n$/, '');
	if (plan.sink.type === 'average' && want !== 'empty') return Math.abs(Number(g) - Number(want)) < 1e-6 * Math.max(1, Math.abs(Number(want)));
	return g === want;
};

let serial = 0;
function checkPlan(plan, label) {
	let want;
	try {
		want = expected(plan);
	} catch (e) {
		return fail(label, `the checker could not work out the answer: ${e.message}`);
	}
	for (const lang of LANGS) {
		const work = path.join(dir, `p${serial++}`);
		fs.mkdirSync(work);
		checked++;
		try {
			const out = S.write(plan, lang);
			fs.writeFileSync(path.join(work, FILE[lang]), out.code);
			if (plan.source.file) fs.writeFileSync(path.join(work, plan.source.file), plan.source.type === 'file-lines' ? LINES_FILE : NUMBERS_FILE);
			const got = run(lang, work);
			if (!same(got, want, plan)) fail(`${label} [${lang}]`, `printed ${JSON.stringify(got.slice(0, 300))}\nwanted ${JSON.stringify(want.slice(0, 300))}\nplan ${JSON.stringify(plan)}`);
		} catch (e) {
			fail(`${label} [${lang}]`, `${e.message}\nplan ${JSON.stringify(plan)}`);
		}
		fs.rmSync(work, { recursive: true, force: true });
	}
}

/* ---------- Plans read from prompts: the reading is checked too ---------- */

const PROMPTS = [
	['take the numbers 1 to 20, keep the even ones, square them and print the sum', '1540'],
	['the sum of the squares of the odd numbers from 1 to 9', '165'],
	['print the numbers from 1 to 30 that are divisible by 7', '7\n14\n21\n28'],
	['take the list 4, 8, 15, 16, 23, 42, remove the even ones and print the average', '19'],
	['given the numbers 5, 3, 9, 3, 5, 1, remove the duplicates, sort them in descending order and print them separated by commas', '9, 5, 3, 1'],
	['the three largest numbers in 12, 7, 31, 4, 18, 25', '31\n25\n18'],
	['read the numbers in data.txt, keep the positive ones, double them and print the largest', '60'],
	['read numbers from standard input, drop the negative ones and count them', '8'],
	['multiply the numbers 1 to 6 together', '720'],
	['take the numbers 1 to 10, add 5 to each one, then keep those greater than 12 and print them on one line', '13, 14, 15'],
	['take the words apple, kiwi, banana, fig and cherry, keep the ones longer than 4 letters, put them in capitals and sort them', 'APPLE\nBANANA\nCHERRY'],
	['read the lines of names.txt, remove the duplicates, sort them and print each one', 'Bo\nChristopher\nMaria\nOlu\nSam\nalexander\nbeatrice'],
	['the longest line in names.txt', 'Christopher'],
	['split the sentence "the quick brown fox jumps over the lazy dog" into words and print the ones that start with the letter t', 'the\nthe'],
	['take the words in "one fish two fish red fish blue fish", remove the repeats and join them with dashes', 'one-fish-two-red-blue'],
	['the lengths of the words pear, fig, banana and plum, then the sum', '17'],
	['count the lines in names.txt that end with a', '1'],
	['the two shortest names in names.txt', 'Bo\nBo'],
	['take the numbers 1 to 12, skip the first 3, keep the ones that are not divisible by 2 and print the smallest', '5'],
];

/* ---------- Random plans ---------- */

function rng(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
function randomPlan(rand) {
	const pick = (xs) => xs[Math.floor(rand() * xs.length)];
	const int = (a, b) => a + Math.floor(rand() * (b - a + 1));
	const WORDS = ['pear', 'fig', 'banana', 'Kiwi', 'apple', 'cherry', 'fig', 'plum', 'apricot', 'Date', 'lime', 'pear', 'melon', 'grape'];
	const strings = rand() < 0.45;
	const source = strings
		? pick([() => ({ type: 'words', values: Array.from({ length: int(0, 9) }, () => pick(WORDS)) }), () => ({ type: 'file-lines', file: 'names.txt' }), () => ({ type: 'text-words', text: Array.from({ length: int(1, 9) }, () => pick(WORDS)).join(' ') })])()
		: pick([() => ({ type: 'nums', values: Array.from({ length: int(0, 10) }, () => int(-20, 40)) }), () => ({ type: 'range', from: int(-5, 5), to: int(6, 25) }), () => ({ type: 'file-nums', file: 'data.txt' }), () => ({ type: 'input-nums' })])();
	const steps = [];
	let str = strings;
	let big = 1; // how many times the numbers may have grown, to stay far inside 64 bits (and inside a double)
	for (let i = int(0, 5); i > 0; i--) {
		const kind = pick(['filter', 'filter', 'map', 'map', 'sort', 'unique', 'take', 'skip', 'reverse']);
		if (kind === 'filter') {
			steps.push({ op: 'filter', pred: str ? pick([{ kind: pick(['longer', 'shorter', 'notlonger', 'notshorter']), n: int(2, 7) }, { kind: pick(['startswith', 'endswith', 'contains', 'notstartswith', 'notendswith', 'notcontains']), s: pick(['a', 'e', 'p', 'an', 'B', 'm', 'er']) }]) : pick([{ kind: pick(['even', 'odd', 'positive', 'negative', 'nonpositive', 'nonnegative']) }, { kind: pick(['gt', 'lt', 'ge', 'le', 'eq', 'ne']), n: int(-10, 30) }, { kind: pick(['divisible', 'indivisible']), n: int(2, 7) }]) });
		} else if (kind === 'map') {
			if (str) {
				const f = pick(['upper', 'lower', 'reverse', 'length']);
				steps.push({ op: 'map', fn: { kind: f } });
				if (f === 'length') str = false;
			} else {
				const f = pick([{ kind: 'square' }, { kind: 'cube' }, { kind: 'times', n: pick([2, 3, -1, 5, 10]) }, { kind: 'plus', n: int(-9, 9) || 1 }, { kind: 'abs' }]);
				const cost = f.kind === 'square' ? 2 : f.kind === 'cube' ? 3 : 1;
				if (big * cost > 3) continue;
				big *= cost;
				steps.push({ op: 'map', fn: f });
			}
		} else if (kind === 'sort') steps.push(Object.assign({ op: 'sort', desc: rand() < 0.5 }, str && rand() < 0.4 ? { byLength: true } : {}));
		else if (kind === 'unique') steps.push({ op: 'unique' });
		else if (kind === 'take' || kind === 'skip') steps.push({ op: kind, n: int(0, 6) });
		else steps.push({ op: 'reverse' });
	}
	// A product of many big numbers would overflow 64 bits: only of a few small ones.
	const sinks = str ? ['each', 'each', 'count', 'longest', 'shortest', 'join'] : ['each', 'sum', 'average', 'count', 'max', 'min', 'join'].concat(big === 1 && !steps.some((s) => s.op === 'map') ? ['product'] : []);
	let sink = { type: pick(sinks) };
	if (sink.type === 'join') sink.sep = pick([', ', ' ', '-', '; ', ' | ']);
	if (sink.type === 'product') steps.push({ op: 'take', n: 8 }, { op: 'filter', pred: { kind: 'le', n: 25 } });
	return { kind: 'pipeline', source, steps, sink };
}

/* ---------- Pages and requests ---------- */

function checkHtml(code, label) {
	checked++;
	const VOID = new Set(['meta', 'input', 'br', 'img', 'link', 'hr', 'source', 'col', 'area', 'base', 'wbr']);
	if (!/^<!DOCTYPE html>/i.test(code)) return fail(label, 'no doctype');
	const stack = [];
	const ids = new Set();
	const body = code.replace(/<script>[\s\S]*?<\/script>/g, '<script></script>').replace(/<style>[\s\S]*?<\/style>/g, '<style></style>');
	for (const m of body.matchAll(/<(\/?)([a-z][a-z0-9]*)\b([^>]*?)(\/?)>/gi)) {
		const [, close, tag, attrs] = m;
		const t = tag.toLowerCase();
		const id = (attrs.match(/\bid="([^"]*)"/) || [])[1];
		if (id) {
			if (ids.has(id)) return fail(label, `two elements share the id "${id}"`);
			ids.add(id);
		}
		if (VOID.has(t)) continue;
		if (!close) stack.push(t);
		else if (stack.pop() !== t) return fail(label, `</${t}> doesn't close the element that is open`);
	}
	if (stack.length) return fail(label, `unclosed: ${stack.join(', ')}`);
	// Every link inside the page must lead somewhere, and every field must have a label.
	for (const m of body.matchAll(/href="#([^"]+)"/g)) if (!ids.has(m[1])) return fail(label, `a link to #${m[1]}, which isn't on the page`);
	for (const m of body.matchAll(/<label for="([^"]+)"/g)) if (!ids.has(m[1])) return fail(label, `a label for "${m[1]}", which isn't on the page`);
	if (/[<>&](?![a-z/!]|amp;|lt;|gt;|quot;|#\d+;|copy;|middot;)/.test(body.replace(/<[^>]+>/g, '').replace(/&(?:amp|lt|gt|quot|copy|middot|#\d+);/g, ''))) fail(label, 'unescaped text');
}

function send(port, bytes) {
	return new Promise((resolve) => {
		const s = net.connect(port, '127.0.0.1');
		let got = '';
		s.on('connect', () => s.write(bytes));
		s.on('data', (d) => (got += d));
		s.on('end', () => resolve(got));
		s.on('error', () => resolve(got));
		setTimeout(() => (s.destroy(), resolve(got)), 3000);
	});
}
/** Sends the request, as written, to a local server and checks that what arrives is what the plan asked for. */
async function checkRequest(prompt, want, label) {
	checked++;
	const plan = S.parse(prompt, 'http');
	if (!plan) return fail(label, 'not read as a request');
	const out = S.write(plan, 'http');
	const at = out.code.indexOf('\r\n\r\n');
	if (at < 0) return fail(label, 'no blank line after the headers');
	if (out.code.slice(0, at).split('\r\n').slice(1).some((h) => !/^[A-Za-z0-9-]+: \S/.test(h))) return fail(label, 'a malformed header');
	const seen = await new Promise((resolve) => {
		const server = http.createServer((req, res) => {
			let body = '';
			req.on('data', (d) => (body += d));
			req.on('end', () => {
				res.end('ok');
				server.close();
				resolve({ method: req.method, url: req.url, headers: req.headers, body });
			});
		});
		server.on('clientError', (e) => (server.close(), resolve({ error: e.message })));
		server.listen(0, '127.0.0.1', async () => {
			const reply = await send(server.address().port, out.code.replace(/^Connection: .*\r\n/m, '').replace('\r\n\r\n', '\r\nConnection: close\r\n\r\n'));
			if (!/^HTTP\/1\.1 200/.test(reply)) (server.close(), resolve({ error: `the server answered ${JSON.stringify(reply.slice(0, 80))}` }));
		});
	});
	if (seen.error) return fail(label, seen.error);
	for (const [k, v] of Object.entries(want)) {
		const got = k === 'json' ? JSON.stringify(JSON.parse(seen.body || 'null')) : k in seen ? seen[k] : seen.headers[k];
		const wanted = k === 'json' ? JSON.stringify(v) : v;
		if (got !== wanted) return fail(label, `${k}: arrived as ${JSON.stringify(got)}, wanted ${JSON.stringify(wanted)}\n${out.code}`);
	}
	// The curl command must be one a shell can read (quotes balanced).
	if (out.curl && spawnSync('sh', ['-n', '-c', out.curl]).status !== 0) fail(label, `the curl command isn't valid shell: ${out.curl}`);
}

(async () => {
	if (LANGS.length < 6) console.log(`skipping (not installed): ${Object.keys(TOOLS).filter((l) => !TOOLS[l]).join(', ')}`);
	for (const [prompt, want] of PROMPTS) {
		const plan = S.parse(prompt, 'python');
		checked++;
		if (!plan) {
			fail(prompt, 'not read as a plan');
			continue;
		}
		const worked = expected(plan);
		if (worked.replace(/\.0+$/, '') !== want) {
			fail(prompt, `read as a plan that gives ${JSON.stringify(worked)}, not ${JSON.stringify(want)}\n${S.describe(plan).join('; ')}`);
			continue;
		}
		checkPlan(plan, prompt);
	}
	const rand = rng(3);
	const n = Number(process.argv[2]) || 40;
	for (let i = 0; i < n; i++) checkPlan(randomPlan(rand), `random plan ${i + 1}`);

	const PAGES = ['a landing page for a bakery called Sweet Crumbs with a hero, three features, a gallery, opening hours, a contact form and a footer', 'a dark portfolio page for Ana Ruiz with an about section, a gallery of 6 projects, testimonials and a contact form', 'a page for a café called "Tom & Jerry <3" with a menu, prices, an FAQ and a footer', 'a pricing page with three plans in green', 'a web page with a navigation bar, a hero and a footer'];
	for (const p of PAGES) {
		const plan = S.parse(p, 'html');
		if (!plan) (checked++, fail(p, 'not read as a page'));
		else checkHtml(S.write(plan, 'html').code, p);
	}
	await checkRequest('a PUT request to https://api.example.com/users/42 with a bearer token and a JSON body with name Sam and age 30', { method: 'PUT', url: '/users/42', host: 'api.example.com', authorization: 'Bearer YOUR_TOKEN', 'content-type': 'application/json', json: { name: 'Sam', age: 30 } }, 'PUT with a token and JSON');
	await checkRequest('a DELETE request to https://api.example.com/items/7 with an api key', { method: 'DELETE', url: '/items/7', 'x-api-key': 'YOUR_API_KEY' }, 'DELETE with an API key');
	await checkRequest('a GET request to https://example.com/search with query q=red shoes and page=2 and an Accept header of application/json', { method: 'GET', url: '/search?q=red%20shoes&page=2', accept: 'application/json' }, 'GET with a query');
	await checkRequest('a PATCH request to https://api.example.com/tasks/3 with a json body done=true and title "Buy milk, eggs"', { method: 'PATCH', url: '/tasks/3', json: { done: true, title: 'Buy milk, eggs' } }, 'PATCH with JSON');
	await checkRequest('send a POST to https://example.com/login with a header X-Request-Id: abc123 and body user=sam', { method: 'POST', url: '/login', 'x-request-id': 'abc123', json: { user: 'sam' } }, 'POST with a header');

	fs.rmSync(dir, { recursive: true, force: true });
	console.log(`${checked - failed}/${checked} checks passed${failed ? `, ${failed} FAILED` : ''} (${LANGS.length} languages)`);
	process.exit(failed ? 1 : 0);
})();

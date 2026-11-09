// Compiles and runs every program Onyx can write (src/onyx-code.js), in every language, to check that each one builds
// without warnings and does what it says. The answers are compared across languages: FizzBuzz, a factorial or a sorted
// list must come out the same in all of them.
//
//   node tools/check-code.js            all tasks; toolchains that aren't installed are skipped, and listed
//   node tools/check-code.js fizzbuzz   one task
//
// Needs python3, node, rustc, gcc, g++ and, for C#, mcs and mono (or dotnet); cargo for the Rust HTTP examples, which
// use the reqwest crate; and libcurl's headers for the C and C++ HTTP examples. Requests to the internet are compiled
// but not sent.
'use strict';
const { execFileSync, spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
global.Omni = {};
require('../src/onyx-code.js');
const C = Omni.onyxCode;

const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'onyx-code-'));
const has = (cmd) => spawnSync('sh', ['-c', `command -v ${cmd}`]).status === 0;
const TOOLS = { python: has('python3'), javascript: has('node'), rust: has('rustc'), c: has('gcc'), cpp: has('g++'), csharp: has('mcs') && has('mono'), cargo: has('cargo') };
const curl = TOOLS.c && spawnSync('sh', ['-c', 'echo "#include <curl/curl.h>" | gcc -E - >/dev/null 2>&1']).status === 0;

// Variations of each task's parameters, to check more than the defaults.
const VARIANTS = {
	hello: [{}, { msg: 'Hola, {mundo}! "quoted" 100%' }],
	count: [{}, { from: 5, to: 12 }],
	fizzbuzz: [{}, { n: 15 }],
	func: [{}, { name: 'average', args: ['a', 'b'], expr: '(a + b) / 2', example: [6, 3] }, { name: 'circle_area', args: ['r'], expr: '3.14159 * r * r', example: [2] }, { name: 'area', args: ['w', 'h'], expr: 'w * h', example: [2, 3] }],
	reverse: [{}, { text: "it's a test" }],
	palindrome: [{}, { text: 'onyx' }],
	factorial: [{}, { n: 20 }],
	fibonacci: [{}, { n: 30 }],
	prime: [{}, { n: 97 }, { n: 91 }],
	sort: [{}, { nums: [5, 2, 9, 1], desc: true }, { nums: [2.5, -1, 3.25] }],
	stats: [{}, { nums: [1.5, 2.5, 3] }],
	loop: [{}, { items: ['red', 'green', 'blue'] }],
	readfile: [{}],
	writefile: [{}, { file: 'notes.txt', text: "Don't forget" }],
	wordcount: [{}, { text: 'one fish two fish red fish blue fish' }],
	cls: [{}, { name: 'book', fields: ['title', 'author', 'price', 'is available'] }, { name: 'car', fields: ['make', 'model', 'year'] }],
	get: [{}],
	post: [{}],
	server: [{}],
	greet: [{}],
	guess: [{}],
	temperature: [{}, { value: 98.6, toC: true }],
	htmlpage: [{}, { title: 'Tom & Jerry <3' }],
	table: [{}],
	form: [{}],
	button: [{}],
};
const NETWORK = new Set(['get', 'post']);

let checked = 0;
let failed = 0;
const skipped = new Set();
const fail = (label, why) => {
	failed++;
	console.log(`FAIL ${label}: ${String(why).trim().split('\n').slice(0, 12).join('\n     ')}`);
};

function sh(cmd, args, opts = {}) {
	const r = spawnSync(cmd, args, Object.assign({ cwd: opts.cwd, input: opts.input, timeout: opts.timeout || 60000, encoding: 'utf8' }, opts));
	if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')}\n${r.stderr || ''}${r.stdout || ''}${r.error || ''}`);
	return r.stdout;
}

/** Builds a program and returns how to run it, or null if it only needs to build. */
function build(lang, file, work, task) {
	if (lang === 'python') {
		sh('python3', ['-m', 'py_compile', file], { cwd: work });
		return NETWORK.has(task) ? null : ['python3', [file]];
	}
	if (lang === 'javascript') {
		sh('node', ['--check', file], { cwd: work });
		// Requests to the internet, and code for a page (document), are checked but not run.
		return NETWORK.has(task) || task === 'button' ? null : ['node', [file]];
	}
	if (lang === 'rust') {
		if (NETWORK.has(task)) {
			if (!TOOLS.cargo) return skipped.add('cargo (Rust HTTP examples)'), null;
			const proj = path.join(dir, 'cargo-http');
			if (!fs.existsSync(proj)) {
				fs.mkdirSync(path.join(proj, 'src'), { recursive: true });
				fs.writeFileSync(path.join(proj, 'Cargo.toml'), '[package]\nname = "check"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\nreqwest = { version = "0.12", features = ["blocking", "json"] }\nserde_json = "1"\n');
			}
			fs.copyFileSync(path.join(work, file), path.join(proj, 'src', 'main.rs'));
			sh('cargo', ['build', '-q'], { cwd: proj, timeout: 600000, env: Object.assign({}, process.env, { RUSTFLAGS: '-D warnings' }) });
			return null;
		}
		sh('rustc', ['-D', 'warnings', '-o', 'main', file], { cwd: work });
		return ['./main', []];
	}
	if (lang === 'c' || lang === 'cpp') {
		if (NETWORK.has(task) && !curl) return skipped.add('libcurl headers (C and C++ HTTP examples)'), null;
		const compiler = lang === 'c' ? 'gcc' : 'g++';
		const std = lang === 'c' ? '-std=c11' : '-std=c++17';
		sh(compiler, [std, '-Wall', '-Wextra', '-Werror', '-D_DEFAULT_SOURCE', '-o', 'main', file].concat(NETWORK.has(task) ? ['-lcurl'] : []), { cwd: work });
		return NETWORK.has(task) ? null : ['./main', []];
	}
	if (lang === 'csharp') {
		sh('mcs', ['-warnaserror+', '-r:System.Net.Http.dll', '-r:System.Numerics.dll', '-out:main.exe', file], { cwd: work });
		return NETWORK.has(task) ? null : ['mono', ['main.exe']];
	}
	return null;
}

/** The answer a program prints, reduced to numbers and words so languages can be compared ("[1, 2]" is "1 2"). */
const answer = (s) => String(s).toLowerCase().replace(/\btrue\b/g, 'true').match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?|[a-z']+/g) || [];
const sameNumbers = (a, b) => a.length === b.length && a.every((x, i) => x === b[i] || (Number.isFinite(+x) && Number.isFinite(+b[i]) && Math.abs(+x - +b[i]) < 1e-4 * Math.max(1, Math.abs(+x))));

/** Waits for a TCP port to open. */
function waitPort(port, ms) {
	const end = Date.now() + ms;
	return new Promise((resolve) => {
		const tryOnce = () => {
			const s = net.connect(port, '127.0.0.1');
			s.on('connect', () => (s.destroy(), resolve(true)));
			s.on('error', () => (Date.now() > end ? resolve(false) : setTimeout(tryOnce, 100)));
		};
		tryOnce();
	});
}

/** Sends raw bytes to a port and returns what comes back. */
function exchange(port, bytes) {
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

let port = 18080;
async function runServer(cmd, args, work, label) {
	const p = port++;
	const child = spawn(cmd, args, { cwd: work, stdio: 'ignore' });
	try {
		if (!(await waitPort(p, 15000))) return fail(label, 'the server never started listening');
		const reply = await exchange(p, 'GET / HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n');
		if (!/^HTTP\/1\.[01] 200/.test(reply) || !/Hello from the server!/.test(reply)) fail(label, `unexpected reply: ${JSON.stringify(reply.slice(0, 200))}`);
	} finally {
		child.kill('SIGKILL');
	}
}

/** Checks an HTML page is well formed: a doctype, and every element closed in order. */
function checkHtml(code, label) {
	const VOID = new Set(['meta', 'input', 'br', 'img', 'link', 'hr', 'source', 'col', 'area', 'base', 'wbr']);
	if (!/^<!DOCTYPE html>/i.test(code)) return fail(label, 'no doctype');
	const stack = [];
	const body = code.replace(/<script>[\s\S]*?<\/script>/g, '<script></script>').replace(/<style>[\s\S]*?<\/style>/g, '<style></style>');
	for (const m of body.matchAll(/<(\/?)([a-z][a-z0-9]*)\b[^>]*?(\/?)>/gi)) {
		const [, close, tag] = m;
		const t = tag.toLowerCase();
		if (VOID.has(t)) continue;
		if (!close) stack.push(t);
		else if (stack.pop() !== t) return fail(label, `</${t}> doesn't close the element that is open`);
	}
	if (stack.length) fail(label, `unclosed: ${stack.join(', ')}`);
	for (const m of code.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
		try {
			new Function(m[1]); // eslint-disable-line no-new-func
		} catch (e) {
			fail(label, `script: ${e.message}`);
		}
	}
	if (/[<>&](?![a-z/!]|amp;|lt;|gt;|quot;)/.test(code.replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, '').replace(/&(?:amp|lt|gt|quot);/g, ''))) fail(label, 'unescaped text');
}

/** Checks an HTTP message: start line, headers, a blank line, and a Content-Length that matches the body's bytes. */
async function checkHttp(code, label) {
	const at = code.indexOf('\r\n\r\n');
	if (at < 0) return fail(label, 'no blank line after the headers');
	const [start, ...headers] = code.slice(0, at).split('\r\n');
	if (!/^(?:(?:GET|POST|PUT|DELETE|PATCH|HEAD) \/\S* HTTP\/1\.1|HTTP\/1\.1 \d{3} [A-Za-z ]+)$/.test(start)) return fail(label, `bad start line: ${start}`);
	const map = new Map(headers.map((h) => [h.split(':')[0].toLowerCase(), h.slice(h.indexOf(':') + 1).trim()]));
	if (headers.some((h) => !/^[A-Za-z-]+: \S/.test(h))) return fail(label, 'a malformed header');
	if (/^(?:GET|POST)/.test(start) && !map.has('host')) return fail(label, 'no Host header');
	const body = code.slice(at + 4);
	if (body && Number(map.get('content-length')) !== Buffer.byteLength(body)) return fail(label, `Content-Length ${map.get('content-length')} but the body is ${Buffer.byteLength(body)} bytes`);
	if (map.get('content-type') === 'application/json') JSON.parse(body);
	// A request goes to a local server, which must understand it.
	if (/^(?:GET|POST)/.test(start)) {
		const p = port++;
		const server = require('http').createServer((req, res) => {
			let got = '';
			req.on('data', (d) => (got += d));
			req.on('end', () => {
				res.end(req.method === 'POST' && got !== body ? 'BODY MISMATCH' : 'ok');
			});
		});
		await new Promise((r) => server.listen(p, '127.0.0.1', r));
		const reply = await exchange(p, code);
		server.close();
		if (!/^HTTP\/1\.1 200[\s\S]*\r\n\r\nok$/.test(reply)) fail(label, `a server didn't accept it: ${JSON.stringify(reply.slice(-60))}`);
	}
}

(async () => {
	const tasks = C.catalog().filter((t) => !only || t.task === only);
	for (const { task, languages } of tasks) {
		for (const variant of VARIANTS[task] || [{}]) {
			const params = Object.assign({}, C.TASKS[task].defaults, variant);
			if (task === 'cls' || task === 'post' || task === 'table' || task === 'form') params.fields = (variant.fields || C.TASKS[task].defaults.fields).map((f) => ({ name: f, type: C.typeOf(f), value: null }));
			// Fields get their sample values the way parse() gives them.
			if (params.fields) params.fields = C.parse(`write a class Thing with ${params.fields.map((f) => f.name).join(', ')} in python`).params.fields;
			const outputs = {};
			for (const lang of languages) {
				const label = `${task} ${JSON.stringify(variant)} ${lang}`;
				const w = C.write({ task, lang, params });
				if (!w || w.missing) {
					if (!(task === 'count' && lang === 'html')) fail(label, 'nothing written');
					continue;
				}
				checked++;
				const work = fs.mkdtempSync(path.join(dir, `${task}-${lang}-`));
				fs.writeFileSync(path.join(work, w.file), w.code);
				try {
					if (lang === 'html') {
						checkHtml(w.code, label);
						continue;
					}
					if (lang === 'http') {
						await checkHttp(w.code, label);
						continue;
					}
					if (!TOOLS[lang]) {
						skipped.add(C.LANGS[lang].name);
						continue;
					}
					const run = build(lang, w.file, work, task);
					if (!run) continue;
					if (task === 'server') {
						const code = w.code.replace(/\b8080\b/g, String(port));
						fs.writeFileSync(path.join(work, w.file), code);
						const again = build(lang, w.file, work, task);
						await runServer(again[0], again[1], work, label);
						continue;
					}
					if (task === 'readfile') fs.writeFileSync(path.join(work, params.file), 'line one\nline two\n');
					const input = task === 'greet' ? 'Ada\n' : task === 'guess' ? Array.from({ length: params.max }, (_, i) => i + 1).join('\n') + '\n' : undefined;
					const out = sh(run[0], run[1], { cwd: work, input, timeout: 30000 });
					if (task === 'writefile') {
						const written = fs.readFileSync(path.join(work, params.file), 'utf8');
						if (written !== params.text + '\n') fail(label, `wrote ${JSON.stringify(written)}`);
						continue;
					}
					if (task === 'readfile' && !/line one\s+line two/.test(out)) fail(label, `printed ${JSON.stringify(out)}`);
					if (task === 'greet' && !/Hello, Ada!/.test(out)) fail(label, `printed ${JSON.stringify(out)}`);
					if (task === 'guess' && !/You got it in \d+ tries!/.test(out)) fail(label, `printed ${JSON.stringify(out.slice(-200))}`);
					if (task === 'hello' && out.trim() !== params.msg) fail(label, `printed ${JSON.stringify(out)}`);
					if (task === 'cls') {
						for (const f of params.fields) if (!out.includes(String(f.value)) && !(f.type === 'bool' && /true/i.test(out))) fail(label, `doesn't show ${f.name} = ${f.value}: ${out}`);
						continue;
					}
					outputs[lang] = out;
				} catch (e) {
					fail(label, e.message);
				}
			}
			// The same answer in every language.
			const ref = outputs.python || Object.values(outputs)[0];
			if (ref && !['hello', 'greet', 'guess', 'readfile', 'writefile', 'cls', 'server'].includes(task)) {
				for (const [lang, out] of Object.entries(outputs)) {
					let a = answer(out);
					let b = answer(ref);
					// C counts the words but has no map for each word's count.
					if (task === 'wordcount' && lang === 'c') b = b.slice(0, a.length);
					if (task === 'wordcount') a = a.filter((x) => x !== 'words'), b = b.filter((x) => x !== 'words');
					if (!sameNumbers(a, b)) fail(`${task} ${JSON.stringify(variant)} ${lang}`, `printed ${JSON.stringify(out.slice(0, 160))}, but Python printed ${JSON.stringify(ref.slice(0, 160))}`);
				}
			}
		}
	}
	fs.rmSync(dir, { recursive: true, force: true });
	console.log(`${failed ? 'FAIL' : 'PASS'} ${checked - failed} of ${checked} programs built and ran as they should${skipped.size ? `; skipped (not installed): ${[...skipped].join(', ')}` : ''}`);
	process.exit(failed ? 1 : 0);
})();

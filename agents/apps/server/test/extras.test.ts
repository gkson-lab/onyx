import { describe, expect, it } from 'vitest';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadEquivalents, localOf, parseTiers } from '../src/config.ts';
import { buildServer, receive } from '../src/index.ts';
import { fitHistory, inputBudget } from '../src/context.ts';
import { backupNow, readAttachments, warmUp, type WarmState } from '../src/extras.ts';
import { plan, type Hardware } from '../src/hardware.ts';
import { testApp, TIERS_YAML } from './helpers.ts';

const pc: Hardware = { gpu: { name: 'NVIDIA GeForce RTX 5060 Ti', vramGb: 15.9, bandwidthGbs: 448 }, ramGb: 32, ramMts: 6000, cpu: 'AMD Ryzen 7 8700F', notes: [] };
const WITH_VISION = TIERS_YAML.replace('models:\n', 'models:\n  gemma-vision: { provider: ollama, id: "gemma3:12b", price: { input: 0, output: 0 }, tools: false }\n') + 'vision: { model: gemma-vision }\n';
const b64 = (s: string) => Buffer.from(s).toString('base64');

/** The smallest PDF with one line of text on one page. */
function pdf(text: string): string {
	const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 100] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>', `<< /Length ${`BT /F1 12 Tf 20 50 Td (${text}) Tj ET`.length} >>\nstream\nBT /F1 12 Tf 20 50 Td (${text}) Tj ET\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
	let out = '%PDF-1.4\n';
	const at: number[] = [];
	objs.forEach((o, i) => ((at[i] = out.length), (out += `${i + 1} 0 obj\n${o}\nendobj\n`)));
	const xref = out.length;
	out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${at.map((n) => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
	return Buffer.from(out, 'latin1').toString('base64');
}

describe('chats', () => {
	it('keep their own history, and can be searched, pinned, renamed, exported and deleted', async () => {
		const { app, seen } = await testApp({ 'qwen3:8b': [{ content: 'Paris is the capital of France.' }, { content: 'Seven.' }] });
		const server = await buildServer(app, { webDir: '/nonexistent', detect: async () => pc });
		const a = (await server.inject({ method: 'POST', url: '/api/conversations' })).json().id;
		const b = (await server.inject({ method: 'POST', url: '/api/conversations' })).json().id;
		await receive(app, { userId: app.owner, text: '/standard What is the capital of France?', channel: 'web', conversationId: a });
		await receive(app, { userId: app.owner, text: '/standard How many days are in a week?', channel: 'web', conversationId: b });
		// The second chat's model saw none of the first chat.
		expect(JSON.stringify(seen.at(-1)!.body.messages)).not.toContain('France');
		expect((await server.inject({ method: 'GET', url: `/api/messages?conversation=${a}` })).json().messages.map((m: any) => m.text)).toEqual(['/standard What is the capital of France?', 'Paris is the capital of France.']);

		const found = (await server.inject({ method: 'GET', url: '/api/conversations?q=paris' })).json().conversations;
		expect(found.map((c: any) => c.id)).toEqual([a]);
		expect(found[0].match).toContain('Paris is the capital');

		await server.inject({ method: 'PATCH', url: `/api/conversations/${b}`, payload: { title: 'Week', pinned: true } });
		const all = (await server.inject({ method: 'GET', url: '/api/conversations' })).json().conversations;
		expect(all[0]).toMatchObject({ id: b, title: 'Week', pinned: true });

		const md = await server.inject({ method: 'GET', url: `/api/conversations/${a}/export` });
		expect(md.headers['content-type']).toContain('text/markdown');
		expect(md.body).toMatch(/^# New chat\n\n\*\*You\*\*, .+\n\n\/standard What is the capital of France\?\n\n\*\*Onyx\*\*/);

		await server.inject({ method: 'DELETE', url: `/api/conversations/${a}` });
		expect((await server.inject({ method: 'GET', url: `/api/messages?conversation=${a}` })).json().messages).toEqual([]);
	});
});

describe('attached files', () => {
	it('reads text, a PDF, and an image through the vision model, and says what came of each', async () => {
		const { app, seen } = await testApp({ 'gemma3:12b': [{ content: 'A receipt for 3 coffees, total $12.50.' }] }, {}, { tiers: parseTiers(WITH_VISION) });
		const r = await readAttachments(app, [
			{ name: 'notes.md', type: 'text/markdown', data: b64('# Plan\nShip on Friday.') },
			{ name: 'report.pdf', type: 'application/pdf', data: pdf('Quarterly revenue rose 12 percent') },
			{ name: 'receipt.jpg', type: 'image/jpeg', data: b64('not really a jpeg') },
			{ name: 'song.mp3', type: 'audio/mpeg', data: b64('xx') },
		], 'How much did I spend?', { userId: app.owner });
		expect(r.text).toContain('Ship on Friday.');
		expect(r.text).toContain('Quarterly revenue rose 12 percent');
		expect(r.text).toContain('A receipt for 3 coffees, total $12.50.');
		expect(r.files).toEqual([
			{ name: 'notes.md', ok: true, note: 'read' },
			{ name: 'report.pdf', ok: true, note: '1 page' },
			{ name: 'receipt.jpg', ok: true, note: 'described by gemma3:12b' },
			{ name: 'song.mp3', ok: false, note: 'could not read: only text, code, PDFs and images can be read' },
		]);
		const asked = seen.find((s) => s.model === 'gemma3:12b')!.body.messages[0].content;
		expect(asked[1]).toEqual({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64('not really a jpeg')}` } });
	});

	it('says plainly when no model reads images, or when it is not downloaded', async () => {
		const { app } = await testApp({});
		const r = await readAttachments(app, [{ name: 'a.png', type: 'image/png', data: b64('x') }], 'what is this', { userId: app.owner });
		expect(r.files[0]!.note).toMatch(/^could not read: no model that reads images is set up: on the Models screen/);
		const v = await testApp({ 'gemma3:12b': [{ status: 404, content: 'model "gemma3:12b" not found, try pulling it first' }] }, {}, { tiers: parseTiers(WITH_VISION) });
		const r2 = await readAttachments(v.app, [{ name: 'a.png', type: 'image/png', data: b64('x') }], 'what is this', { userId: v.app.owner });
		expect(r2.files[0]!.note).toBe('could not read: the image model is not downloaded: on the Models screen, under More models, download gemma3:12b');
	});

	it('reads Notepad\'s "Unicode" (UTF-16) files, and shares the space between files', async () => {
		const { app } = await testApp({});
		const utf16 = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('Héllo from Notepad', 'utf16le')]).toString('base64');
		const long = 'x'.repeat(10_000);
		const r = await readAttachments(app, [{ name: 'note.txt', type: 'text/plain', data: utf16 }, { name: 'a.txt', type: 'text/plain', data: b64(long) }, { name: 'b.txt', type: 'text/plain', data: b64(long) }], 'q', { userId: app.owner, maxChars: 9000 });
		expect(r.text).toContain('Héllo from Notepad');
		expect(r.files.map((f) => f.note)).toEqual(['read', 'read, the start', 'read, the start']);
		// Three files share 9,000 characters: 3,000 each, plus the labels.
		expect(r.text.length).toBeLessThan(9000 + 400);
	});
});

describe('fitting the context', () => {
	it('keeps the newest messages that fit, and the newest earlier file for follow-up questions', () => {
		const past = [
			{ direction: 'out', text: 'Revenue rose 12%.', attached: null },
			{ direction: 'in', text: 'Summarise this 📎 report.pdf (1 page)', attached: '[Attached PDF] Quarterly revenue rose 12 percent' },
			{ direction: 'out', text: 'old answer '.repeat(300), attached: null },
		];
		const h = fitHistory(past, 200, true);
		expect(h.map((m) => m.role)).toEqual(['user', 'assistant']);
		expect(h[0]!.content).toContain('Quarterly revenue rose 12 percent');
		// When this message brings its own file, the old file's text is left out.
		expect(fitHistory(past, 200, false)[0]!.content).not.toContain('Quarterly revenue');
		// The budget follows Ollama's context: 1.7 characters per token.
		const before = process.env.OLLAMA_CONTEXT_LENGTH;
		process.env.OLLAMA_CONTEXT_LENGTH = '8192';
		expect(inputBudget()).toBe(13926);
		if (before === undefined) delete process.env.OLLAMA_CONTEXT_LENGTH;
		else process.env.OLLAMA_CONTEXT_LENGTH = before;
	});
});

describe('the chat route, end to end', () => {
	const waitFor = async <T,>(f: () => Promise<T | undefined>): Promise<T> => {
		for (let i = 0; i < 100; i++) {
			const v = await f();
			if (v !== undefined) return v;
			await new Promise((r) => setTimeout(r, 30));
		}
		throw new Error('timed out');
	};

	it('picks the tier, reads the file, names the chat, and remembers the file for the next question', async () => {
		const { app, seen } = await testApp({ 'qwen3:8b': [{ content: 'They ship on Friday.' }, { content: 'Friday, as planned.' }] });
		const server = await buildServer(app, { webDir: '/nonexistent', detect: async () => pc });
		const id = (await server.inject({ method: 'POST', url: '/api/conversations' })).json().id;
		const out = (n: number) => waitFor(async () => {
			const m = (await server.inject({ method: 'GET', url: `/api/messages?conversation=${id}` })).json().messages;
			return m.filter((x: any) => x.direction === 'out').length >= n ? m : undefined;
		});
		const first = await server.inject({ method: 'POST', url: '/api/chat', payload: { text: 'When do they ship?', tier: 'standard', conversation_id: id, attachments: [{ name: 'plan.md', type: 'text/markdown', data: b64('# Plan\nShip on Friday.') }] } });
		expect(first.statusCode).toBe(202);
		let msgs = await out(1);
		expect(msgs.map((m: any) => m.text)).toEqual(['/standard When do they ship?\n\n📎 plan.md (read)', 'They ship on Friday.']);
		// The router was skipped (the tier was chosen), and the model read the file.
		expect(seen.map((s) => s.model)).toEqual(['qwen3:8b']);
		expect(JSON.stringify(seen[0]!.body.messages)).toContain('Ship on Friday.');
		expect((await server.inject({ method: 'GET', url: '/api/conversations' })).json().conversations[0]).toMatchObject({ id, title: 'When do they ship?', messages: 2 });
		// The app is not sent what the file said.
		expect(msgs[0]).not.toHaveProperty('attached');

		await server.inject({ method: 'POST', url: '/api/chat', payload: { text: 'Remind me: which day?', tier: 'standard', conversation_id: id } });
		msgs = await out(2);
		expect(msgs.at(-1).text).toBe('Friday, as planned.');
		expect(JSON.stringify(seen[1]!.body.messages)).toContain('Ship on Friday.');
	});

	it('refuses a chat that does not exist, and a bad chat number', async () => {
		const { app } = await testApp({});
		const server = await buildServer(app, { webDir: '/nonexistent', detect: async () => pc });
		expect((await server.inject({ method: 'POST', url: '/api/chat', payload: { text: 'hi', conversation_id: 999 } })).statusCode).toBe(404);
		expect((await server.inject({ method: 'GET', url: '/api/messages?conversation=-1' })).statusCode).toBe(400);
		expect((await server.inject({ method: 'POST', url: '/api/chat', payload: { text: '' } })).statusCode).toBe(400);
	});

	it('exports a chat under its own name, accents and all', async () => {
		const { app } = await testApp({});
		const server = await buildServer(app, { webDir: '/nonexistent', detect: async () => pc });
		const id = (await server.inject({ method: 'POST', url: '/api/conversations' })).json().id;
		await server.inject({ method: 'PATCH', url: `/api/conversations/${id}`, payload: { title: 'Café plans: "Lisbon"' } });
		const r = await server.inject({ method: 'GET', url: `/api/conversations/${id}/export` });
		expect(r.headers['content-disposition']).toBe(`attachment; filename="Cafe plans Lisbon.md"; filename*=UTF-8''${encodeURIComponent('Café plans Lisbon.md')}`);
	});
});

describe('models', () => {
	it('gpt-oss 20B backs Pro on a 16 GB card, and Gemma 3 reads images', () => {
		const p = plan(pc);
		expect(p.tiers.pro).toBe('gpt-oss:20b');
		expect(p.vision).toBe('gemma3:12b');
		expect(p.env.OLLAMA_KEEP_ALIVE).toBe('30m');
	});

	it('a model can be put on a tier from the Models screen; a chat-only one cannot', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'onyx-'));
		const file = join(dir, 'tiers.local.yaml');
		writeFileSync(file, WITH_VISION);
		const { app } = await testApp({}, {}, { tiers: parseTiers(WITH_VISION) });
		const server = await buildServer(app, { webDir: '/nonexistent', detect: async () => pc, tiersPath: file });
		expect((await server.inject({ method: 'POST', url: '/api/models/assign', payload: { use: 'pro', id: 'phi4:14b' } })).json().error).toContain('cannot call tools');
		expect((await server.inject({ method: 'POST', url: '/api/models/assign', payload: { use: 'pro', id: 'gpt-oss:20b' } })).statusCode).toBe(200);
		expect(parseTiers(readFileSync(file, 'utf8')).models['qwen-pro']).toMatchObject({ id: 'gpt-oss:20b', family: 'gpt-oss', extra: { reasoning_effort: 'low' } });
		expect(app.config.candidates('pro').map((m) => m.id)).toEqual(['gpt-oss:20b']);
		expect((await server.inject({ method: 'POST', url: '/api/models/assign', payload: { use: 'vision', id: 'mistral-small3.2:24b' } })).statusCode).toBe(200);
		expect(app.config.model('gemma-vision').id).toBe('mistral-small3.2:24b');
	});

	it('works on a tiers file from before image reading existed (yours)', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'onyx-'));
		const file = join(dir, 'tiers.local.yaml');
		writeFileSync(file, TIERS_YAML);
		const { app } = await testApp({}, {}, { tiers: parseTiers(TIERS_YAML) });
		const server = await buildServer(app, { webDir: '/nonexistent', detect: async () => pc, tiersPath: file });
		expect((await server.inject({ method: 'POST', url: '/api/models/assign', payload: { use: 'vision', id: 'gemma3:12b' } })).statusCode).toBe(200);
		expect(app.config.file.vision).toEqual({ model: 'vision' });
		expect(app.config.model('vision')).toMatchObject({ id: 'gemma3:12b', family: 'gemma', tools: false });
		expect((await server.inject({ method: 'POST', url: '/api/models/assign', payload: { use: 'pro', id: 'gpt-oss:20b' } })).statusCode).toBe(200);
		expect(app.config.model('qwen-pro')).toMatchObject({ id: 'gpt-oss:20b', family: 'gpt-oss', extra: { reasoning_effort: 'low' } });
		// What was written reads back the same, so it survives a restart.
		expect(parseTiers(readFileSync(file, 'utf8')).vision).toEqual({ model: 'vision' });
	});

	it('the health check asks every tier one small question', async () => {
		const { app } = await testApp({ 'qwen3:4b': [{ content: 'OK' }], 'qwen3:8b': [{ content: 'OK' }], 'qwen3:14b': [{ content: 'OK' }], 'qwen3:30b': [{ status: 404, content: 'model "qwen3:30b" not found' }] });
		const server = await buildServer(app, { webDir: '/nonexistent', detect: async () => pc });
		const r = (await server.inject({ method: 'POST', url: '/api/health' })).json();
		expect(r.results.map((x: any) => [x.tier, x.ok, x.model])).toEqual([['lite', true, 'qwen3:4b'], ['standard', true, 'qwen3:8b'], ['pro', true, 'qwen3:14b'], ['max', false, 'qwen3:30b']]);
		expect(r.results[3].error).toContain('not found');
		expect((await server.inject({ method: 'GET', url: '/api/health/last' })).json().at).toBe(r.at);
	});

	it("loads Lite's and Standard's models when Onyx starts", async () => {
		const { app } = await testApp({});
		const asked: string[] = [];
		const state: WarmState = {};
		await warmUp(app, state, (async (url: string, init: any) => (asked.push(`${url} ${JSON.parse(init.body).model}`), new Response('{}'))) as never);
		expect(asked).toEqual(['http://ollama.test/api/generate qwen3:4b', 'http://ollama.test/api/generate qwen3:8b']);
		expect(state).toEqual({ 'qwen3:4b': 'ready', 'qwen3:8b': 'ready' });
	});
});

describe('backups', () => {
	it('copies the database into the folder and keeps only the newest', async () => {
		const { app } = await testApp({});
		const dir = mkdtempSync(join(tmpdir(), 'onyx-backup-'));
		for (const d of ['2026-01-01-09-00', '2026-01-02-09-00']) writeFileSync(join(dir, `onyx-${d}.db`), 'old');
		const r = await backupNow(app, { dir, keep: 2 });
		expect(readdirSync(dir).sort()).toEqual(['onyx-2026-01-02-09-00.db', r.file.split(/[\\/]/).pop()].sort());
		expect(readFileSync(r.file).subarray(0, 15).toString()).toBe('SQLite format 3');
		await expect(backupNow(app, { dir: null, keep: 7 })).rejects.toThrow('Choose a backup folder first.');
	});
});

describe('your own config files', () => {
	it('prices in equivalents.local.yaml are laid over the shipped ones, which updates replace', () => {
		const dir = mkdtempSync(join(tmpdir(), 'onyx-cfg-'));
		const base = join(dir, 'equivalents.yaml');
		writeFileSync(base, 'equivalents:\n  "qwen3:8b": { name: shipped, input: 0.18, output: 0.70, source: "x" }\n  "gpt-oss:20b": { name: shipped, input: 0.05, output: 0.20, source: "x" }\n');
		writeFileSync(localOf(base), 'equivalents:\n  "qwen3:8b": { name: mine, input: 1, output: 2, source: "my own" }\n');
		expect(localOf(base)).toBe(join(dir, 'equivalents.local.yaml'));
		expect(loadEquivalents(base)).toEqual({ 'qwen3:8b': { name: 'mine', input: 1, output: 2, source: 'my own' }, 'gpt-oss:20b': { name: 'shipped', input: 0.05, output: 0.2, source: 'x' } });
	});
});

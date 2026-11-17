import { describe, expect, it } from 'vitest';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseTiers } from '../src/config.ts';
import { buildServer, receive } from '../src/index.ts';
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
	it('reads text, a PDF, and an image through the vision model', async () => {
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
		expect(r.notes).toEqual(['read notes.md', 'read 1 page of report.pdf', 'gemma3:12b looked at receipt.jpg', 'could not read song.mp3: only text, code, PDFs and images can be read']);
		const asked = seen.find((s) => s.model === 'gemma3:12b')!.body.messages[0].content;
		expect(asked[1]).toEqual({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64('not really a jpeg')}` } });
	});

	it('says plainly when no model reads images', async () => {
		const { app } = await testApp({});
		const r = await readAttachments(app, [{ name: 'a.png', type: 'image/png', data: b64('x') }], 'what is this', { userId: app.owner });
		expect(r.notes[0]).toMatch(/^could not read a\.png: no model that reads images/);
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
		expect(readFileSync(file, 'utf8')).toMatch(/qwen-pro: +\{ provider: ollama, id: "?gpt-oss:20b"?, price: \{ input: 0, output: 0 \}, extra: \{ reasoning_effort: low \} \}/);
		expect(app.config.candidates('pro').map((m) => m.id)).toEqual(['gpt-oss:20b']);
		expect((await server.inject({ method: 'POST', url: '/api/models/assign', payload: { use: 'vision', id: 'mistral-small3.2:24b' } })).statusCode).toBe(200);
		expect(app.config.model('gemma-vision').id).toBe('mistral-small3.2:24b');
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

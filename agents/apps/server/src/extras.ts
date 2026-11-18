// The everyday comforts: separate chats you can search, pin, rename and export; attached files and images; models
// loaded before the first message; a one-click check of every tier; trying other models; backups; starting with
// Windows. Each is small; they share this file so index.ts stays the map of the API.
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { sql } from 'kysely';
import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { TIERS, type Tier } from '@onyx/shared';
import type { App } from './app.ts';
import { now } from './db.ts';
import { applyToTiers, CATALOG, catalogEntry, familyOf, type Plan } from './hardware.ts';
import { ROOT, parseTiers } from './config.ts';
import { writeFileSync } from 'node:fs';
import { inputBudget } from './context.ts';
import { pullWith, type Pull } from './setup.ts';

/* ---------- attachments ---------- */

export const Attachment = z.object({ name: z.string().trim().min(1).max(200), type: z.string().max(100).default(''), data: z.string().max(14_000_000) });
export type Attachment = z.infer<typeof Attachment>;
const TEXTY = /\.(txt|md|markdown|csv|tsv|json|ya?ml|xml|html?|css|js|jsx|ts|tsx|py|rb|go|rs|java|c|cc|cpp|h|hpp|cs|php|sh|ps1|bat|sql|toml|ini|log)$/i;
export interface FileResult { name: string; ok: boolean; note: string }

/** Text from a file's bytes: UTF-8, or UTF-16 when it starts with that byte-order mark (Windows Notepad's "Unicode"). */
function decode(bytes: Buffer): string {
	if (bytes[0] === 0xff && bytes[1] === 0xfe) return bytes.subarray(2).toString('utf16le');
	if (bytes[0] === 0xfe && bytes[1] === 0xff) return Buffer.from(bytes.subarray(2)).swap16().toString('utf16le');
	return bytes.toString('utf8').replace(/^\uFEFF/, '');
}

/**
 * Turns attached files into text the agents can read: text and code as they are, a PDF's text, and an image described
 * by the vision model. The files share `maxChars` evenly, so together they fit the model's context. Returns that text,
 * and what came of each file, for the message ("2 pages", "could not read: ...").
 */
export async function readAttachments(app: App, files: Attachment[], question: string, o: { runId?: string; userId: string; maxChars?: number }): Promise<{ text: string; files: FileResult[] }> {
	const parts: string[] = [];
	const results: FileResult[] = [];
	const share = Math.max(2000, Math.floor((o.maxChars ?? Math.round(inputBudget() * 0.75)) / Math.max(1, files.length)));
	const fit = (t: string) => (t.length > share ? `${t.slice(0, share)}\n[cut short here, to fit the model's context]` : t);
	for (const f of files) {
		const bytes = Buffer.from(f.data, 'base64');
		try {
			if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) {
				const { extractText, getDocumentProxy } = await import('unpdf');
				const pdf = await getDocumentProxy(new Uint8Array(bytes));
				const { totalPages, text } = await extractText(pdf, { mergePages: true });
				const t = String(text).trim();
				if (!t) throw new Error('it has no text to read (a scanned PDF needs reading as images)');
				parts.push(`[Attached PDF "${f.name}", ${totalPages} page${totalPages === 1 ? '' : 's'}]\n${fit(t)}`);
				results.push({ name: f.name, ok: true, note: `${totalPages} page${totalPages === 1 ? '' : 's'}${t.length > share ? ', the start' : ''}` });
			} else if (f.type.startsWith('image/')) {
				const key = app.config.file.vision?.model;
				if (!key || !app.config.file.models[key]) throw new Error('no model that reads images is set up: on the Models screen, under More models, download gemma3:12b and choose "Reading images"');
				const r = await app.gateway.complete({
					userId: o.userId, runId: o.runId ?? null, tier: 'standard', modelKey: key, purpose: 'vision', allowTierDrop: false, maxTokens: 900,
					// Ollama takes images the OpenAI way: a content list with the picture as a data URL.
					messages: [{ role: 'user', content: [{ type: 'text', text: `Describe this image in detail for someone who cannot see it, so they can answer: "${question.slice(0, 500)}". Copy out any text in it exactly.` }, { type: 'image_url', image_url: { url: `data:${f.type};base64,${f.data}` } }] as never }],
				});
				parts.push(`[Attached image "${f.name}", as described by ${r.model}]\n${fit(r.content.trim())}`);
				results.push({ name: f.name, ok: true, note: `described by ${r.model}` });
			} else if (f.type.startsWith('text/') || f.type === 'application/json' || TEXTY.test(f.name)) {
				const t = decode(bytes);
				parts.push(`[Attached file "${f.name}"]\n${fit(t)}`);
				results.push({ name: f.name, ok: true, note: t.length > share ? 'read, the start' : 'read' });
			} else throw new Error('only text, code, PDFs and images can be read');
		} catch (e) {
			let why = (e as Error).message;
			const vision = app.config.file.vision?.model ? app.config.file.models[app.config.file.vision.model]?.id : undefined;
			if (f.type.startsWith('image/') && /not found/i.test(why)) why = `the image model is not downloaded: on the Models screen, under More models, download ${vision ?? 'gemma3:12b'}`;
			parts.push(`[Attached "${f.name}" could not be read: ${why}. Tell the person.]`);
			results.push({ name: f.name, ok: false, note: `could not read: ${why}` });
		}
	}
	return { text: parts.join('\n\n'), files: results };
}

/* ---------- loading models before the first message ---------- */

export type WarmState = Record<string, 'loading' | 'ready' | 'failed'>;
/**
 * Loads Lite's and Standard's models into the graphics card when Onyx starts, one after the other, so the first
 * message does not wait for them. Ollama keeps them loaded for OLLAMA_KEEP_ALIVE (30 minutes with Onyx's settings).
 */
export async function warmUp(app: App, state: WarmState, fetchImpl: typeof fetch = fetch): Promise<void> {
	const base = app.config.baseUrl('ollama').replace(/\/v1\/?$/, '');
	const ids = [...new Set((['lite', 'standard'] as Tier[]).map((t) => app.config.candidates(t).find((m) => app.config.file.providers[m.provider]!.local)?.id).filter(Boolean) as string[])];
	for (const id of ids) state[id] = 'loading';
	for (const id of ids) {
		try {
			const res = await fetchImpl(`${base}/api/generate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: id, keep_alive: '30m' }), signal: AbortSignal.timeout(180_000) });
			state[id] = res.ok ? 'ready' : 'failed';
		} catch {
			state[id] = 'failed';
		}
	}
}

/* ---------- trying other models ---------- */

export type Pulls = Record<string, { status: string; done: number; total: number; error: string | null; finished: boolean }>;
/** Downloads a model through Ollama, keeping its progress for the Models screen. */
export async function pull(app: App, id: string, pulls: Pulls, download: (base: string) => Pull = (base) => pullWith(base)): Promise<void> {
	const base = app.config.baseUrl('ollama').replace(/\/v1\/?$/, '');
	const p: Pulls[string] = { status: 'starting', done: 0, total: 0, error: null, finished: false };
	pulls[id] = p;
	// Ollama reports each layer of the model in turn; the total is all of them.
	p.error = await download(base)(id, (done, total, status) => {
		p.status = status;
		if (total) (p.done = done), (p.total = total);
	});
	p.finished = true;
}

/* ---------- backups ---------- */

export interface BackupSettings { dir: string | null; keep: number }
/** Copies the database (history, memories, reminders, settings) into the backup folder, keeping the newest `keep`. */
export async function backupNow(app: App, s: BackupSettings): Promise<{ file: string; at: string }> {
	if (!s.dir) throw new Error('Choose a backup folder first.');
	mkdirSync(s.dir, { recursive: true });
	const at = now();
	const file = join(s.dir, `onyx-${at.slice(0, 16).replace(/[:T]/g, '-')}.db`);
	if (existsSync(file)) unlinkSync(file);
	// VACUUM INTO writes a clean, consistent copy while Onyx keeps running.
	await sql`vacuum into ${file}`.execute(app.db);
	const old = readdirSync(s.dir).filter((f) => /^onyx-[\d-]+\.db$/.test(f)).sort().reverse().slice(s.keep);
	for (const f of old) unlinkSync(join(s.dir, f));
	await app.db.insertInto('settings').values({ key: 'backup_last', value: JSON.stringify({ file, at }) }).onConflict((c) => c.column('key').doUpdateSet({ value: JSON.stringify({ file, at }) })).execute();
	return { file, at };
}
/** A sensible place to suggest: OneDrive when it is there (so it is off the PC too), else Documents. */
export function suggestedBackupDir(): string {
	const one = process.env.OneDrive ?? join(homedir(), 'OneDrive');
	return existsSync(one) ? join(one, 'Onyx backups') : join(homedir(), 'Documents', 'Onyx backups');
}

/* ---------- starting with Windows ---------- */

const STARTUP_LINK = join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'Onyx.lnk');
export const autostartSupported = (): boolean => process.platform === 'win32';
export const autostartOn = (): boolean => autostartSupported() && existsSync(STARTUP_LINK);
/** Puts a shortcut in the Startup folder that starts Onyx minimized, without opening the browser; or removes it. */
export async function setAutostart(on: boolean): Promise<void> {
	if (!autostartSupported()) throw new Error('Starting with the PC is set up on Windows only.');
	if (!on) return void (existsSync(STARTUP_LINK) && unlinkSync(STARTUP_LINK));
	const bat = resolve(ROOT, 'Start Onyx.bat').replace(/'/g, "''");
	const ps = `$s = (New-Object -ComObject WScript.Shell).CreateShortcut('${STARTUP_LINK.replace(/'/g, "''")}'); $s.TargetPath = '${bat}'; $s.Arguments = '/background'; $s.WorkingDirectory = '${ROOT.replace(/'/g, "''")}'; $s.WindowStyle = 7; $s.Description = 'Starts Onyx when you sign in'; $s.Save()`;
	await new Promise<void>((done, fail) => execFile('powershell', ['-NoProfile', '-Command', ps], { windowsHide: true, timeout: 20000 }, (err) => (err ? fail(err) : done())));
}

/* ---------- the routes ---------- */

const Conv = z.coerce.number().int().min(0);
const title = (text: string) => text.replace(/^\/(lite|standard|pro|max|think)\s*/i, '').replace(/\s+/g, ' ').trim().slice(0, 60) || 'New chat';

export function registerExtras(server: FastifyInstance, app: App, o: { plan: () => Promise<Plan>; ollamaFetch?: typeof fetch; download?: (base: string) => Pull; warm: WarmState; readTiers: () => string; tiersOut: string }) {
	const db = app.db;
	const pulls: Pulls = {};
	const setting = async <T>(key: string, fallback: T): Promise<T> => {
		const row = await db.selectFrom('settings').select('value').where('key', '=', key).executeTakeFirst();
		return row ? JSON.parse(row.value) : fallback;
	};
	const save = (key: string, value: unknown) => db.insertInto('settings').values({ key, value: JSON.stringify(value) }).onConflict((c) => c.column('key').doUpdateSet({ value: JSON.stringify(value) })).execute();

	/* Chats. Id 0 stands for the messages that belong to none: phones and reminders. */
	server.get('/api/conversations', async (req) => {
		const { q } = z.object({ q: z.string().trim().max(200).default('') }).parse(req.query);
		const like = `%${q.replace(/[%_]/g, (c) => `\\${c}`)}%`;
		let rows = db.selectFrom('conversations').selectAll().select((eb) => eb.selectFrom('messages').select((e) => e.fn.countAll<number>().as('n')).whereRef('messages.conversation_id', '=', 'conversations.id').as('messages')).where('user_id', '=', app.owner);
		if (q) rows = rows.where((eb) => eb.or([eb('title', 'like', like), eb.exists(eb.selectFrom('messages').select('id').whereRef('messages.conversation_id', '=', 'conversations.id').where(sql<boolean>`text like ${like} escape '\\'`))]));
		const list = await rows.orderBy('pinned', 'desc').orderBy('updated_at', 'desc').limit(200).execute();
		// For a search, the first matching line of each chat, to show why it matched.
		const hits: Record<number, string> = {};
		if (q) for (const c of list) {
			const m = await db.selectFrom('messages').select('text').where('conversation_id', '=', c.id).where(sql<boolean>`text like ${like} escape '\\'`).orderBy('id', 'desc').executeTakeFirst();
			if (m) {
				const i = m.text.toLowerCase().indexOf(q.toLowerCase());
				hits[c.id] = `${i > 40 ? '…' : ''}${m.text.slice(Math.max(0, i - 40), i + 80).replace(/\s+/g, ' ')}`;
			}
		}
		const other = await db.selectFrom('messages').select(['created_at']).where('user_id', '=', app.owner).where('conversation_id', 'is', null).orderBy('id', 'desc').executeTakeFirst();
		return { conversations: list.map((c) => ({ ...c, pinned: !!c.pinned, messages: Number(c.messages ?? 0), match: hits[c.id] ?? null })), other: other ? { updated_at: other.created_at } : null };
	});
	server.post('/api/conversations', async () => {
		const c = await db.insertInto('conversations').values({ user_id: app.owner, title: 'New chat', pinned: 0, created_at: now(), updated_at: now() }).returning('id').executeTakeFirstOrThrow();
		return { id: Number(c.id) };
	});
	server.patch('/api/conversations/:id', async (req, reply) => {
		const id = Conv.parse((req.params as { id: string }).id);
		const body = z.object({ title: z.string().trim().min(1).max(120).optional(), pinned: z.boolean().optional() }).safeParse(req.body);
		if (!body.success) return reply.code(400).send({ error: body.error.issues[0]?.message });
		const set: { title?: string; pinned?: number } = {};
		if (body.data.title) set.title = body.data.title;
		if (body.data.pinned !== undefined) set.pinned = body.data.pinned ? 1 : 0;
		const r = await db.updateTable('conversations').set(set).where('id', '=', id).where('user_id', '=', app.owner).executeTakeFirst();
		return Number(r.numUpdatedRows) ? { saved: true } : reply.code(404).send({ error: 'No such chat.' });
	});
	server.delete('/api/conversations/:id', async (req) => {
		const id = Conv.parse((req.params as { id: string }).id);
		await db.deleteFrom('messages').where('conversation_id', '=', id).where('user_id', '=', app.owner).execute();
		return { deleted: Number((await db.deleteFrom('conversations').where('id', '=', id).where('user_id', '=', app.owner).executeTakeFirst()).numDeletedRows) };
	});
	server.get('/api/conversations/:id/export', async (req, reply) => {
		const id = Conv.parse((req.params as { id: string }).id);
		const c = id ? await db.selectFrom('conversations').selectAll().where('id', '=', id).where('user_id', '=', app.owner).executeTakeFirst() : { title: 'Phone and reminders' };
		if (!c) return reply.code(404).send({ error: 'No such chat.' });
		const msgs = await db.selectFrom('messages').selectAll().where('user_id', '=', app.owner).where((eb) => (id ? eb('conversation_id', '=', id) : eb('conversation_id', 'is', null))).orderBy('id').execute();
		const md = [`# ${c.title}`, '', ...msgs.flatMap((m) => [`**${m.direction === 'in' ? 'You' : 'Onyx'}**, ${m.created_at.slice(0, 16).replace('T', ' ')} UTC${m.channel !== 'web' ? ` (${m.channel})` : ''}`, '', m.text, ''])].join('\n');
		// Characters Windows refuses in file names become spaces; the plain-ASCII fallback spells é as e.
		const name = c.title.replace(/[\\/:*?"<>|\x00-\x1f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) || 'chat';
		const ascii = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]+/g, '').trim() || 'chat';
		return reply.type('text/markdown; charset=utf-8').header('content-disposition', `attachment; filename="${ascii}.md"; filename*=UTF-8''${encodeURIComponent(`${name}.md`)}`).send(md);
	});
	server.get('/api/messages', async (req, reply) => {
		const query = z.object({ conversation: Conv.optional() }).safeParse(req.query);
		if (!query.success) return reply.code(400).send({ error: 'conversation must be a chat number, or 0 for phone and reminders.' });
		const { conversation } = query.data;
		// Not `attached`: what files said can be long, and the app does not show it.
		let q = db.selectFrom('messages').select(['id', 'channel', 'direction', 'text', 'run_id', 'status', 'error', 'created_at', 'conversation_id']).where('user_id', '=', app.owner);
		if (conversation !== undefined) q = q.where((eb) => (conversation === 0 ? eb('conversation_id', 'is', null) : eb('conversation_id', '=', conversation)));
		return { messages: (await q.orderBy('id', 'desc').limit(200).execute()).reverse() };
	});
	/** The first message names a new chat. */
	const nameChat = async (id: number, text: string) => {
		await db.updateTable('conversations').set({ title: title(text) }).where('id', '=', id).where('title', '=', 'New chat').execute();
	};

	/* Models loaded before the first message. */
	server.get('/api/warmup', async () => ({ models: o.warm, ready: Object.values(o.warm).every((s) => s !== 'loading') }));

	/* Every tier, checked with one small question each. */
	server.post('/api/health', async () => {
		const results = [];
		for (const tier of TIERS) {
			const started = Date.now();
			try {
				const r = await app.gateway.complete({ userId: app.owner, tier, purpose: 'health', allowTierDrop: false, maxTokens: 1500, deadline: Date.now() + 180_000, messages: [{ role: 'user', content: 'Reply with the single word: OK' }] });
				results.push({ tier, ok: true, model: r.model, ms: Date.now() - started, answer: r.content.trim().slice(0, 80), fallbacks: r.fallbacks.length, error: null });
			} catch (e) {
				results.push({ tier, ok: false, model: app.config.candidates(tier)[0]?.id ?? null, ms: Date.now() - started, answer: null, fallbacks: 0, error: (e as Error).message });
			}
		}
		const at = now();
		await save('health_last', { at, results });
		return { at, results };
	});
	server.get('/api/health/last', async () => setting('health_last', null));

	/* Other models: what fits, what is downloaded, downloading one, and using it for a tier. */
	server.get('/api/models/catalog', async () => {
		const p = await o.plan();
		const base = app.config.baseUrl('ollama').replace(/\/v1\/?$/, '');
		const downloads = structuredClone(pulls);
		const installed = await (o.ollamaFetch ?? fetch)(`${base}/api/tags`, { signal: AbortSignal.timeout(5000) }).then((r) => r.json() as Promise<{ models?: { name: string }[] }>).then((j) => (j.models ?? []).map((m) => m.name.replace(/:latest$/, '')), () => null);
		const using: Record<string, string[]> = {};
		for (const t of TIERS) for (const m of app.config.candidates(t)) (using[m.id] ??= []).push(t);
		const vision = app.config.file.vision?.model ? app.config.file.models[app.config.file.vision.model]?.id : undefined;
		if (vision) (using[vision] ??= []).push('vision');
		return { context: p.context, recommended: { ...p.tiers, vision: p.vision }, models: p.fits.map((f) => ({ ...f, installed: installed ? installed.includes(f.id) : null, using: using[f.id] ?? [], equivalent: app.config.equivalents[f.id] ?? null })), pulls: downloads };
	});
	server.post('/api/models/pull', async (req, reply) => {
		const body = z.object({ id: z.string() }).safeParse(req.body);
		if (!body.success || !catalogEntry(body.data.id)) return reply.code(400).send({ error: `Onyx only downloads models from its list: ${CATALOG.map((m) => m.id).join(', ')}.` });
		if (pulls[body.data.id] && !pulls[body.data.id]!.finished) return { started: false };
		void pull(app, body.data.id, pulls, o.download);
		return reply.code(202).send({ started: true });
	});
	// A tier tries a cloud model first (key), or goes back to its local models only (null). The tier's other cloud
	// models are taken off it, so one cloud model at a time leads each tier. Its local models stay, as the fallback.
	server.post('/api/models/cloud', async (req, reply) => {
		const body = z.object({ use: z.enum(TIERS), key: z.string().nullable() }).safeParse(req.body);
		if (!body.success) return reply.code(400).send({ error: body.error.issues[0]?.message });
		const { use, key } = body.data;
		const cloudKey = (k: string) => !!app.config.file.models[k] && !app.config.file.providers[app.config.file.models[k]!.provider]!.local;
		if (key !== null && !cloudKey(key)) return reply.code(400).send({ error: `There is no cloud model called "${key}".` });
		const { parseDocument } = await import('yaml');
		const doc = parseDocument(o.readTiers());
		const list = app.config.file.tiers[use].models.filter((k) => !cloudKey(k));
		doc.setIn(['tiers', use, 'models'], doc.createNode(key ? [key, ...list] : list, { flow: true }));
		const yaml = doc.toString({ lineWidth: 0 });
		try {
			const file = parseTiers(yaml);
			writeFileSync(o.tiersOut, yaml);
			app.config.replace(file);
		} catch (e) {
			return reply.code(500).send({ error: `The new tiers file did not check out: ${(e as Error).message}` });
		}
		return { tiers: app.config.publicTiers() };
	});
	server.post('/api/models/assign', async (req, reply) => {
		const body = z.object({ use: z.enum([...TIERS, 'vision'] as [string, ...string[]]), id: z.string() }).safeParse(req.body);
		if (!body.success) return reply.code(400).send({ error: body.error.issues[0]?.message });
		const entry = catalogEntry(body.data.id);
		if (!entry) return reply.code(400).send({ error: 'That model is not on Onyx\'s list.' });
		if (body.data.use === 'vision' && !entry.vision) return reply.code(400).send({ error: `${entry.id} cannot read images.` });
		if (body.data.use !== 'vision' && !entry.tools) return reply.code(400).send({ error: `${entry.id} cannot call tools, which every agent needs, so it cannot back a tier.` });
		let yaml = o.readTiers();
		if (body.data.use === 'vision') {
			const { parseDocument } = await import('yaml');
			const doc = parseDocument(yaml);
			const key = app.config.file.vision?.model ?? 'vision';
			if (!app.config.file.models[key]) doc.setIn(['models', key], doc.createNode({ provider: 'ollama', id: entry.id, family: familyOf(entry.id), price: { input: 0, output: 0 }, tools: false }, { flow: true }));
			else (doc.setIn(['models', key, 'id'], entry.id), doc.setIn(['models', key, 'family'], familyOf(entry.id)));
			doc.setIn(['vision'], doc.createNode({ model: key }));
			yaml = doc.toString({ lineWidth: 0 });
		} else yaml = (await applyToTiers(yaml, { [body.data.use]: entry.id } as Plan['tiers'])).yaml;
		try {
			const file = parseTiers(yaml);
			// Always into tiers.local.yaml: this PC's choice, which updates never overwrite.
			writeFileSync(o.tiersOut, yaml);
			app.config.replace(file);
		} catch (e) {
			return reply.code(500).send({ error: `The new tiers file did not check out: ${(e as Error).message}` });
		}
		return { tiers: app.config.publicTiers() };
	});

	/* Backups. */
	const backupSettings = () => setting<BackupSettings>('backup', { dir: null, keep: 7 });
	server.get('/api/backup', async () => ({ ...(await backupSettings()), suggested: suggestedBackupDir(), last: await setting<{ file: string; at: string } | null>('backup_last', null) }));
	server.put('/api/backup', async (req, reply) => {
		const body = z.object({ dir: z.string().trim().min(3).max(400).nullable(), keep: z.number().int().min(1).max(60).default(7) }).safeParse(req.body);
		if (!body.success) return reply.code(400).send({ error: body.error.issues[0]?.message });
		await save('backup', body.data);
		return { saved: true };
	});
	server.post('/api/backup/now', async (_req, reply) => {
		try {
			return await backupNow(app, await backupSettings());
		} catch (e) {
			return reply.code(400).send({ error: `The backup failed: ${(e as Error).message}` });
		}
	});
	// Once a day while Onyx runs: checked two minutes after it starts, then every hour.
	const due = async () => {
		const s = await backupSettings().catch(() => null);
		const last = await setting<{ at: string } | null>('backup_last', null).catch(() => null);
		if (s?.dir && (!last || Date.now() - Date.parse(last.at) > 23 * 3600_000)) await backupNow(app, s).catch((e) => console.log(`  backup failed: ${(e as Error).message}`));
	};
	const daily = setInterval(() => void due(), 3600_000);
	const first = setTimeout(() => void due(), 120_000);
	daily.unref();
	first.unref();
	server.addHook('onClose', async () => (clearInterval(daily), clearTimeout(first)));

	/* Starting with Windows. */
	server.get('/api/autostart', async () => ({ supported: autostartSupported(), on: autostartOn() }));
	server.put('/api/autostart', async (req, reply) => {
		const body = z.object({ on: z.boolean() }).safeParse(req.body);
		if (!body.success) return reply.code(400).send({ error: 'Send { on: true } or { on: false }.' });
		try {
			await setAutostart(body.data.on);
			return { on: autostartOn() };
		} catch (e) {
			return reply.code(400).send({ error: (e as Error).message });
		}
	});

	return { nameChat };
}


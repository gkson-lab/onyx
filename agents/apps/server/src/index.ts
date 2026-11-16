// The server: the API the app uses, and a WebSocket that carries every agent event as it happens. It listens on this
// machine only (127.0.0.1). Keys never leave the server: the API reports whether one is set, never its value.
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Fastify, { type FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import { sql } from 'kysely';
import { z } from 'zod';
import { AgentDef, Channel, CHANNELS, TIERS, type ChatMessage } from '@onyx/shared';
import { createApp, type App } from './app.ts';
import { parseTiers, ROOT } from './config.ts';
import { now, today } from './db.ts';
import { listModels } from './models/provider.ts';

const ChatBody = z.object({ text: z.string().trim().min(1).max(20000) });
const SettingsBody = z.object({ preferred_channels: z.array(Channel).min(1).max(4).optional(), allowlist: z.array(z.string().trim().min(3).max(64)).max(50).optional() });
const KEYS = ['MOONSHOT_API_KEY', 'BRAVE_API_KEY', 'GITHUB_MCP_TOKEN', 'WHATSAPP_TOKEN', 'TWILIO_AUTH_TOKEN'];

/** Takes a message in, runs it, stores both sides, and sends the answer out on the channel it came from. */
export async function receive(app: App, o: { userId: string; text: string; channel: Channel; runId?: string }) {
	const past = await app.db.selectFrom('messages').select(['direction', 'text']).where('user_id', '=', o.userId).where('status', '!=', 'failed').orderBy('id', 'desc').limit(10).execute();
	const history: ChatMessage[] = past.reverse().map((m) => ({ role: m.direction === 'in' ? 'user' : 'assistant', content: m.text.slice(0, 4000) }));
	await app.db.insertInto('messages').values({ user_id: o.userId, channel: o.channel, direction: 'in', text: o.text, run_id: o.runId ?? null, status: 'received', error: null, created_at: now() }).execute();
	const r = await app.runtime.handle({ userId: o.userId, text: o.text, channel: o.channel, history, runId: o.runId });
	const reply = r.status === 'done' ? r.output : r.status === 'killed' ? 'Stopped.' : `That failed: ${r.error}`;
	if (o.channel === 'web' || o.channel === 'terminal') await app.db.insertInto('messages').values({ user_id: o.userId, channel: o.channel, direction: 'out', text: reply, run_id: r.runId, status: r.status === 'done' ? 'sent' : 'error', error: r.error, created_at: now() }).execute();
	else await app.outbox.deliver(o.userId, reply, { channel: o.channel, runId: r.runId });
	return { ...r, reply };
}

export async function buildServer(app: App, o: { tiersPath?: string; webDir?: string } = {}): Promise<FastifyInstance> {
	const server = Fastify({ logger: false, bodyLimit: 1_000_000 });
	await server.register(websocket);
	const tiersPath = o.tiersPath ?? resolve(ROOT, 'config/tiers.yaml');
	const db = app.db;
	const bad = (reply: any, e: z.ZodError) => reply.code(400).send({ error: e.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ') });

	server.get('/health', async () => ({ ok: true }));
	server.get('/ws', { websocket: true }, (socket) => {
		const off = app.bus.on((e) => socket.readyState === 1 && socket.send(JSON.stringify(e)));
		socket.on('close', off);
		socket.on('error', off);
	});

	/* ---------- chat ---------- */
	server.post('/api/chat', async (req, reply) => {
		const body = ChatBody.safeParse(req.body);
		if (!body.success) return bad(reply, body.error);
		const runId = randomUUID();
		// The run goes on after this answers; its progress and its result arrive on the WebSocket and at /api/runs/:id.
		void receive(app, { userId: app.owner, text: body.data.text, channel: 'web', runId }).catch((e) => app.bus.emit({ type: 'error', at: now(), runId, rootId: runId, parentId: null, agentId: 'core', data: { status: 'error', error: (e as Error).message } }));
		return reply.code(202).send({ runId });
	});
	server.get('/api/messages', async () => ({ messages: (await db.selectFrom('messages').selectAll().where('user_id', '=', app.owner).orderBy('id', 'desc').limit(60).execute()).reverse() }));

	/* ---------- runs ---------- */
	server.get('/api/runs', async (req) => {
		const q = z.object({ channel: Channel.optional(), agent: z.string().optional(), tier: z.enum(TIERS).optional(), status: z.string().optional(), limit: z.coerce.number().int().min(1).max(200).default(50) }).parse(req.query);
		// One row per message: the root run, with the tokens and cost of everything under it.
		const roots = await db.selectFrom('runs as r').select(['r.id', 'r.agent_id', 'r.channel', 'r.status', 'r.input', 'r.tier', 'r.model', 'r.started_at', 'r.finished_at', 'r.error'])
			.select((eb) => [
				eb.selectFrom('runs as c').select((e) => e.fn.sum<number>(sql`c.tokens_in + c.tokens_out`).as('t')).whereRef('c.root_id', '=', 'r.id').as('tokens'),
				eb.selectFrom('runs as c').select((e) => e.fn.sum<number>('c.cost_usd').as('t')).whereRef('c.root_id', '=', 'r.id').as('cost_usd'),
				eb.selectFrom('runs as c').select((e) => e.fn.countAll<number>().as('t')).whereRef('c.root_id', '=', 'r.id').as('agents'),
			])
			.where('r.parent_id', 'is', null)
			.$if(!!q.channel, (b) => b.where('r.channel', '=', q.channel!))
			.$if(!!q.tier, (b) => b.where('r.tier', '=', q.tier!))
			.$if(!!q.status, (b) => b.where('r.status', '=', q.status!))
			.$if(!!q.agent, (b) => b.where((eb) => eb.exists(eb.selectFrom('runs as c').select('c.id').whereRef('c.root_id', '=', 'r.id').where('c.agent_id', '=', q.agent!))))
			.orderBy('r.started_at', 'desc').limit(q.limit).execute();
		return { runs: roots, running: app.runtime.running() };
	});
	server.get('/api/runs/:id', async (req, reply) => {
		const { id } = req.params as { id: string };
		const runs = await db.selectFrom('runs').selectAll().where('root_id', '=', id).orderBy('started_at').execute();
		if (!runs.length) return reply.code(404).send({ error: 'No run has that id.' });
		const steps = await db.selectFrom('steps').selectAll().where('root_id', '=', id).orderBy('id').execute();
		return { runs: runs.map((r) => ({ ...r, routing: r.routing ? JSON.parse(r.routing) : null })), steps: steps.map((s) => ({ ...s, data: JSON.parse(s.data) })) };
	});
	server.post('/api/runs/:id/kill', async (req) => ({ stopped: app.runtime.kill((req.params as { id: string }).id) }));

	/* ---------- agents ---------- */
	server.get('/api/agents', async () => ({ agents: await app.runtime.agents(), tools: app.tools.list(), connectors: app.connectors.status().map((c) => c.id) }));
	server.put('/api/agents/:id', async (req, reply) => {
		const { id } = req.params as { id: string };
		const existing = await app.runtime.agent(id);
		const parsed = AgentDef.safeParse({ ...(req.body as object), id, builtin: existing?.builtin ?? false });
		if (!parsed.success) return bad(reply, parsed.error);
		if (id === 'core' && !parsed.data.enabled) return reply.code(400).send({ error: 'Onyx Core receives every message, so it cannot be switched off.' });
		await app.runtime.saveAgent(parsed.data);
		return { agent: parsed.data };
	});
	server.delete('/api/agents/:id', async (req, reply) => {
		const a = await app.runtime.agent((req.params as { id: string }).id);
		if (!a) return reply.code(404).send({ error: 'No agent has that id.' });
		if (a.builtin) return reply.code(400).send({ error: 'Built-in agents can be switched off, not deleted.' });
		await db.deleteFrom('agents').where('id', '=', a.id).execute();
		return { deleted: a.id };
	});

	/* ---------- models, tiers, usage ---------- */
	server.get('/api/tiers', async () => ({ tiers: app.config.publicTiers(), cloud: app.config.cloud, plans: app.config.file.plans }));
	server.get('/api/tiers/raw', async () => ({ yaml: readFileSync(tiersPath, 'utf8') }));
	server.put('/api/tiers/raw', async (req, reply) => {
		const body = z.object({ yaml: z.string().min(10).max(50000) }).safeParse(req.body);
		if (!body.success) return bad(reply, body.error);
		try {
			const file = parseTiers(body.data.yaml);
			writeFileSync(tiersPath, body.data.yaml);
			app.config.replace(file);
			return { tiers: app.config.publicTiers() };
		} catch (e) {
			return reply.code(400).send({ error: e instanceof z.ZodError ? e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') : `Not valid YAML: ${(e as Error).message}` });
		}
	});
	server.get('/api/models', async () => {
		const stats = await db.selectFrom('model_calls').select(['model_key']).select((eb) => [eb.fn.countAll<number>().as('calls'), eb.fn.sum<number>(sql`case when status = 'error' then 1 else 0 end`).as('errors'), eb.fn.avg<number>(sql`case when status = 'ok' then latency_ms end`).as('latency_ms'), eb.fn.sum<number>(sql`input_tokens + output_tokens`).as('tokens'), eb.fn.sum<number>('cost_usd').as('cost_usd'), eb.fn.max('created_at').as('last_used')]).groupBy('model_key').execute();
		const available: Record<string, string[] | { error: string }> = {};
		await Promise.all(Object.keys(app.config.file.providers).filter((p) => app.config.usable(p)).map(async (p) => {
			available[p] = await listModels(app.config.baseUrl(p), app.config.apiKey(p)).catch((e) => ({ error: (e as Error).message }));
		}));
		const models = Object.entries(app.config.file.models).map(([key, m]) => {
			const have = available[m.provider];
			return { key, id: m.id, provider: m.provider, family: m.family, price: m.price, local: app.config.file.providers[m.provider]!.local, usable: app.config.usable(m.provider), tiers: TIERS.filter((t) => app.config.file.tiers[t].models.includes(key)), installed: Array.isArray(have) ? have.includes(m.id) || have.includes(`${m.id}:latest`) : null, provider_error: have && !Array.isArray(have) ? have.error : null, ...(stats.find((s) => s.model_key === key) ?? { calls: 0, errors: 0, latency_ms: null, tokens: 0, cost_usd: null, last_used: null }) };
		});
		return { models };
	});
	server.get('/api/usage', async (req) => {
		const { days } = z.object({ days: z.coerce.number().int().min(1).max(90).default(14) }).parse(req.query);
		const since = new Date(Date.now() - days * 86400000).toISOString();
		const group = async (col: 'tier' | 'model_id' | 'purpose') => db.selectFrom('model_calls').select(col).select((eb) => [eb.fn.countAll<number>().as('calls'), eb.fn.sum<number>(sql`input_tokens + output_tokens`).as('tokens'), eb.fn.sum<number>('cost_usd').as('cost_usd'), eb.fn.avg<number>('latency_ms').as('latency_ms')]).where('created_at', '>=', since).where('status', '=', 'ok').groupBy(col).execute();
		const byDay = await db.selectFrom('model_calls').select(sql<string>`substr(created_at, 1, 10)`.as('day')).select((eb) => [eb.fn.sum<number>(sql`input_tokens + output_tokens`).as('tokens'), eb.fn.sum<number>('cost_usd').as('cost_usd'), eb.fn.countAll<number>().as('calls')]).where('created_at', '>=', since).where('status', '=', 'ok').groupBy(sql`substr(created_at, 1, 10)`).orderBy('day').execute();
		const plan = await app.gateway.plan(app.owner);
		return { days, plan, limit: app.config.file.plans[plan]!.daily_tokens, used_today: await app.gateway.usedToday(app.owner), today: today(), by_day: byDay, by_tier: await group('tier'), by_model: await group('model_id'), by_agent: await group('purpose') };
	});

	/* ---------- channels, connectors, schedules, settings ---------- */
	server.get('/api/channels', async () => {
		const channels = await Promise.all(app.outbox.list().map(async (a) => {
			const last = await db.selectFrom('messages').selectAll().where('channel', '=', a.id).orderBy('id', 'desc').limit(1).executeTakeFirst();
			const errors = await db.selectFrom('messages').select(['error', 'created_at']).where('channel', '=', a.id).where('error', 'is not', null).orderBy('id', 'desc').limit(5).execute();
			return { id: a.id, ...(await a.status()), last: last ? { direction: last.direction, text: last.text.slice(0, 160), at: last.created_at } : null, errors };
		}));
		// Channels that exist in the product but aren't set up yet are listed too, so the screen says what is missing.
		const missing = CHANNELS.filter((c) => c !== 'terminal' && !channels.some((x) => x.id === c)).map((c) => ({ id: c, ok: false, detail: 'Not built yet: this channel arrives in a later milestone.', last: null, errors: [] }));
		return { channels: [...channels, ...missing], preferred: await app.outbox.preferred() };
	});
	server.post('/api/channels/:id/test', async (req, reply) => {
		const id = Channel.safeParse((req.params as { id: string }).id);
		if (!id.success || !app.outbox.get(id.data)) return reply.code(404).send({ error: 'That channel is not set up.' });
		try {
			const adapter = app.outbox.get(id.data)!;
			const st = await adapter.status();
			if (!st.ok) throw new Error(st.detail);
			await adapter.sendProactive(app.owner, [`Test message from Onyx, sent ${new Date().toLocaleTimeString()}.`]);
			await db.insertInto('messages').values({ user_id: app.owner, channel: id.data, direction: 'out', text: 'Test message', run_id: null, status: 'sent', error: null, created_at: now() }).execute();
			return { sent: true };
		} catch (e) {
			return reply.code(502).send({ error: (e as Error).message });
		}
	});
	server.get('/api/connectors', async () => ({ connectors: app.connectors.status() }));
	server.post('/api/connectors/reload', async () => ({ connectors: await app.connectors.start() }));
	server.get('/api/schedules', async () => ({ schedules: await db.selectFrom('schedules').selectAll().where('user_id', '=', app.owner).orderBy('next_fire').execute() }));
	server.delete('/api/schedules/:id', async (req) => ({ cancelled: Number((await db.updateTable('schedules').set({ status: 'cancelled' }).where('id', '=', Number((req.params as { id: string }).id)).where('status', '=', 'active').executeTakeFirst()).numUpdatedRows) }));
	server.get('/api/memories', async () => ({ memories: await db.selectFrom('memories').select(['id', 'text', 'created_at']).where('user_id', '=', app.owner).orderBy('id', 'desc').execute() }));
	server.delete('/api/memories/:id', async (req) => ({ deleted: Number((await db.deleteFrom('memories').where('id', '=', Number((req.params as { id: string }).id)).executeTakeFirst()).numDeletedRows) }));

	const setting = async (key: string, fallback: unknown) => {
		const row = await db.selectFrom('settings').select('value').where('key', '=', key).executeTakeFirst();
		return row ? JSON.parse(row.value) : fallback;
	};
	server.get('/api/settings', async () => ({
		preferred_channels: await setting('preferred_channels', ['whatsapp', 'sms', 'web']),
		allowlist: await setting('allowlist', []),
		// Whether each key is set. The values stay in .env and are never sent here.
		keys: KEYS.map((k) => ({ name: k, set: !!app.env[k] })),
		cloud: app.config.cloud,
	}));
	server.put('/api/settings', async (req, reply) => {
		const body = SettingsBody.safeParse(req.body);
		if (!body.success) return bad(reply, body.error);
		for (const [key, value] of Object.entries(body.data)) {
			const v = JSON.stringify(value);
			await db.insertInto('settings').values({ key, value: v }).onConflict((c) => c.column('key').doUpdateSet({ value: v })).execute();
		}
		return { saved: Object.keys(body.data) };
	});

	// The built web app, when it has been built: one process serves the API and the pages.
	const webDir = o.webDir ?? resolve(ROOT, 'apps/web/out');
	if (existsSync(webDir)) {
		await server.register(fastifyStatic, { root: webDir, wildcard: false });
		server.setNotFoundHandler((req, reply) => {
			if (req.url.startsWith('/api/')) return reply.code(404).send({ error: 'No such API route.' });
			const page = req.url.split('?')[0]!.replace(/\/$/, '');
			return existsSync(resolve(webDir, `.${page}.html`)) ? reply.sendFile(`${page}.html`) : reply.sendFile('index.html');
		});
	}
	return server;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('index.ts')) {
	const app = await createApp();
	const server = await buildServer(app);
	const port = Number(process.env.PORT ?? 8787);
	await server.listen({ port, host: '127.0.0.1' });
	app.scheduler.start();
	const connectors = await app.connectors.start();
	console.log(`Onyx Agents on http://127.0.0.1:${port}`);
	for (const c of connectors.filter((x) => x.enabled)) console.log(`  connector ${c.id}: ${c.state}${c.error ? ` (${c.error})` : `, ${c.tools.length} tools`}`);
}

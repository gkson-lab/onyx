// The server: the API the app uses, and a WebSocket that carries every agent event as it happens. It listens on this
// machine only (127.0.0.1). Keys never leave the server: the API reports whether one is set, never its value.
import { randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Fastify, { type FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import { sql } from 'kysely';
import { z } from 'zod';
import { AgentDef, Channel, TIERS, type ChatMessage } from '@onyx/shared';
import { createApp, type App } from './app.ts';
import { LOCAL_TIERS, parseTiers, ROOT, tiersPath as currentTiers } from './config.ts';
import { now, today } from './db.ts';
import { listModels } from './models/provider.ts';
import { e164 } from './channels/phone.ts';
import { applyToTiers, detect, plan as planFor, type Hardware } from './hardware.ts';

const ChatBody = z.object({ text: z.string().trim().min(1).max(20000) });
const SettingsBody = z.object({ preferred_channels: z.array(Channel).min(1).max(4).optional(), allowlist: z.array(z.string().trim().min(3).max(64)).max(50).optional() });
const KEYS = ['ONYX_PASSWORD', 'MOONSHOT_API_KEY', 'BRAVE_API_KEY', 'GITHUB_MCP_TOKEN', 'WHATSAPP_TOKEN', 'WHATSAPP_APP_SECRET', 'TWILIO_AUTH_TOKEN'];

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

/** At most `max` events per `windowMs` for each key. In memory: it resets when the server restarts. */
export function limiter(max: number, windowMs: number, clock: () => number = Date.now) {
	const hits = new Map<string, number[]>();
	return (key: string): boolean => {
		const t = clock();
		const recent = (hits.get(key) ?? []).filter((x) => t - x < windowMs);
		if (recent.length >= max) return hits.set(key, recent), false;
		recent.push(t);
		hits.set(key, recent);
		return true;
	};
}
const allowInbound = limiter(20, 5 * 60 * 1000);

/**
 * A message from a phone. Only numbers on the allowlist get anywhere; everyone else is ignored without a reply.
 * A number is linked to the account by texting the code shown in Settings, which proves the phone is yours.
 */
export async function inbound(app: App, channel: 'whatsapp' | 'sms', from: string, text: string | null, kind = 'text'): Promise<'ignored' | 'verified' | 'unverified' | 'limited' | 'unsupported' | 'handled'> {
	const handle = e164(from);
	const row = await app.db.selectFrom('settings').select('value').where('key', '=', 'allowlist').executeTakeFirst();
	const allow: string[] = row ? JSON.parse(row.value) : [];
	if (!allow.includes(handle)) return 'ignored';
	const adapter = channel === 'whatsapp' ? app.whatsapp : app.sms;
	const id = await app.db.selectFrom('identities').selectAll().where('channel', '=', channel).where('handle', '=', handle).executeTakeFirst();
	if (!id) return 'ignored';
	await app.db.updateTable('identities').set({ last_inbound: now() }).where('id', '=', id.id).execute();
	if (!id.verified_at) {
		const ok = !!id.code && !!text && text.trim() === id.code && !!id.code_expires && Date.parse(id.code_expires) > Date.now();
		if (!ok) return 'unverified';
		await app.db.updateTable('identities').set({ verified_at: now(), code: null, code_expires: null }).where('id', '=', id.id).execute();
		await adapter.sendTo(handle, ['This number is now linked to Onyx. Text me anything.']).catch(() => {});
		return 'verified';
	}
	if (!allowInbound(`${channel}:${handle}`)) return 'limited';
	if (text === null || !text.trim()) {
		await adapter.sendTo(handle, [`I can only read text messages for now, not ${kind === 'audio' ? 'voice notes' : `${kind} messages`}.`]).catch(() => {});
		return 'unsupported';
	}
	// The run can take a while, so it goes on after the webhook has been answered.
	void receive(app, { userId: id.user_id, text: text.slice(0, 20000), channel }).catch(() => {});
	return 'handled';
}

async function seenSids(app: App): Promise<string[]> {
	const row = await app.db.selectFrom('settings').select('value').where('key', '=', 'sms_seen').executeTakeFirst();
	return row ? JSON.parse(row.value) : [];
}
async function markSeen(app: App, sids: string[]): Promise<void> {
	const value = JSON.stringify([...new Set([...(await seenSids(app)), ...sids])].slice(-300));
	await app.db.insertInto('settings').values({ key: 'sms_seen', value }).onConflict((c) => c.column('key').doUpdateSet({ value })).execute();
}

/** Answers texts that arrived through Twilio while this PC was off. Returns how many it picked up. */
export async function catchUpSms(app: App): Promise<number> {
	if (!(await app.sms.status()).ok) return 0;
	const seen = new Set(await seenSids(app));
	const missed = (await app.sms.recent()).filter((m) => !seen.has(m.sid)).sort((a, b) => a.at.localeCompare(b.at));
	await markSeen(app, missed.map((m) => m.sid));
	for (const m of missed) await inbound(app, 'sms', m.from, `${m.body}`);
	return missed.length;
}

export async function buildServer(app: App, o: { tiersPath?: string; webDir?: string; detect?: () => Promise<Hardware> } = {}): Promise<FastifyInstance> {
	const server = Fastify({ logger: false, bodyLimit: 1_000_000 });
	await server.register(websocket);
	// Read: this PC's own tiers file if there is one, else the shipped one. Write: always this PC's own.
	const readTiers = () => readFileSync(o.tiersPath ?? currentTiers(), 'utf8');
	const tiersOut = o.tiersPath ?? LOCAL_TIERS;
	const db = app.db;
	const bad = (reply: any, e: z.ZodError) => reply.code(400).send({ error: e.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ') });

	// Bodies are kept as text too: the webhook signatures are computed over the exact bytes that arrived.
	server.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
		(req as any).rawBody = body;
		try {
			done(null, body ? JSON.parse(body as string) : {});
		} catch {
			done(Object.assign(new Error('The body is not valid JSON.'), { statusCode: 400 }));
		}
	});
	server.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, (_req, body, done) => done(null, Object.fromEntries(new URLSearchParams(body as string))));

	/* ---------- who may use the API ---------- */
	// From this PC, directly: open. Through a tunnel or from another machine: only with the password's session.
	const password = app.env.ONYX_PASSWORD ?? '';
	const tryLogin = limiter(5, 60 * 1000);
	const cookie = (req: any): string | null => (String(req.headers.cookie ?? '').match(/(?:^|;\s*)onyx_session=([a-f0-9]{64})/) ?? [])[1] ?? null;
	const remote = (req: any): boolean => !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.ip) || ['x-forwarded-for', 'cf-connecting-ip', 'x-real-ip', 'forwarded'].some((h) => req.headers[h] !== undefined);
	const signedIn = async (req: any): Promise<boolean> => {
		const token = cookie(req);
		return !!token && !!(await db.selectFrom('sessions').select('token').where('token', '=', token).executeTakeFirst());
	};
	server.addHook('onRequest', async (req, reply) => {
		const path = req.url.split('?')[0]!;
		if (!(path.startsWith('/api/') || path === '/ws') || path === '/api/login' || path === '/api/session') return;
		if (!remote(req) || (await signedIn(req))) return;
		return reply.code(401).send({ error: password ? 'Sign in first.' : 'This server has no password, so it only answers this PC. Set ONYX_PASSWORD in .env to use it from elsewhere.' });
	});
	server.get('/api/session', async (req) => ({ signed_in: !remote(req) || (await signedIn(req)), needs_password: remote(req), has_password: !!password }));
	server.post('/api/login', async (req, reply) => {
		const body = z.object({ password: z.string().min(1).max(200) }).safeParse(req.body);
		if (!body.success) return bad(reply, body.error);
		if (!tryLogin(req.ip)) return reply.code(429).send({ error: 'Too many tries. Wait a minute.' });
		const a = Buffer.from(body.data.password);
		const b = Buffer.from(password);
		if (!password || a.length !== b.length || !timingSafeEqual(a, b)) return reply.code(401).send({ error: password ? 'That is not the password.' : 'No password is set on the server.' });
		const token = randomBytes(32).toString('hex');
		await db.insertInto('sessions').values({ token, user_id: app.owner, created_at: now() }).execute();
		reply.header('set-cookie', `onyx_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https' ? '; Secure' : ''}`);
		return { signed_in: true };
	});
	server.post('/api/logout', async (req, reply) => {
		const token = cookie(req);
		if (token) await db.deleteFrom('sessions').where('token', '=', token).execute();
		reply.header('set-cookie', 'onyx_session=; Path=/; HttpOnly; Max-Age=0');
		return { signed_in: false };
	});

	/* ---------- webhooks: checked by signature, not by session ---------- */
	server.get('/webhooks/whatsapp', async (req, reply) => {
		const challenge = app.whatsapp.verify(req.query as Record<string, string>);
		return challenge === null ? reply.code(403).send('forbidden') : reply.type('text/plain').send(challenge);
	});
	server.post('/webhooks/whatsapp', async (req, reply) => {
		if (!app.whatsapp.signed(String((req as any).rawBody ?? ''), req.headers['x-hub-signature-256'] as string | undefined)) return reply.code(401).send({ error: 'bad signature' });
		for (const m of app.whatsapp.parse(req.body)) await inbound(app, 'whatsapp', m.from, m.text, m.kind);
		return { ok: true };
	});
	server.post('/webhooks/sms', async (req, reply) => {
		const params = (req.body ?? {}) as Record<string, string>;
		if (!app.sms.signed('/webhooks/sms', params, req.headers['x-twilio-signature'] as string | undefined)) return reply.code(401).send({ error: 'bad signature' });
		if (params.MessageSid) await markSeen(app, [params.MessageSid]);
		await inbound(app, 'sms', String(params.From ?? ''), typeof params.Body === 'string' ? params.Body : null);
		// An empty reply: Onyx answers with a message of its own when the run is done.
		return reply.type('text/xml').send('<Response></Response>');
	});

	/* ---------- phone numbers linked to the account ---------- */
	server.get('/api/identities', async () => ({ identities: await db.selectFrom('identities').select(['id', 'channel', 'handle', 'verified_at', 'code', 'code_expires']).where('user_id', '=', app.owner).execute() }));
	server.post('/api/identities', async (req, reply) => {
		const body = z.object({ channel: z.enum(['whatsapp', 'sms']), handle: z.string().transform(e164).pipe(z.string().regex(/^\+\d{8,15}$/, 'write the number in international form: + then 8 to 15 digits')) }).safeParse(req.body);
		if (!body.success) return bad(reply, body.error);
		const code = String(randomInt(100000, 1000000));
		const row = { user_id: app.owner, channel: body.data.channel, handle: body.data.handle, verified_at: null, code, code_expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(), last_inbound: null };
		await db.insertInto('identities').values(row).onConflict((c) => c.columns(['channel', 'handle']).doUpdateSet({ code, code_expires: row.code_expires, verified_at: null })).execute();
		// Linking a number also puts it on the allowlist: otherwise its code would be ignored.
		const cur = await db.selectFrom('settings').select('value').where('key', '=', 'allowlist').executeTakeFirst();
		const list = JSON.stringify([...new Set([...(cur ? JSON.parse(cur.value) : []), body.data.handle])]);
		await db.insertInto('settings').values({ key: 'allowlist', value: list }).onConflict((c) => c.column('key').doUpdateSet({ value: list })).execute();
		return { code, expires: row.code_expires, handle: body.data.handle };
	});
	server.delete('/api/identities/:id', async (req) => ({ removed: Number((await db.deleteFrom('identities').where('id', '=', Number((req.params as { id: string }).id)).where('user_id', '=', app.owner).executeTakeFirst()).numDeletedRows) }));

	/* ---------- notifications for the installed app ---------- */
	server.get('/api/push', async () => ({ public_key: await app.push.publicKey(), devices: await app.push.count(app.owner) }));
	server.post('/api/push', async (req, reply) => {
		const body = z.object({ endpoint: z.string().url() }).passthrough().safeParse(req.body);
		if (!body.success) return bad(reply, body.error);
		await app.push.subscribe(app.owner, body.data);
		return { devices: await app.push.count(app.owner) };
	});
	server.post('/api/push/test', async () => ({ sent: await app.push.notify(app.owner, 'Notifications from Onyx work on this device.') }));

	/* ---------- billing: off unless tiers.yaml turns it on ---------- */
	// Kept small on purpose. It answers "who used what, and what did it cost me", and lets a plan be set per account.
	// Taking payment is not here: connect a payment provider's webhook to PUT /api/billing/users/:id when you need it.
	server.get('/api/billing', async () => {
		const month = new Date().toISOString().slice(0, 7);
		const users = await db.selectFrom('users').selectAll().execute();
		const used = await db.selectFrom('usage_daily').select('user_id').select((eb) => [eb.fn.sum<number>('tokens').as('tokens'), eb.fn.sum<number>('cost_usd').as('cost_usd')]).where('day', '>=', `${month}-01`).groupBy('user_id').execute();
		return { enabled: app.config.file.billing.enabled, month, plans: app.config.file.plans, users: users.map((u) => ({ id: u.id, name: u.name, plan: u.plan, tokens: used.find((x) => x.user_id === u.id)?.tokens ?? 0, cost_usd: used.find((x) => x.user_id === u.id)?.cost_usd ?? 0 })) };
	});
	server.put('/api/billing/users/:id', async (req, reply) => {
		const body = z.object({ plan: z.enum(['free', 'pro', 'max']) }).safeParse(req.body);
		if (!body.success) return bad(reply, body.error);
		const r = await db.updateTable('users').set({ plan: body.data.plan }).where('id', '=', (req.params as { id: string }).id).executeTakeFirst();
		return Number(r.numUpdatedRows) ? { plan: body.data.plan } : reply.code(404).send({ error: 'No account has that id.' });
	});

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
	server.get('/api/tiers/raw', async () => ({ yaml: readTiers() }));
	server.put('/api/tiers/raw', async (req, reply) => {
		const body = z.object({ yaml: z.string().min(10).max(50000) }).safeParse(req.body);
		if (!body.success) return bad(reply, body.error);
		try {
			const file = parseTiers(body.data.yaml);
			writeFileSync(tiersOut, body.data.yaml);
			app.config.replace(file);
			return { tiers: app.config.publicTiers() };
		} catch (e) {
			return reply.code(400).send({ error: e instanceof z.ZodError ? e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') : `Not valid YAML: ${(e as Error).message}` });
		}
	});
	/* ---------- what this PC can run ---------- */
	let hwCache: Hardware | null = null;
	const hardware = async () => (hwCache ??= await (o.detect ?? detect)());
	server.get('/api/hardware', async () => {
		const hw = await hardware();
		return { hardware: hw, plan: planFor(hw) };
	});
	server.post('/api/hardware/apply', async (_req, reply) => {
		const p = planFor(await hardware());
		const r = await applyToTiers(readTiers(), p.tiers);
		try {
			const file = parseTiers(r.yaml);
			writeFileSync(tiersOut, r.yaml);
			app.config.replace(file);
		} catch (e) {
			return reply.code(500).send({ error: `The new tiers file did not check out: ${(e as Error).message}` });
		}
		return { changed: r.changed, tiers: app.config.publicTiers() };
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
		return { days, billing: app.config.file.billing.enabled, plan, limit: app.config.file.billing.enabled ? app.config.file.plans[plan]!.daily_tokens : null, used_today: await app.gateway.usedToday(app.owner), today: today(), by_day: byDay, by_tier: await group('tier'), by_model: await group('model_id'), by_agent: await group('purpose') };
	});

	/* ---------- channels, connectors, schedules, settings ---------- */
	server.get('/api/channels', async () => {
		const channels = await Promise.all(app.outbox.list().map(async (a) => {
			const last = await db.selectFrom('messages').selectAll().where('channel', '=', a.id).orderBy('id', 'desc').limit(1).executeTakeFirst();
			const errors = await db.selectFrom('messages').select(['error', 'created_at']).where('channel', '=', a.id).where('error', 'is not', null).orderBy('id', 'desc').limit(5).execute();
			return { id: a.id, ...(await a.status()), last: last ? { direction: last.direction, text: last.text.slice(0, 160), at: last.created_at } : null, errors };
		}));
		// Channels that exist in the product but aren't set up yet are listed too, so the screen says what is missing.
		return { channels, preferred: await app.outbox.preferred(), public_url: app.env.PUBLIC_URL ?? null };
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
	// It listens on this PC only. A tunnel (cloudflared) running on this PC is what makes it reachable from outside.
	await server.listen({ port, host: '127.0.0.1' });
	app.scheduler.start();
	const connectors = await app.connectors.start();
	const missed = await catchUpSms(app).catch((e) => (console.log(`  SMS catch-up failed: ${(e as Error).message}`), 0));
	if (missed) console.log(`  answered ${missed} text${missed === 1 ? '' : 's'} sent while Onyx was off`);
	console.log(`Onyx Agents on http://127.0.0.1:${port}`);
	for (const c of connectors.filter((x) => x.enabled)) console.log(`  connector ${c.id}: ${c.state}${c.error ? ` (${c.error})` : `, ${c.tools.length} tools`}`);
}

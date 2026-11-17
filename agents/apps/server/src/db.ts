// The database: SQLite for development through Node's built-in driver, behind Kysely so that the same queries and
// migrations run on Postgres (swap the dialect in `open`). Nothing here is SQLite-only SQL.
import { DatabaseSync } from 'node:sqlite';
import { Kysely, SqliteDialect, sql, type Generated } from 'kysely';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export interface Tables {
	users: { id: string; name: string; plan: string; created_at: string };
	routing_decisions: { id: Generated<number>; user_id: string; run_id: string | null; text: string; tier: string; via: string; reason: string; complexity: string; tools: string; urgency: string; latency_ms: number; created_at: string };
	model_calls: { id: Generated<number>; user_id: string; run_id: string | null; purpose: string; tier: string; model_key: string; provider: string; model_id: string; status: string; error: string | null; input_tokens: number; output_tokens: number; usage_estimated: number; cost_usd: number | null; equivalent_usd: Generated<number | null>; latency_ms: number; attempt: number; created_at: string };
	fallbacks: { id: Generated<number>; user_id: string; run_id: string | null; kind: string; from_ref: string; to_ref: string; reason: string; created_at: string };
	usage_daily: { user_id: string; day: string; tokens: number; cost_usd: number };
	agents: { id: string; name: string; description: string; system_prompt: string; tier: string; tools: string; enabled: number; max_steps: number; token_budget: number; time_budget_ms: number; builtin: number };
	runs: { id: string; parent_id: string | null; root_id: string; depth: number; user_id: string; agent_id: string; channel: string; status: string; input: string; output: string | null; error: string | null; tier: string | null; model: string | null; provider: string | null; tokens_in: number; tokens_out: number; cost_usd: number | null; steps: number; routing: string | null; started_at: string; finished_at: string | null; equivalent_usd: Generated<number | null> };
	steps: { id: Generated<number>; run_id: string; root_id: string; n: number; type: string; data: string; created_at: string };
	messages: { id: Generated<number>; user_id: string; channel: string; direction: string; text: string; run_id: string | null; status: string; error: string | null; created_at: string; conversation_id: Generated<number | null> };
	conversations: { id: Generated<number>; user_id: string; title: string; pinned: number; created_at: string; updated_at: string };
	memories: { id: Generated<number>; user_id: string; text: string; embedding: string | null; created_at: string };
	schedules: { id: Generated<number>; user_id: string; text: string; next_fire: string; repeat: string; channel: string | null; status: string; last_fired: string | null; created_at: string };
	settings: { key: string; value: string };
	identities: { id: Generated<number>; user_id: string; channel: string; handle: string; verified_at: string | null; code: string | null; code_expires: string | null; last_inbound: string | null };
	sessions: { token: string; user_id: string; created_at: string };
	push_subscriptions: { endpoint: string; user_id: string; data: string; created_at: string };
}
export type DB = Kysely<Tables>;

/** Makes Node's built-in SQLite look like the driver Kysely's SQLite dialect expects. */
function adapt(db: DatabaseSync) {
	return {
		close: () => db.close(),
		prepare(text: string) {
			const st = db.prepare(text);
			return {
				reader: /^\s*(?:select|with|pragma|explain)\b/i.test(text) || /\breturning\b/i.test(text),
				all: (params: readonly unknown[]) => st.all(...(params as never[])),
				run: (params: readonly unknown[]) => st.run(...(params as never[])),
				iterate: (params: readonly unknown[]) => st.iterate(...(params as never[])) as IterableIterator<unknown>,
			};
		},
	};
}

const MIGRATIONS: ((db: Kysely<any>) => Promise<void>)[] = [
	async (db) => {
		await db.schema.createTable('users').addColumn('id', 'text', (c) => c.primaryKey()).addColumn('name', 'text', (c) => c.notNull()).addColumn('plan', 'text', (c) => c.notNull()).addColumn('created_at', 'text', (c) => c.notNull()).execute();
		await db.schema.createTable('routing_decisions').addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement()).addColumn('user_id', 'text', (c) => c.notNull()).addColumn('run_id', 'text').addColumn('text', 'text', (c) => c.notNull()).addColumn('tier', 'text', (c) => c.notNull()).addColumn('via', 'text', (c) => c.notNull()).addColumn('reason', 'text', (c) => c.notNull()).addColumn('complexity', 'text', (c) => c.notNull()).addColumn('tools', 'text', (c) => c.notNull()).addColumn('urgency', 'text', (c) => c.notNull()).addColumn('latency_ms', 'integer', (c) => c.notNull()).addColumn('created_at', 'text', (c) => c.notNull()).execute();
		await db.schema.createTable('model_calls').addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement()).addColumn('user_id', 'text', (c) => c.notNull()).addColumn('run_id', 'text').addColumn('purpose', 'text', (c) => c.notNull()).addColumn('tier', 'text', (c) => c.notNull()).addColumn('model_key', 'text', (c) => c.notNull()).addColumn('provider', 'text', (c) => c.notNull()).addColumn('model_id', 'text', (c) => c.notNull()).addColumn('status', 'text', (c) => c.notNull()).addColumn('error', 'text').addColumn('input_tokens', 'integer', (c) => c.notNull()).addColumn('output_tokens', 'integer', (c) => c.notNull()).addColumn('usage_estimated', 'integer', (c) => c.notNull()).addColumn('cost_usd', 'real').addColumn('latency_ms', 'integer', (c) => c.notNull()).addColumn('attempt', 'integer', (c) => c.notNull()).addColumn('created_at', 'text', (c) => c.notNull()).execute();
		await db.schema.createTable('fallbacks').addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement()).addColumn('user_id', 'text', (c) => c.notNull()).addColumn('run_id', 'text').addColumn('kind', 'text', (c) => c.notNull()).addColumn('from_ref', 'text', (c) => c.notNull()).addColumn('to_ref', 'text', (c) => c.notNull()).addColumn('reason', 'text', (c) => c.notNull()).addColumn('created_at', 'text', (c) => c.notNull()).execute();
		await db.schema.createTable('usage_daily').addColumn('user_id', 'text', (c) => c.notNull()).addColumn('day', 'text', (c) => c.notNull()).addColumn('tokens', 'integer', (c) => c.notNull()).addColumn('cost_usd', 'real', (c) => c.notNull()).addPrimaryKeyConstraint('usage_daily_pk', ['user_id', 'day']).execute();
		await db.schema.createIndex('model_calls_user_day').on('model_calls').columns(['user_id', 'created_at']).execute();
	},
	async (db) => {
		const t = (name: string) => db.schema.createTable(name);
		await t('agents').addColumn('id', 'text', (c) => c.primaryKey()).addColumn('name', 'text', (c) => c.notNull()).addColumn('description', 'text', (c) => c.notNull()).addColumn('system_prompt', 'text', (c) => c.notNull()).addColumn('tier', 'text', (c) => c.notNull()).addColumn('tools', 'text', (c) => c.notNull()).addColumn('enabled', 'integer', (c) => c.notNull()).addColumn('max_steps', 'integer', (c) => c.notNull()).addColumn('token_budget', 'integer', (c) => c.notNull()).addColumn('time_budget_ms', 'integer', (c) => c.notNull()).addColumn('builtin', 'integer', (c) => c.notNull()).execute();
		await t('runs').addColumn('id', 'text', (c) => c.primaryKey()).addColumn('parent_id', 'text').addColumn('root_id', 'text', (c) => c.notNull()).addColumn('depth', 'integer', (c) => c.notNull()).addColumn('user_id', 'text', (c) => c.notNull()).addColumn('agent_id', 'text', (c) => c.notNull()).addColumn('channel', 'text', (c) => c.notNull()).addColumn('status', 'text', (c) => c.notNull()).addColumn('input', 'text', (c) => c.notNull()).addColumn('output', 'text').addColumn('error', 'text').addColumn('tier', 'text').addColumn('model', 'text').addColumn('provider', 'text').addColumn('tokens_in', 'integer', (c) => c.notNull()).addColumn('tokens_out', 'integer', (c) => c.notNull()).addColumn('cost_usd', 'real').addColumn('steps', 'integer', (c) => c.notNull()).addColumn('routing', 'text').addColumn('started_at', 'text', (c) => c.notNull()).addColumn('finished_at', 'text').execute();
		await db.schema.createIndex('runs_root').on('runs').column('root_id').execute();
		await db.schema.createIndex('runs_started').on('runs').column('started_at').execute();
		await t('steps').addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement()).addColumn('run_id', 'text', (c) => c.notNull()).addColumn('root_id', 'text', (c) => c.notNull()).addColumn('n', 'integer', (c) => c.notNull()).addColumn('type', 'text', (c) => c.notNull()).addColumn('data', 'text', (c) => c.notNull()).addColumn('created_at', 'text', (c) => c.notNull()).execute();
		await db.schema.createIndex('steps_run').on('steps').column('run_id').execute();
		await t('messages').addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement()).addColumn('user_id', 'text', (c) => c.notNull()).addColumn('channel', 'text', (c) => c.notNull()).addColumn('direction', 'text', (c) => c.notNull()).addColumn('text', 'text', (c) => c.notNull()).addColumn('run_id', 'text').addColumn('status', 'text', (c) => c.notNull()).addColumn('error', 'text').addColumn('created_at', 'text', (c) => c.notNull()).execute();
		await t('memories').addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement()).addColumn('user_id', 'text', (c) => c.notNull()).addColumn('text', 'text', (c) => c.notNull()).addColumn('embedding', 'text').addColumn('created_at', 'text', (c) => c.notNull()).execute();
		await t('schedules').addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement()).addColumn('user_id', 'text', (c) => c.notNull()).addColumn('text', 'text', (c) => c.notNull()).addColumn('next_fire', 'text', (c) => c.notNull()).addColumn('repeat', 'text', (c) => c.notNull()).addColumn('channel', 'text').addColumn('status', 'text', (c) => c.notNull()).addColumn('last_fired', 'text').addColumn('created_at', 'text', (c) => c.notNull()).execute();
		await t('settings').addColumn('key', 'text', (c) => c.primaryKey()).addColumn('value', 'text', (c) => c.notNull()).execute();
	},
	async (db) => {
		await db.schema.createTable('identities').addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement()).addColumn('user_id', 'text', (c) => c.notNull()).addColumn('channel', 'text', (c) => c.notNull()).addColumn('handle', 'text', (c) => c.notNull()).addColumn('verified_at', 'text').addColumn('code', 'text').addColumn('code_expires', 'text').addColumn('last_inbound', 'text').execute();
		await db.schema.createIndex('identities_handle').on('identities').columns(['channel', 'handle']).unique().execute();
		await db.schema.createTable('sessions').addColumn('token', 'text', (c) => c.primaryKey()).addColumn('user_id', 'text', (c) => c.notNull()).addColumn('created_at', 'text', (c) => c.notNull()).execute();
		await db.schema.createTable('push_subscriptions').addColumn('endpoint', 'text', (c) => c.primaryKey()).addColumn('user_id', 'text', (c) => c.notNull()).addColumn('data', 'text', (c) => c.notNull()).addColumn('created_at', 'text', (c) => c.notNull()).execute();
	},
	async (db) => {
		// What a local call would have cost on a paid host. Null for calls made before this was added.
		await db.schema.alterTable('model_calls').addColumn('equivalent_usd', 'real').execute();
		await db.schema.alterTable('runs').addColumn('equivalent_usd', 'real').execute();
	},
	async (db) => {
		// Chats in the app are kept apart, each with its own history. Messages from phones and reminders have none.
		await db.schema.createTable('conversations').addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement()).addColumn('user_id', 'text', (c) => c.notNull()).addColumn('title', 'text', (c) => c.notNull()).addColumn('pinned', 'integer', (c) => c.notNull().defaultTo(0)).addColumn('created_at', 'text', (c) => c.notNull()).addColumn('updated_at', 'text', (c) => c.notNull()).execute();
		await db.schema.alterTable('messages').addColumn('conversation_id', 'integer').execute();
		await db.schema.createIndex('messages_conversation').on('messages').columns(['conversation_id', 'id']).execute();
		// Chats from before there were chats become one, "Earlier chats", so they stay where they were.
		const users = await db.selectFrom('messages').select('user_id').distinct().where('channel', 'in', ['web', 'terminal']).execute();
		for (const u of users) {
			const at = new Date().toISOString();
			const c = await db.insertInto('conversations').values({ user_id: u.user_id, title: 'Earlier chats', pinned: 0, created_at: at, updated_at: at }).returning('id').executeTakeFirstOrThrow();
			await db.updateTable('messages').set({ conversation_id: c.id }).where('user_id', '=', u.user_id).where('channel', 'in', ['web', 'terminal']).execute();
		}
	},
];

export async function open(path: string): Promise<DB> {
	if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
	const db = new Kysely<any>({ dialect: new SqliteDialect({ database: adapt(new DatabaseSync(path)) as never }) });
	await db.schema.createTable('_migrations').ifNotExists().addColumn('n', 'integer', (c) => c.primaryKey()).execute();
	const done = Number(((await sql<{ n: number | null }>`select max(n) as n from _migrations`.execute(db)).rows[0]?.n) ?? 0);
	for (let i = done; i < MIGRATIONS.length; i++) {
		await db.transaction().execute(async (tx) => {
			await MIGRATIONS[i]!(tx);
			await sql`insert into _migrations (n) values (${i + 1})`.execute(tx);
		});
	}
	return db as DB;
}

export const now = (): string => new Date().toISOString();
export const today = (): string => new Date().toISOString().slice(0, 10);

export async function ensureUser(db: DB, id: string, name: string, plan: string): Promise<void> {
	const u = await db.selectFrom('users').select('id').where('id', '=', id).executeTakeFirst();
	if (!u) await db.insertInto('users').values({ id, name, plan, created_at: now() }).execute();
	else await db.updateTable('users').set({ plan }).where('id', '=', id).execute();
}

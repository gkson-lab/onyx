// The database: SQLite for development through Node's built-in driver, behind Kysely so that the same queries and
// migrations run on Postgres (swap the dialect in `open`). Nothing here is SQLite-only SQL.
import { DatabaseSync } from 'node:sqlite';
import { Kysely, SqliteDialect, sql, type Generated } from 'kysely';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export interface Tables {
	users: { id: string; name: string; plan: string; created_at: string };
	routing_decisions: { id: Generated<number>; user_id: string; run_id: string | null; text: string; tier: string; via: string; reason: string; complexity: string; tools: string; urgency: string; latency_ms: number; created_at: string };
	model_calls: { id: Generated<number>; user_id: string; run_id: string | null; purpose: string; tier: string; model_key: string; provider: string; model_id: string; status: string; error: string | null; input_tokens: number; output_tokens: number; usage_estimated: number; cost_usd: number | null; latency_ms: number; attempt: number; created_at: string };
	fallbacks: { id: Generated<number>; user_id: string; run_id: string | null; kind: string; from_ref: string; to_ref: string; reason: string; created_at: string };
	usage_daily: { user_id: string; day: string; tokens: number; cost_usd: number };
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

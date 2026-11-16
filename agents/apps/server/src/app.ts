// Puts the pieces together: config, database, gateway, router. Used by the server, the terminal chat and the tests.
import { resolve } from 'node:path';
import { Config, loadDotEnv, loadTiers, ROOT, type Env, type TiersFile } from './config.ts';
import { ensureUser, open, type DB } from './db.ts';
import { Gateway, type GatewayOptions } from './models/gateway.ts';
import { Router } from './models/router.ts';
import { Plan } from '@onyx/shared';

export interface App {
	config: Config;
	db: DB;
	gateway: Gateway;
	router: Router;
	/** The account of the person whose machine this is. */
	owner: string;
}

export async function createApp(o: { tiers?: TiersFile; env?: Env; dbPath?: string; fetch?: GatewayOptions['fetch']; sleep?: GatewayOptions['sleep']; onFallback?: GatewayOptions['onFallback'] } = {}): Promise<App> {
	if (!o.env) loadDotEnv();
	const env = o.env ?? process.env;
	const config = new Config(o.tiers ?? loadTiers(), env);
	const db = await open(o.dbPath ?? resolve(ROOT, env.ONYX_DB ?? './data/onyx.db'));
	const plan = Plan.catch('max').parse(env.ONYX_PLAN);
	await ensureUser(db, 'owner', 'Owner', plan);
	const gateway = new Gateway({ config, db, fetch: o.fetch, sleep: o.sleep, onFallback: o.onFallback });
	return { config, db, gateway, router: new Router(config, gateway, db), owner: 'owner' };
}

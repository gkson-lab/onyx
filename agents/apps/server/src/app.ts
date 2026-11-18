// Puts the pieces together: config, database, gateway, router, tools, agents, channels, scheduler, connectors.
// Used by the server, the terminal chat and the tests.
import { resolve } from 'node:path';
import { Config, loadDotEnv, loadEquivalents, loadTiers, ROOT, type Env, type Equivalent, type TiersFile } from './config.ts';
import { ensureUser, open, type DB } from './db.ts';
import { Gateway, type GatewayOptions } from './models/gateway.ts';
import { Router } from './models/router.ts';
import { Bus } from './bus.ts';
import { Runtime } from './agents/runtime.ts';
import { ToolRegistry } from './tools/types.ts';
import { builtinTools, type ToolDeps } from './tools/builtin.ts';
import { Connectors, type Connect } from './tools/mcp.ts';
import { Outbox } from './channels/outbox.ts';
import { Scheduler } from './scheduler.ts';
import { embedder } from './embed.ts';
import { SmsChannel, WhatsAppChannel } from './channels/phone.ts';
import { Push } from './push.ts';
import { Plan } from '@onyx/shared';

export interface App {
	config: Config;
	env: Env;
	db: DB;
	bus: Bus;
	gateway: Gateway;
	router: Router;
	tools: ToolRegistry;
	runtime: Runtime;
	outbox: Outbox;
	scheduler: Scheduler;
	connectors: Connectors;
	whatsapp: WhatsAppChannel;
	sms: SmsChannel;
	push: Push;
	/** The account of the person whose machine this is. */
	owner: string;
}

export interface AppOptions {
	tiers?: TiersFile;
	equivalents?: Record<string, Equivalent>;
	env?: Env;
	dbPath?: string;
	fetch?: GatewayOptions['fetch'];
	sleep?: GatewayOptions['sleep'];
	onFallback?: GatewayOptions['onFallback'];
	tool?: Partial<ToolDeps>;
	clock?: () => Date;
	connect?: Connect;
	/** Used for Claude (Anthropic's SDK); replaced in tests. */
	anthropicFetch?: typeof fetch;
	/** Used by the phone channels to reach Meta and Twilio; replaced in tests. */
	phoneFetch?: typeof fetch;
	pushSend?: ConstructorParameters<typeof Push>[1];
	connectorsPath?: string;
}

export async function createApp(o: AppOptions = {}): Promise<App> {
	if (!o.env) loadDotEnv();
	const env = o.env ?? process.env;
	const config = new Config(o.tiers ?? loadTiers(), env, o.equivalents ?? (o.tiers ? {} : loadEquivalents()));
	const db = await open(o.dbPath ?? resolve(ROOT, env.ONYX_DB ?? './data/onyx.db'));
	const plan = Plan.catch('max').parse(env.ONYX_PLAN);
	await ensureUser(db, 'owner', 'Owner', plan);
	const bus = new Bus();
	const gateway = new Gateway({ config, db, fetch: o.fetch, anthropicFetch: o.anthropicFetch, sleep: o.sleep, onFallback: o.onFallback });
	const router = new Router(config, gateway, db);
	const tools = new ToolRegistry().add(...builtinTools({ db, env, embed: o.fetch ? undefined : embedder(config), clock: o.clock, ...o.tool } as ToolDeps));
	const runtime = new Runtime({ db, gateway, router, bus, tools, clock: o.clock });
	await runtime.seed();
	const outbox = new Outbox(db, bus);
	const whatsapp = new WhatsAppChannel(db, env, o.phoneFetch);
	const sms = new SmsChannel(db, env, o.phoneFetch);
	outbox.add(whatsapp);
	outbox.add(sms);
	const push = new Push(db, o.pushSend);
	// A message Onyx starts also goes to the installed app as a notification.
	bus.on((e) => e.type === 'message' && e.data.proactive && void push.notify(String(e.data.userId), String(e.data.text)).catch(() => {}));
	const scheduler = new Scheduler(db, outbox, o.clock);
	const connectors = new Connectors(tools, env, o.connect, o.connectorsPath);
	return { config, env, db, bus, gateway, router, tools, runtime, outbox, scheduler, connectors, whatsapp, sms, push, owner: 'owner' };
}

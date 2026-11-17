// Reads tiers.yaml and the environment. Keys are read from the environment at call time and never stored here.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { z } from 'zod';
import { Tier, Plan, TIERS } from '@onyx/shared';

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(here, '../../..');

const Provider = z.object({
	base_url: z.string().url(),
	base_url_env: z.string().optional(),
	api_key_env: z.string().optional(),
	local: z.boolean(),
	/** Calls sent to this provider at the same time. Default: 1 for a local one (one graphics card), 8 for a cloud one. */
	max_concurrent: z.number().int().min(1).max(64).optional(),
});
const Model = z.object({
	provider: z.string(),
	id: z.string().min(1),
	family: z.string().default('qwen'),
	price: z.object({ input: z.number().nonnegative(), output: z.number().nonnegative() }).nullable().default(null),
	system_suffix: z.string().optional(),
	extra: z.record(z.unknown()).optional(),
	/** False for a model that cannot call tools: it is skipped for any call that offers tools. */
	tools: z.boolean().default(true),
});
const TierDef = z.object({ label: z.string(), use_for: z.string().default(''), models: z.array(z.string()).min(1) });
const PlanDef = z.object({ tiers: z.array(Tier).min(1), daily_tokens: z.number().int().positive() });

export const TiersFile = z
	.object({
		version: z.literal(1),
		providers: z.record(Provider),
		models: z.record(Model),
		tiers: z.object({ lite: TierDef, standard: TierDef, pro: TierDef, max: TierDef }),
		billing: z.object({ enabled: z.boolean() }).default({ enabled: false }),
		plans: z.record(Plan, PlanDef),
		fallback: z.object({ retries: z.number().int().min(0).max(5), backoff_ms: z.number().int().min(0), drop_tier: z.boolean(), timeout_ms: z.number().int().positive() }),
		router: z.object({ tier: Tier, timeout_ms: z.number().int().positive() }),
		embeddings: z.object({ provider: z.string(), model: z.string() }).optional(),
		/** The model that reads attached images (a key under models). */
		vision: z.object({ model: z.string() }).optional(),
	})
	.superRefine((f, ctx) => {
		for (const [key, m] of Object.entries(f.models)) if (!f.providers[m.provider]) ctx.addIssue({ code: 'custom', message: `model "${key}" names a provider that isn't defined: ${m.provider}` });
		for (const t of TIERS) for (const key of f.tiers[t].models) if (!f.models[key]) ctx.addIssue({ code: 'custom', message: `tier "${t}" names a model that isn't defined: ${key}` });
	});
export type TiersFile = z.infer<typeof TiersFile>;
export type ModelDef = z.infer<typeof Model> & { key: string };

/**
 * This PC's own version of a shipped config file: config/x.local.yaml beside config/x.yaml. Updates replace the
 * shipped files and never touch the local ones, so your changes go in those.
 */
export const localOf = (path: string): string => path.replace(/\.ya?ml$/, '.local.yaml');

/**
 * What a local model would cost on a paid host, by Ollama model id: config/equivalents.yaml, with any prices of your
 * own from config/equivalents.local.yaml on top (so updates still bring prices for new models).
 */
export const Equivalents = z.object({ equivalents: z.record(z.object({ name: z.string(), input: z.number().nonnegative(), output: z.number().nonnegative(), source: z.string() })).default({}) });
export type Equivalent = z.infer<typeof Equivalents>['equivalents'][string];
export function loadEquivalents(path = resolve(ROOT, 'config/equivalents.yaml')): Record<string, Equivalent> {
	const read = (p: string) => (existsSync(p) ? Equivalents.parse(parse(readFileSync(p, 'utf8')) ?? {}).equivalents : {});
	return { ...read(path), ...read(localOf(path)) };
}

export type Env = Record<string, string | undefined>;

/** Loads KEY=value lines from a .env file into process.env, without overriding what is already set. */
export function loadDotEnv(path = resolve(ROOT, '.env')): void {
	if (!existsSync(path)) return;
	for (const line of readFileSync(path, 'utf8').split('\n')) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
		if (m && process.env[m[1]!] === undefined) process.env[m[1]!] = m[2]!.replace(/^["']|["']$/g, '');
	}
}

export function parseTiers(text: string): TiersFile {
	return TiersFile.parse(parse(text));
}
/** The tiers file as shipped, and this PC's own version of it. The local one wins, and updates never touch it. */
export const BASE_TIERS = resolve(ROOT, 'config/tiers.yaml');
export const LOCAL_TIERS = resolve(ROOT, 'config/tiers.local.yaml');
export const tiersPath = (): string => (existsSync(LOCAL_TIERS) ? LOCAL_TIERS : BASE_TIERS);

export function loadTiers(path = tiersPath()): TiersFile {
	return parseTiers(readFileSync(path, 'utf8'));
}

export class Config {
	constructor(public file: TiersFile, private readonly env: Env = process.env, public readonly equivalents: Record<string, Equivalent> = {}) {}

	/** Swaps in an edited tiers file (already validated). */
	replace(file: TiersFile): void {
		this.file = file;
	}

	get cloud(): boolean {
		return /^(on|1|true|yes)$/i.test(this.env.ONYX_CLOUD ?? '');
	}
	baseUrl(provider: string): string {
		const p = this.file.providers[provider]!;
		return ((p.base_url_env && this.env[p.base_url_env]) || p.base_url).replace(/\/+$/, '');
	}
	apiKey(provider: string): string | null {
		const p = this.file.providers[provider]!;
		return (p.api_key_env && this.env[p.api_key_env]) || null;
	}
	/** A provider can be used when it is local, or when cloud use is on and its key is set. */
	usable(provider: string): boolean {
		const p = this.file.providers[provider]!;
		return p.local || (this.cloud && !!this.apiKey(provider));
	}
	model(key: string): ModelDef {
		return { ...this.file.models[key]!, key };
	}
	/** The models that can back a tier right now, in the order to try them. */
	candidates(tier: Tier): ModelDef[] {
		return this.file.tiers[tier].models.map((k) => this.model(k)).filter((m) => this.usable(m.provider));
	}
	/** What the UI shows: tier labels and real model names. No URLs, no keys. */
	publicTiers() {
		return TIERS.map((t) => {
			const c = this.candidates(t);
			return { tier: t, label: this.file.tiers[t].label, use_for: this.file.tiers[t].use_for, model: c[0]?.id ?? null, provider: c[0]?.provider ?? null, local: c[0] ? this.file.providers[c[0].provider]!.local : null, alternates: c.slice(1).map((m) => m.id) };
		});
	}
}

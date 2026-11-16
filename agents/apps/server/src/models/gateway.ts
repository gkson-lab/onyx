// The model gateway: every model call in Onyx goes through `complete`. It keeps a caller inside their plan and
// daily limit, tries the tier's models in order, and when one fails it retries, then moves to the next provider,
// then drops a tier. Every call and every step down is written to the database. It never fails silently: if
// nothing answered, it throws with the whole trail.
import { TIERS, tierRank, type ChatMessage, type Fallback, type Tier, type ToolCall, type ToolDef, type Usage, type Plan } from '@onyx/shared';
import type { Config, ModelDef } from '../config.ts';
import { now, today, type DB } from '../db.ts';
import { chat, ProviderError, type FetchLike } from './provider.ts';

export interface CompleteRequest {
	userId: string;
	tier: Tier;
	messages: ChatMessage[];
	purpose?: string;
	runId?: string | null;
	tools?: ToolDef[];
	toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
	maxTokens?: number;
	temperature?: number;
	timeoutMs?: number;
	signal?: AbortSignal;
	onDelta?: (text: string) => void;
	/** Set to false where a lower tier would be worse than an error (the router itself, for one). */
	allowTierDrop?: boolean;
}
export interface CompleteResult {
	content: string;
	reasoning: string;
	toolCalls: ToolCall[];
	finish: string;
	usage: Usage;
	costUsd: number | null;
	latencyMs: number;
	tier: Tier;
	requestedTier: Tier;
	model: string;
	modelKey: string;
	provider: string;
	local: boolean;
	fallbacks: Fallback[];
}

export class LimitError extends Error {}
export class AllModelsFailed extends Error {
	constructor(message: string, public readonly fallbacks: Fallback[]) {
		super(message);
	}
}

export interface GatewayOptions {
	config: Config;
	db: DB;
	fetch?: FetchLike;
	sleep?: (ms: number) => Promise<void>;
	onFallback?: (f: Fallback, req: CompleteRequest) => void;
}

export class Gateway {
	private readonly config: Config;
	private readonly db: DB;
	private readonly fetch?: FetchLike;
	private readonly sleep: (ms: number) => Promise<void>;
	private readonly onFallback?: GatewayOptions['onFallback'];

	constructor(o: GatewayOptions) {
		this.config = o.config;
		this.db = o.db;
		this.fetch = o.fetch;
		this.sleep = o.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
		this.onFallback = o.onFallback;
	}

	/** USD for a call, or null when the model's price isn't in the config. */
	cost(model: ModelDef, usage: Usage): number | null {
		if (!model.price) return null;
		return (usage.input * model.price.input + usage.output * model.price.output) / 1e6;
	}

	async plan(userId: string): Promise<Plan> {
		const u = await this.db.selectFrom('users').select('plan').where('id', '=', userId).executeTakeFirst();
		if (!u) throw new LimitError(`no such user: ${userId}`);
		return u.plan as Plan;
	}
	async usedToday(userId: string): Promise<number> {
		const row = await this.db.selectFrom('usage_daily').select('tokens').where('user_id', '=', userId).where('day', '=', today()).executeTakeFirst();
		return row?.tokens ?? 0;
	}
	/** The highest tier at or below `tier` that the plan includes. */
	clamp(plan: Plan, tier: Tier): Tier {
		const allowed = this.config.file.plans[plan]!.tiers;
		for (let i = tierRank(tier); i >= 0; i--) if (allowed.includes(TIERS[i]!)) return TIERS[i]!;
		return allowed[0]!;
	}

	private async note(req: CompleteRequest, trail: Fallback[], f: Fallback): Promise<void> {
		trail.push(f);
		await this.db.insertInto('fallbacks').values({ user_id: req.userId, run_id: req.runId ?? null, kind: f.kind, from_ref: f.from, to_ref: f.to, reason: f.reason, created_at: now() }).execute();
		this.onFallback?.(f, req);
	}

	async complete(req: CompleteRequest): Promise<CompleteResult> {
		const fb = this.config.file.fallback;
		const plan = await this.plan(req.userId);
		const limit = this.config.file.plans[plan]!.daily_tokens;
		const used = await this.usedToday(req.userId);
		if (used >= limit) throw new LimitError(`Daily limit reached: ${used.toLocaleString('en-US')} of ${limit.toLocaleString('en-US')} tokens used today on the ${plan} plan. It resets at midnight UTC.`);

		const trail: Fallback[] = [];
		let tier = this.clamp(plan, req.tier);
		if (tier !== req.tier) await this.note(req, trail, { kind: 'plan', from: req.tier, to: tier, reason: `the ${plan} plan doesn't include the ${req.tier} tier` });
		const purpose = req.purpose ?? 'chat';
		const errors: string[] = [];

		for (;;) {
			const candidates = this.config.candidates(tier);
			if (!candidates.length) errors.push(`${tier}: no usable model is configured`);
			for (const [i, model] of candidates.entries()) {
				let last = '';
				for (let attempt = 0; attempt <= fb.retries; attempt++) {
					const started = Date.now();
					const messages = model.system_suffix ? withSuffix(req.messages, model.system_suffix) : req.messages;
					try {
						const r = await chat({ baseUrl: this.config.baseUrl(model.provider), apiKey: this.config.apiKey(model.provider), model: model.id, messages, tools: req.tools, toolChoice: req.toolChoice, maxTokens: req.maxTokens, temperature: req.temperature, extra: model.extra, timeoutMs: req.timeoutMs ?? fb.timeout_ms, signal: req.signal, onDelta: req.onDelta }, this.fetch);
						const latencyMs = Date.now() - started;
						const costUsd = this.cost(model, r.usage);
						await this.db.insertInto('model_calls').values({ user_id: req.userId, run_id: req.runId ?? null, purpose, tier, model_key: model.key, provider: model.provider, model_id: model.id, status: 'ok', error: null, input_tokens: r.usage.input, output_tokens: r.usage.output, usage_estimated: r.usage.estimated ? 1 : 0, cost_usd: costUsd, latency_ms: latencyMs, attempt, created_at: now() }).execute();
						const tokens = r.usage.input + r.usage.output;
						await this.db.insertInto('usage_daily').values({ user_id: req.userId, day: today(), tokens, cost_usd: costUsd ?? 0 }).onConflict((c) => c.columns(['user_id', 'day']).doUpdateSet((eb) => ({ tokens: eb('usage_daily.tokens', '+', tokens), cost_usd: eb('usage_daily.cost_usd', '+', costUsd ?? 0) }))).execute();
						return { ...r, costUsd, latencyMs, tier, requestedTier: req.tier, model: model.id, modelKey: model.key, provider: model.provider, local: this.config.file.providers[model.provider]!.local, fallbacks: trail };
					} catch (e) {
						const err = e instanceof ProviderError ? e : new ProviderError((e as Error).message, 0, false);
						last = err.message;
						await this.db.insertInto('model_calls').values({ user_id: req.userId, run_id: req.runId ?? null, purpose, tier, model_key: model.key, provider: model.provider, model_id: model.id, status: 'error', error: err.message, input_tokens: 0, output_tokens: 0, usage_estimated: 0, cost_usd: null, latency_ms: Date.now() - started, attempt, created_at: now() }).execute();
						if (err.status === 499) throw err;
						if (!err.retryable || attempt === fb.retries) break;
						await this.note(req, trail, { kind: 'retry', from: `${model.provider}/${model.id}`, to: `${model.provider}/${model.id}`, reason: `${err.message}; try ${attempt + 2} of ${fb.retries + 1}` });
						await this.sleep(fb.backoff_ms * 2 ** attempt);
					}
				}
				errors.push(`${model.provider}/${model.id}: ${last}`);
				const next = candidates[i + 1];
				if (next) await this.note(req, trail, { kind: 'provider', from: `${model.provider}/${model.id}`, to: `${next.provider}/${next.id}`, reason: last });
			}
			const lower = tierRank(tier) > 0 ? this.clamp(plan, TIERS[tierRank(tier) - 1]!) : null;
			if (!fb.drop_tier || req.allowTierDrop === false || !lower || lower === tier) break;
			await this.note(req, trail, { kind: 'tier', from: tier, to: lower, reason: `every model in the ${tier} tier failed` });
			tier = lower;
		}
		throw new AllModelsFailed(`No model answered. ${errors.join(' | ')}`, trail);
	}
}

/** Adds a model's switch (Qwen's /think or /no_think) to the system message, or adds one to carry it. */
function withSuffix(messages: ChatMessage[], suffix: string): ChatMessage[] {
	const i = messages.findIndex((m) => m.role === 'system');
	if (i < 0) return [{ role: 'system', content: suffix }, ...messages];
	return messages.map((m, k) => (k === i ? { ...m, content: `${m.content ?? ''}\n${suffix}` } : m));
}

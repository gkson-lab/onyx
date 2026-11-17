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
	/** When the caller's time budget runs out (ms since 1970). Waiting for the model counts against it. */
	deadline?: number;
	signal?: AbortSignal;
	onDelta?: (text: string) => void;
	/** Set to false where a lower tier would be worse than an error (the router itself, for one). */
	allowTierDrop?: boolean;
	/** Call this one model (a key under models), not the tier's: the image reader, for one. */
	modelKey?: string;
	/**
	 * Told how long the call waited for its turn on the graphics card. That wait is given back: it does not count
	 * against the caller's time budget (see deadline), and the caller can give it back to its own budget too.
	 */
	onWait?: (ms: number) => void;
}
export interface CompleteResult {
	content: string;
	reasoning: string;
	toolCalls: ToolCall[];
	finish: string;
	usage: Usage;
	costUsd: number | null;
	/** What this call would have cost on a paid host running the same model. Null when not known or not local. */
	equivalentUsd: number | null;
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

// Less time than this left in the budget: another try could not finish, so it is not made.
const MIN_TRY_MS = 5000;
/** A model's extra settings switch thinking off (Qwen3 through Ollama: reasoning_effort "none"). */
const thinkingOff = (extra: Record<string, unknown> | undefined) => extra?.reasoning_effort === 'none';
const thinkingOn = (extra: Record<string, unknown> | undefined) => {
	const { reasoning_effort: _, ...rest } = extra ?? {};
	return rest;
};

export class Gateway {
	private readonly config: Config;
	private readonly db: DB;
	private readonly fetch?: FetchLike;
	private readonly sleep: (ms: number) => Promise<void>;
	private readonly onFallback?: GatewayOptions['onFallback'];
	private readonly lanes = new Map<string, { active: number; waiting: (() => void)[] }>();

	constructor(o: GatewayOptions) {
		this.config = o.config;
		this.db = o.db;
		this.fetch = o.fetch;
		this.sleep = o.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
		this.onFallback = o.onFallback;
	}

	/**
	 * Waits for a free slot at a provider. A local provider takes one call at a time by default: calls for different
	 * models at once make Ollama load several models onto one graphics card together, which is how a model ends up
	 * split onto the processor or failing to load.
	 */
	private async acquire(provider: string, signal?: AbortSignal): Promise<() => void> {
		const p = this.config.file.providers[provider]!;
		const limit = p.max_concurrent ?? (p.local ? 1 : 8);
		const lane = this.lanes.get(provider) ?? { active: 0, waiting: [] };
		this.lanes.set(provider, lane);
		const release = () => {
			lane.active--;
			lane.waiting.shift()?.();
		};
		if (lane.active < limit) {
			lane.active++;
			return release;
		}
		await new Promise<void>((resolve, reject) => {
			const go = () => {
				signal?.removeEventListener('abort', stop);
				lane.active++;
				resolve();
			};
			const stop = () => {
				lane.waiting.splice(lane.waiting.indexOf(go), 1);
				reject(new ProviderError('cancelled', 499, false));
			};
			if (signal?.aborted) return stop();
			lane.waiting.push(go);
			signal?.addEventListener('abort', stop, { once: true });
		});
		return release;
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
		// Plans and limits apply only when billing is on. With it off, every tier is open; tokens are still counted.
		const billing = this.config.file.billing.enabled;
		const plan = await this.plan(req.userId);
		if (billing) {
			const limit = this.config.file.plans[plan]!.daily_tokens;
			const used = await this.usedToday(req.userId);
			if (used >= limit) throw new LimitError(`Daily limit reached: ${used.toLocaleString('en-US')} of ${limit.toLocaleString('en-US')} tokens used today on the ${plan} plan. It resets at midnight UTC.`);
		}

		const trail: Fallback[] = [];
		let tier = billing ? this.clamp(plan, req.tier) : req.tier;
		if (tier !== req.tier) await this.note(req, trail, { kind: 'plan', from: req.tier, to: tier, reason: `the ${plan} plan doesn't include the ${req.tier} tier` });
		const purpose = req.purpose ?? 'chat';
		const errors: string[] = [];
		let outOfTime = false;
		let deadline = req.deadline;
		const left = () => (deadline === undefined ? Infinity : deadline - Date.now());

		for (;;) {
			// A model that cannot call tools is no use to a call that offers them.
			const candidates = req.modelKey ? [this.config.model(req.modelKey)] : this.config.candidates(tier).filter((m) => m.tools !== false || !req.tools?.length);
			if (!candidates.length) errors.push(`${tier}: no usable model is configured`);
			for (const [i, model] of candidates.entries()) {
				let last = '';
				// Ollama 0.40 loses a tool call that Qwen3 writes with thinking off: it pre-fills an empty <think></think>, then
				// takes the "<t" of "<tool_call>" for the start of another <think> tag, and the call never arrives (an empty
				// answer, though the model wrote it; qwen3:8b, seen in real runs). With thinking on it comes through. So such a
				// call is asked again with thinking on, for that call only: plain answers, most of what Core writes, stay fast.
				let thinkNow = false;
				for (let attempt = 0; attempt <= fb.retries; attempt++) {
					if (left() < MIN_TRY_MS) {
						outOfTime = true;
						last = `out of time: the agent's time budget had ${Math.max(0, Math.round(left() / 1000))} s left`;
						break;
					}
					const asked = Date.now();
					const release = await this.acquire(model.provider, req.signal);
					// Time spent waiting for another call to finish on the graphics card is not this call's: on a slow PC, an
					// agent working beside another could spend its whole budget in the queue (seen in a real run).
					const waited = Date.now() - asked;
					if (waited > 20) {
						if (deadline !== undefined) deadline += waited;
						req.onWait?.(waited);
					}
					const started = Date.now();
					const messages = model.system_suffix ? withSuffix(req.messages, model.system_suffix) : req.messages;
					try {
						const r = await chat({ baseUrl: this.config.baseUrl(model.provider), apiKey: this.config.apiKey(model.provider), model: model.id, messages, tools: req.tools, toolChoice: req.toolChoice, maxTokens: req.maxTokens, temperature: req.temperature, extra: thinkNow ? thinkingOn(model.extra) : model.extra, timeoutMs: Math.max(1000, Math.min(req.timeoutMs ?? fb.timeout_ms, left())), signal: req.signal, onDelta: req.onDelta }, this.fetch);
						const latencyMs = Date.now() - started;
						const costUsd = this.cost(model, r.usage);
						const eq = this.config.file.providers[model.provider]!.local ? this.config.equivalents[model.id] : undefined;
						const equivalentUsd = eq ? (r.usage.input * eq.input + r.usage.output * eq.output) / 1e6 : null;
						await this.db.insertInto('model_calls').values({ user_id: req.userId, run_id: req.runId ?? null, purpose, tier, model_key: model.key, provider: model.provider, model_id: model.id, status: 'ok', error: null, input_tokens: r.usage.input, output_tokens: r.usage.output, usage_estimated: r.usage.estimated ? 1 : 0, cost_usd: costUsd, equivalent_usd: equivalentUsd, latency_ms: latencyMs, attempt, created_at: now() }).execute();
						const tokens = r.usage.input + r.usage.output;
						await this.db.insertInto('usage_daily').values({ user_id: req.userId, day: today(), tokens, cost_usd: costUsd ?? 0 }).onConflict((c) => c.columns(['user_id', 'day']).doUpdateSet((eb) => ({ tokens: eb('usage_daily.tokens', '+', tokens), cost_usd: eb('usage_daily.cost_usd', '+', costUsd ?? 0) }))).execute();
						return { ...r, costUsd, equivalentUsd, latencyMs, tier, requestedTier: req.tier, model: model.id, modelKey: model.key, provider: model.provider, local: this.config.file.providers[model.provider]!.local, fallbacks: trail };
					} catch (e) {
						const err = e instanceof ProviderError ? e : new ProviderError((e as Error).message, 0, false);
						// A tool call lost to Ollama's thinking switch (above): ask again straight away, with thinking on.
						const lost = err.kind === 'empty' && !!req.tools?.length && thinkingOff(model.extra) && !thinkNow;
						last = lost ? `its tool call was lost with thinking switched off (an Ollama bug: ${err.generated ?? 0} tokens written, none delivered); asked again with thinking on` : err.message;
						await this.db.insertInto('model_calls').values({ user_id: req.userId, run_id: req.runId ?? null, purpose, tier, model_key: model.key, provider: model.provider, model_id: model.id, status: 'error', error: last, input_tokens: 0, output_tokens: 0, usage_estimated: 0, cost_usd: null, latency_ms: Date.now() - started, attempt, created_at: now() }).execute();
						if (err.status === 499) throw err;
						if (lost) {
							thinkNow = true;
							await this.note(req, trail, { kind: 'retry', from: `${model.provider}/${model.id}`, to: `${model.provider}/${model.id}`, reason: 'its tool call was lost with thinking off; asked again with thinking on' });
							// Not a try used up: the model did its part.
							attempt--;
							continue;
						}
						// With too little of the agent's time left, a retry, another provider or a lower tier would only fail
						// again in a second or two, and count as more failures. Stop here and say why.
						if (left() < MIN_TRY_MS) {
							outOfTime = true;
							last = `${err.message} (not tried again: the agent's time budget had ${Math.max(0, Math.round(left() / 1000))} s left)`;
							break;
						}
						if (!err.retryable || attempt === fb.retries) break;
						await this.note(req, trail, { kind: 'retry', from: `${model.provider}/${model.id}`, to: `${model.provider}/${model.id}`, reason: `${err.message}; try ${attempt + 2} of ${fb.retries + 1}` });
						await this.sleep(fb.backoff_ms * 2 ** attempt);
					} finally {
						release();
					}
				}
				errors.push(`${model.provider}/${model.id}: ${last}`);
				if (outOfTime) break;
				const next = candidates[i + 1];
				if (next) await this.note(req, trail, { kind: 'provider', from: `${model.provider}/${model.id}`, to: `${next.provider}/${next.id}`, reason: last });
			}
			const lower = tierRank(tier) > 0 ? (billing ? this.clamp(plan, TIERS[tierRank(tier) - 1]!) : TIERS[tierRank(tier) - 1]!) : null;
			if (outOfTime || !fb.drop_tier || req.allowTierDrop === false || !lower || lower === tier) break;
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

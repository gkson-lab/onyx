// The router: the Lite model reads each message and picks the tier that should answer it. It answers through a
// real tool call (`route`), so its decision arrives as structured arguments, not as prose to pick apart. A message
// that starts with /lite, /standard, /pro or /max skips the model: the person chose.
import { z } from 'zod';
import { Tier, TIERS, tierRank, type RoutingDecision, type ToolDef } from '@onyx/shared';
import type { Config } from '../config.ts';
import { now, type DB } from '../db.ts';
import type { Gateway } from './gateway.ts';

const OVERRIDE = /^\s*\/(lite|standard|pro|max)\b[ \t]*/i;
const THINK_HARD = /^\s*\/think\b[ \t]*/i;

/** A tier the person asked for at the start of a message, and the message without it. */
export function parseOverride(text: string): { tier: Tier | null; text: string } {
	const m = text.match(OVERRIDE);
	if (m) return { tier: m[1]!.toLowerCase() as Tier, text: text.slice(m[0].length) };
	if (THINK_HARD.test(text)) return { tier: 'max', text: text.replace(THINK_HARD, '') };
	return { tier: null, text };
}

const Args = z.object({
	tier: Tier,
	complexity: z.enum(['low', 'medium', 'high']),
	tools: z.array(z.string()).default([]),
	urgency: z.enum(['low', 'normal', 'high']).default('normal'),
	reason: z.string().min(1).max(300),
});

const ROUTE: ToolDef = {
	type: 'function',
	function: {
		name: 'route',
		description: 'Record which tier should handle the message.',
		parameters: {
			type: 'object',
			properties: {
				tier: { type: 'string', enum: [...TIERS], description: 'lite: greetings, thanks, one-line facts, reformatting. standard: normal conversation, explanations, summaries, short writing. pro: writing or fixing code, tasks needing tools (search, running code, reminders), multi-step work. max: hard reasoning, proofs, long research, careful analysis, or when asked to think hard.' },
				complexity: { type: 'string', enum: ['low', 'medium', 'high'] },
				tools: { type: 'array', items: { type: 'string', enum: ['web_search', 'code', 'schedule', 'memory', 'connector'] }, description: 'Tools the task will need, if any.' },
				urgency: { type: 'string', enum: ['low', 'normal', 'high'] },
				reason: { type: 'string', description: 'One short sentence: why this tier.' },
			},
			required: ['tier', 'complexity', 'tools', 'urgency', 'reason'],
		},
	},
};
const SYSTEM = 'You route messages for an assistant. Read the message and call the `route` tool exactly once. Pick the cheapest tier that will do the job well. Do not answer the message.';

/** A plain guess from the message's surface, used only when the Lite model can't be reached. Always logged as such. */
export function heuristic(text: string): Omit<RoutingDecision, 'via' | 'text'> {
	const t = text.toLowerCase();
	const words = t.split(/\s+/).filter(Boolean).length;
	const tools: string[] = [];
	if (/\b(search|look up|latest|news|today|find out|research)\b|https?:\/\//.test(t)) tools.push('web_search');
	if (/\b(code|function|script|bug|error|compile|python|javascript|typescript|rust|sql|regex)\b|```/.test(t)) tools.push('code');
	if (/\b(remind|reminder|every (?:day|week|morning|monday)|schedule|at \d{1,2}(?::\d\d)?\s?(?:am|pm)?|tomorrow)\b/.test(t)) tools.push('schedule');
	if (/\b(remember|don'?t forget|forget that|what do you know about me|my (?:name|birthday|preference)|i prefer)\b/.test(t)) tools.push('memory');
	const urgency = /\b(urgent|asap|right now|immediately|emergency)\b/.test(t) ? 'high' : 'normal';
	if (/\b(prove|proof|think hard|step by step|derive|rigorous|in depth|deep dive)\b/.test(t)) return { tier: 'max', complexity: 'high', tools, urgency, reason: 'asks for careful reasoning' };
	if (tools.some((x) => x !== 'schedule' && x !== 'memory')) return { tier: 'pro', complexity: 'medium', tools, urgency, reason: `needs ${tools.join(', ')}` };
	if (tools.length) return { tier: 'standard', complexity: 'low', tools, urgency, reason: `needs ${tools.join(', ')}` };
	if (words <= 6 && !/\b(why|how|explain|compare)\b/.test(t)) return { tier: 'lite', complexity: 'low', tools, urgency, reason: 'a short message' };
	return { tier: 'standard', complexity: words > 120 ? 'medium' : 'low', tools, urgency, reason: 'ordinary conversation' };
}

export class Router {
	constructor(private readonly config: Config, private readonly gateway: Gateway, private readonly db: DB) {}

	async route(userId: string, raw: string, runId: string | null = null): Promise<RoutingDecision> {
		const started = Date.now();
		const o = parseOverride(raw);
		let d: RoutingDecision;
		if (o.tier) {
			d = { tier: o.tier, via: 'override', reason: `you asked for /${o.tier}`, complexity: 'medium', tools: [], urgency: 'normal', text: o.text };
		} else {
			try {
				const r = await this.gateway.complete({ userId, runId, purpose: 'route', tier: this.config.file.router.tier, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: raw.slice(0, 4000) }], tools: [ROUTE], toolChoice: { type: 'function', function: { name: 'route' } }, temperature: 0, maxTokens: 300, timeoutMs: this.config.file.router.timeout_ms, allowTierDrop: false });
				const call = r.toolCalls.find((c) => c.function.name === 'route');
				if (!call) throw new Error('the router model did not call `route`');
				const a = Args.parse(JSON.parse(call.function.arguments));
				d = { ...a, via: 'router', text: raw };
				// Small router models under-rate work that needs tools: writing code went to Lite in a real run.
				// Code, the web and connectors need Pro; reminders and memory need at least Standard.
				// The model can also miss a need the words make plain (a link to read, "remember", "remind"): the rules add those.
				const tools = [...new Set([...a.tools, ...heuristic(raw).tools])];
				d = { ...d, tools };
				const floor: Tier | null = tools.some((t) => ['code', 'web_search', 'connector'].includes(t)) ? 'pro' : tools.length ? 'standard' : null;
				if (floor && tierRank(a.tier) < tierRank(floor)) d = { ...d, tier: floor, reason: `${a.reason} (raised from ${a.tier} to ${floor}: it needs ${tools.join(', ')})` };
			} catch (e) {
				const h = heuristic(raw);
				d = { ...h, via: 'heuristic', reason: `${h.reason} (rule-based guess: the router model failed: ${(e as Error).message.slice(0, 160)})`, text: raw };
			}
		}
		// What the plan allows is settled by the gateway, which logs it; the decision records what was wanted.
		await this.db.insertInto('routing_decisions').values({ user_id: userId, run_id: runId, text: d.text.slice(0, 500), tier: d.tier, via: d.via, reason: d.reason, complexity: d.complexity, tools: JSON.stringify(d.tools), urgency: d.urgency, latency_ms: Date.now() - started, created_at: now() }).execute();
		return d;
	}
}

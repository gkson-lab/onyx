// Types shared by the server and, later, the web app. Everything that crosses a boundary is a zod schema.
import { z } from 'zod';

export const TIERS = ['lite', 'standard', 'pro', 'max'] as const;
export const Tier = z.enum(TIERS);
export type Tier = z.infer<typeof Tier>;
export const tierRank = (t: Tier): number => TIERS.indexOf(t);

export const Plan = z.enum(['free', 'pro', 'max']);
export type Plan = z.infer<typeof Plan>;

export const ToolCall = z.object({
	id: z.string(),
	type: z.literal('function').default('function'),
	function: z.object({ name: z.string(), arguments: z.string() }),
});
export type ToolCall = z.infer<typeof ToolCall>;

export const ChatMessage = z.object({
	role: z.enum(['system', 'user', 'assistant', 'tool']),
	content: z.string().nullable(),
	tool_calls: z.array(ToolCall).optional(),
	tool_call_id: z.string().optional(),
	name: z.string().optional(),
	/**
	 * An assistant turn's content as its provider wrote it, for that provider only: Claude's thinking blocks must be
	 * sent back unchanged in the next request of a tool loop. Other providers never see it.
	 */
	raw: z.unknown().optional(),
});
export type ChatMessage = z.infer<typeof ChatMessage>;

export const ToolDef = z.object({
	type: z.literal('function'),
	function: z.object({ name: z.string(), description: z.string(), parameters: z.record(z.unknown()) }),
});
export type ToolDef = z.infer<typeof ToolDef>;

export const Usage = z.object({ input: z.number().int().nonnegative(), output: z.number().int().nonnegative(), estimated: z.boolean() });
export type Usage = z.infer<typeof Usage>;

/** What the router decided for one message, and why. Logged, and shown in the UI. */
export const RoutingDecision = z.object({
	tier: Tier,
	via: z.enum(['override', 'router', 'heuristic']),
	reason: z.string(),
	complexity: z.enum(['low', 'medium', 'high']),
	tools: z.array(z.string()),
	urgency: z.enum(['low', 'normal', 'high']),
	text: z.string(),
});
export type RoutingDecision = z.infer<typeof RoutingDecision>;

/** One step down from the model that was asked for: a retry, another provider, or a lower tier. */
export const Fallback = z.object({
	kind: z.enum(['retry', 'provider', 'tier', 'plan']),
	from: z.string(),
	to: z.string(),
	reason: z.string(),
});
export type Fallback = z.infer<typeof Fallback>;

/* ---------- Agents, runs and the event stream ---------- */

export const CHANNELS = ['web', 'whatsapp', 'sms', 'terminal'] as const;
export const Channel = z.enum(CHANNELS);
export type Channel = z.infer<typeof Channel>;

export const AgentDef = z.object({
	id: z.string().regex(/^[a-z][a-z0-9_-]{1,30}$/),
	name: z.string().min(1).max(40),
	description: z.string().max(300).default(''),
	system_prompt: z.string().min(1).max(8000),
	tier: Tier,
	tools: z.array(z.string()).default([]),
	enabled: z.boolean().default(true),
	max_steps: z.number().int().min(1).max(30).default(8),
	token_budget: z.number().int().min(500).max(2_000_000).default(40_000),
	time_budget_ms: z.number().int().min(5_000).max(3_600_000).default(300_000),
	builtin: z.boolean().default(false),
});
export type AgentDef = z.infer<typeof AgentDef>;

export const RunStatus = z.enum(['running', 'done', 'error', 'killed']);
export type RunStatus = z.infer<typeof RunStatus>;

export const EVENT_TYPES = ['routed', 'started', 'thinking', 'delta', 'tool_call', 'tool_result', 'delegated', 'fallback', 'finished', 'error', 'message', 'channel', 'attachments', 'update'] as const;
/** One thing that happened in a run. The same shape goes over the WebSocket and into the step log. */
export const AgentEvent = z.object({
	type: z.enum(EVENT_TYPES),
	at: z.string(),
	runId: z.string().nullable(),
	rootId: z.string().nullable(),
	parentId: z.string().nullable(),
	agentId: z.string().nullable(),
	data: z.record(z.unknown()),
});
export type AgentEvent = z.infer<typeof AgentEvent>;

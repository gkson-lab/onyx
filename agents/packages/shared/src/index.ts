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

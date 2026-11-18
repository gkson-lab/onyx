// Claude, through Anthropic's own Messages API and its official SDK. Onyx keeps conversations in the
// chat-completions shape every other provider speaks; this module converts on the way in and out:
//
// - The system prompt goes in `system`; tool results go back as `tool_result` blocks, all of a step's results in one
//   user message (splitting them teaches the model to stop calling tools in parallel).
// - An assistant turn Claude wrote is sent back exactly as Claude wrote it (kept in the message's `raw`): its thinking
//   blocks must come back unchanged in the next request of a tool loop, or the turn breaks.
// - Thinking is adaptive (Claude decides when and how much), its depth set by the tier through `effort`, with
//   readable summaries kept as the reasoning. No temperature: current Claude models refuse sampling settings.
// - Answers stream, and tool input streams as it is written (eager input streaming): Onyx checks every tool's
//   arguments against its schema before running it, which is what that needs.
// - On Opus and Sonnet, a declined request is handed to another Claude model by the API itself (server-side
//   fallbacks); a refusal that stands, or a tool call cut off at the length limit, is an error, so the gateway moves on
//   to the next model.
import Anthropic from '@anthropic-ai/sdk';
import type { BetaMessageStreamParams } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { ChatMessage, ToolCall, ToolDef } from '@onyx/shared';
import { ProviderError, type ChatRequest, type ChatResult } from './provider.ts';

type Block = Anthropic.Beta.BetaContentBlock;
type BlockParam = Anthropic.Beta.BetaContentBlockParam;
type MessageParam = Anthropic.Beta.BetaMessageParam;

/** What an assistant turn from Claude keeps for replay: its content blocks, as they came. */
export interface ClaudeRaw {
	anthropic: Block[];
}
export const isClaudeRaw = (raw: unknown): raw is ClaudeRaw => !!raw && Array.isArray((raw as ClaudeRaw).anthropic);

/** Room for adaptive thinking, which counts against max_tokens: a smaller cap would cut answers off. */
const MIN_TOKENS = 8192;
const DEFAULT_TOKENS = 64000;
/** The models whose refusals the API can pass to another Claude model itself; Haiku has no server-side fallback. */
const SERVER_FALLBACK = /^claude-(opus|sonnet|fable)-/;

/**
 * The blocks of an earlier assistant turn, as they must be echoed. After a mid-answer fallback (a `fallback` block in
 * the content), the thinking and tool calls before the last such block belong to the model that declined: they are
 * left out, and the `fallback` block stays where it was.
 */
export function echoable(content: Block[]): BlockParam[] {
	let boundary = -1;
	content.forEach((b, i) => (b.type === 'fallback' ? (boundary = i) : null));
	const dropBefore = new Set(['thinking', 'redacted_thinking', 'tool_use', 'server_tool_use']);
	return content.filter((b, i) => !(i < boundary && dropBefore.has(b.type))) as unknown as BlockParam[];
}

/** The tool calls Onyx should run: those of the model that finished the turn (after any fallback block). */
function toolUses(content: Block[]): Anthropic.Beta.BetaToolUseBlock[] {
	let boundary = -1;
	content.forEach((b, i) => (b.type === 'fallback' ? (boundary = i) : null));
	return content.filter((b, i): b is Anthropic.Beta.BetaToolUseBlock => i > boundary && b.type === 'tool_use');
}

function parseArgs(text: string): unknown {
	try {
		return JSON.parse(text || '{}');
	} catch {
		return {};
	}
}

/** Onyx's messages as Claude's: the system prompt apart, tool results as blocks, Claude's own turns as it wrote them. */
export function toClaude(messages: ChatMessage[]): { system: string; messages: MessageParam[] } {
	const system: string[] = [];
	const out: MessageParam[] = [];
	/** Appends to the last user message, or starts one: tool results and what follows them share a turn. */
	const userBlocks = (): BlockParam[] => {
		const last = out[out.length - 1];
		if (last?.role === 'user' && Array.isArray(last.content)) return last.content as BlockParam[];
		const blocks: BlockParam[] = [];
		out.push({ role: 'user', content: blocks });
		return blocks;
	};
	for (const m of messages) {
		const text = (m.content ?? '').trim();
		if (m.role === 'system') {
			// Leading system messages are the system prompt; a later one is passed along as a note in the conversation.
			if (!out.length) system.push(m.content ?? '');
			else if (text) userBlocks().push({ type: 'text', text: `[Note from Onyx] ${text}` });
		} else if (m.role === 'user') {
			if (text) userBlocks().push({ type: 'text', text: m.content! });
		} else if (m.role === 'tool') {
			userBlocks().push({ type: 'tool_result', tool_use_id: m.tool_call_id ?? '', content: m.content || '(no output)' });
		} else if (isClaudeRaw(m.raw)) {
			out.push({ role: 'assistant', content: echoable(m.raw.anthropic) });
		} else {
			// A turn another model wrote (a fallback to a local model mid-run): its text and tool calls, rebuilt.
			const blocks: BlockParam[] = [];
			if (text) blocks.push({ type: 'text', text: m.content! });
			for (const c of m.tool_calls ?? []) blocks.push({ type: 'tool_use', id: c.id, name: c.function.name, input: parseArgs(c.function.arguments) });
			if (blocks.length) out.push({ role: 'assistant', content: blocks });
		}
	}
	// The conversation must open with the person.
	if (out[0]?.role === 'assistant') out.unshift({ role: 'user', content: '(The conversation so far.)' });
	return { system: system.join('\n\n'), messages: out };
}

function toolsFor(defs: ToolDef[] | undefined): Anthropic.Beta.BetaTool[] | undefined {
	if (!defs?.length) return undefined;
	return defs.map((d) => ({ name: d.function.name, description: d.function.description, input_schema: d.function.parameters as Anthropic.Beta.BetaTool.InputSchema, eager_input_streaming: true }));
}

/** An error from the SDK, as Onyx's: whether trying again could help, and a message a person can act on. */
function failure(e: unknown, req: ChatRequest): ProviderError {
	if (req.signal?.aborted) return new ProviderError('cancelled', 499, false);
	if (e instanceof Anthropic.APIUserAbortError || e instanceof Anthropic.APIConnectionTimeoutError) return new ProviderError(`no answer within ${req.timeoutMs} ms`, 0, true);
	if (e instanceof Anthropic.APIConnectionError) return new ProviderError(`could not reach Anthropic: ${e.message}`, 0, true);
	if (e instanceof Anthropic.AuthenticationError) return new ProviderError('Anthropic refused the API key (401): check it in Settings, Cloud models', 401, false);
	if (e instanceof Anthropic.PermissionDeniedError) return new ProviderError(`Anthropic: this key may not use ${req.model} (403)`, 403, false);
	if (e instanceof Anthropic.NotFoundError) return new ProviderError(`Anthropic has no model ${req.model} (404)`, 404, false);
	if (e instanceof Anthropic.RateLimitError) return new ProviderError('Anthropic: rate limit reached (429)', 429, true);
	if (e instanceof Anthropic.InternalServerError) return new ProviderError(`Anthropic: server error (${e.status}), or busy`, e.status ?? 500, true);
	if (e instanceof Anthropic.APIError) {
		const status = e.status ?? 0;
		// 402: no credit left on the account. Neither it nor a bad request will go better a second time.
		const why = status === 402 ? 'the Anthropic account has no credit left' : e.message.slice(0, 300);
		return new ProviderError(`Anthropic (${status}): ${why}`, status, status === 408 || status === 409);
	}
	// A tool call whose input could not be read at all (it streams as it is written): asking again usually mends it.
	return new ProviderError(`the reply from Claude could not be read: ${(e as Error).message}`, 0, true);
}

/** One call to Claude. Streams always: long answers would otherwise outlast an HTTP request's time limit. */
export async function chatAnthropic(req: ChatRequest, fetchImpl?: typeof fetch): Promise<ChatResult> {
	if (!req.apiKey) throw new ProviderError('no Anthropic API key is set', 401, false);
	const client = new Anthropic({ apiKey: req.apiKey, baseURL: req.baseUrl, maxRetries: 0, ...(fetchImpl ? { fetch: fetchImpl } : {}) });
	const { system, messages } = toClaude(req.messages);
	const tools = toolsFor(req.tools);
	const params: BetaMessageStreamParams = {
		model: req.model,
		max_tokens: Math.max(req.maxTokens ?? DEFAULT_TOKENS, MIN_TOKENS),
		system,
		messages,
		thinking: { type: 'adaptive', display: 'summarized' },
		output_config: { effort: req.effort ?? 'high' },
		// The system prompt and tools stay the same for a whole run: cached after the first step, so later steps cost less.
		cache_control: { type: 'ephemeral' },
		...(tools ? { tools, tool_choice: { type: req.toolChoice === 'none' ? 'none' : 'auto' } } : {}),
		...(SERVER_FALLBACK.test(req.model) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
	};
	const timeout = AbortSignal.timeout(req.timeoutMs);
	const signal = req.signal ? AbortSignal.any([req.signal, timeout]) : timeout;
	let msg: Anthropic.Beta.BetaMessage;
	try {
		const stream = client.beta.messages.stream(params, { signal, timeout: req.timeoutMs });
		if (req.onDelta) stream.on('text', (delta) => req.onDelta!(delta));
		msg = await stream.finalMessage();
	} catch (e) {
		throw failure(e, req);
	}

	const u = msg.usage;
	// Cached input is counted in full: the cost shown (and the daily cloud limit) err on the high side, not the low.
	const usage = { input: (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0), output: u.output_tokens ?? 0, estimated: false };
	if (msg.stop_reason === 'refusal') {
		const category = msg.stop_details?.category;
		throw new ProviderError(`Claude declined to answer${category ? ` (${category})` : ''}`, 200, false);
	}
	const uses = toolUses(msg.content);
	// A tool call cut off at the length limit can still look complete: it is not run.
	if (msg.stop_reason === 'max_tokens' && uses.length) throw new ProviderError('Claude was cut off at the length limit in the middle of a tool call', 200, false);
	const content = msg.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text').map((b) => b.text).join('').trim();
	const reasoning = msg.content.filter((b): b is Anthropic.Beta.BetaThinkingBlock => b.type === 'thinking').map((b) => b.thinking).join('\n').trim();
	const toolCalls: ToolCall[] = uses.map((b) => ({ id: b.id, type: 'function', function: { name: b.name, arguments: JSON.stringify(b.input ?? {}) } }));
	if (!content && !toolCalls.length) throw new ProviderError('the reply was empty', 200, true, 'empty', usage.output);
	const finish = msg.stop_reason === 'tool_use' ? 'tool_calls' : msg.stop_reason === 'max_tokens' ? 'length' : 'stop';
	return { content, reasoning, toolCalls, finish, usage, raw: { anthropic: msg.content } satisfies ClaudeRaw };
}

/** The model IDs the key can use: a free call, to check a key works and the configured models exist. */
export async function listClaudeModels(baseUrl: string, apiKey: string, fetchImpl?: typeof fetch): Promise<string[]> {
	const client = new Anthropic({ apiKey, baseURL: baseUrl, maxRetries: 1, ...(fetchImpl ? { fetch: fetchImpl } : {}) });
	const ids: string[] = [];
	try {
		for await (const m of client.models.list({ limit: 100 })) ids.push(m.id);
	} catch (e) {
		throw failure(e, { baseUrl, apiKey, model: 'models', messages: [], timeoutMs: 15000 });
	}
	return ids;
}

// One client for every provider that speaks the OpenAI chat-completions API: Ollama, Moonshot, OpenAI itself
// (ChatGPT's models), DashScope, OpenRouter. Claude speaks Anthropic's own API: see anthropic.ts. Tool calls are the
// models' own, passed through as they come; nothing is parsed out of prose.
import type { ChatMessage, ToolCall, ToolDef, Usage } from '@onyx/shared';

export type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body?: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; text(): Promise<string>; body?: ReadableStream<Uint8Array> | null }>;

export interface ChatRequest {
	baseUrl: string;
	apiKey: string | null;
	/** Which dialect (config: a provider's `api`). OpenAI's own wants max_completion_tokens and no temperature. */
	api?: 'openai-compatible' | 'openai' | 'anthropic';
	/** How hard to think (Claude: output_config.effort), from the tier. */
	effort?: 'low' | 'medium' | 'high' | 'xhigh';
	model: string;
	messages: ChatMessage[];
	tools?: ToolDef[];
	toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
	maxTokens?: number;
	temperature?: number;
	extra?: Record<string, unknown>;
	timeoutMs: number;
	signal?: AbortSignal;
	/** Called with each piece of the answer as it arrives. When given, the reply is streamed. */
	onDelta?: (text: string) => void;
}
export interface ChatResult {
	content: string;
	reasoning: string;
	toolCalls: ToolCall[];
	finish: string;
	usage: Usage;
	/** The assistant turn as the provider wrote it, to send back unchanged (Claude's thinking blocks). */
	raw?: unknown;
}

export class ProviderError extends Error {
	/** `empty`: the reply had nothing in it, though the model may have written something (`generated` tokens). */
	constructor(message: string, public readonly status: number, public readonly retryable: boolean, public readonly kind?: 'empty', public readonly generated?: number) {
		super(message);
	}
}

// About four characters to a token: only used when a provider doesn't report usage, and marked as an estimate.
const estimate = (text: string): number => Math.ceil(text.length / 4);

/** Qwen writes its thinking inside <think> tags when served by some runtimes: kept apart from the answer. */
function splitThinking(text: string): { content: string; reasoning: string } {
	let reasoning = '';
	const content = text.replace(/<think>([\s\S]*?)(?:<\/think>|$)/g, (_, r: string) => ((reasoning += r), '')).trim();
	return { content, reasoning: reasoning.trim() };
}

export async function chat(req: ChatRequest, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<ChatResult> {
	const stream = !!req.onDelta;
	// Another provider's own content (Claude's) is never sent here: OpenAI rejects fields it does not know.
	const messages = req.messages.map(({ raw: _raw, ...m }) => m);
	const body: Record<string, unknown> = { model: req.model, messages, stream, ...(req.extra ?? {}) };
	// "No tool calls" is sent as no tools at all: some runtimes (Ollama) call a tool they are offered anyway.
	if (req.tools?.length && req.toolChoice !== 'none') {
		body.tools = req.tools;
		body.tool_choice = req.toolChoice ?? 'auto';
	}
	// OpenAI's current models take max_completion_tokens (max_tokens is refused) and only their default temperature.
	const openai = req.api === 'openai';
	if (req.maxTokens) body[openai ? 'max_completion_tokens' : 'max_tokens'] = req.maxTokens;
	if (req.temperature !== undefined && !openai) body.temperature = req.temperature;
	if (stream) body.stream_options = { include_usage: true };
	const headers: Record<string, string> = { 'content-type': 'application/json' };
	if (req.apiKey) headers.authorization = `Bearer ${req.apiKey}`;

	const timeout = AbortSignal.timeout(req.timeoutMs);
	const signal = req.signal ? AbortSignal.any([req.signal, timeout]) : timeout;
	let res;
	try {
		res = await fetchImpl(`${req.baseUrl}/chat/completions`, { method: 'POST', headers, body: JSON.stringify(body), signal });
	} catch (e) {
		if (req.signal?.aborted) throw new ProviderError('cancelled', 499, false);
		const name = (e as Error).name;
		throw new ProviderError(name === 'TimeoutError' || name === 'AbortError' ? `no answer within ${req.timeoutMs} ms` : `could not reach ${req.baseUrl}: ${(e as Error).message}`, 0, true);
	}
	if (!res.ok) {
		const text = (await res.text().catch(() => '')).slice(0, 300);
		// Rate limits and server errors may pass; a bad request or a bad key will fail the same way again.
		throw new ProviderError(`HTTP ${res.status}${text ? `: ${text}` : ''}`, res.status, res.status === 429 || res.status === 408 || res.status >= 500);
	}
	const promptText = req.messages.map((m) => m.content ?? '').join('\n');

	if (!stream) {
		let data: any;
		try {
			data = JSON.parse(await res.text());
		} catch {
			throw new ProviderError('the reply was not JSON', res.status, true);
		}
		const msg = data?.choices?.[0]?.message;
		if (!msg) throw new ProviderError('the reply had no message in it', res.status, true);
		const split = splitThinking(String(msg.content ?? ''));
		const reasoning = String(msg.reasoning_content ?? msg.reasoning ?? '') || split.reasoning;
		const u = data.usage;
		// An answer with nothing in it is not an answer, even after some thinking: an agent would otherwise finish with an
		// empty result. (Ollama 0.40 sometimes drops the tool call that follows Qwen3's thinking, too.)
		if (!split.content && !msg.tool_calls?.length) throw new ProviderError('the reply was empty', res.status, true, 'empty', Number(u?.completion_tokens ?? 0));
		return {
			content: split.content,
			reasoning,
			toolCalls: (msg.tool_calls ?? []).map((t: any, i: number) => ({ id: String(t.id ?? `call_${i}`), type: 'function' as const, function: { name: String(t.function?.name ?? ''), arguments: typeof t.function?.arguments === 'string' ? t.function.arguments : JSON.stringify(t.function?.arguments ?? {}) } })),
			finish: String(data.choices[0].finish_reason ?? 'stop'),
			usage: u ? { input: Number(u.prompt_tokens ?? 0), output: Number(u.completion_tokens ?? 0), estimated: false } : { input: estimate(promptText), output: estimate(split.content + reasoning), estimated: true },
		};
	}

	// Streaming: server-sent events, one JSON object per "data:" line.
	if (!res.body) throw new ProviderError('the reply had no body to stream', res.status, true);
	const decoder = new TextDecoder();
	let buffer = '';
	let raw = '';
	let reasoning = '';
	let finish = 'stop';
	let usage: Usage | null = null;
	let inThink = false;
	const calls: ToolCall[] = [];
	const emit = (piece: string) => {
		// Thinking tags are held back from the stream; only the answer is shown as it arrives.
		raw += piece;
		let rest = piece;
		while (rest) {
			if (inThink) {
				const end = rest.indexOf('</think>');
				if (end < 0) return;
				inThink = false;
				rest = rest.slice(end + 8);
			} else {
				const start = rest.indexOf('<think>');
				if (start < 0) return void req.onDelta!(rest);
				if (start > 0) req.onDelta!(rest.slice(0, start));
				inThink = true;
				rest = rest.slice(start + 7);
			}
		}
	};
	const handle = (line: string) => {
		if (!line.startsWith('data:')) return;
		const payload = line.slice(5).trim();
		if (!payload || payload === '[DONE]') return;
		let j: any;
		try {
			j = JSON.parse(payload);
		} catch {
			return;
		}
		if (j.usage) usage = { input: Number(j.usage.prompt_tokens ?? 0), output: Number(j.usage.completion_tokens ?? 0), estimated: false };
		const choice = j.choices?.[0];
		if (!choice) return;
		if (choice.finish_reason) finish = String(choice.finish_reason);
		const d = choice.delta ?? {};
		if (d.reasoning_content || d.reasoning) reasoning += String(d.reasoning_content ?? d.reasoning);
		if (d.content) emit(String(d.content));
		for (const t of d.tool_calls ?? []) {
			const i = Number(t.index ?? 0);
			const c = (calls[i] ??= { id: '', type: 'function', function: { name: '', arguments: '' } });
			if (t.id) c.id = String(t.id);
			if (t.function?.name) c.function.name += String(t.function.name);
			if (t.function?.arguments) c.function.arguments += typeof t.function.arguments === 'string' ? t.function.arguments : JSON.stringify(t.function.arguments);
		}
	};
	try {
		for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
			buffer += decoder.decode(chunk, { stream: true });
			let at;
			while ((at = buffer.indexOf('\n')) >= 0) {
				handle(buffer.slice(0, at).trim());
				buffer = buffer.slice(at + 1);
			}
		}
		if (buffer.trim()) handle(buffer.trim());
	} catch (e) {
		if (req.signal?.aborted) throw new ProviderError('cancelled', 499, false);
		throw new ProviderError(`the stream broke off: ${(e as Error).message}`, 0, true);
	}
	const split = splitThinking(raw);
	const toolCalls = calls.filter(Boolean).map((c, i) => ({ ...c, id: c.id || `call_${i}` }));
	if (!split.content && !toolCalls.length) throw new ProviderError(reasoning || split.reasoning ? 'the stream ended with thinking but no answer' : 'the stream ended with nothing in it', res.status, true, 'empty', (usage as Usage | null)?.output ?? 0);
	return { content: split.content, reasoning: reasoning || split.reasoning, toolCalls, finish, usage: usage ?? { input: estimate(promptText), output: estimate(raw + reasoning), estimated: true } };
}

/** The model IDs a provider says it has. */
export async function listModels(baseUrl: string, apiKey: string | null, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<string[]> {
	const headers: Record<string, string> = {};
	if (apiKey) headers.authorization = `Bearer ${apiKey}`;
	let res;
	try {
		res = await fetchImpl(`${baseUrl}/models`, { method: 'GET', headers, signal: AbortSignal.timeout(10000) });
	} catch (e) {
		throw new ProviderError(`could not reach ${baseUrl}: ${(e as Error).message}`, 0, true);
	}
	if (!res.ok) throw new ProviderError(`HTTP ${res.status}`, res.status, false);
	const data = JSON.parse(await res.text());
	return (data.data ?? []).map((m: any) => String(m.id));
}

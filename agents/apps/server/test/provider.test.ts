import { describe, expect, it } from 'vitest';
import { chat, ProviderError, type FetchLike } from '../src/models/provider.ts';

const sse = (events: unknown[]): FetchLike => async () => ({
	ok: true,
	status: 200,
	text: async () => '',
	body: new ReadableStream<Uint8Array>({
		start(c) {
			const text = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('') + 'data: [DONE]\n\n';
			// Cut in odd places, as a network would.
			for (let i = 0; i < text.length; i += 37) c.enqueue(new TextEncoder().encode(text.slice(i, i + 37)));
			c.close();
		},
	}),
});
const base = { baseUrl: 'http://x/v1', apiKey: null, model: 'm', messages: [{ role: 'user' as const, content: 'hi' }], timeoutMs: 1000 };

describe('the provider client', () => {
	it('streams text, holds thinking back from the stream, and reads usage from the last event', async () => {
		const seen: string[] = [];
		const r = await chat({ ...base, onDelta: (t) => seen.push(t) }, sse([{ choices: [{ delta: { content: '<think>let me' } }] }, { choices: [{ delta: { content: ' see</think>Hel' } }] }, { choices: [{ delta: { content: 'lo there' }, finish_reason: 'stop' }] }, { choices: [], usage: { prompt_tokens: 7, completion_tokens: 9 } }]));
		expect(seen.join('')).toBe('Hello there');
		expect(r).toMatchObject({ content: 'Hello there', reasoning: 'let me see', finish: 'stop', usage: { input: 7, output: 9, estimated: false } });
	});

	it('puts a streamed tool call back together from its pieces', async () => {
		const r = await chat({ ...base, onDelta: () => {} }, sse([{ choices: [{ delta: { tool_calls: [{ index: 0, id: 'c1', function: { name: 'web_search', arguments: '{"que' } }] } }] }, { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: 'ry":"onyx"}' } }] }, finish_reason: 'tool_calls' }] }]));
		expect(r.toolCalls).toEqual([{ id: 'c1', type: 'function', function: { name: 'web_search', arguments: '{"query":"onyx"}' } }]);
		expect(JSON.parse(r.toolCalls[0]!.function.arguments)).toEqual({ query: 'onyx' });
	});

	it('tells errors worth retrying from ones that are not', async () => {
		const fail = (status: number): FetchLike => async () => ({ ok: false, status, text: async () => 'nope' });
		await expect(chat(base, fail(429))).rejects.toMatchObject({ retryable: true, status: 429 });
		await expect(chat(base, fail(500))).rejects.toMatchObject({ retryable: true });
		await expect(chat(base, fail(400))).rejects.toMatchObject({ retryable: false });
		await expect(chat(base, fail(401))).rejects.toBeInstanceOf(ProviderError);
		await expect(chat(base, async () => ({ ok: true, status: 200, text: async () => 'not json' }))).rejects.toMatchObject({ retryable: true });
	});
});


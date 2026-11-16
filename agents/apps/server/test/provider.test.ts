import { describe, expect, it } from 'vitest';
import { chat, ProviderError, type FetchLike } from '../src/models/provider.ts';
import { buildServer } from '../src/index.ts';
import { testApp } from './helpers.ts';

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

describe('the server', () => {
	it('routes and answers a chat message, and reports the tier, the real model and the cost', async () => {
		const { app } = await testApp({ 'qwen3:4b': [{ toolCall: { name: 'route', args: { tier: 'standard', complexity: 'low', tools: [], urgency: 'normal', reason: 'small talk' } } }], 'qwen3:8b': [{ content: 'Hi.' }] });
		const server = await buildServer(app);
		const res = await server.inject({ method: 'POST', url: '/api/chat', payload: { text: 'hello there' } });
		expect(res.statusCode).toBe(200);
		expect(res.json()).toMatchObject({ reply: 'Hi.', tier: 'standard', model: 'qwen3:8b', local: true, cost_usd: 0, routing: { via: 'router', reason: 'small talk' } });
		expect((await server.inject({ method: 'POST', url: '/api/chat', payload: { text: '' } })).statusCode).toBe(400);
		const tiers = (await server.inject({ method: 'GET', url: '/api/tiers' })).json();
		expect(tiers.tiers.map((t: any) => t.model)).toEqual(['qwen3:4b', 'qwen3:8b', 'qwen3:14b', 'qwen3:30b']);
	});

	it('answers 502 with the trail when no model can be reached', async () => {
		const { app } = await testApp({});
		const server = await buildServer(app);
		const res = await server.inject({ method: 'POST', url: '/api/chat', payload: { text: '/standard hello' } });
		expect(res.statusCode).toBe(502);
		expect(res.json().error).toContain('No model answered');
	});
});

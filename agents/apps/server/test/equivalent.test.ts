import { describe, expect, it } from 'vitest';
import { loadEquivalents } from '../src/config.ts';
import { buildServer } from '../src/index.ts';
import { testApp } from './helpers.ts';

const route = { toolCall: { name: 'route', args: { tier: 'lite', complexity: 'low', tools: [], urgency: 'normal', reason: 'short' } } };
const EQ = { 'qwen3:4b': { name: 'Qwen3 4B on a host', input: 0.5, output: 2, source: 'https://example.org' } };

describe('what a local call would cost on a paid host', () => {
	it('is recorded with each call and run, summed for the run, and reported by the API; nothing is charged', async () => {
		const { app } = await testApp({ 'qwen3:4b': [{ ...route, usage: { prompt_tokens: 1000, completion_tokens: 100 } }, { content: 'Hi.', usage: { prompt_tokens: 2000, completion_tokens: 500 } }] }, {}, { equivalents: EQ });
		const r = await app.runtime.handle({ userId: 'owner', text: 'hello', channel: 'web' });
		// The answer's own call: 2,000 in and 500 out at $0.50 and $2 per million.
		expect(r.costUsd).toBe(0);
		expect(r.equivalentUsd).toBeCloseTo((2000 * 0.5 + 500 * 2) / 1e6, 12);
		const calls = await app.db.selectFrom('model_calls').select(['purpose', 'cost_usd', 'equivalent_usd']).orderBy('id').execute();
		expect(calls.map((c) => c.purpose)).toEqual(['route', 'core']);
		expect(calls[0]!.equivalent_usd).toBeCloseTo((1000 * 0.5 + 100 * 2) / 1e6, 12);
		expect(calls.every((c) => c.cost_usd === 0)).toBe(true);

		const server = await buildServer(app, { webDir: '/nonexistent' });
		const usage = (await server.inject({ method: 'GET', url: '/api/usage' })).json();
		expect(usage.equivalent.today).toBeCloseTo(0.0027, 10);
		expect(usage.equivalent.since).toMatch(/^\d{4}-/);
		expect(usage.by_model[0].equivalent_usd).toBeCloseTo(0.0027, 10);
		const runs = (await server.inject({ method: 'GET', url: '/api/runs' })).json().runs;
		expect(runs[0].equivalent_usd).toBeCloseTo(0.002, 10);
		const models = (await server.inject({ method: 'GET', url: '/api/models' })).json().models;
		expect(models.find((m: any) => m.id === 'qwen3:4b').equivalent).toMatchObject({ name: 'Qwen3 4B on a host' });
	});

	it('a model with no known price shows none, rather than a guess', async () => {
		const { app } = await testApp({ 'qwen3:8b': [{ content: 'x' }] }, {}, { equivalents: EQ });
		const r = await app.gateway.complete({ userId: 'owner', tier: 'standard', messages: [{ role: 'user', content: 'hi' }] });
		expect(r.equivalentUsd).toBeNull();
	});

	it('the shipped price list covers every default model', () => {
		const eq = loadEquivalents();
		for (const id of ['qwen3:4b-instruct', 'qwen3:8b', 'qwen3:14b', 'qwen3:30b']) expect(eq[id], id).toBeDefined();
	});
});

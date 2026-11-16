import { describe, expect, it } from 'vitest';
import { AllModelsFailed, LimitError } from '../src/models/gateway.ts';
import { testApp } from './helpers.ts';

const ask = (tier: 'lite' | 'standard' | 'pro' | 'max') => ({ userId: 'owner', tier, messages: [{ role: 'user' as const, content: 'hi' }] });

describe('the model gateway', () => {
	it('answers from the tier\'s model and records the call, the tokens and the cost', async () => {
		const { app, seen } = await testApp({ 'qwen3:8b': [{ content: 'hello', usage: { prompt_tokens: 12, completion_tokens: 3 } }] });
		const r = await app.gateway.complete(ask('standard'));
		expect(r).toMatchObject({ content: 'hello', tier: 'standard', model: 'qwen3:8b', provider: 'ollama', local: true, costUsd: 0, fallbacks: [] });
		expect(seen[0]!.url).toBe('http://ollama.test/v1/chat/completions');
		const calls = await app.db.selectFrom('model_calls').selectAll().execute();
		expect(calls).toHaveLength(1);
		expect(calls[0]).toMatchObject({ status: 'ok', input_tokens: 12, output_tokens: 3, model_id: 'qwen3:8b', usage_estimated: 0 });
		expect(await app.gateway.usedToday('owner')).toBe(15);
	});

	it('skips a cloud model unless cloud use is on and its key is set', async () => {
		const off = await testApp({ 'qwen3:14b': [{ content: 'local' }], 'kimi-pro-test': [{ content: 'cloud' }] });
		expect((await off.app.gateway.complete(ask('pro'))).model).toBe('qwen3:14b');
		expect(off.seen.every((s) => s.model !== 'kimi-pro-test')).toBe(true);
		const keyOnly = await testApp({ 'qwen3:14b': [{ content: 'local' }] }, { MOONSHOT_API_KEY: 'sk-test' });
		expect((await keyOnly.app.gateway.complete(ask('pro'))).model).toBe('qwen3:14b');
		const on = await testApp({ 'kimi-pro-test': [{ content: 'cloud', usage: { prompt_tokens: 1000, completion_tokens: 500 } }] }, { ONYX_CLOUD: 'on', MOONSHOT_API_KEY: 'sk-test' });
		const r = await on.app.gateway.complete(ask('pro'));
		expect(r).toMatchObject({ model: 'kimi-pro-test', provider: 'moonshot', local: false });
		expect(r.costUsd).toBeCloseTo((1000 * 1 + 500 * 4) / 1e6, 10);
		expect(on.seen[0]!.auth).toBe('Bearer sk-test');
	});

	it('retries a rate limit on the same model, with a growing wait, and logs each retry', async () => {
		const { app, seen, slept } = await testApp({ 'qwen3:8b': [{ status: 429, content: 'slow down' }, { status: 503 }, { content: 'third time' }] });
		const r = await app.gateway.complete(ask('standard'));
		expect(r.content).toBe('third time');
		expect(seen).toHaveLength(3);
		expect(slept).toEqual([10, 20]);
		expect(r.fallbacks.map((f) => f.kind)).toEqual(['retry', 'retry']);
		expect(await app.db.selectFrom('fallbacks').selectAll().execute()).toHaveLength(2);
		expect((await app.db.selectFrom('model_calls').select('status').execute()).map((c) => c.status)).toEqual(['error', 'error', 'ok']);
	});

	it('moves to the next provider when one keeps failing, then drops a tier, and says so', async () => {
		const { app, seen } = await testApp({ 'kimi-pro-test': [{ status: 500 }], 'qwen3:14b': [{ throw: 'connection refused' }], 'qwen3:8b': [{ content: 'from standard' }] }, { ONYX_CLOUD: 'on', MOONSHOT_API_KEY: 'k' });
		const r = await app.gateway.complete(ask('pro'));
		expect(r).toMatchObject({ content: 'from standard', tier: 'standard', requestedTier: 'pro', model: 'qwen3:8b' });
		expect(seen.map((s) => s.model)).toEqual(['kimi-pro-test', 'kimi-pro-test', 'kimi-pro-test', 'qwen3:14b', 'qwen3:14b', 'qwen3:14b', 'qwen3:8b']);
		expect(r.fallbacks.map((f) => f.kind)).toEqual(['retry', 'retry', 'provider', 'retry', 'retry', 'tier']);
		expect(r.fallbacks[2]).toMatchObject({ from: 'moonshot/kimi-pro-test', to: 'ollama/qwen3:14b' });
		expect(r.fallbacks[5]).toMatchObject({ from: 'pro', to: 'standard' });
	});

	it('does not retry an error that would fail the same way again', async () => {
		const { app, seen } = await testApp({ 'kimi-pro-test': [{ status: 401, content: 'bad key' }], 'qwen3:14b': [{ content: 'ok' }] }, { ONYX_CLOUD: 'on', MOONSHOT_API_KEY: 'wrong' });
		const r = await app.gateway.complete(ask('pro'));
		expect(seen.map((s) => s.model)).toEqual(['kimi-pro-test', 'qwen3:14b']);
		expect(r.fallbacks).toHaveLength(1);
		expect(r.fallbacks[0]!.reason).toContain('401');
	});

	it('never fails silently: when nothing answers, the error carries the whole trail', async () => {
		const { app } = await testApp({ 'qwen3:8b': [{ status: 500 }], 'qwen3:4b': [{ throw: 'refused' }] });
		const err = await app.gateway.complete(ask('standard')).catch((e) => e);
		expect(err).toBeInstanceOf(AllModelsFailed);
		expect(err.message).toContain('ollama/qwen3:8b: HTTP 500');
		expect(err.message).toContain('ollama/qwen3:4b: could not reach');
		expect(err.fallbacks.at(-1)).toMatchObject({ kind: 'retry' });
		expect(err.fallbacks.some((f: any) => f.kind === 'tier' && f.to === 'lite')).toBe(true);
	});

	it('keeps a caller inside their plan, and logs the step down', async () => {
		const { app } = await testApp({ 'qwen3:8b': [{ content: 'standard' }] }, { ONYX_PLAN: 'free' });
		const r = await app.gateway.complete(ask('max'));
		expect(r).toMatchObject({ tier: 'standard', requestedTier: 'max' });
		expect(r.fallbacks[0]).toMatchObject({ kind: 'plan', from: 'max', to: 'standard' });
	});

	it('enforces the daily token limit', async () => {
		const { app, seen } = await testApp({ 'qwen3:8b': [{ content: 'x', usage: { prompt_tokens: 900, completion_tokens: 200 } }] }, { ONYX_PLAN: 'free' });
		await app.gateway.complete(ask('standard'));
		const err = await app.gateway.complete(ask('standard')).catch((e) => e);
		expect(err).toBeInstanceOf(LimitError);
		expect(err.message).toContain('1,100 of 1,000');
		expect(seen).toHaveLength(1);
	});

	it('marks usage as an estimate when the provider reports none, and cost as unknown when no price is set', async () => {
		const { app } = await testApp({ 'qwen3:30b': [{ content: 'twelve chars', usage: null }] });
		const r = await app.gateway.complete(ask('max'));
		expect(r.usage.estimated).toBe(true);
		expect(r.costUsd).toBeNull();
	});
});

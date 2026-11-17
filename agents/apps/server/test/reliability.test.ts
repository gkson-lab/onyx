import { describe, expect, it } from 'vitest';
import { plan, type Hardware } from '../src/hardware.ts';
import { ollamaStatus } from '../src/ollama.ts';
import { buildServer } from '../src/index.ts';
import type { FetchLike } from '../src/models/provider.ts';
import { testApp } from './helpers.ts';

const ask = (tier: 'lite' | 'standard' | 'pro' | 'max', extra: object = {}) => ({ userId: 'owner', tier, messages: [{ role: 'user' as const, content: 'hi' }], ...extra });
const pc: Hardware = { gpu: { name: 'NVIDIA GeForce RTX 5060 Ti', vramGb: 15.9, bandwidthGbs: 448 }, ramGb: 32, ramMts: 6000, cpu: 'AMD Ryzen 7 8700F', notes: [] };

describe('one graphics card, one call at a time', () => {
	it('calls to the local provider never overlap, even for different models at once', async () => {
		const { app } = await testApp({});
		let inFlight = 0;
		let most = 0;
		const order: string[] = [];
		(app.gateway as any).fetch = (async (_url: string, init: any) => {
			const model = JSON.parse(init.body).model;
			inFlight++;
			most = Math.max(most, inFlight);
			order.push(`start ${model}`);
			await new Promise((r) => setTimeout(r, 40));
			order.push(`end ${model}`);
			inFlight--;
			return { ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { role: 'assistant', content: model }, finish_reason: 'stop' }], usage: { prompt_tokens: 1, completion_tokens: 1 } }) };
		}) as FetchLike;
		const answers = await Promise.all([app.gateway.complete(ask('pro')), app.gateway.complete(ask('lite')), app.gateway.complete(ask('standard'))]);
		expect(answers.map((a) => a.content)).toEqual(['qwen3:14b', 'qwen3:4b', 'qwen3:8b']);
		expect(most).toBe(1);
		expect(order).toEqual(['start qwen3:14b', 'end qwen3:14b', 'start qwen3:4b', 'end qwen3:4b', 'start qwen3:8b', 'end qwen3:8b']);
	});

	it('a call waiting for its turn is cancelled by the stop button', async () => {
		const { app } = await testApp({ 'qwen3:8b': [{ content: 'slow', delayMs: 300 }] });
		const stop = new AbortController();
		const first = app.gateway.complete(ask('standard'));
		const second = app.gateway.complete(ask('standard', { signal: stop.signal }));
		stop.abort();
		await expect(second).rejects.toMatchObject({ status: 499 });
		expect((await first).content).toBe('slow');
	});
});

describe('time budgets', () => {
	it('a try that times out is not retried with no time left: one failure, not three', async () => {
		const { app } = await testApp({ 'qwen3:8b': [{ content: 'late', delayMs: 3000 }] });
		const t = Date.now();
		const err = await app.gateway.complete(ask('standard', { deadline: Date.now() + 6000, timeoutMs: 1500 })).catch((e) => e);
		expect(err).toBeInstanceOf(Error);
		expect(err.message).toMatch(/no answer within 1500 ms \(not tried again: the agent's time budget had [45] s left\)/);
		const tries = await app.db.selectFrom('model_calls').select(['model_id', 'status']).execute();
		// The try ran out its 1.5 s; with under 5 s left, no second try, no other provider and no lower tier.
		expect(tries).toEqual([{ model_id: 'qwen3:8b', status: 'error' }]);
		expect(Date.now() - t).toBeLessThan(3000);
	});

	it('a model that starts with too little time left is not called at all', async () => {
		const { app } = await testApp({ 'qwen3:8b': [{ content: 'never' }] });
		const err = await app.gateway.complete(ask('standard', { deadline: Date.now() + 2000 })).catch((e) => e);
		expect(err.message).toMatch(/out of time: the agent's time budget had 2 s left/);
		expect(await app.db.selectFrom('model_calls').select('id').execute()).toEqual([]);
	});

	it('with time to spare, a timed-out try is still retried', async () => {
		const { app } = await testApp({ 'qwen3:8b': [{ content: 'late', delayMs: 3000 }, { content: 'second time lucky' }] });
		const r = await app.gateway.complete(ask('standard', { deadline: Date.now() + 60_000, timeoutMs: 1000 }));
		expect(r.content).toBe('second time lucky');
		expect(r.fallbacks.map((f) => f.kind)).toEqual(['retry']);
	});
});

describe('the planner', () => {
	it('keeps room for Windows and halves the context cache on a 16 GB card', () => {
		const p = plan(pc);
		expect(p.context).toBe(16384);
		expect(p.env).toMatchObject({ OLLAMA_CONTEXT_LENGTH: '16384', OLLAMA_KV_CACHE_TYPE: 'q8_0', OLLAMA_FLASH_ATTENTION: '1', OLLAMA_GPU_OVERHEAD: String(1024 ** 3) });
		const f = Object.fromEntries(p.fits.map((x) => [x.id, x]));
		// Lite and Standard together leave several GB of the card free.
		expect(f['qwen3:4b-instruct']!.needGb + f['qwen3:8b']!.needGb).toBeLessThan(15.9 - 2 - 2);
		expect(p.tiers).toEqual({ lite: 'qwen3:4b-instruct', standard: 'qwen3:8b', pro: 'qwen3:14b', max: 'qwen3:30b' });
	});
});

describe("Ollama's status", () => {
	const fakeOllama = (ps: unknown, reachable = true): typeof fetch =>
		(async (url: string) => {
			if (!reachable) throw new Error('connect ECONNREFUSED');
			return new Response(JSON.stringify(String(url).endsWith('/api/version') ? { version: '0.40.16' } : ps), { status: 200 });
		}) as unknown as typeof fetch;

	it('says when Ollama runs without its settings, and when a model that should fit is partly on the processor', async () => {
		const { app } = await testApp({});
		const ps = { models: [
			{ name: 'qwen3:8b', size: 8 * 1024 ** 3, size_vram: 8 * 1024 ** 3, context_length: 4096 },
			{ name: 'qwen3:14b', size: 12 * 1024 ** 3, size_vram: 7.2 * 1024 ** 3, context_length: 16384 },
			{ name: 'qwen3:30b', size: 21 * 1024 ** 3, size_vram: 14 * 1024 ** 3, context_length: 16384 },
		] };
		const s = await ollamaStatus(app.config, plan(pc), fakeOllama(ps));
		expect(s).toMatchObject({ reachable: true, version: '0.40.16' });
		expect(s.loaded.map((m) => [m.name, m.contextLength, Math.round(m.onCard * 100)])).toEqual([['qwen3:8b', 4096, 100], ['qwen3:14b', 16384, 60], ['qwen3:30b', 16384, 67]]);
		expect(s.warnings).toHaveLength(2);
		expect(s.warnings[0]).toMatch(/^Ollama is running without Onyx's settings: qwen3:8b was given 4,096 tokens of context instead of 16,384/);
		// The 30B is meant to be split; only the 14B, which should fit, is flagged.
		expect(s.warnings[1]).toMatch(/^qwen3:14b is only 60% on the graphics card/);
	});

	it('says when Ollama is not running', async () => {
		const { app } = await testApp({});
		const s = await ollamaStatus(app.config, plan(pc), fakeOllama({}, false));
		expect(s.reachable).toBe(false);
		expect(s.warnings[0]).toMatch(/^Ollama is not running/);
	});

	it('the API reports the status, and the latest failed tries with their messages', async () => {
		const { app } = await testApp({ 'qwen3:8b': [{ status: 500, content: 'llama runner process has terminated: CUDA error: out of memory' }, { content: 'ok' }] });
		await app.gateway.complete(ask('standard'));
		const server = await buildServer(app, { webDir: '/nonexistent', detect: async () => pc, ollamaFetch: fakeOllama({ models: [] }) });
		const models = (await server.inject({ method: 'GET', url: '/api/models' })).json();
		expect(models.errors).toHaveLength(1);
		expect(models.errors[0]).toMatchObject({ model_id: 'qwen3:8b', purpose: 'chat', attempt: 0 });
		expect(models.errors[0].error).toContain('CUDA error: out of memory');
		expect((await server.inject({ method: 'GET', url: '/api/ollama' })).json()).toMatchObject({ reachable: true, version: '0.40.16', loaded: [], warnings: [] });
	});
});

// Cloud models: Claude through Anthropic's SDK (against a stand-in that streams what the real API streams), ChatGPT's
// dialect of the chat-completions API, the model a person chooses, the day's cloud limit, and the settings that hold
// the keys.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ChatMessage } from '@onyx/shared';
import { chatAnthropic, echoable, toClaude } from '../src/models/anthropic.ts';
import { chat, ProviderError } from '../src/models/provider.ts';
import { parseTiers, writeDotEnv } from '../src/config.ts';
import { buildServer } from '../src/index.ts';
import { now } from '../src/db.ts';
import { fakeFetch, testApp, TIERS_YAML } from './helpers.ts';

const CLOUD_TIERS = TIERS_YAML.replace(
	'models:\n',
	`  anthropic: { base_url: http://anthropic.test, api_key_env: ANTHROPIC_API_KEY, local: false, api: anthropic }
  openai:    { base_url: http://openai.test/v1, api_key_env: OPENAI_API_KEY, local: false, api: openai }
models:
  claude-opus:  { provider: anthropic, id: claude-opus-5-5, label: "Claude Opus 5.5", price: { input: 4, output: 20 } }
  claude-haiku: { provider: anthropic, id: claude-haiku-5-5, label: "Claude Haiku 5.5", price: { input: 0.1, output: 0.5 } }
  gpt-sol:      { provider: openai, id: gpt-6.2-sol, label: "ChatGPT: GPT-6.2 Sol", price: { input: 2, output: 10 } }
`,
);
const CLOUD_ENV = { ONYX_CLOUD: 'on', ANTHROPIC_API_KEY: 'sk-ant-test-0000000000000000', OPENAI_API_KEY: 'sk-test-openai-000000000000' };

/* ---------- a stand-in for Anthropic's API ---------- */

type Turn =
	| { status: number; error: { type: string; message: string } }
	| { thinking?: string; text?: string; tools?: { name: string; input: unknown }[]; stop?: string; category?: string; usage?: { input: number; output: number; cacheRead?: number } };
interface SeenClaude { url: string; headers: Record<string, string>; body: any }

/** Answers each request with the next turn of the script, as server-sent events (the last turn repeats). */
function claudeFetch(turns: Turn[]) {
	const seen: SeenClaude[] = [];
	const fetch = (async (url: string | URL | Request, init?: RequestInit) => {
		const headers: Record<string, string> = {};
		for (const [k, v] of new Map(Object.entries(Object.fromEntries(init?.headers as Iterable<[string, string]>)))) headers[k.toLowerCase()] = v;
		seen.push({ url: String(url), headers, body: JSON.parse(String(init?.body ?? '{}')) });
		// Asked for no tool calls, Claude gives its final answer.
		const t: Turn = seen.at(-1)!.body.tool_choice?.type === 'none' ? { text: 'Final answer, from what I have.' } : turns[Math.min(seen.length - 1, turns.length - 1)]!;
		if ('status' in t) return new Response(JSON.stringify({ type: 'error', error: t.error }), { status: t.status, headers: { 'content-type': 'application/json' } });
		const ev: object[] = [];
		const u = t.usage ?? { input: 120, output: 30 };
		ev.push({ type: 'message_start', message: { id: `msg_${seen.length}`, type: 'message', role: 'assistant', model: seen.at(-1)!.body.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: u.input, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: u.cacheRead ?? 0 } } });
		let i = 0;
		if (t.thinking) {
			ev.push({ type: 'content_block_start', index: i, content_block: { type: 'thinking', thinking: '', signature: '' } });
			ev.push({ type: 'content_block_delta', index: i, delta: { type: 'thinking_delta', thinking: t.thinking } });
			ev.push({ type: 'content_block_delta', index: i, delta: { type: 'signature_delta', signature: `sig-${seen.length}` } });
			ev.push({ type: 'content_block_stop', index: i++ });
		}
		if (t.text) {
			ev.push({ type: 'content_block_start', index: i, content_block: { type: 'text', text: '' } });
			for (let k = 0; k < t.text.length; k += 5) ev.push({ type: 'content_block_delta', index: i, delta: { type: 'text_delta', text: t.text.slice(k, k + 5) } });
			ev.push({ type: 'content_block_stop', index: i++ });
		}
		for (const [n, tool] of (t.tools ?? []).entries()) {
			ev.push({ type: 'content_block_start', index: i, content_block: { type: 'tool_use', id: `toolu_${seen.length}_${n}`, name: tool.name, input: {} } });
			ev.push({ type: 'content_block_delta', index: i, delta: { type: 'input_json_delta', partial_json: JSON.stringify(tool.input) } });
			ev.push({ type: 'content_block_stop', index: i++ });
		}
		const stop = t.stop ?? (t.tools?.length ? 'tool_use' : 'end_turn');
		ev.push({ type: 'message_delta', delta: { stop_reason: stop, stop_sequence: null, ...(stop === 'refusal' ? { stop_details: { type: 'refusal', category: t.category ?? null, explanation: 'declined' } } : {}) }, usage: { output_tokens: u.output } });
		ev.push({ type: 'message_stop' });
		const sse = ev.map((e) => `event: ${(e as { type: string }).type}\ndata: ${JSON.stringify(e)}\n\n`).join('');
		return new Response(sse, { status: 200, headers: { 'content-type': 'text/event-stream' } });
	}) as typeof globalThis.fetch;
	return { fetch, seen };
}

const ask = (over: Partial<Parameters<typeof chatAnthropic>[0]> = {}) => ({ baseUrl: 'http://anthropic.test', apiKey: 'sk-ant-test-0000000000000000', model: 'claude-opus-5-5', messages: [{ role: 'system', content: 'You are Onyx.' }, { role: 'user', content: 'Hello' }] as ChatMessage[], timeoutMs: 5000, ...over });

describe('Claude: what Onyx sends', () => {
	it('turns a tool loop into Claude\'s shape: the system prompt apart, all of a step\'s results in one message', () => {
		const r = toClaude([
			{ role: 'system', content: 'Be brief.' },
			{ role: 'user', content: 'Two sums' },
			{ role: 'assistant', content: 'Working on it.', tool_calls: [{ id: 'a', type: 'function', function: { name: 'calculate', arguments: '{"question":"1+1"}' } }, { id: 'b', type: 'function', function: { name: 'calculate', arguments: '{"question":"2+2"}' } }] },
			{ role: 'tool', tool_call_id: 'a', content: '2' },
			{ role: 'tool', tool_call_id: 'b', content: '4' },
			{ role: 'user', content: 'You have reached the step limit.' },
		]);
		expect(r.system).toBe('Be brief.');
		expect(r.messages).toEqual([
			{ role: 'user', content: [{ type: 'text', text: 'Two sums' }] },
			{ role: 'assistant', content: [{ type: 'text', text: 'Working on it.' }, { type: 'tool_use', id: 'a', name: 'calculate', input: { question: '1+1' } }, { type: 'tool_use', id: 'b', name: 'calculate', input: { question: '2+2' } }] },
			{ role: 'user', content: [{ type: 'tool_result', tool_use_id: 'a', content: '2' }, { type: 'tool_result', tool_use_id: 'b', content: '4' }, { type: 'text', text: 'You have reached the step limit.' }] },
		]);
	});

	it("sends Claude's own turns back exactly as it wrote them, and after a fallback leaves out what the declining model began", () => {
		const own = [{ type: 'thinking', thinking: 'plan', signature: 'sig' }, { type: 'tool_use', id: 't1', name: 'calculate', input: { question: '6*7' } }];
		const r = toClaude([{ role: 'user', content: 'q' }, { role: 'assistant', content: null, raw: { anthropic: own } }, { role: 'tool', tool_call_id: 't1', content: '42' }]);
		expect(r.messages[1]).toEqual({ role: 'assistant', content: own });
		const after = echoable([{ type: 'thinking', thinking: 'x', signature: 's1' }, { type: 'text', text: 'Part ' }, { type: 'fallback' }, { type: 'thinking', thinking: 'y', signature: 's2' }, { type: 'text', text: 'rest' }] as never);
		expect(after.map((b) => b.type)).toEqual(['text', 'fallback', 'thinking', 'text']);
	});

	it('streams the answer, asks for adaptive thinking at the tier\'s effort, caches, and never sends a temperature', async () => {
		const c = claudeFetch([{ thinking: 'They greet me.', text: 'Hello! How can I help?' }]);
		const deltas: string[] = [];
		const r = await chatAnthropic(ask({ effort: 'high', temperature: 0.2, maxTokens: 300, onDelta: (t) => deltas.push(t) }), c.fetch);
		expect(r).toMatchObject({ content: 'Hello! How can I help?', reasoning: 'They greet me.', toolCalls: [], finish: 'stop', usage: { input: 120, output: 30, estimated: false } });
		expect(deltas.join('')).toBe('Hello! How can I help?');
		const { url, headers, body } = c.seen[0]!;
		expect(url).toContain('http://anthropic.test/v1/messages');
		// The SDK sends the key, and the API version that refuses sampling settings.
		expect(headers.authorization).toBe('Bearer sk-ant-test-0000000000000000');
		expect(headers['anthropic-version']).toBe('2026-10-21');
		expect(headers['anthropic-beta']).toContain('server-side-fallback-2026-07-01');
		expect(body).toMatchObject({ model: 'claude-opus-5-5', system: 'You are Onyx.', stream: true, thinking: { type: 'adaptive', display: 'summarized' }, output_config: { effort: 'high' }, cache_control: { type: 'ephemeral' }, fallbacks: 'default' });
		// Room for thinking, which counts against max_tokens; no sampling settings (Claude refuses them).
		expect(body.max_tokens).toBe(8192);
		expect(body).not.toHaveProperty('temperature');
	});

	it('offers tools that stream as written, never forces one, and returns the calls with Claude\'s own turn to replay', async () => {
		const c = claudeFetch([{ thinking: 'Use the tool.', text: 'Let me work it out.', tools: [{ name: 'calculate', input: { question: '6*7' } }] }]);
		const r = await chatAnthropic(ask({ model: 'claude-haiku-5-5', tools: [{ type: 'function', function: { name: 'calculate', description: 'Arithmetic.', parameters: { type: 'object', properties: { question: { type: 'string' } }, required: ['question'] } } }], toolChoice: { type: 'function', function: { name: 'calculate' } } }), c.fetch);
		expect(r.toolCalls).toEqual([{ id: 'toolu_1_0', type: 'function', function: { name: 'calculate', arguments: '{"question":"6*7"}' } }]);
		expect(r.finish).toBe('tool_calls');
		expect((r.raw as { anthropic: { type: string }[] }).anthropic.map((b) => b.type)).toEqual(['thinking', 'text', 'tool_use']);
		const body = c.seen[0]!.body;
		expect(body.tools).toEqual([{ name: 'calculate', description: 'Arithmetic.', input_schema: { type: 'object', properties: { question: { type: 'string' } }, required: ['question'] }, eager_input_streaming: true }]);
		expect(body.tool_choice).toEqual({ type: 'auto' });
		// Haiku has no server-side fallback: none is asked for.
		expect(body).not.toHaveProperty('fallbacks');
		expect(c.seen[0]!.headers['anthropic-beta'] ?? '').not.toContain('server-side-fallback');
	});

	it('a refusal, a rate limit and a bad key each say what happened, and only the rate limit is worth trying again', async () => {
		const refused = await chatAnthropic(ask(), claudeFetch([{ stop: 'refusal', category: 'cyber' }]).fetch).catch((e) => e);
		expect(refused).toBeInstanceOf(ProviderError);
		expect(refused).toMatchObject({ message: 'Claude declined to answer (cyber)', retryable: false });
		const limited = await chatAnthropic(ask(), claudeFetch([{ status: 429, error: { type: 'rate_limit_error', message: 'slow down' } }]).fetch).catch((e) => e);
		expect(limited).toMatchObject({ status: 429, retryable: true });
		const badKey = await chatAnthropic(ask(), claudeFetch([{ status: 401, error: { type: 'authentication_error', message: 'invalid x-api-key' } }]).fetch).catch((e) => e);
		expect(badKey).toMatchObject({ status: 401, retryable: false });
		expect(badKey.message).toMatch(/refused the API key/);
		const cut = await chatAnthropic(ask(), claudeFetch([{ text: 'Calling', tools: [{ name: 'calculate', input: { question: '1' } }], stop: 'max_tokens' }]).fetch).catch((e) => e);
		expect(cut.message).toMatch(/cut off .* tool call/);
	});
});

describe('ChatGPT: OpenAI\'s own dialect', () => {
	it('sends max_completion_tokens and no temperature, and never another provider\'s content', async () => {
		const f = fakeFetch({ 'gpt-6.2-sol': [{ content: 'Hi.' }] });
		await chat({ baseUrl: 'http://openai.test/v1', apiKey: 'sk-test', api: 'openai', model: 'gpt-6.2-sol', messages: [{ role: 'user', content: 'Hi' }, { role: 'assistant', content: 'x', raw: { anthropic: [] } }, { role: 'user', content: 'again' }], maxTokens: 500, temperature: 0.3, timeoutMs: 5000 }, f.fetch);
		const body = f.seen[0]!.body;
		expect(body.max_completion_tokens).toBe(500);
		expect(body).not.toHaveProperty('max_tokens');
		expect(body).not.toHaveProperty('temperature');
		expect(body.messages[1]).toEqual({ role: 'assistant', content: 'x' });
		// The other chat-completions providers (Ollama, Moonshot) keep max_tokens and temperature.
		await chat({ baseUrl: 'http://ollama.test/v1', apiKey: null, model: 'gpt-6.2-sol', messages: [{ role: 'user', content: 'Hi' }], maxTokens: 500, temperature: 0.3, timeoutMs: 5000 }, f.fetch);
		expect(f.seen[1]!.body).toMatchObject({ max_tokens: 500, temperature: 0.3 });
	});
});

describe('choosing a cloud model', () => {
	it('runs the whole message on Claude, replaying its thinking unchanged through the tool loop', async () => {
		const c = claudeFetch([{ thinking: 'I should compute it.', text: 'Working it out.', tools: [{ name: 'calculate', input: { question: '6*7' } }] }, { text: 'It is 42.' }]);
		const { app, seen } = await testApp({}, CLOUD_ENV, { tiers: parseTiers(CLOUD_TIERS), anthropicFetch: c.fetch });
		const r = await app.runtime.handle({ userId: 'owner', text: '/pro What is 6 times 7?', channel: 'web', model: 'claude-opus' });
		expect(r).toMatchObject({ status: 'done', output: 'It is 42.', model: 'claude-opus-5-5' });
		expect(seen).toHaveLength(0);
		const second = c.seen[1]!.body.messages;
		// The first turn goes back exactly as Claude wrote it, thinking and signature included, then the tool's result.
		expect(second[1]).toEqual({ role: 'assistant', content: [{ type: 'thinking', thinking: 'I should compute it.', signature: 'sig-1' }, { type: 'text', text: 'Working it out.' }, { type: 'tool_use', id: 'toolu_1_0', name: 'calculate', input: { question: '6*7' } }] });
		expect(second[2].role).toBe('user');
		expect(second[2].content[0]).toMatchObject({ type: 'tool_result', tool_use_id: 'toolu_1_0' });
		expect(String(second[2].content[0].content)).toContain('42');
		// Pro is "high" effort; the cost is counted at Claude's price.
		expect(c.seen[0]!.body.output_config).toEqual({ effort: 'high' });
		const calls = await app.db.selectFrom('model_calls').select(['provider', 'cost_usd']).where('provider', '=', 'anthropic').execute();
		expect(calls).toHaveLength(2);
		expect(calls[0]!.cost_usd).toBeCloseTo((120 * 4 + 30 * 20) / 1e6, 9);
	});

	it('at the step limit, keeps the same tools and asks for no tool calls, so the thinking so far stays valid', async () => {
		const c = claudeFetch([{ thinking: 'Again.', tools: [{ name: 'calculate', input: { question: '1+1' } }] }]);
		const { app } = await testApp({}, CLOUD_ENV, { tiers: parseTiers(CLOUD_TIERS), anthropicFetch: c.fetch });
		const r = await app.runtime.handle({ userId: 'owner', text: '/pro Keep adding.', channel: 'web', model: 'claude-opus' });
		expect(r).toMatchObject({ status: 'done', output: 'Final answer, from what I have.' });
		const bodies = c.seen.map((x) => x.body);
		expect(bodies).toHaveLength(8);
		expect(bodies.slice(0, 7).every((b) => b.tool_choice.type === 'auto')).toBe(true);
		expect(bodies[7].tool_choice).toEqual({ type: 'none' });
		expect(bodies[7].tools).toEqual(bodies[0].tools);
		// Every earlier turn goes back as it was written, signatures and all.
		expect(bodies[7].messages.filter((m: { role: string }) => m.role === 'assistant').map((m: { content: { type: string; signature?: string }[] }) => m.content[0]!.signature)).toEqual(['sig-1', 'sig-2', 'sig-3', 'sig-4', 'sig-5', 'sig-6', 'sig-7']);
	});

	it("once the day's cloud limit is spent, Claude is skipped and a local model answers, with the reason shown", async () => {
		const c = claudeFetch([{ text: 'from Claude' }]);
		const { app } = await testApp({ 'kimi-pro-test': [{ status: 500 }], 'qwen3:14b': [{ content: 'from the PC' }] }, CLOUD_ENV, { tiers: parseTiers(CLOUD_TIERS), anthropicFetch: c.fetch });
		await app.db.insertInto('settings').values({ key: 'cloud_daily_usd', value: '1' }).execute();
		await app.db.insertInto('model_calls').values({ user_id: 'owner', run_id: null, purpose: 'chat', tier: 'pro', model_key: 'claude-opus', provider: 'anthropic', model_id: 'claude-opus-5-5', status: 'ok', error: null, input_tokens: 1, output_tokens: 1, usage_estimated: 0, cost_usd: 1.25, equivalent_usd: null, latency_ms: 1, attempt: 0, created_at: now() }).execute();
		const r = await app.gateway.complete({ userId: 'owner', tier: 'pro', messages: [{ role: 'user', content: 'hi' }], preferModel: 'claude-opus' });
		expect(r).toMatchObject({ content: 'from the PC', provider: 'ollama' });
		expect(c.seen).toHaveLength(0);
		expect(r.fallbacks[0]!.reason).toMatch(/^today's cloud spending limit is reached \(\$1\.25 of \$1\.00/);
		// No limit (null): Claude is called again.
		await app.db.updateTable('settings').set({ value: 'null' }).where('key', '=', 'cloud_daily_usd').execute();
		const again = await app.gateway.complete({ userId: 'owner', tier: 'pro', messages: [{ role: 'user', content: 'hi' }], preferModel: 'claude-opus' });
		expect(again.content).toBe('from Claude');
	});
});

describe('the settings that hold the keys', () => {
	it('writes keys and the switch to .env, uses them at once, and never sends a key back', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'onyx-env-'));
		const envFile = join(dir, '.env');
		writeFileSync(envFile, '# mine\nONYX_PASSWORD=secret-pass\nBRAVE_API_KEY=brave-1\n');
		const env: Record<string, string> = { ONYX_PASSWORD: 'secret-pass' };
		const { app } = await testApp({}, env, { tiers: parseTiers(CLOUD_TIERS) });
		const server = await buildServer(app, { tiersPath: join(dir, 'tiers.yaml'), envFile, webDir: '/nonexistent' });
		const put = (body: object) => server.inject({ method: 'PUT', url: '/api/settings/cloud', payload: body });
		expect((await put({ keys: { ANTHROPIC_API_KEY: 'has spaces in it' } })).statusCode).toBe(400);
		const ok = await put({ on: true, daily_usd: 2.5, keys: { ANTHROPIC_API_KEY: 'sk-ant-api03-abcdefghijklmnop-WXYZ' } });
		expect(ok.json()).toEqual({ cloud: true, cloud_daily_usd: 2.5 });
		expect(readFileSync(envFile, 'utf8')).toBe('# mine\nONYX_PASSWORD=secret-pass\nBRAVE_API_KEY=brave-1\nONYX_CLOUD=on\nANTHROPIC_API_KEY=sk-ant-api03-abcdefghijklmnop-WXYZ\n');
		expect(app.config.usable('anthropic')).toBe(true);
		const s = await server.inject({ method: 'GET', url: '/api/settings' });
		expect(s.body).not.toContain('abcdefghijklmnop');
		expect(s.json().cloud_keys).toContainEqual({ name: 'ANTHROPIC_API_KEY', set: true, hint: '…WXYZ' });
		expect(s.json()).toMatchObject({ cloud: true, cloud_daily_usd: 2.5, cloud_spent_today: 0 });
		// Removing a key takes its line out, and the model can no longer be chosen.
		await put({ keys: { ANTHROPIC_API_KEY: null } });
		expect(readFileSync(envFile, 'utf8')).not.toContain('ANTHROPIC_API_KEY');
		const chosen = await server.inject({ method: 'POST', url: '/api/chat', payload: { text: 'hi', model: 'claude-opus' } });
		expect(chosen.statusCode).toBe(400);
		expect(chosen.json().error).toMatch(/Claude Opus 5\.5 is not set up/);
		await server.close();
	});

	it('puts a cloud model first in a tier, keeping the local ones behind it, and takes it off again', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'onyx-tiers-'));
		const tiersPath = join(dir, 'tiers.local.yaml');
		writeFileSync(tiersPath, CLOUD_TIERS);
		const { app } = await testApp({}, CLOUD_ENV, { tiers: parseTiers(CLOUD_TIERS) });
		const server = await buildServer(app, { tiersPath, webDir: '/nonexistent' });
		const set = (use: string, key: string | null) => server.inject({ method: 'POST', url: '/api/models/cloud', payload: { use, key } });
		expect((await set('max', 'claude-opus')).statusCode).toBe(200);
		expect(app.config.file.tiers.max.models).toEqual(['claude-opus', 'qwen-max']);
		// Another cloud model replaces it at the front; the Pro tier's Kimi gives way to ChatGPT the same way.
		await set('max', 'gpt-sol');
		await set('pro', 'gpt-sol');
		expect(app.config.file.tiers.max.models).toEqual(['gpt-sol', 'qwen-max']);
		expect(app.config.file.tiers.pro.models).toEqual(['gpt-sol', 'qwen-pro']);
		await set('max', null);
		expect(app.config.file.tiers.max.models).toEqual(['qwen-max']);
		expect(parseTiers(readFileSync(tiersPath, 'utf8')).tiers.max.models).toEqual(['qwen-max']);
		const models = await server.inject({ method: 'GET', url: '/api/models' });
		expect(models.json().models).toContainEqual(expect.objectContaining({ key: 'claude-opus', label: 'Claude Opus 5.5', local: false, usable: true, tiers: [] }));
		await server.close();
	});
});

describe('.env', () => {
	it('changes only the lines it is asked to, and refuses a value that would break the file', () => {
		const dir = mkdtempSync(join(tmpdir(), 'onyx-dotenv-'));
		const path = join(dir, '.env');
		writeFileSync(path, 'A=1\r\n# note\r\nB=2\r\n');
		writeDotEnv({ B: '3', C: '4', A: null }, path);
		expect(readFileSync(path, 'utf8')).toBe('# note\nB=3\nC=4\n');
		expect(() => writeDotEnv({ D: 'x\ny' }, path)).toThrow();
		expect(() => writeDotEnv({ 'bad key': 'x' }, path)).toThrow();
	});
});

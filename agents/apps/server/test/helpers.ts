// A stand-in for the providers: a scripted fetch, so the tests run with no model and no network.
import { parseTiers } from '../src/config.ts';
import { createApp } from '../src/app.ts';
import type { FetchLike } from '../src/models/provider.ts';

export const TIERS_YAML = `
version: 1
providers:
  ollama:   { base_url: http://ollama.test/v1, local: true }
  moonshot: { base_url: http://moonshot.test/v1, api_key_env: MOONSHOT_API_KEY, local: false }
models:
  qwen-lite:     { provider: ollama, id: "qwen3:4b",  price: { input: 0, output: 0 } }
  qwen-standard: { provider: ollama, id: "qwen3:8b",  price: { input: 0, output: 0 } }
  qwen-pro:      { provider: ollama, id: "qwen3:14b", price: { input: 0, output: 0 } }
  qwen-max:      { provider: ollama, id: "qwen3:30b", price: null }
  kimi-pro:      { provider: moonshot, id: kimi-pro-test, price: { input: 1, output: 4 } }
tiers:
  lite:     { label: Lite,     models: [qwen-lite] }
  standard: { label: Standard, models: [qwen-standard] }
  pro:      { label: Pro,      models: [kimi-pro, qwen-pro] }
  max:      { label: Max,      models: [qwen-max] }
plans:
  free: { tiers: [lite, standard],           daily_tokens: 1000 }
  pro:  { tiers: [lite, standard, pro],      daily_tokens: 100000 }
  max:  { tiers: [lite, standard, pro, max], daily_tokens: 100000 }
fallback: { retries: 2, backoff_ms: 10, drop_tier: true, timeout_ms: 5000 }
router: { tier: lite, timeout_ms: 5000 }
`;

export type Reply = { status?: number; content?: string; toolCall?: { name: string; args: unknown }; usage?: { prompt_tokens: number; completion_tokens: number } | null; throw?: string };
export interface Seen { url: string; model: string; auth: string | undefined; body: any }

/** A fetch that answers each model from a script: `script[model]` is a list of replies, used in order (the last repeats). */
export function fakeFetch(script: Record<string, Reply[]>) {
	const seen: Seen[] = [];
	const fetch: FetchLike = async (url, init) => {
		const body = JSON.parse(init.body ?? '{}');
		seen.push({ url, model: body.model, auth: init.headers.authorization, body });
		const list = script[body.model] ?? [{ status: 404, content: 'no such model' }];
		const n = seen.filter((s) => s.model === body.model).length - 1;
		const r = list[Math.min(n, list.length - 1)]!;
		if (r.throw) throw new Error(r.throw);
		const status = r.status ?? 200;
		const message: any = { role: 'assistant', content: r.content ?? '' };
		if (r.toolCall) message.tool_calls = [{ id: 'call_1', type: 'function', function: { name: r.toolCall.name, arguments: JSON.stringify(r.toolCall.args) } }];
		const payload = status === 200 ? { choices: [{ message, finish_reason: r.toolCall ? 'tool_calls' : 'stop' }], ...(r.usage === null ? {} : { usage: r.usage ?? { prompt_tokens: 10, completion_tokens: 5 } }) } : { error: { message: r.content ?? 'error' } };
		return { ok: status === 200, status, text: async () => JSON.stringify(payload) };
	};
	return { fetch, seen };
}

export async function testApp(script: Record<string, Reply[]>, env: Record<string, string> = {}) {
	const f = fakeFetch(script);
	const slept: number[] = [];
	const app = await createApp({ tiers: parseTiers(TIERS_YAML), env: { ONYX_PLAN: 'max', ...env }, dbPath: ':memory:', fetch: f.fetch, sleep: async (ms) => void slept.push(ms) });
	return { app, seen: f.seen, slept };
}

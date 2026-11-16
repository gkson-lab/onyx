// Embeddings for Memory, from the local embedding model. Null when it isn't configured or doesn't answer.
import type { Config } from './config.ts';

export function embedder(config: Config, fetchImpl: typeof fetch = fetch): (text: string) => Promise<number[] | null> {
	const e = config.file.embeddings;
	return async (text) => {
		if (!e || !config.usable(e.provider)) return null;
		const key = config.apiKey(e.provider);
		const res = await fetchImpl(`${config.baseUrl(e.provider)}/embeddings`, { method: 'POST', headers: { 'content-type': 'application/json', ...(key ? { authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify({ model: e.model, input: text }), signal: AbortSignal.timeout(20000) });
		if (!res.ok) return null;
		const j: any = await res.json();
		const v = j?.data?.[0]?.embedding;
		return Array.isArray(v) ? v.map(Number) : null;
	};
}

// What Ollama is actually doing: its version, the models it has loaded, how much context each got, and how much of
// each sits on the graphics card. This is how Onyx notices that Ollama is running without its settings (a model with
// 4,096 tokens of context instead of 16,384: Ollama then silently drops the oldest messages), or that a model only
// partly fit on the card and runs slowly on the processor.
import type { Config } from './config.ts';
import type { Plan } from './hardware.ts';

export interface Loaded { name: string; contextLength: number | null; sizeGb: number; onCard: number }
export interface OllamaStatus { reachable: boolean; version: string | null; loaded: Loaded[]; warnings: string[] }

type Fetch = typeof fetch;

export async function ollamaStatus(config: Config, plan: Plan | null, fetchImpl: Fetch = fetch): Promise<OllamaStatus> {
	if (!config.file.providers.ollama) return { reachable: false, version: null, loaded: [], warnings: [] };
	const base = config.baseUrl('ollama').replace(/\/v1$/, '');
	const get = async (path: string) => {
		const res = await fetchImpl(`${base}${path}`, { signal: AbortSignal.timeout(5000) });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return res.json() as Promise<any>;
	};
	let version: string | null = null;
	let ps: any;
	try {
		version = String((await get('/api/version')).version ?? '') || null;
		ps = await get('/api/ps');
	} catch {
		return { reachable: false, version: null, loaded: [], warnings: ['Ollama is not running, so no model can answer. Start Onyx with its shortcut, which starts Ollama, or start Ollama from the Start menu.'] };
	}
	const loaded: Loaded[] = (ps.models ?? []).map((m: any) => ({
		name: String(m.name ?? m.model),
		contextLength: m.context_length != null ? Number(m.context_length) : null,
		sizeGb: Math.round((Number(m.size ?? 0) / 1024 ** 3) * 10) / 10,
		onCard: Number(m.size) > 0 ? Math.min(1, Number(m.size_vram ?? 0) / Number(m.size)) : 0,
	}));
	const warnings: string[] = [];
	const expected = plan ? Number(plan.env.OLLAMA_CONTEXT_LENGTH) : null;
	for (const m of loaded) {
		if (expected && m.contextLength !== null && m.contextLength < expected)
			warnings.push(`Ollama is running without Onyx's settings: ${m.name} was given ${m.contextLength.toLocaleString('en-US')} tokens of context instead of ${expected.toLocaleString('en-US')}, so Ollama silently drops the oldest messages of a conversation. Close Onyx and start it again with its shortcut, which restarts Ollama with the right settings.`);
		const fit = plan?.fits.find((f) => f.id === m.name || `${f.id}:latest` === m.name);
		if (plan && fit?.where === 'gpu' && m.onCard < 0.97)
			warnings.push(`${m.name} is only ${Math.round(m.onCard * 100)}% on the graphics card, so it runs slowly on the processor. Something else is using the card's memory: another program, or a model Ollama has not unloaded yet. Close programs that use the graphics card (games, video editors), or restart Onyx with its shortcut.`);
	}
	return { reachable: true, version, loaded, warnings };
}

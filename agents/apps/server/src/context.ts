// How much of a conversation and its attached files to give a model, so it all fits the model's context window.
// Past the window, Ollama silently drops the start of the prompt, which is where an agent's instructions are.
import type { ChatMessage } from '@onyx/shared';

/**
 * Characters of history and attached files that fit beside an agent's instructions, its tools' results and its
 * answer: about 1.7 per token of context. The Onyx shortcut sets OLLAMA_CONTEXT_LENGTH for Onyx as well as Ollama.
 */
export const inputBudget = (): number => Math.round(Math.max(4096, Number(process.env.OLLAMA_CONTEXT_LENGTH) || 16384) * 1.7);

/**
 * The newest messages (given newest first) that fit in `room` characters, returned oldest first. What the newest
 * earlier attachment said stays with its message, so "what does page 2 say?" still works, unless `keepFile` is false
 * because this message brings files of its own.
 */
export function fitHistory(past: { direction: string; text: string; attached?: string | null }[], room: number, keepFile: boolean): ChatMessage[] {
	const out: ChatMessage[] = [];
	let kept = !keepFile;
	for (const m of past) {
		let content = m.text.slice(0, 4000);
		if (m.attached && !kept) {
			content += `\n\n${m.attached.slice(0, Math.round(room * 0.6))}`;
			kept = true;
		}
		if (content.length > room) break;
		room -= content.length;
		out.push({ role: m.direction === 'in' ? 'user' : 'assistant', content });
	}
	return out.reverse();
}

// Fits a reply to the channel it goes out on: plain text where the channel has no markdown, and several messages
// when one would be too long. This is exact work, so it is code, not a model.
import type { Channel } from '@onyx/shared';

export const LIMITS: Record<Channel, { max: number; markdown: boolean; parts: number }> = {
	web: { max: 100000, markdown: true, parts: 1 },
	terminal: { max: 100000, markdown: true, parts: 1 },
	whatsapp: { max: 4096, markdown: false, parts: 6 },
	// One SMS segment is 160 characters (70 with non-Latin text); carriers join up to about ten. 1,500 keeps a part to ten segments.
	sms: { max: 1500, markdown: false, parts: 4 },
};

/** Markdown to plain text. WhatsApp keeps *bold* and _italic_, which it understands. */
export function plain(text: string, channel: Channel): string {
	let t = text.replace(/```[a-z]*\n?([\s\S]*?)```/g, (_, code: string) => code.trimEnd()).replace(/^#{1,6}\s+(.*)$/gm, channel === 'whatsapp' ? '*$1*' : '$1').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '$1 ($2)').replace(/^\s*[-*]\s+/gm, '- ').replace(/`([^`]+)`/g, '$1');
	t = channel === 'whatsapp' ? t.replace(/\*\*([^*]+)\*\*/g, '*$1*') : t.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/(^|\s)\*([^*\n]+)\*/g, '$1$2');
	// A markdown table becomes one line per row.
	t = t.replace(/^\|?\s*:?-{3,}.*$/gm, '').replace(/^\|(.+)\|\s*$/gm, (_, row: string) => row.split('|').map((c) => c.trim()).join(' · '));
	return t.replace(/\n{3,}/g, '\n\n').trim();
}

/** Cuts text into parts of at most `max` characters, at a paragraph, a line or a sentence where it can. */
export function split(text: string, max: number): string[] {
	const parts: string[] = [];
	let rest = text.trim();
	while (rest.length > max) {
		const window = rest.slice(0, max);
		let at = window.lastIndexOf('\n\n');
		if (at < max * 0.4) at = window.lastIndexOf('\n');
		if (at < max * 0.4) at = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! ')) + 1;
		if (at < max * 0.4) at = window.lastIndexOf(' ');
		if (at <= 0) at = max;
		parts.push(rest.slice(0, at).trim());
		rest = rest.slice(at).trim();
	}
	if (rest) parts.push(rest);
	return parts;
}

/** The messages to send for `text` on `channel`. When it won't fit in the allowed parts, the last one says so. */
export function formatFor(channel: Channel, text: string): string[] {
	const l = LIMITS[channel];
	const body = l.markdown ? text.trim() : plain(text, channel);
	if (!body) return [];
	let parts = split(body, l.parts > 1 ? l.max - 8 : l.max);
	if (parts.length > l.parts) {
		const note = '\n[Cut short: the full reply is in the Onyx app.]';
		parts = parts.slice(0, l.parts);
		parts[l.parts - 1] = parts[l.parts - 1]!.slice(0, l.max - 8 - note.length) + note;
	}
	return parts.length > 1 ? parts.map((p, i) => `(${i + 1}/${parts.length}) ${p}`) : parts;
}

/**
 * The demo's stand-in for the Onyx server, running in the page: no server, no model, no AI. Every page gets the data a
 * real Onyx gave while it answered a few questions (fixtures.json, recorded from a stand-in model by
 * capture-demo.mjs), and new chats live in memory until the page is closed. A message you send is answered by
 * replaying one of the recorded answers, event by event and with its own timing, as the server would send it, so the
 * app, and its liquid glass, behave as they do with a real model: the routing, the agents at work, the words arriving.
 */
import fixtures from './fixtures.json';
import type { AgentEvent } from '@/lib/api';

interface Msg { id: number; direction: 'in' | 'out'; text: string; run_id: string | null; channel: string; status: string; created_at: string }
interface Conv { id: number; title: string; pinned: boolean; updated_at: string; messages: number; match: string | null }
interface Script { conversation: number; text: string; runId: string; events: AgentEvent[] }
const F = fixtures as unknown as { scripts: Script[]; get: Record<string, any> };

const copy = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const now = () => new Date().toISOString();
const later = (ms: number) => new Promise((done) => setTimeout(done, ms));
let serial = 0;
const newId = () => `demo-${Date.now().toString(36)}-${(serial++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// The recorded world, copied so the demo can change it.
const conversations: Conv[] = copy(F.get['/conversations'].conversations);
const messages = new Map<number, Msg[]>(conversations.map((c) => [c.id, copy(F.get[`/messages?conversation=${c.id}`]?.messages ?? [])]));
const runs: any[] = copy(F.get['/runs'].runs);
const runDetail = new Map<string, any>(F.scripts.map((s) => [s.runId, copy(F.get[`/runs/${s.runId}`])]));
let nextMessage = 1 + Math.max(0, ...[...messages.values()].flat().map((m) => m.id));

// The events a page listens to (lib/api.tsx's LiveProvider subscribes instead of opening a WebSocket).
const listeners = new Set<(e: AgentEvent) => void>();
export function subscribe(fn: (e: AgentEvent) => void) {
	listeners.add(fn);
	return () => void listeners.delete(fn);
}
const emit = (e: AgentEvent) => listeners.forEach((fn) => fn(e));

/** The recorded answer that fits what was asked; anything else gets a word about the demo itself. */
const GENERIC = "This is the Onyx demo, so there's no AI inside: this answer was written ahead of time. Everything else is the real app. Watch the glass round the window: while an answer comes in, its waves quicken, colour glows out of its rim and a light runs round it. Move the pointer near any edge to stir it, and try Settings, Appearance for the three looks: Standard, Liquid glass and Black chrome.";
function pick(text: string): { script: Script; answer?: string } {
	const t = text.toLowerCase();
	const by = (re: RegExp) => F.scripts.find((s) => re.test(s.text))!;
	if (/photo|rename|script|code|python|file|folder/.test(t)) return { script: by(/rename/) };
	if (/weekend|austin|trip|travel|plan|visit/.test(t)) return { script: by(/weekend/) };
	if (/glass|light|liquid|chrome|shader|rainbow|prism/.test(t)) return { script: by(/glass/) };
	if (/tide|moon|ocean|sea\b/.test(t)) return { script: by(/tides/) };
	if (/^(thanks|thank you|thx|ty|cheers)\b/.test(t)) return { script: by(/^thanks/) };
	return { script: by(/glass/), answer: GENERIC };
}
const answerOf = (s: Script) => F.get[`/messages?conversation=${s.conversation}`]?.messages.find((m: Msg) => m.run_id === s.runId && m.direction === 'out')?.text ?? '';

// Answers being replayed now, so Stop can stop one.
const playing = new Map<string, { timers: ReturnType<typeof setTimeout>[]; text: string; finish: (status: string) => void }>();

function replay(pickd: { script: Script; answer?: string }, runId: string, conversation: number) {
	const { script } = pickd;
	const ids = new Map<string, string>([[script.runId, runId]]);
	const map = (id: string | null) => (id === null ? null : ids.get(id) ?? (ids.set(id, newId()), ids.get(id)!));
	// A written answer goes in place of the recorded one's words, at the same pace.
	let events = script.events;
	if (pickd.answer) {
		const words = events.filter((e) => e.type === 'delta' && e.runId === script.runId);
		const at = words.length ? Date.parse(words[0]!.at) : 0;
		const chunks = pickd.answer.match(/[\s\S]{1,14}/g) ?? [];
		const fresh = chunks.map((text, i) => ({ ...words[0]!, at: new Date(at + i * 60).toISOString(), data: { text } }));
		const first = events.indexOf(words[0]!);
		events = [...events.slice(0, first), ...fresh, ...events.slice(first).filter((e) => !(e.type === 'delta' && e.runId === script.runId))];
	}
	const answer = pickd.answer ?? answerOf(script);
	const state = { timers: [] as ReturnType<typeof setTimeout>[], text: '', finish: (_: string) => {} };
	playing.set(runId, state);
	const store = (status: string, text: string) => {
		const at = now();
		messages.get(conversation)?.push({ id: nextMessage++, direction: 'out', text, run_id: runId, channel: 'web', status, created_at: at });
		const c = conversations.find((x) => x.id === conversation);
		if (c) c.updated_at = at;
		const detail = copy(F.get[`/runs/${script.runId}`]);
		for (const r of detail.runs) Object.assign(r, { id: map(r.id), root_id: map(r.root_id), parent_id: map(r.parent_id), started_at: at, finished_at: at });
		for (const s of detail.steps) s.run_id = map(s.run_id);
		if (status === 'killed') detail.runs[0].status = 'killed';
		runDetail.set(runId, detail);
		const row = runs.find((r) => r.id === script.runId);
		if (row) runs.unshift({ ...copy(row), id: runId, status, input: messages.get(conversation)?.findLast((m) => m.run_id === runId && m.direction === 'in')?.text ?? row.input, started_at: at, finished_at: at });
		playing.delete(runId);
	};
	state.finish = (status) => {
		state.timers.forEach(clearTimeout);
		emit({ type: 'finished', at: now(), runId, rootId: runId, parentId: null, agentId: 'core', data: { status, output: state.text } });
		store(status, state.text || '(stopped)');
	};
	// The recorded gaps between events, kept within reason, from a moment after the message is sent.
	let t = 250;
	events.forEach((e, i) => {
		if (i) t += Math.min(700, Math.max(20, Date.parse(e.at) - Date.parse(events[i - 1]!.at)));
		state.timers.push(
			setTimeout(() => {
				const out = { ...e, at: now(), runId: map(e.runId), rootId: map(e.rootId), parentId: map(e.parentId), data: copy(e.data) } as AgentEvent;
				if (out.type === 'delta' && out.runId === runId) state.text += String(out.data.text);
				if (out.type === 'tool_call' && out.runId === runId) state.text = '';
				const done = (out.type === 'finished' || out.type === 'error') && out.runId === runId;
				if (done) out.data.output = answer;
				emit(out);
				if (done) store(String(out.data.status ?? 'done'), answer);
			}, t),
		);
	});
}

function listConversations(query: string) {
	const q = query.trim().toLowerCase();
	const found = conversations
		.map((c) => {
			const list = messages.get(c.id) ?? [];
			const hit = q ? list.find((m) => m.text.toLowerCase().includes(q))?.text ?? (c.title.toLowerCase().includes(q) ? c.title : null) : null;
			return { ...c, messages: list.length, match: hit ? hit.slice(0, 80) : null, hit: !q || !!hit };
		})
		.filter((c) => c.hit)
		.map(({ hit: _, ...c }) => c)
		.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated_at.localeCompare(a.updated_at));
	return { conversations: found, other: null };
}

/** What lib/api.tsx's api() calls instead of fetch: the server's API, answered here. */
export async function request(path: string, init?: { method?: string; body?: any }): Promise<any> {
	await later(40);
	const method = init?.method ?? 'GET';
	const [p = '', qs = ''] = path.split('?');
	const q = new URLSearchParams(qs);
	if (method === 'GET') {
		if (p === '/conversations') return listConversations(q.get('q') ?? '');
		if (p === '/messages') return { messages: copy(messages.get(Number(q.get('conversation'))) ?? []) };
		if (p === '/runs') return { runs: copy(runs.slice(0, Number(q.get('limit') ?? runs.length))) };
		const run = p.match(/^\/runs\/([^/]+)$/);
		if (run) return copy(runDetail.get(run[1]!) ?? { runs: [], steps: [] });
		if (p === '/usage') return copy(F.get[`/usage?days=${q.get('days') ?? 14}`] ?? F.get['/usage?days=14']);
		if (F.get[path] !== undefined) return copy(F.get[path]);
		if (F.get[p] !== undefined) return copy(F.get[p]);
		console.warn('Onyx demo: nothing recorded for', path);
		return {};
	}
	const body = init?.body ?? {};
	if (p === '/chat' && method === 'POST') {
		const conversation = Number(body.conversation_id);
		if (!messages.has(conversation)) messages.set(conversation, []);
		const runId = newId();
		const list = messages.get(conversation)!;
		const c = conversations.find((x) => x.id === conversation);
		if (c && !list.length) c.title = String(body.text).slice(0, 60) || 'New chat';
		list.push({ id: nextMessage++, direction: 'in', text: String(body.text), run_id: runId, channel: 'web', status: 'done', created_at: now() });
		if (c) c.updated_at = now();
		replay(pick(String(body.text)), runId, conversation);
		return { runId };
	}
	if (p === '/conversations' && method === 'POST') {
		const id = 1 + Math.max(0, ...conversations.map((c) => c.id));
		conversations.push({ id, title: 'New chat', pinned: false, updated_at: now(), messages: 0, match: null });
		messages.set(id, []);
		return { id };
	}
	const conv = p.match(/^\/conversations\/(\d+)$/);
	if (conv) {
		const i = conversations.findIndex((c) => c.id === Number(conv[1]));
		if (method === 'DELETE' && i >= 0) (conversations.splice(i, 1), messages.delete(Number(conv[1])));
		if (method === 'PATCH' && i >= 0) Object.assign(conversations[i]!, body.title ? { title: String(body.title) } : {}, body.pinned !== undefined ? { pinned: !!body.pinned } : {});
		return { ok: true };
	}
	const kill = p.match(/^\/runs\/([^/]+)\/kill$/);
	if (kill) {
		playing.get(kill[1]!)?.finish('killed');
		return { ok: true };
	}
	// Anything else (saving settings, testing a channel...) is taken and does nothing: there's nothing behind it.
	return { ok: true };
}

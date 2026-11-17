// Talking to the Onyx server: plain fetches for data, and one WebSocket for everything agents do as they do it.
'use client';
import { createContext, useContext, useEffect, useReducer, useRef, useState, type Dispatch } from 'react';

const BASE = process.env.NEXT_PUBLIC_API ?? '';

export async function api<T = any>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
	const res = await fetch(`${BASE}/api${path}`, { method: init?.method ?? 'GET', headers: init?.body !== undefined ? { 'content-type': 'application/json' } : undefined, body: init?.body !== undefined ? JSON.stringify(init.body) : undefined });
	const data = await res.json().catch(() => ({ error: `The server answered ${res.status} with something that is not JSON.` }));
	// Reached through a tunnel without a session: go and sign in.
	if (res.status === 401 && !path.startsWith('/login') && !path.startsWith('/session') && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) window.location.replace('/login');
	if (!res.ok) throw new Error(data.error ?? `The server answered ${res.status}.`);
	return data as T;
}

/** Loads data, and again whenever `deps` change or `reload` is called. Errors are kept, not swallowed. */
export function useData<T>(path: string | null, deps: unknown[] = []) {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [n, setN] = useState(0);
	useEffect(() => {
		if (!path) return;
		let live = true;
		api<T>(path).then((d) => live && (setData(d), setError(null)), (e) => live && setError(e.message === 'Failed to fetch' ? 'The Onyx server is not answering. Start it with: pnpm start' : e.message));
		return () => void (live = false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [path, n, ...deps]);
	return { data, error, reload: () => setN((x) => x + 1) };
}

export type Tier = 'lite' | 'standard' | 'pro' | 'max';
export interface AgentEvent { type: string; at: string; runId: string | null; rootId: string | null; parentId: string | null; agentId: string | null; data: Record<string, any> }
export interface LogEntry { type: string; at: string; data: Record<string, any> }
export interface RunNode {
	id: string; rootId: string; parentId: string | null; agentId: string; name: string; depth: number; status: 'running' | 'done' | 'error' | 'killed';
	tier: Tier | null; model: string | null; input: string; output: string; error: string | null; tokens: number; cost: number | null; equivalent: number | null; ms: number | null; step: number; log: LogEntry[]; startedAt: string;
}
export interface Live { connected: boolean; nodes: Record<string, RunNode>; routing: Record<string, any>; text: Record<string, string>; inbox: { text: string; at: string; channel: string }[]; lastRoot: string | null }

const empty: Live = { connected: false, nodes: {}, routing: {}, text: {}, inbox: [], lastRoot: null };

function reduce(s: Live, a: AgentEvent | { type: '_conn'; connected: boolean } | { type: '_load'; nodes: RunNode[]; routing?: any }): Live {
	if (a.type === '_conn') return { ...s, connected: (a as any).connected };
	if (a.type === '_load') {
		const l = a as { nodes: RunNode[]; routing?: any };
		const nodes = { ...s.nodes };
		for (const n of l.nodes) nodes[n.id] = n;
		const root = l.nodes.find((n) => !n.parentId);
		return { ...s, nodes, routing: root && l.routing ? { ...s.routing, [root.id]: l.routing } : s.routing };
	}
	const e = a as AgentEvent;
	if (e.type === 'message') return { ...s, inbox: [...s.inbox, { text: String(e.data.text), at: e.at, channel: String(e.data.channel) }].slice(-50) };
	if (!e.runId) return s;
	if (e.type === 'routed') return { ...s, routing: { ...s.routing, [e.runId]: e.data }, lastRoot: e.runId };
	if (e.type === 'delta') return { ...s, text: { ...s.text, [e.runId]: (s.text[e.runId] ?? '') + String(e.data.text) } };
	const prev = s.nodes[e.runId];
	if (e.type === 'started') {
		const node: RunNode = { id: e.runId, rootId: e.rootId ?? e.runId, parentId: e.parentId, agentId: e.agentId ?? '', name: String(e.data.agent ?? e.agentId), depth: Number(e.data.depth ?? 0), status: 'running', tier: e.data.tier ?? null, model: null, input: String(e.data.input ?? ''), output: '', error: null, tokens: 0, cost: null, equivalent: null, ms: null, step: 0, log: [], startedAt: e.at };
		return { ...s, nodes: { ...s.nodes, [e.runId]: node }, lastRoot: e.parentId ? s.lastRoot : e.runId };
	}
	if (!prev) return s;
	let node = prev;
	if (e.type === 'thinking') node = { ...prev, step: Number(e.data.step) };
	else if (e.type === 'finished' || e.type === 'error') node = { ...prev, status: e.data.status ?? (e.type === 'finished' ? 'done' : 'error'), output: String(e.data.output ?? ''), error: e.data.error ?? null, tokens: Number(e.data.tokens_in ?? 0) + Number(e.data.tokens_out ?? 0), cost: e.data.cost_usd ?? null, equivalent: e.data.equivalent_usd ?? null, ms: e.data.ms ?? null, tier: e.data.tier ?? prev.tier, model: e.data.model ?? prev.model, log: [...prev.log, { type: e.type, at: e.at, data: e.data }] };
	else node = { ...prev, log: [...prev.log, { type: e.type, at: e.at, data: e.data }] };
	// A tool that starts a new text segment: what was streamed before it was thinking aloud, not the answer.
	const text = e.type === 'tool_call' && !prev.parentId ? { ...s.text, [e.runId]: '' } : s.text;
	return { ...s, nodes: { ...s.nodes, [e.runId]: node }, text };
}

const Ctx = createContext<{ live: Live; dispatch: Dispatch<any> }>({ live: empty, dispatch: () => {} });
export const useLive = () => useContext(Ctx);

export function LiveProvider({ children }: { children: React.ReactNode }) {
	const [live, dispatch] = useReducer(reduce, empty);
	const retry = useRef(0);
	useEffect(() => {
		let ws: WebSocket | null = null;
		let timer: ReturnType<typeof setTimeout>;
		let closed = false;
		const connect = () => {
			const origin = BASE || window.location.origin;
			ws = new WebSocket(`${origin.replace(/^http/, 'ws')}/ws`);
			ws.onopen = () => ((retry.current = 0), dispatch({ type: '_conn', connected: true }));
			ws.onmessage = (m) => {
				try {
					dispatch(JSON.parse(m.data));
				} catch {
					// Not an event: ignored.
				}
			};
			ws.onclose = () => {
				dispatch({ type: '_conn', connected: false });
				if (!closed) timer = setTimeout(connect, Math.min(10000, 500 * 2 ** retry.current++));
			};
		};
		connect();
		return () => ((closed = true), clearTimeout(timer), ws?.close());
	}, []);
	return <Ctx.Provider value={{ live, dispatch }}>{children}</Ctx.Provider>;
}

/** Turns a stored run (GET /api/runs/:id) into the same nodes the live stream builds. */
export function nodesFrom(run: { runs: any[]; steps: any[] }): RunNode[] {
	return run.runs.map((r) => ({
		id: r.id, rootId: r.root_id, parentId: r.parent_id, agentId: r.agent_id, name: String(run.steps.find((s) => s.run_id === r.id && s.type === 'started')?.data.agent ?? r.agent_id), depth: r.depth, status: r.status, tier: r.tier, model: r.model, input: r.input, output: r.output ?? '', error: r.error,
		tokens: r.tokens_in + r.tokens_out, cost: r.cost_usd, equivalent: r.equivalent_usd ?? null, ms: r.finished_at ? Date.parse(r.finished_at) - Date.parse(r.started_at) : null, step: r.steps, startedAt: r.started_at,
		log: run.steps.filter((s) => s.run_id === r.id && s.type !== 'started').map((s) => ({ type: s.type, at: s.created_at, data: s.data })),
	}));
}

export const fmtTokens = (n: number | null | undefined) => (n == null ? '0' : n.toLocaleString('en-US'));
export const fmtCost = (c: number | null | undefined) => (c == null ? 'no price' : c === 0 ? '$0' : c < 0.0001 ? '<$0.0001' : c < 0.01 ? `$${c.toFixed(4)}` : `$${c.toFixed(2)}`);
/** What the same work would have cost on a paid host. Empty when no equivalent price is known. */
export const fmtHosted = (c: number | null | undefined) => (c == null ? '' : `${fmtCost(c)} if hosted`);
export const fmtMs = (ms: number | null | undefined) => (ms == null ? '' : ms < 1000 ? `${Math.round(ms)} ms` : ms < 60000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.floor(ms / 60000)} min ${Math.round((ms % 60000) / 1000)} s`);
export const fmtTime = (iso: string) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

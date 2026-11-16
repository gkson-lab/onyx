'use client';
import { useMemo, useState } from 'react';
import { ChevronRight, CornerDownRight, Square, Wrench } from 'lucide-react';
import { api, fmtCost, fmtMs, fmtTokens, type LogEntry, type RunNode } from '@/lib/api';
import { Button, ICON, Status, TierBadge } from './ui';

export const treeOf = (nodes: Record<string, RunNode> | RunNode[], rootId: string): RunNode[] => {
	const all = (Array.isArray(nodes) ? nodes : Object.values(nodes)).filter((n) => n.rootId === rootId);
	const out: RunNode[] = [];
	const walk = (parent: string | null) => all.filter((n) => n.parentId === parent).sort((a, b) => a.startedAt.localeCompare(b.startedAt)).forEach((n) => (out.push(n), walk(n.id)));
	walk(null);
	return out;
};
export const totals = (tree: RunNode[]) => ({ tokens: tree.reduce((s, n) => s + n.tokens, 0), cost: tree.some((n) => n.cost != null) ? tree.reduce((s, n) => s + (n.cost ?? 0), 0) : null, tools: [...new Set(tree.flatMap((n) => n.log.filter((l) => l.type === 'tool_call').map((l) => String(l.data.tool))))] });

function Entry({ e }: { e: LogEntry }) {
	const [open, setOpen] = useState(false);
	const d = e.data;
	if (e.type === 'tool_call') return <p className="font-mono text-xs"><span className="text-muted">call </span>{d.tool}<span className="text-muted"> {JSON.stringify(d.args)}</span></p>;
	if (e.type === 'tool_result') {
		const text = String(d.result ?? '');
		return (
			<div className="font-mono text-xs">
				<button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`text-left ${d.ok ? 'text-muted' : 'text-bad'}`}>
					{d.ok ? 'result' : 'failed'} {d.tool} <span className="text-muted">{fmtMs(d.ms)} · {open ? 'hide' : `show ${text.length.toLocaleString('en-US')} characters`}</span>
				</button>
				{open && <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap border-l pl-3 text-text">{text}</pre>}
			</div>
		);
	}
	if (e.type === 'delegated') return <p className="font-mono text-xs"><span className="text-muted">delegate </span>{(d.tasks ?? []).map((t: any) => t.agent).join(', ')}</p>;
	if (e.type === 'fallback') return <p className="font-mono text-xs text-bad">fallback ({d.kind}) {d.from} to {d.to}: <span className="text-muted">{d.reason}</span></p>;
	if (e.type === 'error') return <p className="text-sm text-bad">{d.error}</p>;
	return null;
}

/** One run as a tree: the orchestrator, the agents it called, the subagents they called. Select a node to read its steps. */
export function RunTree({ tree, routing, live = false }: { tree: RunNode[]; routing?: Record<string, any> | null; live?: boolean }) {
	const [picked, setPicked] = useState<string | null>(null);
	const node = tree.find((n) => n.id === picked) ?? tree[0];
	const sum = useMemo(() => totals(tree), [tree]);
	if (!node) return null;
	const root = tree[0]!;
	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
			<div>
				{routing && (
					<p className="mb-3 text-sm text-muted">
						Routed to <span className="text-text">{routing.tier}</span> by {routing.via === 'override' ? 'you' : routing.via === 'heuristic' ? 'rules (the router model failed)' : 'the Lite model'}: {routing.reason}
					</p>
				)}
				<ul role="tree" aria-label="Agents in this run" className="border-t">
					{tree.map((n) => (
						<li key={n.id} role="treeitem" aria-selected={n.id === node.id} aria-level={n.depth + 1}>
							<button type="button" onClick={() => setPicked(n.id)} className={`flex min-h-12 w-full items-center gap-2 border-b py-2 pr-2 text-left ${n.id === node.id ? 'bg-surface' : 'hover:bg-surface'}`} style={{ paddingLeft: 8 + n.depth * 20 }}>
								{n.depth > 0 && <CornerDownRight {...ICON} size={14} className="shrink-0 text-muted" aria-hidden />}
								<span className="min-w-0 flex-1">
									<span className="flex items-center gap-2">
										<span className={`truncate text-sm ${n.id === node.id ? 'font-medium' : ''}`}>{n.name}</span>
										<TierBadge tier={n.tier} active={n.status === 'running'} inline />
									</span>
									<span className="block truncate font-mono text-xs text-muted">{n.model ?? (n.status === 'running' ? `step ${n.step}` : '')}{n.tokens ? ` · ${fmtTokens(n.tokens)} tok · ${fmtCost(n.cost)}` : ''}{n.ms != null ? ` · ${fmtMs(n.ms)}` : ''}</span>
								</span>
								<Status status={n.status} />
							</button>
						</li>
					))}
				</ul>
				<p className="mt-3 font-mono text-xs text-muted">
					{tree.length} agent{tree.length === 1 ? '' : 's'} · {fmtTokens(sum.tokens)} tokens · {fmtCost(sum.cost)}{root.ms != null ? ` · ${fmtMs(root.ms)}` : ''}
				</p>
				{live && root.status === 'running' && (
					<div className="mt-3">
						<Button kind="danger" onClick={() => void api(`/runs/${root.id}/kill`, { method: 'POST' })}><Square {...ICON} size={14} aria-hidden />Stop this run</Button>
					</div>
				)}
			</div>
			<div className="min-w-0">
				<h3 className="text-sm font-medium">{node.name}</h3>
				<p className="mt-1 whitespace-pre-wrap text-sm text-muted">{node.input}</p>
				<div className="mt-4 space-y-2 border-t pt-4">
					{node.log.filter((l) => l.type !== 'finished').map((l, i) => <Entry key={i} e={l} />)}
					{node.status === 'running' && <p className="thinking font-mono text-xs">working, step {node.step}</p>}
					{!node.log.some((l) => l.type === 'tool_call') && node.status !== 'running' && <p className="font-mono text-xs text-muted">answered without tools</p>}
				</div>
				{node.output && <div className="mt-4 border-t pt-4"><p className="mb-1 text-xs text-muted">Result</p><p className="whitespace-pre-wrap text-sm">{node.output}</p></div>}
				{node.error && node.status !== 'running' && <p className="mt-4 text-sm text-bad">{node.error}</p>}
			</div>
		</div>
	);
}

/** The one-line summary under a chat reply; opens to the tree. */
export function Activity({ tree, routing, live }: { tree: RunNode[]; routing?: Record<string, any> | null; live?: boolean }) {
	const [open, setOpen] = useState(false);
	const root = tree[0];
	if (!root) return null;
	const sum = totals(tree);
	return (
		<div className="mt-2">
			<button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-h-9 w-full flex-wrap items-center gap-x-3 gap-y-1 text-left text-xs text-muted hover:text-text">
				<ChevronRight {...ICON} size={14} className={open ? 'rotate-90' : ''} style={{ transition: 'transform var(--fast)' }} aria-hidden />
				<TierBadge tier={root.tier} model={root.model} active={root.status === 'running'} inline />
				<span>{tree.length === 1 ? 'Core alone' : tree.slice(1).map((n) => n.name).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</span>
				{sum.tools.length > 0 && <span className="inline-flex items-center gap-1 font-mono"><Wrench {...ICON} size={12} aria-hidden />{sum.tools.join(' ')}</span>}
				<span className="font-mono">{fmtTokens(sum.tokens)} tok{root.ms != null ? ` · ${fmtMs(root.ms)}` : ''}</span>
			</button>
			{open && <div className="mt-3 border-l pl-4"><RunTree tree={tree} routing={routing} live={live} /></div>}
		</div>
	);
}

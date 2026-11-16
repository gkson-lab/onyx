'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { api, nodesFrom, useData, useLive, fmtTime, type RunNode } from '@/lib/api';
import { Activity, treeOf } from '@/components/run';
import { ChannelIcon, Empty, ICON, Problem } from '@/components/ui';

interface Msg { id: number; direction: 'in' | 'out'; text: string; run_id: string | null; channel: string; status: string; created_at: string }

/** The activity under a stored reply: loaded from the run log the first time it is shown. */
function Stored({ runId }: { runId: string }) {
	const { live, dispatch } = useLive();
	const have = Object.values(live.nodes).some((n) => n.rootId === runId);
	useEffect(() => {
		if (have) return;
		api(`/runs/${runId}`).then((r) => dispatch({ type: '_load', nodes: nodesFrom(r), routing: r.runs[0]?.routing }), () => {});
	}, [runId, have, dispatch]);
	const tree = treeOf(live.nodes, runId);
	return tree.length ? <Activity tree={tree} routing={live.routing[runId]} /> : null;
}

export default function Chat() {
	const { live } = useLive();
	const { data, error, reload } = useData<{ messages: Msg[] }>('/messages');
	const [text, setText] = useState('');
	const [pending, setPending] = useState<{ runId: string; text: string } | null>(null);
	const [sendError, setSendError] = useState<string | null>(null);
	const end = useRef<HTMLDivElement>(null);
	const messages = data?.messages ?? [];
	const tree: RunNode[] = pending ? treeOf(live.nodes, pending.runId) : [];
	const root = tree[0];
	const streamed = pending ? live.text[pending.runId] ?? '' : '';

	// When the run ends, the stored messages are the record. The reply is stored a moment after the run's last
	// event, so keep asking until it is there, then drop the in-flight copy.
	const finished = !!pending && !!root && root.status !== 'running';
	const stored = !!pending && messages.some((m) => m.run_id === pending.runId && m.direction === 'out');
	useEffect(() => {
		if (!finished) return;
		reload();
		const t = setInterval(reload, 400);
		return () => clearInterval(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [finished]);
	useEffect(() => {
		if (stored) setPending(null);
	}, [stored]);
	useEffect(() => {
		end.current?.scrollIntoView({ block: 'end' });
	}, [messages.length, streamed, tree.length, Object.keys(live.nodes).length]);
	// Messages Onyx starts (reminders) arrive on the live stream.
	useEffect(() => {
		if (live.inbox.length) reload();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [live.inbox.length]);

	const send = async () => {
		const t = text.trim();
		if (!t || pending) return;
		setSendError(null);
		setText('');
		try {
			const { runId } = await api<{ runId: string }>('/chat', { method: 'POST', body: { text: t } });
			setPending({ runId, text: t });
		} catch (e) {
			setText(t);
			setSendError((e as Error).message);
		}
	};

	return (
		<div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 md:px-8">
			<div className="min-h-0 flex-1 overflow-y-auto py-6" aria-live="polite">
				{error && <Problem>{error}</Problem>}
				{!error && data && !messages.length && !pending && (
					<Empty title="No messages yet.">
						Type below to talk to Onyx Core. It answers quick things itself and hands the rest to its agents. Start a message with /lite, /standard, /pro or /max to choose the model tier yourself.
					</Empty>
				)}
				<ol className="space-y-6">
					{messages.map((m) => (
						<li key={m.id}>
							<p className="mb-1 flex items-center gap-2 text-xs text-muted">
								{m.direction === 'in' ? 'You' : 'Onyx'}
								{m.channel !== 'web' && <ChannelIcon channel={m.channel} />}
								<time dateTime={m.created_at}>{fmtTime(m.created_at)}</time>
							</p>
							<p className={`whitespace-pre-wrap ${m.direction === 'in' ? 'text-muted' : ''} ${m.status === 'error' ? 'text-bad' : ''}`}>{m.text}</p>
							{m.direction === 'out' && m.run_id && <Stored runId={m.run_id} />}
						</li>
					))}
					{pending && (
						<>
							{!messages.some((m) => m.run_id === pending.runId && m.direction === 'in') && <li><p className="mb-1 text-xs text-muted">You</p><p className="whitespace-pre-wrap text-muted">{pending.text.replace(/^\/(lite|standard|pro|max|think)\s*/i, '')}</p></li>}
							<li>
								<p className="mb-1 text-xs text-muted">Onyx</p>
								{streamed ? <p className="whitespace-pre-wrap">{streamed}</p> : <p className="thinking">{tree.length > 1 ? `${tree.filter((n) => n.status === 'running' && n.parentId).map((n) => n.name).join(', ') || 'Core'} working` : live.routing[pending.runId] ? 'Thinking' : 'Choosing a model'}</p>}
								<Activity tree={tree} routing={live.routing[pending.runId]} live />
							</li>
						</>
					)}
				</ol>
				<div ref={end} />
			</div>
			<form onSubmit={(e) => (e.preventDefault(), void send())} className="border-t py-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
				{sendError && <div className="mb-2"><Problem>{sendError}</Problem></div>}
				<div className="flex items-end gap-2">
					<label htmlFor="message" className="sr-only">Message to Onyx</label>
					<textarea id="message" rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), void send())} placeholder="Message Onyx" className="max-h-40 min-h-11 flex-1" />
					<button type="submit" disabled={!text.trim() || !!pending} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-accent text-bg disabled:opacity-30"><ArrowUp {...ICON} /></button>
				</div>
			</form>
		</div>
	);
}

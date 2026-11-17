'use client';
import { useState } from 'react';
import Link from 'next/link';
import { fmtCost, fmtHosted, fmtMs, fmtTime, fmtTokens, useData } from '@/lib/api';
import { ChannelIcon, Empty, Loading, Page, Problem, Status, TierBadge, channelLabel } from '@/components/ui';

interface Row { id: string; channel: string; status: string; input: string; tier: any; model: string | null; started_at: string; finished_at: string | null; tokens: number | null; cost_usd: number | null; equivalent_usd: number | null; agents: number; error: string | null }
const FILTERS = { channel: ['web', 'whatsapp', 'sms', 'terminal'], tier: ['lite', 'standard', 'pro', 'max'], status: ['running', 'done', 'error', 'killed'] } as const;

export default function Runs() {
	const [f, setF] = useState<Record<string, string>>({});
	const agents = useData<{ agents: { id: string; name: string }[] }>('/agents');
	const q = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
	const { data, error } = useData<{ runs: Row[] }>(`/runs${q ? `?${q}` : ''}`);
	const filtered = Object.values(f).some(Boolean);
	const select = (key: string, label: string, options: { value: string; label: string }[]) => (
		<label className="flex flex-col gap-1 text-xs text-muted">
			{label}
			<select value={f[key] ?? ''} onChange={(e) => setF({ ...f, [key]: e.target.value })} className="min-h-9 text-sm">
				<option value="">Any</option>
				{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
			</select>
		</label>
	);
	return (
		<Page title="Runs" note="Every message Onyx has handled. Open one to replay its steps.">
			<div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
				{select('channel', 'Channel', FILTERS.channel.map((c) => ({ value: c, label: channelLabel(c) })))}
				{select('agent', 'Agent', (agents.data?.agents ?? []).map((a) => ({ value: a.id, label: a.name })))}
				{select('tier', 'Tier', FILTERS.tier.map((t) => ({ value: t, label: t[0]!.toUpperCase() + t.slice(1) })))}
				{select('status', 'Status', [{ value: 'running', label: 'Running' }, { value: 'done', label: 'Done' }, { value: 'error', label: 'Failed' }, { value: 'killed', label: 'Stopped' }])}
			</div>
			{error && <Problem>{error}</Problem>}
			{!data && !error && <Loading what="runs" />}
			{data && !data.runs.length && (filtered ? <Empty title="No runs match these filters.">Set a filter back to Any to widen the list.</Empty> : <Empty title="No runs yet.">A run is recorded each time Onyx handles a message. Send one in <Link href="/" className="text-text underline">Chat</Link>.</Empty>)}
			{data && data.runs.length > 0 && (
				<ul className="rows border-t">
					{data.runs.map((r) => (
						<li key={r.id}>
							<Link href={`/graph?run=${r.id}`} className="grid min-h-14 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b py-3 hover:bg-surface md:grid-cols-[minmax(0,1fr)_9rem_11rem_6rem]">
								<span className="min-w-0">
									<span className="block truncate text-sm">{r.input}</span>
									<span className="flex items-center gap-2 text-xs text-muted"><ChannelIcon channel={r.channel} /><time dateTime={r.started_at}>{fmtTime(r.started_at)}</time>{r.agents > 1 && <span>{r.agents} agents</span>}</span>
								</span>
								<span className="hidden md:block"><TierBadge tier={r.tier} model={r.model} /></span>
								<span className="hidden font-mono text-xs text-muted md:block">{fmtTokens(r.tokens)} tok · {fmtCost(r.cost_usd)}{r.equivalent_usd != null ? ` (${fmtHosted(r.equivalent_usd)})` : ''}{r.finished_at ? ` · ${fmtMs(Date.parse(r.finished_at) - Date.parse(r.started_at))}` : ''}</span>
								<span className="justify-self-end"><Status status={r.status} /></span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</Page>
	);
}

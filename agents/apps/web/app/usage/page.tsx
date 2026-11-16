'use client';
import { useState } from 'react';
import Link from 'next/link';
import { fmtCost, fmtMs, fmtTokens, useData } from '@/lib/api';
import { Empty, Loading, Page, Problem, Section } from '@/components/ui';

interface G { calls: number; tokens: number; cost_usd: number | null; latency_ms: number | null }
interface U { days: number; plan: string; limit: number; used_today: number; by_day: { day: string; tokens: number; calls: number; cost_usd: number | null }[]; by_tier: (G & { tier: string })[]; by_model: (G & { model_id: string })[]; by_agent: (G & { purpose: string })[] }

function Table({ rows, first }: { rows: (G & { name: string })[]; first: string }) {
	const max = Math.max(1, ...rows.map((r) => r.tokens));
	return (
		<table className="w-full border-t text-left text-sm">
			<thead><tr className="border-b text-xs text-muted">{[first, 'Tokens', '', 'Calls', 'Cost', 'Average latency'].map((h, i) => <th key={i} className="py-2 pr-4 font-normal">{h}</th>)}</tr></thead>
			<tbody>
				{rows.sort((a, b) => b.tokens - a.tokens).map((r) => (
					<tr key={r.name} className="border-b">
						<td className="py-2 pr-4 font-mono text-xs">{r.name}</td>
						<td className="py-2 pr-4 font-mono text-xs">{fmtTokens(r.tokens)}</td>
						<td className="w-1/3 py-2 pr-4"><span className="block h-1.5 bg-text" style={{ width: `${Math.max(1, (100 * r.tokens) / max)}%` }} aria-hidden /></td>
						<td className="py-2 pr-4 font-mono text-xs">{r.calls}</td>
						<td className="py-2 pr-4 font-mono text-xs">{fmtCost(r.cost_usd)}</td>
						<td className="py-2 pr-4 font-mono text-xs">{fmtMs(r.latency_ms)}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

export default function Usage() {
	const [days, setDays] = useState(14);
	const { data, error } = useData<U>(`/usage?days=${days}`);
	const pct = data ? Math.min(100, (100 * data.used_today) / data.limit) : 0;
	// Every day of the period gets a bar, so a day with no use shows as a gap instead of vanishing.
	const series = Array.from({ length: days }, (_, i) => {
		const day = new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10);
		return data?.by_day.find((d) => d.day === day) ?? { day, tokens: 0, calls: 0, cost_usd: null };
	});
	const max = Math.max(1, ...series.map((d) => d.tokens));
	return (
		<Page title="Usage" note="Tokens, cost and latency, counted from every model call Onyx has logged on this PC." actions={<label className="flex items-center gap-2 text-xs text-muted">Period<select value={days} onChange={(e) => setDays(Number(e.target.value))} className="text-sm">{[7, 14, 30, 90].map((d) => <option key={d} value={d}>Last {d} days</option>)}</select></label>}>
			{error && <Problem>{error}</Problem>}
			{!data && !error && <Loading what="usage" />}
			{data && (
				<>
					<section>
						<p className="text-sm text-muted">Today, on the {data.plan} plan</p>
						<p className="mt-1 font-mono text-xl">{fmtTokens(data.used_today)} <span className="text-sm text-muted">of {fmtTokens(data.limit)} tokens</span></p>
						<div className="mt-3 h-1.5 w-full bg-line" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Share of today's token limit used"><div className={`h-full ${pct >= 100 ? 'bg-bad' : 'bg-accent'}`} style={{ width: `${pct}%` }} /></div>
						<p className="mt-2 text-sm text-muted">{pct >= 100 ? 'The limit is reached: Onyx refuses new model calls until midnight UTC.' : 'The limit resets at midnight UTC. Plans and limits are set in tiers.yaml.'}</p>
					</section>
					{!data.by_day.length ? (
						<div className="mt-10"><Empty title={`No model calls in the last ${days} days.`}>Usage appears here after Onyx answers a message. Send one in <Link href="/" className="text-text underline">Chat</Link>.</Empty></div>
					) : (
						<>
							<Section title={`Tokens per day, last ${days} days`}>
								<ol className="flex h-36 items-end gap-1 border-b" aria-label="Tokens per day">
									{series.map((d) => <li key={d.day} className="group relative flex h-full flex-1 items-end" title={`${d.day}: ${fmtTokens(d.tokens)} tokens in ${d.calls} calls`}><span className="block w-full bg-text group-hover:bg-accent" style={{ height: d.tokens ? `${Math.max(2, (100 * d.tokens) / max)}%` : '1px', opacity: d.tokens ? 1 : 0.25 }} /><span className="sr-only">{d.day}: {fmtTokens(d.tokens)} tokens</span></li>)}
								</ol>
								<p className="mt-2 flex justify-between font-mono text-xs text-muted"><span>{series[0]!.day}</span><span>peak {fmtTokens(max)} in a day</span><span>{series.at(-1)!.day}</span></p>
							</Section>
							<Section title="By tier"><Table first="Tier" rows={data.by_tier.map((r) => ({ ...r, name: r.tier }))} /></Section>
							<Section title="By model"><Table first="Model" rows={data.by_model.map((r) => ({ ...r, name: r.model_id }))} /></Section>
							<Section title="By agent" aside={<span className="text-xs text-muted">"route" is the router's own calls</span>}><Table first="Agent" rows={data.by_agent.map((r) => ({ ...r, name: r.purpose }))} /></Section>
						</>
					)}
				</>
			)}
		</Page>
	);
}

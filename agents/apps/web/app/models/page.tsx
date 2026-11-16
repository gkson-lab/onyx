'use client';
import { useEffect, useState } from 'react';
import { api, fmtCost, fmtMs, fmtTokens, useData, type Tier } from '@/lib/api';
import { Button, Code, Loading, Page, Problem, Section, TierBadge } from '@/components/ui';

interface M { key: string; id: string; provider: string; family: string; price: { input: number; output: number } | null; local: boolean; usable: boolean; tiers: Tier[]; installed: boolean | null; provider_error: string | null; calls: number; errors: number; latency_ms: number | null; tokens: number; cost_usd: number | null }

export default function Models() {
	const { data, error, reload } = useData<{ models: M[] }>('/models');
	const raw = useData<{ yaml: string }>('/tiers/raw');
	const [yaml, setYaml] = useState('');
	const [saved, setSaved] = useState<string | null>(null);
	const [bad, setBad] = useState<string | null>(null);
	useEffect(() => { if (raw.data) setYaml(raw.data.yaml); }, [raw.data]);
	const save = async () => {
		setBad(null);
		setSaved(null);
		try {
			await api('/tiers/raw', { method: 'PUT', body: { yaml } });
			setSaved('Saved. New messages use the new tiers.');
			reload();
		} catch (e) {
			setBad((e as Error).message);
		}
	};
	const state = (m: M) => (!m.usable ? { text: 'Off (cloud)', bad: false } : m.provider_error ? { text: 'Provider unreachable', bad: true } : m.installed === false ? { text: 'Not installed', bad: true } : { text: 'Ready', bad: false });
	const unreachable = [...new Set((data?.models ?? []).filter((m) => m.usable && m.provider_error).map((m) => `${m.provider}: ${m.provider_error}`))];
	return (
		<Page title="Models" note="Every model in the tiers file, with what Onyx has measured calling it. Latency is the average of successful calls.">
			{error && <Problem>{error}</Problem>}
			{unreachable.map((u) => <div key={u} className="mb-3"><Problem>{u}. If this is Ollama, start it, then reload this page.</Problem></div>)}
			{!data && !error && <Loading what="models" />}
			{data && (
				<div className="overflow-x-auto">
					<table className="w-full min-w-[44rem] border-t text-left text-sm">
						<thead><tr className="border-b text-xs text-muted">{['Model', 'Backs', 'State', 'Calls', 'Errors', 'Latency', 'Tokens', 'Cost', 'Price per 1M in / out'].map((h) => <th key={h} className="py-2 pr-4 font-normal">{h}</th>)}</tr></thead>
						<tbody>
							{data.models.map((m) => {
								const s = state(m);
								return (
									<tr key={m.key} className="border-b align-top">
										<td className="py-3 pr-4"><span className="block font-mono text-xs">{m.id}</span><span className="text-xs text-muted">{m.provider}{m.local ? ', on this PC' : ', cloud'}</span></td>
										<td className="py-3 pr-4"><span className="flex flex-wrap gap-1">{m.tiers.length ? m.tiers.map((t) => <TierBadge key={t} tier={t} />) : <span className="text-xs text-muted">no tier</span>}</span></td>
										<td className={`py-3 pr-4 ${s.bad ? 'text-bad' : 'text-muted'}`}>{s.text}{m.installed === false && m.provider === 'ollama' && <span className="mt-1 block font-mono text-xs text-text">ollama pull {m.id}</span>}</td>
										<td className="py-3 pr-4 font-mono text-xs">{m.calls}</td>
										<td className={`py-3 pr-4 font-mono text-xs ${m.errors ? 'text-bad' : ''}`}>{m.calls ? `${m.errors} (${Math.round((100 * m.errors) / m.calls)}%)` : '0'}</td>
										<td className="py-3 pr-4 font-mono text-xs">{m.latency_ms != null ? fmtMs(m.latency_ms) : 'not measured'}</td>
										<td className="py-3 pr-4 font-mono text-xs">{fmtTokens(m.tokens)}</td>
										<td className="py-3 pr-4 font-mono text-xs">{m.calls ? fmtCost(m.cost_usd) : ''}</td>
										<td className="py-3 pr-4 font-mono text-xs text-muted">{m.price ? (m.price.input === 0 && m.price.output === 0 ? 'free, local' : `$${m.price.input} / $${m.price.output}`) : 'not set'}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
			<Section title="tiers.yaml">
				<p className="mb-3 max-w-2xl text-sm text-muted">Which model backs each tier, in the order they are tried. Saving checks the file first: a tier that names a model that isn't defined is refused. This edits <Code>config/tiers.yaml</Code> on this PC.</p>
				{raw.error && <Problem>{raw.error}</Problem>}
				<label htmlFor="tiers" className="sr-only">tiers.yaml</label>
				<textarea id="tiers" value={yaml} onChange={(e) => (setYaml(e.target.value), setSaved(null))} rows={22} spellCheck={false} className="w-full font-mono text-xs leading-5" />
				{bad && <div className="mt-2"><Problem>{bad}</Problem></div>}
				<div className="mt-3 flex items-center gap-3">
					<Button kind="primary" onClick={() => void save()} disabled={!yaml || yaml === raw.data?.yaml}>Save tiers</Button>
					<Button onClick={() => raw.data && (setYaml(raw.data.yaml), setBad(null))} disabled={yaml === raw.data?.yaml}>Discard changes</Button>
					{saved && <span role="status" className="text-sm text-muted">{saved}</span>}
				</div>
			</Section>
		</Page>
	);
}

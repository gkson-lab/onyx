'use client';
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { api, fmtCost, fmtMs, fmtTime, useData } from '@/lib/api';
import { Button, ICON, Loading, Problem } from './ui';

interface Result { tier: string; ok: boolean; model: string | null; ms: number; answer: string | null; fallbacks: number; error: string | null }

/** One small question to every tier, so a broken model shows up in seconds rather than mid-task. */
export function HealthCheck() {
	const last = useData<{ at: string; results: Result[] } | null>('/health/last');
	const [running, setRunning] = useState(false);
	const [err, setErr] = useState<string | null>(null);
	const run = async () => {
		setRunning(true);
		setErr(null);
		try {
			await api('/health', { method: 'POST' });
			last.reload();
		} catch (e) {
			setErr((e as Error).message);
		}
		setRunning(false);
	};
	const r = last.data;
	return (
		<>
			<div className="mb-3 flex flex-wrap items-center gap-3">
				<Button kind="primary" onClick={() => void run()} disabled={running}>{running ? 'Checking each tier…' : 'Check every tier'}</Button>
				<span className="text-xs text-muted">{running ? 'Each model may need loading first: up to a minute or two.' : r ? `Last checked ${fmtTime(r.at)}` : 'Not checked yet.'}</span>
			</div>
			{err && <Problem>{err}</Problem>}
			{r && (
				<ul className="border-t">
					{r.results.map((x) => (
						<li key={x.tier} className="grid grid-cols-[5rem_1fr_auto] items-start gap-x-3 border-b py-2 text-sm">
							<span className="flex items-center gap-1.5 font-medium capitalize">{x.ok ? <Check {...ICON} size={15} aria-label="works" /> : <X {...ICON} size={15} className="text-bad" aria-label="failed" />}{x.tier}</span>
							<span className="min-w-0">
								<span className="font-mono text-xs">{x.model ?? 'no model'}</span>
								{x.error && <span className="mt-0.5 block break-words font-mono text-xs text-bad">{x.error}</span>}
								{x.fallbacks > 0 && <span className="block text-xs text-muted">answered after {x.fallbacks} retr{x.fallbacks === 1 ? 'y' : 'ies'}</span>}
							</span>
							<span className="font-mono text-xs text-muted">{fmtMs(x.ms)}</span>
						</li>
					))}
				</ul>
			)}
		</>
	);
}

interface CatalogModel { id: string; maker: string; params: string; good: string; tools: boolean; vision: boolean; needGb: number; where: string; gpuShare: number; tokensPerSec: number | null; installed: boolean | null; using: string[]; equivalent: { input: number; output: number } | null }
interface Catalog { context: number; recommended: Record<string, string | null>; models: CatalogModel[]; pulls: Record<string, { status: string; done: number; total: number; error: string | null; finished: boolean }> }
const USES = ['lite', 'standard', 'pro', 'max', 'vision'] as const;

/** Every model Onyx knows, how it would run here, and buttons to download it and put it to work. */
export function MoreModels({ onChange }: { onChange?: () => void }) {
	const { data, error, reload } = useData<Catalog>('/models/catalog');
	const [msg, setMsg] = useState<string | null>(null);
	const busy = data && Object.values(data.pulls).some((p) => !p.finished);
	useEffect(() => {
		if (!busy) return;
		const t = setTimeout(reload, 1500);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);
	if (error) return <Problem>{error}</Problem>;
	if (!data) return <Loading what="the model list" />;
	const download = async (id: string) => {
		setMsg(null);
		await api('/models/pull', { method: 'POST', body: { id } }).catch((e) => setMsg((e as Error).message));
		reload();
	};
	const use = async (id: string, as: string) => {
		setMsg(null);
		try {
			await api('/models/assign', { method: 'POST', body: { use: as, id } });
			setMsg(`${id} now backs ${as === 'vision' ? 'image reading' : `the ${as} tier`}.`);
			reload();
			onChange?.();
		} catch (e) {
			setMsg((e as Error).message);
		}
	};
	return (
		<>
			{msg && <p role="status" className="mb-3 text-sm">{msg}</p>}
			<ul className="border-t">
				{data.models.map((m) => {
					const p = data.pulls[m.id];
					const allowed = USES.filter((u) => (u === 'vision' ? m.vision : m.tools) && !m.using.includes(u));
					return (
						<li key={m.id} className="grid gap-x-4 gap-y-1 border-b py-3 md:grid-cols-[15rem_1fr_auto]">
							<div>
								<p className="font-mono text-sm">{m.id}</p>
								<p className="text-xs text-muted">{m.maker} · {m.params}</p>
							</div>
							<div className="text-sm">
								<p>{m.good}{!m.tools && <span className="text-muted"> · cannot call tools</span>}{m.vision && <span className="text-muted"> · reads images</span>}</p>
								<p className="font-mono text-xs text-muted">
									{m.where === 'no' ? `needs ${m.needGb} GB: too big for this PC` : `${m.needGb} GB · ${m.where === 'gpu' ? 'all on the graphics card' : m.where === 'split' ? `${Math.round(m.gpuShare * 100)}% on the graphics card` : 'on the processor'} · about ${m.tokensPerSec} tokens/s`}
									{m.equivalent && ` · hosted ${fmtCost(m.equivalent.input)}/${fmtCost(m.equivalent.output)} per 1M`}
								</p>
								{m.using.length > 0 && <p className="text-xs">Backs {m.using.join(', ')}</p>}
								{p && !p.finished && <p className="font-mono text-xs" role="status">{p.total ? `Downloading ${Math.round((p.done / p.total) * 100)}% of ${(p.total / 1e9).toFixed(1)} GB` : p.status}</p>}
								{p?.error && <p className="font-mono text-xs text-bad">Download failed: {p.error}</p>}
							</div>
							<div className="flex flex-wrap items-center gap-2 md:justify-end">
								{m.installed === false && m.where !== 'no' && <Button onClick={() => void download(m.id)} disabled={!!p && !p.finished}>Download</Button>}
								{m.installed && allowed.length > 0 && (
									<>
										<label htmlFor={`use-${m.id}`} className="sr-only">Use {m.id} for</label>
										<select id={`use-${m.id}`} defaultValue="" onChange={(e) => e.target.value && void use(m.id, e.target.value)} className="h-9 text-sm">
											<option value="" disabled>Use for…</option>
											{allowed.map((u) => <option key={u} value={u}>{u === 'vision' ? 'Reading images' : `${u[0]!.toUpperCase()}${u.slice(1)} tier`}{data.recommended[u] === m.id ? ' (recommended)' : ''}</option>)}
										</select>
									</>
								)}
								{m.installed === null && <span className="text-xs text-muted">Ollama not running</span>}
							</div>
						</li>
					);
				})}
			</ul>
		</>
	);
}

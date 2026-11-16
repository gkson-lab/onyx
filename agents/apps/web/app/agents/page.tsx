'use client';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api, useData, type Tier } from '@/lib/api';
import { Button, Empty, ICON, Loading, Page, Problem, TierBadge } from '@/components/ui';

interface Agent { id: string; name: string; description: string; system_prompt: string; tier: Tier; tools: string[]; enabled: boolean; max_steps: number; token_budget: number; time_budget_ms: number; builtin: boolean }
interface Data { agents: Agent[]; tools: { name: string; description: string }[]; connectors: string[] }
const BLANK: Agent = { id: '', name: '', description: '', system_prompt: '', tier: 'standard', tools: [], enabled: true, max_steps: 8, token_budget: 40000, time_budget_ms: 300000, builtin: false };

function Editor({ agent, data, tiers, isNew, onSaved, onCancel }: { agent: Agent; data: Data; tiers: Record<string, string | null>; isNew: boolean; onSaved: () => void; onCancel: () => void }) {
	const [a, setA] = useState(agent);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	useEffect(() => {
		setA(agent);
		setError(null);
	}, [agent]);
	const set = <K extends keyof Agent>(k: K, v: Agent[K]) => setA((x) => ({ ...x, [k]: v }));
	const options = [...data.tools.filter((t) => !t.name.startsWith('mcp__')).map((t) => ({ value: t.name, label: t.name, hint: t.description })), ...data.connectors.map((c) => ({ value: `connector:${c}`, label: `connector:${c}`, hint: `Every tool of the ${c} connector.` }))];
	const save = async () => {
		setBusy(true);
		setError(null);
		try {
			if (isNew && !/^[a-z][a-z0-9_-]{1,30}$/.test(a.id)) throw new Error('The id is 2 to 31 characters: lower-case letters, digits, - and _, starting with a letter.');
			await api(`/agents/${a.id}`, { method: 'PUT', body: a });
			onSaved();
		} catch (e) {
			setError((e as Error).message);
		}
		setBusy(false);
	};
	const field = 'flex flex-col gap-1 text-xs text-muted';
	return (
		<form onSubmit={(e) => (e.preventDefault(), void save())} className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2">
				{isNew && <label className={field}>Id<input value={a.id} onChange={(e) => set('id', e.target.value.toLowerCase())} placeholder="summarizer" className="font-mono text-sm" required /></label>}
				<label className={field}>Name<input value={a.name} onChange={(e) => set('name', e.target.value)} placeholder="Summarizer" className="text-sm" required /></label>
				<label className={field}>What it is for<input value={a.description} onChange={(e) => set('description', e.target.value)} placeholder="One line, shown in this list" className="text-sm" /></label>
			</div>
			<label className={field}>System prompt<textarea value={a.system_prompt} onChange={(e) => set('system_prompt', e.target.value)} rows={7} className="text-sm text-text" placeholder="What this agent does, how it should answer, and what it must not do." required /></label>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<label className={field}>Tier
					<select value={a.tier} onChange={(e) => set('tier', e.target.value as Tier)} className="text-sm">
						{(['lite', 'standard', 'pro', 'max'] as const).map((t) => <option key={t} value={t}>{t[0]!.toUpperCase() + t.slice(1)}{tiers[t] ? ` · ${tiers[t]}` : ''}</option>)}
					</select>
				</label>
				<label className={field}>Most steps<input type="number" min={1} max={30} value={a.max_steps} onChange={(e) => set('max_steps', Number(e.target.value))} className="font-mono text-sm" /></label>
				<label className={field}>Token budget<input type="number" min={500} step={500} value={a.token_budget} onChange={(e) => set('token_budget', Number(e.target.value))} className="font-mono text-sm" /></label>
				<label className={field}>Time budget, seconds<input type="number" min={5} max={3600} value={Math.round(a.time_budget_ms / 1000)} onChange={(e) => set('time_budget_ms', Number(e.target.value) * 1000)} className="font-mono text-sm" /></label>
			</div>
			<fieldset>
				<legend className="mb-2 text-xs text-muted">Tools it may use</legend>
				<div className="grid gap-x-6 md:grid-cols-2">
					{options.map((o) => (
						<label key={o.value} className="flex min-h-11 cursor-pointer items-start gap-3 border-b py-2">
							<input type="checkbox" checked={a.tools.includes(o.value)} onChange={(e) => set('tools', e.target.checked ? [...a.tools, o.value] : a.tools.filter((t) => t !== o.value))} className="mt-1 min-h-0 accent-accent" />
							<span className="min-w-0"><span className="block font-mono text-xs text-text">{o.label}</span><span className="block truncate text-xs text-muted">{o.hint}</span></span>
						</label>
					))}
				</div>
			</fieldset>
			<label className="flex min-h-11 items-center gap-3 text-sm">
				<input type="checkbox" checked={a.enabled} disabled={a.id === 'core'} onChange={(e) => set('enabled', e.target.checked)} className="min-h-0 accent-accent" />
				Switched on{a.id === 'core' && <span className="text-xs text-muted">Core receives every message, so it stays on.</span>}
			</label>
			{error && <Problem>{error}</Problem>}
			<div className="flex flex-wrap gap-2">
				<Button type="submit" kind="primary" disabled={busy}>{busy ? 'Saving' : isNew ? 'Create agent' : 'Save changes'}</Button>
				<Button onClick={onCancel}>Cancel</Button>
				{!isNew && !a.builtin && <Button kind="danger" onClick={() => void api(`/agents/${a.id}`, { method: 'DELETE' }).then(onSaved, (e) => setError(e.message))}>Delete agent</Button>}
			</div>
		</form>
	);
}

export default function Agents() {
	const { data, error, reload } = useData<Data>('/agents');
	const tiers = useData<{ tiers: { tier: string; model: string | null }[] }>('/tiers');
	const [open, setOpen] = useState<string | null>(null);
	const models = Object.fromEntries((tiers.data?.tiers ?? []).map((t) => [t.tier, t.model]));
	const done = () => (setOpen(null), reload());
	return (
		<Page title="Agents" note="Onyx Core receives every message and hands work to the others. Edit what each one is told, which model tier it runs on, which tools it may use and how much it may spend." actions={<Button onClick={() => setOpen('+')}><Plus {...ICON} size={16} aria-hidden />New agent</Button>}>
			{error && <Problem>{error}</Problem>}
			{!data && !error && <Loading what="agents" />}
			{data && open === '+' && <div className="mb-8 border-y py-6"><h2 className="mb-4 text-sm font-medium">New agent</h2><Editor agent={BLANK} data={data} tiers={models} isNew onSaved={done} onCancel={() => setOpen(null)} /></div>}
			{data && !data.agents.length && <Empty title="No agents.">The built-in agents are created when the server starts. Restart it with pnpm start.</Empty>}
			{data && (
				<ul className="border-t">
					{data.agents.map((a) => (
						<li key={a.id} className="border-b">
							<button type="button" aria-expanded={open === a.id} onClick={() => setOpen(open === a.id ? null : a.id)} className="grid min-h-14 w-full grid-cols-[1fr_auto] items-center gap-4 py-3 text-left hover:bg-surface md:grid-cols-[14rem_1fr_auto]">
								<span><span className={`block text-sm font-medium ${a.enabled ? '' : 'text-muted line-through'}`}>{a.name}</span><span className="font-mono text-xs text-muted">{a.id}{a.builtin ? '' : ' · custom'}{a.enabled ? '' : ' · off'}</span></span>
								<span className="hidden min-w-0 md:block"><span className="block truncate text-sm text-muted">{a.description}</span><span className="block truncate font-mono text-xs text-muted">{a.tools.join(' ') || 'no tools'}</span></span>
								<TierBadge tier={a.tier} model={models[a.tier] ?? null} />
							</button>
							{open === a.id && <div className="pb-6 pt-2"><Editor agent={a} data={data} tiers={models} isNew={false} onSaved={done} onCancel={() => setOpen(null)} /></div>}
						</li>
					))}
				</ul>
			)}
		</Page>
	);
}

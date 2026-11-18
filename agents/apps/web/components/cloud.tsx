'use client';
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { api, useData } from '@/lib/api';
import { Button, ICON, Loading, Problem, Section } from '@/components/ui';

interface CloudS { cloud: boolean; cloud_keys: { name: string; set: boolean; hint: string | null }[]; cloud_daily_usd: number | null; cloud_spent_today: number }
interface Tested { ok: boolean; error?: string; models?: { id: string; label: string; found: boolean }[] }

const PROVIDERS = [
	{ key: 'ANTHROPIC_API_KEY', provider: 'anthropic', name: 'Claude', by: 'Anthropic', where: 'https://console.anthropic.com/settings/keys', site: 'console.anthropic.com' },
	{ key: 'OPENAI_API_KEY', provider: 'openai', name: 'ChatGPT', by: 'OpenAI', where: 'https://platform.openai.com/api-keys', site: 'platform.openai.com' },
	{ key: 'MOONSHOT_API_KEY', provider: 'moonshot', name: 'Kimi', by: 'Moonshot AI', where: 'https://platform.moonshot.ai', site: 'platform.moonshot.ai' },
] as const;

const usd = (n: number) => `$${n.toFixed(2)}`;

/**
 * Claude and ChatGPT (and Kimi) with your own keys: the switch, the keys, a check that each key works, and the
 * day's spending limit. Keys are written to .env on this PC; this page only ever sees their last four characters.
 */
export function CloudModels() {
	const { data, error, reload } = useData<CloudS>('/settings');
	const [busy, setBusy] = useState(false);
	const [problem, setProblem] = useState<string | null>(null);
	const [drafts, setDrafts] = useState<Record<string, string>>({});
	const [tested, setTested] = useState<Record<string, Tested | 'testing'>>({});
	const [limit, setLimit] = useState<string | null>(null);

	const save = async (body: object) => {
		setBusy(true);
		setProblem(null);
		try {
			await api('/settings/cloud', { method: 'PUT', body });
			reload();
			return true;
		} catch (e) {
			setProblem((e as Error).message);
			return false;
		} finally {
			setBusy(false);
		}
	};
	const test = async (provider: string) => {
		setTested((t) => ({ ...t, [provider]: 'testing' }));
		const r = await api<Tested>('/settings/cloud/test', { method: 'POST', body: { provider } }).catch((e: Error) => ({ ok: false, error: e.message }));
		setTested((t) => ({ ...t, [provider]: r }));
	};

	if (error) return <Section title="Cloud models"><Problem>{error}</Problem></Section>;
	if (!data) return <Section title="Cloud models"><Loading what="cloud models" /></Section>;
	const keyOf = (name: string) => data.cloud_keys.find((k) => k.name === name);
	const limitText = limit ?? (data.cloud_daily_usd === null ? '' : String(data.cloud_daily_usd));

	return (
		<Section title="Cloud models: Claude and ChatGPT" aside={<Button kind={data.cloud ? 'plain' : 'primary'} disabled={busy} onClick={() => void save({ on: !data.cloud })}>{data.cloud ? 'Turn off' : 'Turn on'}</Button>}>
			<p className="mb-2 max-w-2xl text-sm text-muted">
				Onyx runs on this PC by default. Turn cloud models on and add your own key to use Claude (Anthropic) or ChatGPT (OpenAI) as well: choose one for a message in Chat, or make it a tier's first choice under Models.
			</p>
			<p className="mb-4 max-w-2xl text-sm text-muted">
				A message you send to a cloud model, and what its agents read for it, goes to that company, and the company bills your account for it. While cloud models are off, nothing is sent anywhere.
			</p>
			<p className="mb-3 text-sm">
				Cloud models are <strong>{data.cloud ? 'on' : 'off'}</strong>.
			</p>
			{problem && <Problem>{problem}</Problem>}
			<ul className="border-t">
				{PROVIDERS.map((p) => {
					const k = keyOf(p.key);
					const t = tested[p.provider];
					const draft = drafts[p.key] ?? '';
					return (
						<li key={p.key} className="border-b py-3">
							<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
								<span className="text-sm font-medium">
									{p.name} <span className="font-normal text-muted">by {p.by}</span>
								</span>
								<span className={`font-mono text-xs ${k?.set ? 'text-text' : 'text-muted'}`}>{k?.set ? `key set ${k.hint ?? ''}` : 'no key'}</span>
							</div>
							<form
								className="mt-2 flex flex-wrap gap-2"
								onSubmit={(e) => {
									e.preventDefault();
									void save({ keys: { [p.key]: draft } }).then((ok) => ok && (setDrafts((d) => ({ ...d, [p.key]: '' })), setTested((x) => ({ ...x, [p.provider]: undefined as never }))));
								}}
							>
								<label htmlFor={`key-${p.provider}`} className="sr-only">{`${p.name} API key`}</label>
								<input id={`key-${p.provider}`} type="password" autoComplete="off" spellCheck={false} placeholder={k?.set ? 'Paste a new key to replace it' : `Paste your ${p.by} API key`} value={draft} onChange={(e) => setDrafts((d) => ({ ...d, [p.key]: e.target.value }))} className="min-w-0 flex-1 basis-56 font-mono text-xs" />
								<Button type="submit" kind="primary" disabled={busy || draft.trim().length < 16}>Save</Button>
								{k?.set && <Button disabled={busy || t === 'testing'} onClick={() => void test(p.provider)}>{t === 'testing' ? 'Checking…' : 'Check key'}</Button>}
								{k?.set && <Button kind="danger" disabled={busy} onClick={() => void save({ keys: { [p.key]: null } })}>Remove</Button>}
							</form>
							{t && t !== 'testing' && (
								<div className="mt-2 text-sm" role="status">
									{t.ok ? (
										<p className="flex flex-wrap items-center gap-x-3 gap-y-1">
											<span className="inline-flex items-center gap-1"><Check {...ICON} aria-hidden="true" /> The key works.</span>
											{t.models?.map((m) => (
												<span key={m.id} className={`inline-flex items-center gap-1 ${m.found ? '' : 'text-bad'}`}>
													{m.found ? <Check {...ICON} aria-hidden="true" /> : <X {...ICON} aria-hidden="true" />}
													{m.label}
													{!m.found && ' (not offered to this key)'}
												</span>
											))}
										</p>
									) : (
										<p className="text-bad">{t.error}</p>
									)}
								</div>
							)}
							{!k?.set && (
								<p className="mt-2 text-xs text-muted">
									Get a key at <a className="underline" href={p.where} target="_blank" rel="noreferrer">{p.site}</a>.
								</p>
							)}
						</li>
					);
				})}
			</ul>
			<form
				className="mt-4 flex flex-wrap items-center gap-2"
				onSubmit={(e) => {
					e.preventDefault();
					const n = limitText.trim() === '' ? null : Number(limitText);
					if (n !== null && (!Number.isFinite(n) || n < 0)) return setProblem('The limit is an amount in US dollars, like 5.');
					void save({ daily_usd: n }).then((ok) => ok && setLimit(null));
				}}
			>
				<label htmlFor="cloud-limit" className="text-sm">Spending limit per day, in US dollars</label>
				<input id="cloud-limit" inputMode="decimal" value={limitText} placeholder="no limit" onChange={(e) => setLimit(e.target.value)} className="w-24 font-mono text-xs" />
				<Button type="submit" disabled={busy || limit === null}>Save</Button>
				<span className="text-sm text-muted">Spent today: {usd(data.cloud_spent_today)}{data.cloud_daily_usd !== null ? ` of ${usd(data.cloud_daily_usd)}` : ''}</span>
			</form>
			<p className="mt-2 max-w-2xl text-xs text-muted">Once the day's spending reaches the limit, cloud models are skipped until midnight UTC and the models on this PC answer instead. Leave it empty for no limit. The figures use the prices in the tiers file; your provider's bill is what counts.</p>
		</Section>
	);
}

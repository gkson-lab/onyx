'use client';
import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { api, fmtTime, useData } from '@/lib/api';
import { Button, Code, ICON, Loading, Page, Problem, Section, channelLabel } from '@/components/ui';

interface S { preferred_channels: string[]; allowlist: string[]; keys: { name: string; set: boolean }[]; cloud: boolean }
const KEY_USE: Record<string, string> = { MOONSHOT_API_KEY: 'Kimi models (only used when ONYX_CLOUD=on)', BRAVE_API_KEY: 'Web search for the Researcher', GITHUB_MCP_TOKEN: 'The GitHub connector', WHATSAPP_TOKEN: 'WhatsApp (arrives in a later milestone)', TWILIO_AUTH_TOKEN: 'SMS (arrives in a later milestone)' };

export default function Settings() {
	const { data, error, reload } = useData<S>('/settings');
	const schedules = useData<{ schedules: { id: number; text: string; next_fire: string; repeat: string; status: string }[] }>('/schedules');
	const memories = useData<{ memories: { id: number; text: string; created_at: string }[] }>('/memories');
	const [order, setOrder] = useState<string[]>([]);
	const [allow, setAllow] = useState<string[]>([]);
	const [entry, setEntry] = useState('');
	const [note, setNote] = useState<string | null>(null);
	const [bad, setBad] = useState<string | null>(null);
	useEffect(() => { if (data) (setOrder(data.preferred_channels), setAllow(data.allowlist)); }, [data]);
	const save = async (body: Partial<S>) => {
		setBad(null);
		try {
			await api('/settings', { method: 'PUT', body });
			setNote('Saved.');
			reload();
		} catch (e) {
			setBad((e as Error).message);
		}
	};
	const move = (i: number, by: number) => {
		const next = [...order];
		[next[i], next[i + by]] = [next[i + by]!, next[i]!];
		setOrder(next);
		void save({ preferred_channels: next });
	};
	const active = (schedules.data?.schedules ?? []).filter((s) => s.status === 'active');
	return (
		<Page title="Settings">
			{(error || bad) && <Problem>{error ?? bad}</Problem>}
			{!data && !error && <Loading what="settings" />}
			{data && (
				<>
					<Section title="Where Onyx texts you first" aside={note ? <span role="status" className="text-xs text-muted">{note}</span> : undefined}>
						<p className="mb-3 max-w-2xl text-sm text-muted">Reminders and finished tasks go to the first channel that is working. The app is always the last resort.</p>
						<ol className="border-t">
							{order.map((c, i) => (
								<li key={c} className="flex min-h-12 items-center gap-3 border-b">
									<span className="w-5 font-mono text-xs text-muted">{i + 1}</span>
									<span className="flex-1 text-sm">{channelLabel(c)}</span>
									<button type="button" aria-label={`Move ${channelLabel(c)} up`} disabled={i === 0} onClick={() => move(i, -1)} className="flex h-11 w-11 items-center justify-center text-muted hover:text-text disabled:opacity-25"><ArrowUp {...ICON} /></button>
									<button type="button" aria-label={`Move ${channelLabel(c)} down`} disabled={i === order.length - 1} onClick={() => move(i, 1)} className="flex h-11 w-11 items-center justify-center text-muted hover:text-text disabled:opacity-25"><ArrowDown {...ICON} /></button>
								</li>
							))}
						</ol>
					</Section>

					<Section title="Who may text Onyx">
						<p className="mb-3 max-w-2xl text-sm text-muted">Phone numbers allowed to reach the agents over WhatsApp and SMS, in international form. Everyone else is ignored. It takes effect when those channels are added.</p>
						{allow.length === 0 && <p className="border-y py-3 text-sm text-muted">No numbers yet. Add yours below.</p>}
						<ul className={allow.length ? 'border-t' : ''}>
							{allow.map((n) => (
								<li key={n} className="flex min-h-12 items-center justify-between border-b">
									<span className="font-mono text-sm">{n}</span>
									<button type="button" aria-label={`Remove ${n}`} onClick={() => void save({ allowlist: allow.filter((x) => x !== n) })} className="flex h-11 w-11 items-center justify-center text-muted hover:text-bad"><X {...ICON} /></button>
								</li>
							))}
						</ul>
						<form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = entry.replace(/[\s()-]/g, ''); if (!/^\+\d{8,15}$/.test(v)) return setBad('Write the number in international form: + then 8 to 15 digits.'); setEntry(''); void save({ allowlist: [...new Set([...allow, v])] }); }}>
							<label htmlFor="number" className="sr-only">Phone number</label>
							<input id="number" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="+15125550123" inputMode="tel" className="w-56 font-mono text-sm" />
							<Button type="submit" disabled={!entry.trim()}>Add number</Button>
						</form>
					</Section>

					<Section title="Keys">
						<p className="mb-3 max-w-2xl text-sm text-muted">Keys live in <Code>.env</Code> on this PC and are never sent to this page: it only knows whether each one is set. To change one, edit <Code>.env</Code> and restart Onyx.</p>
						<ul className="border-t">
							{data.keys.map((k) => (
								<li key={k.name} className="grid min-h-12 grid-cols-[1fr_auto] items-center gap-3 border-b py-2 md:grid-cols-[16rem_1fr_auto]">
									<span className="font-mono text-xs">{k.name}</span>
									<span className="hidden text-sm text-muted md:block">{KEY_USE[k.name]}</span>
									<span className={`font-mono text-xs ${k.set ? 'text-text' : 'text-muted'}`}>{k.set ? '••••••••  set' : 'not set'}</span>
								</li>
							))}
						</ul>
						<p className="mt-3 text-sm text-muted">Cloud models are {data.cloud ? 'on' : 'off'}: <Code>ONYX_CLOUD={data.cloud ? 'on' : 'off'}</Code>. {data.cloud ? 'Pro and Max try Kimi first.' : 'Every model call stays on this PC.'}</p>
					</Section>

					<Section title="Reminders">
						{schedules.error && <Problem>{schedules.error}</Problem>}
						{!active.length ? <p className="border-y py-3 text-sm text-muted">No active reminders. Ask Onyx in Chat: "remind me to call the dentist tomorrow at 9am".</p> : (
							<ul className="border-t">
								{active.map((s) => (
									<li key={s.id} className="flex min-h-12 items-center justify-between gap-3 border-b py-2">
										<span className="min-w-0"><span className="block truncate text-sm">{s.text}</span><span className="font-mono text-xs text-muted">{fmtTime(s.next_fire)}{s.repeat !== 'none' ? ` · ${s.repeat}` : ''}</span></span>
										<Button kind="danger" onClick={() => void api(`/schedules/${s.id}`, { method: 'DELETE' }).then(schedules.reload)}>Cancel</Button>
									</li>
								))}
							</ul>
						)}
					</Section>

					<Section title="What Onyx remembers about you">
						{memories.error && <Problem>{memories.error}</Problem>}
						{!memories.data?.memories.length ? <p className="border-y py-3 text-sm text-muted">Nothing saved. Tell Onyx something to keep: "remember that I prefer metric units".</p> : (
							<ul className="border-t">
								{memories.data.memories.map((m) => (
									<li key={m.id} className="flex min-h-12 items-center justify-between gap-3 border-b py-2">
										<span className="text-sm">{m.text}</span>
										<button type="button" aria-label={`Forget: ${m.text}`} onClick={() => void api(`/memories/${m.id}`, { method: 'DELETE' }).then(memories.reload)} className="flex h-11 w-11 shrink-0 items-center justify-center text-muted hover:text-bad"><X {...ICON} /></button>
									</li>
								))}
							</ul>
						)}
					</Section>
				</>
			)}
		</Page>
	);
}

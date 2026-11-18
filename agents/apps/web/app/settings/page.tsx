'use client';
import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check, X } from 'lucide-react';
import { api, fmtTime, useData } from '@/lib/api';
import { Button, Code, ICON, Loading, Page, Problem, Section, channelLabel } from '@/components/ui';
import { Autostart, Backups } from '@/components/settings-extra';
import { Updates } from '@/components/updates';
import { CloudModels } from '@/components/cloud';

interface S { preferred_channels: string[]; allowlist: string[]; keys: { name: string; set: boolean }[]; cloud: boolean }
const KEY_USE: Record<string, string> = { OPENAI_API_KEY: 'ChatGPT models (set in Cloud models, above)', ANTHROPIC_API_KEY: 'Claude models (set in Cloud models, above)', MOONSHOT_API_KEY: 'Kimi models (set in Cloud models, above)', BRAVE_API_KEY: 'Web search for the Researcher', GITHUB_MCP_TOKEN: 'The GitHub connector', ONYX_PASSWORD: 'Signing in to this app from outside this PC', WHATSAPP_TOKEN: 'Sending WhatsApp messages', WHATSAPP_APP_SECRET: 'Checking that WhatsApp webhooks come from Meta', TWILIO_AUTH_TOKEN: 'Sending SMS, and checking Twilio webhooks' };

interface Identity { id: number; channel: string; handle: string; verified_at: string | null; code: string | null; code_expires: string | null }

interface TS { installed: boolean; state: string | null; signedIn: boolean; https: boolean; address: string | null; serving: boolean; qrSvg: string | null; next: string | null }

/** Tailscale, the private way to reach Onyx from your phone: what is done, what to do next, and the address to open. */
function Tailscale() {
	const { data, error, reload } = useData<TS>('/tailscale');
	const steps = data
		? [
				{ done: data.installed && data.signedIn, text: 'Tailscale installed on this PC, and signed in' },
				{ done: data.https, text: 'MagicDNS and HTTPS Certificates on for your Tailscale account' },
				{ done: data.serving, text: "Onyx shared at this PC's Tailscale address" },
			]
		: [];
	return (
		<Section title="Your phone, through Tailscale" aside={<Button onClick={reload}>Check again</Button>}>
			<p className="mb-3 max-w-2xl text-sm text-muted">Tailscale connects your phone to this PC privately: only devices signed in to your Tailscale account can reach Onyx, and nothing on this PC is open to the internet. Put the Tailscale app on your phone too, signed in to the same account.</p>
			{error && <Problem>{error}</Problem>}
			{!data && !error && <Loading what="Tailscale's status" />}
			{data && (
				<>
					<ol className="border-t">
						{steps.map((s, i) => (
							<li key={s.text} className="flex min-h-11 items-center gap-3 border-b py-2 text-sm">
								<span className="w-5 font-mono text-xs text-muted">{i + 1}</span>
								<span className={`flex-1 ${s.done ? '' : 'text-muted'}`}>{s.text}</span>
								{s.done ? (
									<>
										<Check {...ICON} aria-hidden="true" />
										<span className="sr-only">done</span>
									</>
								) : (
									<span className="font-mono text-xs text-muted">not yet</span>
								)}
							</li>
						))}
					</ol>
					{data.next && (
						<p className="mt-3 max-w-2xl text-sm">
							<span className="text-muted">Next: </span>
							{data.next.split('`').map((part, i) => (i % 2 ? <Code key={i}>{part}</Code> : part))}
						</p>
					)}
					{data.serving && data.address && (
						<div className="mt-4 flex flex-wrap items-start gap-5">
							{data.qrSvg && <img src={`data:image/svg+xml;utf8,${encodeURIComponent(data.qrSvg)}`} alt={`QR code for ${data.address}`} width={148} height={148} className="rounded" />}
							<div className="max-w-md text-sm">
								<p className="text-muted">On your phone, with Tailscale connected, point the camera at the code, or open:</p>
								<a href={data.address} className="mt-1 block break-all font-mono text-sm underline underline-offset-4">{data.address}</a>
								<p className="mt-3 text-muted">Sign in with your Onyx password. Then add it to the Home Screen: on an iPhone, Safari&rsquo;s Share button, then Add to Home Screen; on Android, Chrome&rsquo;s menu, then Install app.</p>
							</div>
						</div>
					)}
				</>
			)}
		</Section>
	);
}

/** Linking a phone number: Onyx shows a code, you text it from that phone, and that proves the phone is yours. */
function Phones() {
	const { data, error, reload } = useData<{ identities: Identity[] }>('/identities');
	const [channel, setChannel] = useState('whatsapp');
	const [handle, setHandle] = useState('');
	const [bad, setBad] = useState<string | null>(null);
	const waiting = (data?.identities ?? []).some((i) => !i.verified_at);
	// While a code is waiting to be texted, look again every few seconds so the row turns to "Linked" by itself.
	useEffect(() => {
		if (!waiting) return;
		const t = setInterval(reload, 4000);
		return () => clearInterval(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [waiting]);
	const link = async () => {
		setBad(null);
		try {
			await api('/identities', { method: 'POST', body: { channel, handle } });
			setHandle('');
			reload();
		} catch (e) {
			setBad((e as Error).message);
		}
	};
	return (
		<Section title="Your phone">
			<p className="mb-3 max-w-2xl text-sm text-muted">Link the number you text from, once for each channel. Onyx gives you a six-digit code; text that code to Onyx from the phone, and the number is yours.</p>
			{error && <Problem>{error}</Problem>}
			{data && !data.identities.length && <p className="border-y py-3 text-sm text-muted">No number linked. Add yours below.</p>}
			<ul className={data?.identities.length ? 'rows border-t' : ''}>
				{(data?.identities ?? []).map((i) => (
					<li key={i.id} className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b py-2">
						<span><span className="font-mono text-sm">{i.handle}</span> <span className="text-xs text-muted">{channelLabel(i.channel)}</span></span>
						<span className="flex items-center gap-3">
							{i.verified_at ? <span className="text-sm text-muted">Linked {fmtTime(i.verified_at)}</span> : <span className="text-sm">Text <span className="font-mono text-base tracking-widest">{i.code}</span> to Onyx on {channelLabel(i.channel)}</span>}
							<button type="button" aria-label={`Remove ${i.handle}`} onClick={() => void api(`/identities/${i.id}`, { method: 'DELETE' }).then(reload)} className="flex h-11 w-11 items-center justify-center text-muted hover:text-bad"><X {...ICON} /></button>
						</span>
					</li>
				))}
			</ul>
			<form className="mt-3 flex flex-wrap gap-2" onSubmit={(e) => (e.preventDefault(), void link())}>
				<label htmlFor="link-channel" className="sr-only">Channel</label>
				<select id="link-channel" value={channel} onChange={(e) => setChannel(e.target.value)} className="text-sm"><option value="whatsapp">WhatsApp</option><option value="sms">SMS</option></select>
				<label htmlFor="link-number" className="sr-only">Phone number</label>
				<input id="link-number" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="+15125550123" inputMode="tel" className="w-48 font-mono text-sm" />
				<Button type="submit" disabled={!handle.trim()}>Get a code</Button>
			</form>
			{bad && <div className="mt-2"><Problem>{bad}</Problem></div>}
		</Section>
	);
}

/** Notifications on this device, for when Onyx starts a message (a reminder, a finished task). */
function Notifications() {
	const { data, reload } = useData<{ public_key: string; devices: number }>('/push');
	const [state, setState] = useState<string | null>(null);
	const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
	const turnOn = async () => {
		try {
			if ((await Notification.requestPermission()) !== 'granted') return setState('Notifications are blocked for this site in the browser. Allow them in the site settings, then try again.');
			const reg = await navigator.serviceWorker.ready;
			const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: data!.public_key }));
			await api('/push', { method: 'POST', body: sub.toJSON() });
			const r = await api<{ sent: number }>('/push/test', { method: 'POST' });
			setState(r.sent ? 'On. A test notification was sent to this device.' : 'Saved, but the test could not be sent. Push needs this PC to be online.');
			reload();
		} catch (e) {
			setState(`Could not turn notifications on: ${(e as Error).message}`);
		}
	};
	return (
		<Section title="Notifications on this device">
			<p className="mb-3 max-w-2xl text-sm text-muted">{supported ? 'When Onyx texts you first, this device shows a notification too. On an iPhone, add Onyx to the Home Screen first: iOS only allows notifications for installed apps.' : 'This browser cannot receive notifications here. They need a secure address (https, through Tailscale or a tunnel) or this PC itself, and on an iPhone, Onyx added to the Home Screen.'}</p>
			<div className="flex flex-wrap items-center gap-3">
				<Button onClick={() => void turnOn()} disabled={!supported || !data}>Turn on for this device</Button>
				<span className="font-mono text-xs text-muted">{data ? `${data.devices} device${data.devices === 1 ? '' : 's'} subscribed` : ''}</span>
			</div>
			{state && <p role="status" className={`mt-2 text-sm ${state.startsWith('Could not') || state.includes('blocked') ? 'text-bad' : 'text-muted'}`}>{state}</p>}
		</Section>
	);
}

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
						<p className="mb-3 max-w-2xl text-sm text-muted">Phone numbers allowed to reach the agents over WhatsApp and SMS, in international form. Everyone else is ignored, without a reply. A number here must also be linked below before Onyx answers it.</p>
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

					<Tailscale />
					<Notifications />
					<Phones />

					<CloudModels />

					<Section title="Keys">
						<p className="mb-3 max-w-2xl text-sm text-muted">Keys live in <Code>.env</Code> on this PC and are never sent to this page: it only knows whether each one is set. The cloud model keys are set in Cloud models, above; to change another, edit <Code>.env</Code> and restart Onyx.</p>
						<ul className="border-t">
							{data.keys.map((k) => (
								<li key={k.name} className="grid min-h-12 grid-cols-[1fr_auto] items-center gap-3 border-b py-2 md:grid-cols-[16rem_1fr_auto]">
									<span className="font-mono text-xs">{k.name}</span>
									<span className="hidden text-sm text-muted md:block">{KEY_USE[k.name]}</span>
									<span className={`font-mono text-xs ${k.set ? 'text-text' : 'text-muted'}`}>{k.set ? '••••••••  set' : 'not set'}</span>
								</li>
							))}
						</ul>
					</Section>

					<Updates />
					<Autostart />
					<Backups />

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

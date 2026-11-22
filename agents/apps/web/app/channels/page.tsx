'use client';
import { useState } from 'react';
import { api, fmtTime, useData } from '@/lib/api';
import { Button, Card, ChannelIcon, Code, Loading, Page, Problem, Section } from '@/components/ui';

interface Ch { id: string; ok: boolean; detail: string; last: { direction: string; text: string; at: string } | null; errors: { error: string; created_at: string }[] }

export default function Channels() {
	const { data, error, reload } = useData<{ channels: Ch[]; preferred: string[]; public_url: string | null }>('/channels');
	const [result, setResult] = useState<Record<string, string>>({});
	const test = async (id: string) => {
		setResult((r) => ({ ...r, [id]: 'Sending' }));
		try {
			await api(`/channels/${id}/test`, { method: 'POST' });
			setResult((r) => ({ ...r, [id]: 'Sent. Check the channel.' }));
		} catch (e) {
			setResult((r) => ({ ...r, [id]: `Failed: ${(e as Error).message}` }));
		}
		reload();
	};
	return (
		<Page title="Channels" note="Where Onyx can be reached and where it can reach you. When it starts a message itself (a reminder, a finished task), it tries your preferred channels in order and ends with the app, so nothing is dropped.">
			{error && <Problem>{error}</Problem>}
			{!data && !error && <Loading what="channels" />}
			{data && (
				<>
					<Card>
					<ul className="rows">
						{data.channels.map((c) => (
							<li key={c.id} className="grid gap-3 border-b py-4 md:grid-cols-[10rem_1fr_auto] md:items-start">
								<div><ChannelIcon channel={c.id} label /><p className={`mt-1 text-sm ${c.ok ? 'text-muted' : 'text-bad'}`}>{c.ok ? 'Ready' : 'Not ready'}</p></div>
								<div className="min-w-0 text-sm">
									<p className="text-muted">{c.detail}</p>
									{c.last ? <p className="mt-2 truncate"><span className="text-muted">Last {c.last.direction === 'in' ? 'received' : 'sent'} {fmtTime(c.last.at)}: </span>{c.last.text}</p> : <p className="mt-2 text-muted">No messages on this channel yet.</p>}
									{c.errors.map((e, i) => <p key={i} className="mt-1 font-mono text-xs text-bad">{fmtTime(e.created_at)} {e.error}</p>)}
								</div>
								<div className="md:text-right">
									<Button onClick={() => void test(c.id)} disabled={!c.ok}>Send a test</Button>
									{result[c.id] && <p role="status" className={`mt-2 text-xs ${result[c.id]!.startsWith('Failed') ? 'text-bad' : 'text-muted'}`}>{result[c.id]}</p>}
								</div>
							</li>
						))}
					</ul>
					</Card>
					<Section title="Order Onyx tries when it texts you first">
						<p className="font-mono text-sm">{data.preferred.join(' → ')}</p>
						<p className="mt-1 text-sm text-muted">Only channels that are set up appear here. Change the order in Settings.</p>
					</Section>
					<Section title="Webhook addresses">
						{data.public_url ? (
							<ul className="space-y-1 font-mono text-xs">
								<li><span className="text-muted">WhatsApp </span>{data.public_url}/webhooks/whatsapp</li>
								<li><span className="text-muted">SMS </span>{data.public_url}/webhooks/sms</li>
							</ul>
						) : (
							<p className="max-w-2xl text-sm text-muted">Meta and Twilio deliver your texts to a public address. Start a tunnel to this PC, put its address in <Code>PUBLIC_URL</Code> in <Code>.env</Code>, and restart Onyx. SETUP_WHATSAPP.md and SETUP_SMS.md walk through it.</p>
						)}
					</Section>
					<Section title="iMessage">
						<p className="max-w-2xl text-sm text-muted">Not available. Apple has no iMessage API; sending and receiving needs a Mac signed in to Messages, kept on. This machine is a PC, so Onyx uses WhatsApp, SMS and this app instead.</p>
					</Section>
				</>
			)}
		</Page>
	);
}

'use client';
import { Globe, MessageCircle, MessageSquareText, Terminal, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Tier } from '@/lib/api';

export const ICON = { size: 18, strokeWidth: 1.5 } as const;

const TIER_STYLE: Record<Tier, string> = {
	lite: 'border border-muted text-muted',
	standard: 'border border-text text-text',
	pro: 'border border-accent bg-accent text-bg',
	max: 'border border-accent bg-accent text-bg',
};
const TIER_LABEL: Record<Tier, string> = { lite: 'LITE', standard: 'STANDARD', pro: 'PRO', max: 'MAX' };

/** A tier, with the real model that backs it in mono beneath or beside. Max carries a second, dashed border that moves only while a Max run is in progress. */
export function TierBadge({ tier, model, active = false, inline = false }: { tier: Tier | null; model?: string | null; active?: boolean; inline?: boolean }) {
	if (!tier) return model ? <span className="font-mono text-xs text-muted">{model}</span> : null;
	return (
		<span className={inline ? 'inline-flex items-center gap-2' : 'inline-flex flex-col items-start gap-1'}>
			<span className={`relative inline-flex h-5 items-center rounded-full px-2 text-xs font-medium tracking-wide ${TIER_STYLE[tier]}`}>
				{TIER_LABEL[tier]}
				{tier === 'max' && (
					<svg aria-hidden className="pointer-events-none absolute -inset-[3px] h-[calc(100%+6px)] w-[calc(100%+6px)]" preserveAspectRatio="none">
						<rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" rx="13" fill="none" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 4" style={active ? { animation: 'dash 1.2s linear infinite' } : undefined} />
					</svg>
				)}
			</span>
			{model && <span className="font-mono text-xs text-muted">{model}</span>}
		</span>
	);
}

const CHANNEL: Record<string, { icon: LucideIcon; label: string }> = { web: { icon: Globe, label: 'Web' }, whatsapp: { icon: MessageCircle, label: 'WhatsApp' }, sms: { icon: MessageSquareText, label: 'SMS' }, terminal: { icon: Terminal, label: 'Terminal' } };
export function ChannelIcon({ channel, label = false }: { channel: string; label?: boolean }) {
	const c = CHANNEL[channel] ?? CHANNEL.web!;
	const Icon = c.icon;
	return (
		<span className="inline-flex items-center gap-1.5 text-muted" title={c.label}>
			<Icon {...ICON} size={15} aria-hidden={label} aria-label={label ? undefined : c.label} />
			{label && <span className="text-sm text-text">{c.label}</span>}
		</span>
	);
}
export const channelLabel = (c: string) => CHANNEL[c]?.label ?? c;

const STATUS_TEXT: Record<string, string> = { running: 'Running', done: 'Done', error: 'Failed', killed: 'Stopped' };
/** A run's state as a word, with a mark that pulses only while it is running. */
export function Status({ status }: { status: string }) {
	return (
		<span className={`inline-flex items-center gap-1.5 text-sm ${status === 'error' ? 'text-bad' : status === 'running' ? 'text-text' : 'text-muted'}`}>
			<span aria-hidden className={`h-1.5 w-1.5 rounded-full ${status === 'error' ? 'bg-bad' : status === 'running' ? 'running bg-accent' : status === 'done' ? 'bg-muted' : 'border border-muted'}`} />
			{STATUS_TEXT[status] ?? status}
		</span>
	);
}

export function Button({ children, onClick, kind = 'plain', disabled, type = 'button', label }: { children: ReactNode; onClick?: () => void; kind?: 'primary' | 'plain' | 'danger'; disabled?: boolean; type?: 'button' | 'submit'; label?: string }) {
	const style = kind === 'primary' ? 'bg-accent text-bg hover:opacity-85' : kind === 'danger' ? 'border text-bad hover:border-bad' : 'border text-text hover:border-muted';
	return (
		<button type={type} onClick={onClick} disabled={disabled} aria-label={label} className={`inline-flex min-h-9 items-center justify-center gap-2 rounded px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${style}`}>
			{children}
		</button>
	);
}

export function Page({ title, note, actions, children }: { title: string; note?: ReactNode; actions?: ReactNode; children: ReactNode }) {
	return (
		<div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:px-8 md:pt-10">
			<header className="mb-6 flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">{title}</h1>
					{note && <p className="mt-1 max-w-2xl text-sm text-muted">{note}</p>}
				</div>
				{actions && <div className="flex gap-2">{actions}</div>}
			</header>
			{children}
		</div>
	);
}

/** Nothing to show yet: why, and the one thing to do about it. */
export function Empty({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="border-y py-10">
			<p className="font-medium">{title}</p>
			<p className="mt-1 max-w-xl text-sm text-muted">{children}</p>
		</div>
	);
}
export function Problem({ children }: { children: ReactNode }) {
	return <p role="alert" className="border-l-2 border-bad py-1 pl-3 text-sm text-bad">{children}</p>;
}
export function Loading({ what }: { what: string }) {
	return <p className="thinking py-6 text-sm">Loading {what}</p>;
}
export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
	return (
		<section className="mt-10 first:mt-0">
			<div className="mb-3 flex items-baseline justify-between gap-3">
				<h2 className="text-sm font-medium text-muted">{title}</h2>
				{aside}
			</div>
			{children}
		</section>
	);
}
export function Code({ children }: { children: ReactNode }) {
	return <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">{children}</code>;
}

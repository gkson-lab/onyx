'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Activity, Bot, Cable, Cpu, Gauge, History, Menu, MessagesSquare, Network, Radio, Settings, X, type LucideIcon } from 'lucide-react';
import { useLive } from '@/lib/api';
import { ICON } from './ui';

// The destinations, grouped by what you do there. Every one of them exists.
const GROUPS: { label: string; items: { href: string; label: string; icon: LucideIcon }[] }[] = [
	{ label: 'Talk', items: [{ href: '/', label: 'Chat', icon: MessagesSquare }, { href: '/graph', label: 'Agent graph', icon: Network }] },
	{ label: 'Work', items: [{ href: '/runs', label: 'Runs', icon: History }, { href: '/agents', label: 'Agents', icon: Bot }] },
	{ label: 'System', items: [{ href: '/channels', label: 'Channels', icon: Radio }, { href: '/connectors', label: 'Connectors', icon: Cable }, { href: '/models', label: 'Models', icon: Cpu }, { href: '/usage', label: 'Usage', icon: Gauge }, { href: '/settings', label: 'Settings', icon: Settings }] },
];
const ALL = GROUPS.flatMap((g) => g.items);
const BOTTOM = ['/', '/graph', '/runs', '/agents'];
const isCurrent = (path: string, href: string) => (href === '/' ? path === '/' : path.replace(/\/$/, '').startsWith(href));

export function Mark() {
	return (
		<span className="flex items-center gap-2">
			{/* The mark: a pentagon-cut onyx seen from above, five facets (the specialists) round a lit table (Onyx Core).
			    One colour, the facets at five strengths, like everything else here. Drawn by tools/brand.py. */}
			<svg width="20" height="20" viewBox="0 0 100 100" fill="var(--text)" aria-hidden>
				<path d="M52.02,8.97 92.68,38.51 78.15,43.95 51.33,24.47Z" fillOpacity={0.92} />
				<path d="M93.93,42.35 78.40,90.15 68.73,78.01 78.97,46.49Z" fillOpacity={0.5} />
				<path d="M75.13,92.52 24.87,92.52 33.43,79.58 66.57,79.58Z" fillOpacity={0.32} />
				<path d="M21.60,90.15 6.07,42.35 21.03,46.49 31.27,78.01Z" fillOpacity={0.26} />
				<path d="M7.32,38.51 47.98,8.97 48.67,24.47 21.85,43.95Z" fillOpacity={0.66} />
				<path d="M50.00,36.50 67.12,48.94 60.58,69.06 39.42,69.06 32.88,48.94Z" />
			</svg>
			<span className="font-semibold tracking-tight">Onyx</span>
			<span className="text-xs text-muted">by GK Labs</span>
		</span>
	);
}

export function Shell({ children }: { children: React.ReactNode }) {
	const path = usePathname() ?? '/';
	const { live } = useLive();
	const [sheet, setSheet] = useState(false);
	const trigger = useRef<HTMLButtonElement>(null);
	const running = Object.values(live.nodes).filter((n) => n.status === 'running').length;
	useEffect(() => {
		setSheet(false);
	}, [path]);
	useEffect(() => {
		if (!sheet) return;
		const key = (e: KeyboardEvent) => e.key === 'Escape' && (setSheet(false), trigger.current?.focus());
		window.addEventListener('keydown', key);
		return () => window.removeEventListener('keydown', key);
	}, [sheet]);

	useEffect(() => {
		if ('serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js').catch(() => {});
	}, []);
	if (path.startsWith('/login')) return <main className="h-full">{children}</main>;

	const row = (i: (typeof ALL)[number], big = false) => {
		const on = isCurrent(path, i.href);
		const Icon = i.icon;
		return (
			<Link key={i.href} href={i.href} aria-current={on ? 'page' : undefined} className={`flex items-center gap-3 rounded px-3 ${big ? 'min-h-12' : 'min-h-9'} text-sm ${on ? 'bg-surface font-medium text-text' : 'text-muted hover:bg-surface hover:text-text'}`}>
				<Icon {...ICON} aria-hidden />
				{i.label}
				{i.href === '/graph' && running > 0 && <span className="ml-auto font-mono text-xs text-text">{running}</span>}
			</Link>
		);
	};

	return (
		<div className="flex h-full">
			<nav aria-label="Main" className="hidden w-56 shrink-0 flex-col border-r px-3 py-5 md:flex">
				<Link href="/" className="mb-6 px-3"><Mark /></Link>
				{GROUPS.map((g) => (
					<div key={g.label} className="mb-5">
						<p className="mb-1 px-3 text-xs text-muted">{g.label}</p>
						{g.items.map((i) => row(i))}
					</div>
				))}
				<p className="mt-auto flex items-center gap-2 px-3 text-xs text-muted" role="status">
					<Activity {...ICON} size={14} aria-hidden />
					{live.connected ? (running ? `${running} agent${running === 1 ? '' : 's'} running` : 'Connected') : 'Server not connected'}
				</p>
			</nav>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="flex items-center justify-between border-b px-4 py-3 md:hidden" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
					<Mark />
					{!live.connected && <span className="text-xs text-bad">Server not connected</span>}
				</header>
				{(live.updating || live.updated) && (
					<div role="status" className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b bg-surface px-4 py-2 text-sm">
						{live.updated ? (
							<>
								<span>Onyx was updated to <span className="font-mono text-xs">{live.updated.slice(0, 7)}</span>. Reload to use the new version.</span>
								<button type="button" onClick={() => window.location.reload()} className="min-h-9 rounded bg-accent px-3 text-sm font-medium text-bg hover:opacity-85">Reload</button>
							</>
						) : (
							<span className="thinking">Onyx is updating to <span className="font-mono text-xs">{live.updating!.to.slice(0, 7)}</span>{live.updating!.message ? `: ${live.updating!.message}` : ''}. It is back in a minute or two.</span>
						)}
					</div>
				)}
				<main className="min-h-0 flex-1 overflow-y-auto"><div key={path} className="enter h-full">{children}</div></main>
				<nav aria-label="Main" className="grid grid-cols-5 border-t md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
					{ALL.filter((i) => BOTTOM.includes(i.href)).map((i) => {
						const on = isCurrent(path, i.href);
						const Icon = i.icon;
						return (
							<Link key={i.href} href={i.href} aria-current={on ? 'page' : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs ${on ? 'font-medium text-text' : 'text-muted'}`}>
								<Icon {...ICON} size={20} aria-hidden />
								<span className={on ? 'border-b border-accent' : 'border-b border-transparent'}>{i.label.replace('Agent graph', 'Graph')}</span>
							</Link>
						);
					})}
					<button ref={trigger} type="button" aria-expanded={sheet} aria-controls="more-sheet" onClick={() => setSheet((s) => !s)} className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs ${!BOTTOM.some((h) => isCurrent(path, h)) ? 'font-medium text-text' : 'text-muted'}`}>
						<Menu {...ICON} size={20} aria-hidden />
						<span className={!BOTTOM.some((h) => isCurrent(path, h)) ? 'border-b border-accent' : 'border-b border-transparent'}>More</span>
					</button>
				</nav>
			</div>

			{sheet && (
				<div id="more-sheet" role="dialog" aria-modal="true" aria-label="More" className="fade fixed inset-0 z-20 flex flex-col justify-end bg-bg/80 md:hidden" onClick={() => setSheet(false)}>
					<div className="sheet border-t bg-bg px-3 pt-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
						<div className="mb-1 flex items-center justify-between px-3">
							<p className="text-xs text-muted">System</p>
							<button type="button" aria-label="Close" onClick={() => (setSheet(false), trigger.current?.focus())} className="flex h-11 w-11 items-center justify-center text-muted"><X {...ICON} /></button>
						</div>
						{GROUPS[2]!.items.map((i) => row(i, true))}
					</div>
				</div>
			)}
		</div>
	);
}

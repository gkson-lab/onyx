'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Activity, Bot, Cable, Cpu, Gauge, History, Menu, MessagesSquare, Network, Radio, Settings, X, type LucideIcon } from 'lucide-react';
import { Glass, TabBar } from 'glisse';
import { useLive } from '@/lib/api';
import { Backdrop } from './backdrop';
import { LiquidBorder } from './liquid-border';
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

// The mark's shape, as a mask over the chrome.
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M52.02,8.97 92.68,38.51 78.15,43.95 51.33,24.47Z" fill-opacity=".92"/><path d="M93.93,42.35 78.40,90.15 68.73,78.01 78.97,46.49Z" fill-opacity=".5"/><path d="M75.13,92.52 24.87,92.52 33.43,79.58 66.57,79.58Z" fill-opacity=".32"/><path d="M21.60,90.15 6.07,42.35 21.03,46.49 31.27,78.01Z" fill-opacity=".26"/><path d="M7.32,38.51 47.98,8.97 48.67,24.47 21.85,43.95Z" fill-opacity=".66"/><path d="M50.00,36.50 67.12,48.94 60.58,69.06 39.42,69.06 32.88,48.94Z"/></svg>`;
const MARK_URL = `url("data:image/svg+xml,${encodeURIComponent(MARK_SVG)}")`;
const MARK = { WebkitMaskImage: MARK_URL, maskImage: MARK_URL } as const;

export function Mark() {
	return (
		<span className="flex items-center gap-2">
			{/* The mark: a pentagon-cut onyx seen from above, five facets (the specialists) round a lit table (Onyx Core),
			    the facets at five strengths. Drawn by tools/brand.py; here it's cut out of chromatic chrome, which turns
			    while Onyx is answering (see globals.css). */}
			<span className="mark" style={MARK} aria-hidden />
			<span className="font-semibold tracking-tight">Onyx</span>
			<span className="text-xs text-muted">by GK Labs</span>
		</span>
	);
}

/**
 * The sidebar's selection: a lens of lighter glass behind the current item, which springs from one item to the next
 * as you move between screens rather than jumping. It measures the item it sits behind, so it fits any label.
 */
function useLens(path: string) {
	const box = useRef<HTMLDivElement>(null);
	const [lens, setLens] = useState<{ top: number; height: number } | null>(null);
	useLayoutEffect(() => {
		const place = () => {
			const on = box.current?.querySelector<HTMLElement>('a[aria-current="page"]');
			setLens(on ? { top: on.offsetTop, height: on.offsetHeight } : null);
		};
		place();
		window.addEventListener('resize', place);
		return () => window.removeEventListener('resize', place);
	}, [path]);
	return { box, lens };
}

export function Shell({ children }: { children: React.ReactNode }) {
	const path = usePathname() ?? '/';
	const { live } = useLive();
	const [sheet, setSheet] = useState(false);
	const trigger = useRef<HTMLDivElement>(null);
	const running = Object.values(live.nodes).filter((n) => n.status === 'running').length;
	const { box, lens } = useLens(path);
	useEffect(() => {
		setSheet(false);
	}, [path]);
	useEffect(() => {
		if (!sheet) return;
		const key = (e: KeyboardEvent) => e.key === 'Escape' && (setSheet(false), trigger.current?.querySelector<HTMLElement>('[data-value="more"], button:last-child')?.focus());
		window.addEventListener('keydown', key);
		return () => window.removeEventListener('keydown', key);
	}, [sheet]);

	useEffect(() => {
		if ('serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js').catch(() => {});
	}, []);
	if (path.startsWith('/login')) return <main className="h-full"><Backdrop />{children}<LiquidBorder /></main>;

	const row = (i: (typeof ALL)[number], big = false) => {
		const on = isCurrent(path, i.href);
		const Icon = i.icon;
		return (
			<Link key={i.href} href={i.href} aria-current={on ? 'page' : undefined} className={`nav-item relative z-10 flex items-center gap-3 rounded-[12px] px-3 ${big ? 'min-h-12' : 'min-h-9'} text-sm ${on ? 'font-medium text-text' : 'text-muted hover:text-text'}`}>
				<Icon {...ICON} aria-hidden />
				{i.label}
				{i.href === '/graph' && running > 0 && <span className="ml-auto font-mono text-xs text-text">{running}</span>}
			</Link>
		);
	};
	const more = !BOTTOM.some((h) => isCurrent(path, h));
	const tab = more ? 'more' : BOTTOM.find((h) => isCurrent(path, h)) ?? '/';

	return (
		<div className="app-frame flex h-full">
			<Backdrop />
			<LiquidBorder />
			<nav aria-label="Main" className="hidden w-60 shrink-0 pr-3 md:flex">
				<Glass data-glass="slab" className="glass-panel flex w-full flex-col px-3 py-5">
					<Link href="/" className="mb-6 px-3"><Mark /></Link>
					<div ref={box} className="relative">
						{lens && <span aria-hidden className="nav-lens" style={{ transform: `translateY(${lens.top}px)`, height: lens.height }} />}
						{GROUPS.map((g) => (
							<div key={g.label} className="mb-5">
								<p className="mb-1 px-3 text-xs text-muted">{g.label}</p>
								{g.items.map((i) => row(i))}
							</div>
						))}
					</div>
					<p className="mt-auto flex items-center gap-2 px-3 text-xs text-muted" role="status">
						<Activity {...ICON} size={14} aria-hidden className={running ? 'running' : undefined} />
						{live.connected ? (running ? `${running} agent${running === 1 ? '' : 's'} running` : 'Connected') : 'Server not connected'}
					</p>
				</Glass>
			</nav>

			{/* The main pane: a slab of glass, as the sidebar is; the two melt together across the gap between them. */}
			<div data-glass="slab" className="glass-slab flex min-w-0 flex-1 flex-col">
				<header className="px-3 pt-2.5 md:hidden">
					<Glass className="flex min-h-12 items-center justify-between rounded-full px-4">
						<Mark />
						{!live.connected && <span className="text-xs text-bad">Server not connected</span>}
					</Glass>
				</header>
				{(live.updating || live.updated) && (
					<div className="px-3 pt-3 md:px-6">
						<Glass data-glass="rim" role="status" className="enter flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-[18px] px-4 py-2 text-sm">
							{live.updated ? (
								<>
									<span>Onyx was updated to <span className="font-mono text-xs">{live.updated.slice(0, 7)}</span>. Reload to use the new version.</span>
									<button type="button" onClick={() => window.location.reload()} className="min-h-9 rounded-full bg-accent px-4 text-sm font-medium text-bg hover:opacity-85">Reload</button>
								</>
							) : (
								<span className="thinking">Onyx is updating to <span className="font-mono text-xs">{live.updating!.to.slice(0, 7)}</span>{live.updating!.message ? `: ${live.updating!.message}` : ''}. It is back in a minute or two.</span>
							)}
						</Glass>
					</div>
				)}
				<main data-glass-scroll className="min-h-0 flex-1 overflow-y-auto"><div key={path} className="enter h-full">{children}</div></main>
				{/* On a phone: a tab bar of liquid glass, as on iOS 26. Its selection springs between tabs and follows a drag. */}
				<nav ref={trigger} aria-label="Main" className="flex justify-center px-3 pb-2.5 pt-1 md:hidden">
					<TabBar
						className="tabs"
						aria-label="Main"
						link={Link}
						value={tab}
						onValueChange={(v) => v === 'more' && setSheet(true)}
						items={[
							...ALL.filter((i) => BOTTOM.includes(i.href)).map((i) => {
								const Icon = i.icon;
								return { value: i.href, href: i.href, label: i.label.replace('Agent graph', 'Graph'), icon: <Icon {...ICON} size={22} aria-hidden /> };
							}),
							{ value: 'more', label: 'More', icon: <Menu {...ICON} size={22} aria-hidden /> },
						]}
					/>
				</nav>
			</div>

			{sheet && (
				<div id="more-sheet" role="dialog" aria-modal="true" aria-label="More" className="fade fixed inset-0 z-20 flex flex-col justify-end scrim px-3 md:hidden" onClick={() => setSheet(false)} style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
					<Glass data-glass="rim" className="sheet glass-panel px-3 pb-3 pt-3" onClick={(e) => e.stopPropagation()}>
						<div className="mb-1 flex items-center justify-between px-3">
							<p className="text-xs text-muted">System</p>
							<button type="button" aria-label="Close" onClick={() => setSheet(false)} className="flex h-11 w-11 items-center justify-center text-muted"><X {...ICON} /></button>
						</div>
						{GROUPS[2]!.items.map((i) => row(i, true))}
					</Glass>
				</div>
			)}
		</div>
	);
}

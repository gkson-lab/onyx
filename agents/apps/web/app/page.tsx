'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, Download, MessageSquarePlus, Paperclip, Pencil, Pin, PinOff, Search, Smartphone, Square, Trash2, X, PanelLeft } from 'lucide-react';
import { api, nodesFrom, useData, useLive, fmtTime, type RunNode } from '@/lib/api';
import { Activity, treeOf } from '@/components/run';
import { ChannelIcon, Empty, ICON, Problem } from '@/components/ui';
import { CopyButton, MessageText } from '@/components/message';

interface Msg { id: number; direction: 'in' | 'out'; text: string; run_id: string | null; channel: string; status: string; created_at: string }
interface Conv { id: number; title: string; pinned: boolean; updated_at: string; match: string | null }
interface File64 { name: string; type: string; data: string; size: number }
const TIERS = [['auto', 'Auto'], ['lite', 'Lite'], ['standard', 'Standard'], ['pro', 'Pro'], ['max', 'Max']] as const;
type Pick = (typeof TIERS)[number][0];
const MAX_FILE = 10 * 1024 * 1024;
const store = { get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private window */ } } };
const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** The activity under a stored reply: loaded from the run log the first time it is shown. */
function Stored({ runId }: { runId: string }) {
	const { live, dispatch } = useLive();
	const have = Object.values(live.nodes).some((n) => n.rootId === runId);
	useEffect(() => {
		if (have) return;
		api(`/runs/${runId}`).then((r) => dispatch({ type: '_load', nodes: nodesFrom(r), routing: r.runs[0]?.routing }), () => {});
	}, [runId, have, dispatch]);
	const tree = treeOf(live.nodes, runId);
	return tree.length ? <Activity tree={tree} routing={live.routing[runId]} /> : null;
}

const readFile = (f: File) => new Promise<File64>((done, fail) => {
	const r = new FileReader();
	r.onload = () => done({ name: f.name, type: f.type, size: f.size, data: String(r.result).replace(/^data:[^,]*,/, '') });
	r.onerror = () => fail(r.error);
	r.readAsDataURL(f);
});

/** The list of chats: new, search, pinned first. Id 0 is "Phone and reminders", the messages that belong to no chat. */
function Chats({ current, choose, fresh, searchRef, version }: { current: number | null; choose: (id: number) => void; fresh: () => void; searchRef: React.RefObject<HTMLInputElement | null>; version: number }) {
	const [q, setQ] = useState('');
	const [query, setQuery] = useState('');
	useEffect(() => {
		const t = setTimeout(() => setQuery(q), 250);
		return () => clearTimeout(t);
	}, [q]);
	const { data, error } = useData<{ conversations: Conv[]; other: { updated_at: string } | null }>(`/conversations?q=${encodeURIComponent(query)}`, [version]);
	const item = (id: number, title: string, sub: string | null, pinned = false, icon?: React.ReactNode) => (
		<li key={id}>
			<button type="button" onClick={() => choose(id)} aria-current={current === id ? 'true' : undefined} className={`flex w-full min-h-11 items-start gap-2 rounded px-3 py-2 text-left text-sm ${current === id ? 'bg-surface font-medium' : 'text-muted hover:bg-surface hover:text-text'}`}>
				{icon}
				<span className="min-w-0 flex-1">
					<span className="block truncate">{title}</span>
					{sub && <span className="block truncate text-xs font-normal text-muted">{sub}</span>}
				</span>
				{pinned && <Pin {...ICON} size={13} className="mt-1 shrink-0" aria-label="pinned" />}
			</button>
		</li>
	);
	return (
		<div className="flex h-full flex-col">
			<button type="button" onClick={fresh} className="mb-3 flex min-h-10 items-center gap-2 rounded border px-3 text-sm hover:border-muted">
				<MessageSquarePlus {...ICON} size={16} aria-hidden /> New chat
				<kbd className="ml-auto font-mono text-[10px] text-muted">{isMac() ? '⌘⇧O' : 'Ctrl+Shift+O'}</kbd>
			</button>
			<label className="relative mb-2 block">
				<span className="sr-only">Search chats</span>
				<Search {...ICON} size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
				<input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setQ('')} placeholder={`Search  ${isMac() ? '⌘K' : 'Ctrl+K'}`} className="w-full pl-8 text-sm" />
			</label>
			{error && <Problem>{error}</Problem>}
			<ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
				{data?.conversations.map((c) => item(c.id, c.title, c.match ?? fmtTime(c.updated_at), c.pinned))}
				{data?.other && !query && item(0, 'Phone and reminders', fmtTime(data.other.updated_at), false, <Smartphone {...ICON} size={15} className="mt-0.5 shrink-0" aria-hidden />)}
				{data && !data.conversations.length && query && <li className="px-3 py-2 text-sm text-muted">No chat mentions “{query}”.</li>}
			</ul>
		</div>
	);
}

export default function Chat() {
	const { live } = useLive();
	const [conv, setConv] = useState<number | null>(null);
	const [version, setVersion] = useState(0);
	const [panel, setPanel] = useState(false);
	const { data, error, reload } = useData<{ messages: Msg[] }>(conv === null ? null : `/messages?conversation=${conv}`);
	const meta = useData<{ conversations: Conv[] }>('/conversations', [version]);
	const warm = useData<{ ready: boolean; models: Record<string, string> }>('/warmup');
	const [text, setText] = useState('');
	const [tier, setTier] = useState<Pick>('auto');
	const [files, setFiles] = useState<File64[]>([]);
	const [pending, setPending] = useState<{ runId: string; text: string; files: number; conv: number } | null>(null);
	const [sendError, setSendError] = useState<string | null>(null);
	const [renaming, setRenaming] = useState<string | null>(null);
	const end = useRef<HTMLDivElement>(null);
	const input = useRef<HTMLTextAreaElement>(null);
	const search = useRef<HTMLInputElement>(null);
	const picker = useRef<HTMLInputElement>(null);
	const messages = conv === null ? [] : data?.messages ?? [];
	const current = meta.data?.conversations.find((c) => c.id === conv) ?? null;
	const mine = pending && pending.conv === conv ? pending : null;
	const tree: RunNode[] = mine ? treeOf(live.nodes, mine.runId) : [];
	const root = tree[0];
	const streamed = mine ? live.text[mine.runId] ?? '' : '';

	// Start in the chat used last, or the newest.
	useEffect(() => {
		if (conv !== null || !meta.data) return;
		const saved = store.get('onyx.chat');
		const last = saved === null ? NaN : Number(saved);
		setConv(meta.data.conversations.some((c) => c.id === last) || last === 0 ? last : meta.data.conversations[0]?.id ?? -1);
		const t = store.get('onyx.tier') as Pick | null;
		if (t && TIERS.some(([k]) => k === t)) setTier(t);
	}, [meta.data, conv]);
	useEffect(() => {
		if (conv !== null && conv >= 0) store.set('onyx.chat', String(conv));
	}, [conv]);
	useEffect(() => store.set('onyx.tier', tier), [tier]);
	// Until the models are loaded, ask again every two seconds.
	useEffect(() => {
		if (!warm.data || warm.data.ready) return;
		const t = setTimeout(warm.reload, 2000);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [warm.data]);

	// When the run ends, the stored messages are the record. The reply is stored a moment after the run's last
	// event, so keep asking until it is there, then drop the in-flight copy.
	const finished = !!mine && !!root && root.status !== 'running';
	const stored = !!mine && messages.some((m) => m.run_id === mine.runId && m.direction === 'out');
	useEffect(() => {
		if (!finished) return;
		reload();
		const t = setInterval(reload, 400);
		return () => clearInterval(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [finished]);
	useEffect(() => {
		if (stored) (setPending(null), setVersion((v) => v + 1));
	}, [stored]);
	useEffect(() => {
		end.current?.scrollIntoView({ block: 'end' });
	}, [messages.length, streamed, tree.length, conv]);
	useEffect(() => {
		if (live.inbox.length) (reload(), setVersion((v) => v + 1));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [live.inbox.length]);

	const choose = (id: number) => (setConv(id), setPanel(false), setRenaming(null), setSendError(null));
	const fresh = useCallback(async () => {
		// An empty chat is reused rather than piling up.
		const empty = meta.data?.conversations.find((c) => c.title === 'New chat');
		const id = empty?.id ?? (await api<{ id: number }>('/conversations', { method: 'POST' })).id;
		setVersion((v) => v + 1);
		choose(id);
		setTimeout(() => input.current?.focus(), 50);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [meta.data]);
	const stop = useCallback(() => {
		if (pending) void api(`/runs/${pending.runId}/kill`, { method: 'POST' }).catch(() => {});
	}, [pending]);

	// Keyboard: Ctrl/Cmd+K search, Ctrl/Cmd+Shift+O new chat, Esc stop, / to type.
	useEffect(() => {
		const key = (e: KeyboardEvent) => {
			const mod = e.metaKey || e.ctrlKey;
			const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
			if (mod && e.key.toLowerCase() === 'k') (e.preventDefault(), setPanel(true), setTimeout(() => search.current?.focus(), 30));
			else if (mod && e.shiftKey && e.key.toLowerCase() === 'o') (e.preventDefault(), void fresh());
			else if (e.key === 'Escape' && pending && !typing) (e.preventDefault(), stop());
			else if (e.key === '/' && !typing && !mod) (e.preventDefault(), input.current?.focus());
		};
		window.addEventListener('keydown', key);
		return () => window.removeEventListener('keydown', key);
	}, [fresh, stop, pending]);

	const attach = async (list: FileList | null) => {
		setSendError(null);
		const add: File64[] = [];
		for (const f of Array.from(list ?? [])) {
			if (f.size > MAX_FILE) setSendError(`${f.name} is over 10 MB.`);
			else add.push(await readFile(f));
		}
		setFiles((x) => [...x, ...add].slice(0, 5));
		if (picker.current) picker.current.value = '';
	};

	const send = async () => {
		const t = text.trim();
		if ((!t && !files.length) || pending) return;
		setSendError(null);
		let id = conv;
		if (id === null || id < 0 || id === 0) {
			id = (await api<{ id: number }>('/conversations', { method: 'POST' })).id;
			setConv(id);
		}
		const sent = files;
		setText('');
		setFiles([]);
		try {
			const { runId } = await api<{ runId: string }>('/chat', { method: 'POST', body: { text: t, tier, conversation_id: id, attachments: sent.map(({ name, type, data }) => ({ name, type, data })) } });
			setPending({ runId, text: t + (sent.length ? `\n\n📎 ${sent.map((f) => f.name).join(', ')}` : ''), files: sent.length, conv: id });
			setTimeout(() => setVersion((v) => v + 1), 300);
		} catch (e) {
			setText(t);
			setFiles(sent);
			setSendError((e as Error).message);
		}
	};

	const rename = async (title: string) => {
		setRenaming(null);
		if (current && title.trim() && title.trim() !== current.title) await api(`/conversations/${current.id}`, { method: 'PATCH', body: { title: title.trim() } });
		setVersion((v) => v + 1);
	};
	const remove = async () => {
		if (!current || !window.confirm(`Delete “${current.title}” and its messages?`)) return;
		await api(`/conversations/${current.id}`, { method: 'DELETE' });
		setConv(-1);
		setVersion((v) => v + 1);
	};

	const waiting = !warm.data?.ready && warm.data && Object.keys(warm.data.models).length > 0;
	const label = !mine ? '' : tree.length > 1 ? `${tree.filter((n) => n.status === 'running' && n.parentId).map((n) => n.name).join(', ') || 'Core'} working` : live.routing[mine.runId] ? 'Thinking' : mine.files ? 'Reading the attached files' : waiting ? 'Loading models into the graphics card (the first message after starting)' : 'Choosing a model';
	const iconBtn = 'flex h-9 w-9 items-center justify-center rounded text-muted hover:text-text';

	return (
		<div className="flex h-full">
			<aside className="hidden w-64 shrink-0 border-r p-3 lg:block">
				<Chats current={conv} choose={choose} fresh={() => void fresh()} searchRef={search} version={version} />
			</aside>
			{panel && (
				<div role="dialog" aria-modal="true" aria-label="Chats" className="fade fixed inset-0 z-30 flex bg-bg/80 lg:hidden" onClick={() => setPanel(false)}>
					<div className="h-full w-80 max-w-[85vw] border-r bg-bg p-3" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }} onClick={(e) => e.stopPropagation()}>
						<Chats current={conv} choose={choose} fresh={() => void fresh()} searchRef={search} version={version} />
					</div>
				</div>
			)}

			<div className="mx-auto flex h-full w-full min-w-0 max-w-3xl flex-col px-4 md:px-8">
				<div className="flex min-h-12 items-center gap-1 border-b">
					<button type="button" onClick={() => setPanel(true)} aria-label="Chats" className={`${iconBtn} lg:hidden`}><PanelLeft {...ICON} aria-hidden /></button>
					{renaming !== null && current ? (
						<form className="flex-1" onSubmit={(e) => (e.preventDefault(), void rename(renaming))}>
							<label htmlFor="rename" className="sr-only">Chat name</label>
							<input id="rename" autoFocus value={renaming} onChange={(e) => setRenaming(e.target.value)} onBlur={() => void rename(renaming)} onKeyDown={(e) => e.key === 'Escape' && setRenaming(null)} className="w-full text-sm" />
						</form>
					) : (
						<h1 className="min-w-0 flex-1 truncate text-sm font-medium">{conv === 0 ? 'Phone and reminders' : current?.title ?? 'New chat'}</h1>
					)}
					{current && renaming === null && (
						<>
							<button type="button" onClick={() => setRenaming(current.title)} aria-label="Rename" title="Rename" className={iconBtn}><Pencil {...ICON} size={16} aria-hidden /></button>
							<button type="button" onClick={() => void api(`/conversations/${current.id}`, { method: 'PATCH', body: { pinned: !current.pinned } }).then(() => setVersion((v) => v + 1))} aria-label={current.pinned ? 'Unpin' : 'Pin'} title={current.pinned ? 'Unpin' : 'Pin'} className={iconBtn}>{current.pinned ? <PinOff {...ICON} size={16} aria-hidden /> : <Pin {...ICON} size={16} aria-hidden />}</button>
						</>
					)}
					{conv !== null && conv >= 0 && messages.length > 0 && <a href={`/api/conversations/${conv}/export`} download aria-label="Export as Markdown" title="Export as Markdown" className={iconBtn}><Download {...ICON} size={16} aria-hidden /></a>}
					{current && <button type="button" onClick={() => void remove()} aria-label="Delete chat" title="Delete chat" className={`${iconBtn} hover:text-bad`}><Trash2 {...ICON} size={16} aria-hidden /></button>}
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto py-6" aria-live="polite">
					{error && <Problem>{error}</Problem>}
					{!error && (data || conv === -1) && !messages.length && !mine && (
						<Empty title={conv === 0 ? 'Nothing from your phone yet.' : 'A new chat.'}>
							Onyx Core answers quick things itself and hands the rest to its agents. Pick a model below, or leave it on Auto. Attach text, code, PDFs or images with the paperclip.<span className="hidden md:inline"> Keys: {isMac() ? '⌘K' : 'Ctrl+K'} search, {isMac() ? '⌘⇧O' : 'Ctrl+Shift+O'} new chat, / to type, Esc to stop.</span>
						</Empty>
					)}
					<ol className="space-y-6">
						{messages.map((m) => (
							<li key={m.id} className={`group ${Date.now() - Date.parse(m.created_at) < 4000 ? 'enter' : ''}`}>
								<div className="mb-1 flex items-center gap-2 text-xs text-muted">
									{m.direction === 'in' ? 'You' : 'Onyx'}
									{m.channel !== 'web' && <ChannelIcon channel={m.channel} />}
									<time dateTime={m.created_at}>{fmtTime(m.created_at)}</time>
									{m.direction === 'out' && <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"><CopyButton text={m.text} label="Copy the answer" /></span>}
								</div>
								<MessageText text={m.direction === 'in' ? m.text.replace(/^\/(lite|standard|pro|max|think)\s*/i, '') : m.text} className={`${m.direction === 'in' ? 'text-muted' : ''} ${m.status === 'error' ? 'text-bad' : ''}`} />
								{m.direction === 'out' && m.run_id && <Stored runId={m.run_id} />}
							</li>
						))}
						{mine && (
							<>
								{!messages.some((m) => m.run_id === mine.runId && m.direction === 'in') && <li><p className="mb-1 text-xs text-muted">You</p><p className="whitespace-pre-wrap text-muted">{mine.text}</p></li>}
								<li className="enter">
									<p className="mb-1 text-xs text-muted">Onyx</p>
									{streamed ? <MessageText text={streamed} /> : <p className="thinking">{label}</p>}
									<Activity tree={tree} routing={live.routing[mine.runId]} live />
								</li>
							</>
						)}
					</ol>
					<div ref={end} />
				</div>

				<form onSubmit={(e) => (e.preventDefault(), void send())} className="border-t py-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
					onDragOver={(e) => e.preventDefault()} onDrop={(e) => (e.preventDefault(), void attach(e.dataTransfer.files))}>
					{sendError && <div className="mb-2"><Problem>{sendError}</Problem></div>}
					{waiting && !mine && <p role="status" className="thinking mb-2 text-xs">Loading {Object.keys(warm.data!.models).join(' and ')} into the graphics card</p>}
					{files.length > 0 && (
						<ul className="mb-2 flex flex-wrap gap-2">
							{files.map((f, i) => (
								<li key={i} className="flex items-center gap-1 rounded border py-0.5 pl-2 text-xs">
									<span className="max-w-48 truncate">{f.name}</span>
									<span className="font-mono text-muted">{f.size < 1e6 ? `${Math.ceil(f.size / 1024)} KB` : `${(f.size / 1e6).toFixed(1)} MB`}</span>
									<button type="button" onClick={() => setFiles((x) => x.filter((_, k) => k !== i))} aria-label={`Remove ${f.name}`} className="flex h-6 w-6 items-center justify-center text-muted hover:text-bad"><X {...ICON} size={13} aria-hidden /></button>
								</li>
							))}
						</ul>
					)}
					<div className="flex items-end gap-2">
						<input ref={picker} type="file" multiple hidden accept="image/*,application/pdf,text/*,.md,.csv,.json,.yaml,.yml,.py,.js,.ts,.tsx,.jsx,.go,.rs,.java,.c,.cpp,.cs,.sh,.ps1,.sql,.html,.css" onChange={(e) => void attach(e.target.files)} />
						<button type="button" onClick={() => picker.current?.click()} disabled={files.length >= 5} aria-label="Attach files" title="Attach text, code, PDFs or images" className="flex h-11 w-9 shrink-0 items-center justify-center text-muted hover:text-text disabled:opacity-30"><Paperclip {...ICON} aria-hidden /></button>
						<label htmlFor="message" className="sr-only">Message to Onyx</label>
						<textarea ref={input} id="message" rows={1} value={text} onChange={(e) => setText(e.target.value)} onPaste={(e) => e.clipboardData.files.length && (e.preventDefault(), void attach(e.clipboardData.files))} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), void send())} placeholder="Message Onyx" className="max-h-40 min-h-11 min-w-0 flex-1" />
						<label htmlFor="tier" className="sr-only">Model</label>
						<select id="tier" value={tier} onChange={(e) => setTier(e.target.value as Pick)} title="Which model answers. Auto lets the router choose." className="h-11 shrink-0 text-sm">
							{TIERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
						</select>
						{pending ? (
							<button type="button" onClick={stop} aria-label="Stop" title="Stop (Esc)" className="flex h-11 w-11 shrink-0 items-center justify-center rounded border text-text hover:border-bad hover:text-bad"><Square {...ICON} size={16} fill="currentColor" aria-hidden /></button>
						) : (
							<button type="submit" disabled={!text.trim() && !files.length} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-accent text-bg disabled:opacity-30"><ArrowUp {...ICON} aria-hidden /></button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}

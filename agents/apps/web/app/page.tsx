'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, Download, MessageSquarePlus, PanelLeft, Paperclip, Pencil, Pin, PinOff, Smartphone, Square, Trash2, X } from 'lucide-react';
import { Button, Glass, SearchField } from 'glisse';
import { api, nodesFrom, useData, useLive, fmtTime, type RunNode } from '@/lib/api';
import { Activity, treeOf } from '@/components/run';
import { ChannelIcon, Empty, ICON, Problem } from '@/components/ui';
import { CopyButton, MessageText } from '@/components/message';

interface Msg { id: number; direction: 'in' | 'out'; text: string; run_id: string | null; channel: string; status: string; created_at: string }
interface Conv { id: number; title: string; pinned: boolean; updated_at: string; messages: number; match: string | null }
interface File64 { name: string; type: string; data: string; size: number }
interface Pending { runId: string; text: string; files: number }
const TIERS = [['auto', 'Auto'], ['lite', 'Lite'], ['standard', 'Standard'], ['pro', 'Pro'], ['max', 'Max']] as const;
/** A tier, or "model:<key>": a cloud model (Claude, ChatGPT) chosen for the message. */
type Pick = string;
interface CloudModel { key: string; label: string; provider: string }
const MAX_FILE = 10 * 1024 * 1024;
const store = { get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* a private window */ } } };
const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const wide = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
const PREFIX = /^\/(lite|standard|pro|max|think)\s*/i;

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
		const t = setTimeout(() => setQuery(q.trim()), 250);
		return () => clearTimeout(t);
	}, [q]);
	const { data, error } = useData<{ conversations: Conv[]; other: { updated_at: string } | null }>(`/conversations?q=${encodeURIComponent(query)}`, [version]);
	const item = (id: number, title: string, sub: string | null, pinned = false, icon?: React.ReactNode) => (
		<li key={id}>
			<button type="button" onClick={() => choose(id)} aria-current={current === id ? 'true' : undefined} className={`chat-item flex w-full min-h-11 items-start gap-2 rounded-[12px] px-3 py-2 text-left text-sm ${current === id ? 'font-medium' : 'text-muted hover:text-text'}`}>
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
			<Button onClick={fresh} className="new-chat mb-3" icon={<MessageSquarePlus {...ICON} size={16} aria-hidden />}>
				New chat
				<kbd className="ml-auto hidden font-mono text-[10px] text-muted md:inline">{isMac() ? '⌘⇧O' : 'Ctrl+Shift+O'}</kbd>
			</Button>
			<SearchField ref={searchRef} aria-label="Search chats" value={q} onValueChange={setQ} onKeyDown={(e) => e.key === 'Escape' && (e.stopPropagation(), setQ(''))} placeholder={wide() ? `Search  ${isMac() ? '⌘K' : 'Ctrl+K'}` : 'Search chats'} className="mb-3 max-w-none" />
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
	// null: not chosen yet; -1: a new chat not created yet; 0: phone and reminders.
	const [conv, setConv] = useState<number | null>(null);
	const [version, setVersion] = useState(0);
	const [panel, setPanel] = useState(false);
	const { data, error, reload } = useData<{ messages: Msg[] }>(conv === null || conv < 0 ? null : `/messages?conversation=${conv}`);
	const meta = useData<{ conversations: Conv[] }>('/conversations', [version]);
	const warm = useData<{ ready: boolean; models: Record<string, string> }>('/warmup');
	const [text, setText] = useState('');
	const [tier, setTier] = useState<Pick>('auto');
	const [files, setFiles] = useState<File64[]>([]);
	// Each chat can have a message in progress of its own; another chat stays free to use meanwhile.
	const [pending, setPending] = useState<Record<number, Pending>>({});
	const [sendError, setSendError] = useState<string | null>(null);
	const [renaming, setRenaming] = useState<string | null>(null);
	const renamed = useRef(false);
	const end = useRef<HTMLDivElement>(null);
	const input = useRef<HTMLTextAreaElement>(null);
	const searchSide = useRef<HTMLInputElement>(null);
	const searchPanel = useRef<HTMLInputElement>(null);
	const picker = useRef<HTMLInputElement>(null);
	// The composer floats over the end of the chat; the space under the last message follows its height.
	const dock = useRef<HTMLFormElement>(null);
	const [dockHeight, setDockHeight] = useState(96);
	useEffect(() => {
		const el = dock.current;
		if (!el) return;
		const ro = new ResizeObserver(() => setDockHeight(el.offsetHeight));
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	const messages = conv === null || conv < 0 ? [] : data?.messages ?? [];
	const current = meta.data?.conversations.find((c) => c.id === conv) ?? null;
	const mine = conv !== null ? pending[conv] ?? null : null;
	const tree: RunNode[] = mine ? treeOf(live.nodes, mine.runId) : [];
	const root = tree[0];
	const streamed = mine ? live.text[mine.runId] ?? '' : '';

	// Start in the chat used last, or the newest.
	useEffect(() => {
		if (conv !== null || !meta.data) return;
		const saved = store.get('onyx.chat');
		const last = saved === null ? NaN : Number(saved);
		setConv(meta.data.conversations.some((c) => c.id === last) || last === 0 ? last : meta.data.conversations[0]?.id ?? -1);
	}, [meta.data, conv]);
	// The cloud models that can be chosen now (cloud models on, and a key set for them).
	const offered = useData<{ cloud_models: CloudModel[] }>('/tiers');
	const cloudModels = offered.data?.cloud_models ?? [];
	// The model picked last time. Saved when you change it, not on load, or the default would overwrite it. A cloud
	// model comes back only while it can still be used.
	useEffect(() => {
		const t = store.get('onyx.tier');
		if (t && (TIERS.some(([k]) => k === t) || cloudModels.some((m) => `model:${m.key}` === t))) setTier(t);
	}, [cloudModels.length]);
	useEffect(() => {
		if (conv !== null && conv >= 0) store.set('onyx.chat', String(conv));
	}, [conv]);
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
	}, [finished, conv]);
	useEffect(() => {
		if (!stored || conv === null) return;
		setPending(({ [conv]: _, ...rest }) => rest);
		setVersion((v) => v + 1);
	}, [stored, conv]);
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
		const empty = meta.data?.conversations.find((c) => c.messages === 0 && !pending[c.id]);
		const id = empty?.id ?? (await api<{ id: number }>('/conversations', { method: 'POST' })).id;
		setVersion((v) => v + 1);
		choose(id);
		setTimeout(() => input.current?.focus(), 50);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [meta.data, pending]);
	const stop = useCallback(() => {
		if (mine) void api(`/runs/${mine.runId}/kill`, { method: 'POST' }).catch(() => {});
	}, [mine]);

	// Keys: Ctrl/Cmd+K search, Ctrl/Cmd+Shift+O new chat, Esc stops the answer being written, / jumps to the message box.
	useEffect(() => {
		const key = (e: KeyboardEvent) => {
			const mod = e.metaKey || e.ctrlKey;
			const el = e.target instanceof HTMLElement ? e.target : null;
			const typing = !!el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
			if (mod && !e.shiftKey && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				if (wide()) searchSide.current?.focus();
				else (setPanel(true), setTimeout(() => searchPanel.current?.focus(), 30));
			} else if (mod && e.shiftKey && e.key.toLowerCase() === 'o') (e.preventDefault(), void fresh());
			else if (e.key === 'Escape' && mine && (!typing || el === input.current)) (e.preventDefault(), stop());
			else if (e.key === '/' && !typing && !mod) (e.preventDefault(), input.current?.focus());
		};
		window.addEventListener('keydown', key);
		return () => window.removeEventListener('keydown', key);
	}, [fresh, stop, mine]);

	const attach = async (list: FileList | null) => {
		setSendError(null);
		const add: File64[] = [];
		for (const f of Array.from(list ?? [])) {
			if (f.size > MAX_FILE) setSendError(`${f.name} is over 10 MB.`);
			else add.push(await readFile(f));
		}
		if (files.length + add.length > 5) setSendError('Up to five files at a time.');
		setFiles((x) => [...x, ...add].slice(0, 5));
		if (picker.current) picker.current.value = '';
	};

	const send = async () => {
		const t = text.trim();
		if ((!t && !files.length) || mine) return;
		setSendError(null);
		const sent = files;
		setText('');
		setFiles([]);
		try {
			// Phone and reminders, or a chat not created yet: the message starts a new chat.
			let id = conv;
			if (id === null || id <= 0) {
				id = (await api<{ id: number }>('/conversations', { method: 'POST' })).id;
				setConv(id);
			}
			const pick = tier.startsWith('model:') ? { tier: 'auto', model: tier.slice(6) } : { tier };
			const { runId } = await api<{ runId: string }>('/chat', { method: 'POST', body: { text: t, ...pick, conversation_id: id, attachments: sent.map(({ name, type, data }) => ({ name, type, data })) } });
			const chat = id;
			setPending((p) => ({ ...p, [chat]: { runId, text: t + (sent.length ? `\n\n📎 ${sent.map((f) => f.name).join(' · ')}` : ''), files: sent.length } }));
			setTimeout(() => setVersion((v) => v + 1), 300);
		} catch (e) {
			setText(t);
			setFiles(sent);
			setSendError((e as Error).message);
		}
	};

	const rename = async (title: string) => {
		// Enter submits and then the input's blur would submit again.
		if (renamed.current) return;
		renamed.current = true;
		setRenaming(null);
		if (current && title.trim() && title.trim() !== current.title) await api(`/conversations/${current.id}`, { method: 'PATCH', body: { title: title.trim() } }).catch((e) => setSendError((e as Error).message));
		setVersion((v) => v + 1);
	};
	const remove = async () => {
		if (!current || !window.confirm(`Delete “${current.title}” and its messages?`)) return;
		await api(`/conversations/${current.id}`, { method: 'DELETE' });
		setConv(-1);
		setVersion((v) => v + 1);
	};

	const waiting = !!warm.data && !warm.data.ready && Object.keys(warm.data.models).length > 0;
	const label = !mine ? '' : tree.length > 1 ? `${tree.filter((n) => n.status === 'running' && n.parentId).map((n) => n.name).join(', ') || 'Core'} working` : live.routing[mine.runId] ? 'Thinking' : mine.files ? 'Reading the attached files' : waiting ? 'Loading models into the graphics card (the first message after starting)' : 'Choosing a model';
	const iconBtn = 'flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-text';

	return (
		<div className="flex h-full">
			<aside className="hidden w-72 shrink-0 p-3 lg:block">
				<Glass className="glass-panel h-full p-3">
					<Chats current={conv} choose={choose} fresh={() => void fresh()} searchRef={searchSide} version={version} />
				</Glass>
			</aside>
			{panel && (
				<div role="dialog" aria-modal="true" aria-label="Chats" className="fade fixed inset-0 z-30 flex scrim p-3 lg:hidden" onClick={() => setPanel(false)} onKeyDown={(e) => e.key === 'Escape' && setPanel(false)}>
					<Glass className="glass-panel slide-in h-full w-80 max-w-[85vw] p-3" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }} onClick={(e) => e.stopPropagation()}>
						<Chats current={conv} choose={choose} fresh={() => void fresh()} searchRef={searchPanel} version={version} />
					</Glass>
				</div>
			)}

			{/* The chat scrolls under its bar and its composer, both glass, which bend and frost it as it passes. */}
			<div className="relative mx-auto h-full w-full min-w-0 max-w-3xl">
				<div className="absolute inset-x-0 top-0 z-10 px-4 md:px-8">
				<Glass className="mt-3 flex min-h-12 items-center gap-1 rounded-full pl-4 pr-1.5">
					<button type="button" onClick={() => setPanel(true)} aria-label="Chats" className={`${iconBtn} lg:hidden`}><PanelLeft {...ICON} aria-hidden /></button>
					{renaming !== null && current ? (
						<form className="flex-1" onSubmit={(e) => (e.preventDefault(), void rename(renaming))}>
							<label htmlFor="rename" className="sr-only">Chat name</label>
							<input id="rename" autoFocus value={renaming} maxLength={120} onChange={(e) => setRenaming(e.target.value)} onBlur={() => void rename(renaming)} onKeyDown={(e) => e.key === 'Escape' && (e.stopPropagation(), (renamed.current = true), setRenaming(null))} className="w-full text-sm" />
						</form>
					) : (
						<h1 className="min-w-0 flex-1 truncate text-sm font-medium">{conv === 0 ? 'Phone and reminders' : current?.title ?? 'New chat'}</h1>
					)}
					{current && renaming === null && (
						<>
							<button type="button" onClick={() => ((renamed.current = false), setRenaming(current.title))} aria-label="Rename" title="Rename" className={iconBtn}><Pencil {...ICON} size={16} aria-hidden /></button>
							<button type="button" onClick={() => void api(`/conversations/${current.id}`, { method: 'PATCH', body: { pinned: !current.pinned } }).then(() => setVersion((v) => v + 1))} aria-label={current.pinned ? 'Unpin' : 'Pin'} title={current.pinned ? 'Unpin' : 'Pin'} className={iconBtn}>{current.pinned ? <PinOff {...ICON} size={16} aria-hidden /> : <Pin {...ICON} size={16} aria-hidden />}</button>
						</>
					)}
					{conv !== null && conv >= 0 && messages.length > 0 && <a href={`/api/conversations/${conv}/export`} download aria-label="Export as Markdown" title="Export as Markdown" className={iconBtn}><Download {...ICON} size={16} aria-hidden /></a>}
					{current && <button type="button" onClick={() => void remove()} disabled={!!mine} aria-label="Delete chat" title="Delete chat" className={`${iconBtn} hover:text-bad disabled:opacity-30`}><Trash2 {...ICON} size={16} aria-hidden /></button>}
				</Glass>
				</div>

				<div className="chat-scroll absolute inset-0 overflow-y-auto px-4 pt-[84px] md:px-8" aria-live="polite">
					{error && <Problem>{error}</Problem>}
					{!error && (data || conv === -1) && !messages.length && !mine && (
						<Empty title={conv === 0 ? 'Nothing from your phone yet.' : 'A new chat.'}>
							Onyx Core answers quick things itself and hands the rest to its agents. Pick a model below, or leave it on Auto. Attach text, code, PDFs or images with the paperclip.<span className="hidden md:inline"> Keys: {isMac() ? '⌘K' : 'Ctrl+K'} search, {isMac() ? '⌘⇧O' : 'Ctrl+Shift+O'} new chat, / to type, Esc to stop.</span>
						</Empty>
					)}
					<ol className="space-y-6">
						{messages.map((m) => (
							<li key={m.id} className={`group ${m.direction === 'in' ? 'mine' : ''} ${Date.now() - Date.parse(m.created_at) < 4000 ? 'arrive' : ''}`}>
								<div className="mb-1 flex min-h-8 items-center gap-2 text-xs text-muted">
									{m.direction === 'in' ? 'You' : 'Onyx'}
									{m.channel !== 'web' && <ChannelIcon channel={m.channel} />}
									<time dateTime={m.created_at}>{fmtTime(m.created_at)}</time>
									{/* On a phone there is no hover, so the button is always there. */}
									{m.direction === 'out' && <span className="transition-opacity md:opacity-0 md:focus-within:opacity-100 md:group-hover:opacity-100"><CopyButton text={m.text} label="Copy the answer" /></span>}
								</div>
								{m.direction === 'in' ? (
									<Glass className="bubble"><MessageText text={m.text.replace(PREFIX, '')} className={m.status === 'error' ? 'text-bad' : ''} /></Glass>
								) : (
									<MessageText text={m.text} className={m.status === 'error' ? 'text-bad' : ''} />
								)}
								{m.direction === 'out' && m.run_id && <Stored runId={m.run_id} />}
							</li>
						))}
						{mine && (
							<>
								{!messages.some((m) => m.run_id === mine.runId && m.direction === 'in') && <li className="mine arrive"><p className="mb-1 text-xs text-muted">You</p><Glass className="bubble"><p className="whitespace-pre-wrap">{mine.text}</p></Glass></li>}
								<li className="arrive">
									<p className="mb-1 text-xs text-muted">Onyx</p>
									{streamed ? <MessageText text={streamed} /> : <p className="thinking">{label}</p>}
									<Activity tree={tree} routing={live.routing[mine.runId]} live />
								</li>
							</>
						)}
					</ol>
					<div ref={end} style={{ height: dockHeight + 12 }} />
				</div>

				<form ref={dock} onSubmit={(e) => (e.preventDefault(), void send())} className="absolute inset-x-0 bottom-0 z-10 px-4 pt-2 md:px-8" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
					onDragOver={(e) => e.preventDefault()} onDrop={(e) => (e.preventDefault(), void attach(e.dataTransfer.files))}>
					{sendError && <div className="mb-2"><Problem>{sendError}</Problem></div>}
					{waiting && !mine && <p role="status" className="thinking mb-2 text-xs">Loading {Object.keys(warm.data!.models).join(' and ')} into the graphics card</p>}
					{files.length > 0 && (
						<ul className="mb-2 flex flex-wrap gap-2">
							{files.map((f, i) => (
								<li key={i} className="arrive flex items-center gap-1 rounded-full border py-0.5 pl-3 text-xs">
									<span className="max-w-48 truncate">{f.name}</span>
									<span className="font-mono text-muted">{f.size < 1e6 ? `${Math.ceil(f.size / 1024)} KB` : `${(f.size / 1e6).toFixed(1)} MB`}</span>
									<button type="button" onClick={() => setFiles((x) => x.filter((_, k) => k !== i))} aria-label={`Remove ${f.name}`} className="flex h-6 w-6 items-center justify-center text-muted hover:text-bad"><X {...ICON} size={13} aria-hidden /></button>
								</li>
							))}
						</ul>
					)}
					<Glass className="composer flex items-end gap-1.5">
						<input ref={picker} type="file" multiple hidden accept="image/*,application/pdf,text/*,.md,.csv,.json,.yaml,.yml,.py,.js,.ts,.tsx,.jsx,.go,.rs,.java,.c,.cpp,.cs,.sh,.ps1,.sql,.html,.css" onChange={(e) => void attach(e.target.files)} />
						<Button onClick={() => picker.current?.click()} disabled={files.length >= 5} aria-label="Attach files" title="Attach text, code, PDFs or images" className="tool" icon={<Paperclip {...ICON} aria-hidden />} />
						<label htmlFor="message" className="sr-only">Message to Onyx</label>
						{/* A pasted screenshot is attached; text copied from Word or Excel (which also carries a picture of itself) is pasted as text. */}
						<textarea ref={input} id="message" rows={1} value={text} onChange={(e) => setText(e.target.value)} onPaste={(e) => e.clipboardData.files.length > 0 && !e.clipboardData.getData('text/plain') && (e.preventDefault(), void attach(e.clipboardData.files))} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && (e.preventDefault(), void send())} placeholder="Message Onyx" className="max-h-40 min-h-11 min-w-0 flex-1 self-center" />
						<label htmlFor="tier" className="sr-only">Model</label>
						<select id="tier" value={tier} onChange={(e) => (setTier(e.target.value), store.set('onyx.tier', e.target.value))} title="Which model answers. Auto lets the router choose; a cloud model uses your key with its company." className="pill h-10 max-w-[10rem] shrink-0 truncate text-sm">
							{TIERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
							{cloudModels.length > 0 && (
								<optgroup label="Cloud, with your key">
									{cloudModels.map((m) => <option key={m.key} value={`model:${m.key}`}>{m.label}</option>)}
								</optgroup>
							)}
						</select>
						{mine ? (
							<Button onClick={stop} aria-label="Stop" title="Stop (Esc)" destructive className="tool" icon={<Square {...ICON} size={16} fill="currentColor" aria-hidden />} />
						) : (
							<Button type="submit" variant="filled" disabled={!text.trim() && !files.length} aria-label="Send" className="tool" icon={<ArrowUp {...ICON} aria-hidden />} />
						)}
					</Glass>
				</form>
			</div>
		</div>
	);
}

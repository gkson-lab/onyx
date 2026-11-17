'use client';
import { useEffect, useState } from 'react';
import { api, fmtTime, useData } from '@/lib/api';
import { Button, Code, Problem, Section } from './ui';

interface Release { sha: string; message: string; date: string }
interface Record_ { from: string | null; to: string; at: string; mode: 'git' | 'files'; written: number; removed: number; message: string }
interface Status { repo: string; branch: string; mode: 'git' | 'files'; current: string | null; latest: Release | null; available: boolean | null; checkedAt: string | null; state: 'idle' | 'checking' | 'waiting' | 'downloading' | 'restarting' | 'error'; progress: { done: number; total: number } | null; error: string | null; note: string | null; auto: boolean; launcher: boolean; last: Record_ | null; canUndo: boolean }

const short = (sha: string | null | undefined) => (sha && /^[0-9a-f]{40}$/.test(sha) ? sha.slice(0, 7) : sha ?? '');
const BUSY = ['checking', 'waiting', 'downloading', 'restarting'];

/** Updates from GitHub: what this copy is at, what GitHub has, and the buttons to check, update, undo, or stop it updating by itself. */
export function Updates() {
	const { data, error, reload } = useData<Status>('/update');
	const [s, setS] = useState<Status | null>(null);
	const [bad, setBad] = useState<string | null>(null);
	useEffect(() => { if (data) setS(data); }, [data]);
	// While something is happening, ask again every second and a half, through the restart (when nothing answers).
	const busy = !!s && BUSY.includes(s.state);
	useEffect(() => {
		if (!busy) return;
		const t = setInterval(reload, 1500);
		return () => clearInterval(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [busy]);
	const restarting = s?.state === 'restarting';
	const act = async (path: string, method = 'POST', body?: unknown) => {
		setBad(null);
		try {
			setS(await api<Status>(path, { method, body }));
		} catch (e) {
			setBad((e as Error).message);
		}
		reload();
	};
	const state = !s ? '' : s.state === 'checking' ? 'Asking GitHub…' : s.state === 'downloading' ? (s.progress ? `Downloading ${s.progress.done} of ${s.progress.total} files…` : 'Getting the new version…') : s.state === 'restarting' ? 'Updated. Onyx is installing it and starting again: back in a minute or two.' : s.state === 'waiting' ? 'An update is ready. It goes in when the agents finish what they are doing.' : '';
	return (
		<Section title="Updates">
			<p className="mb-3 max-w-2xl text-sm text-muted">Onyx keeps itself the same as the newest version on GitHub: new files are downloaded, and files GitHub no longer has are removed. Your password and keys (<Code>.env</Code>), your chats and settings (<Code>data</Code>) and your model choices (<Code>config/*.local.yaml</Code>) always stay.</p>
			{/* Not answering is expected while Onyx restarts after an update. */}
			{((error && !restarting) || bad || s?.error) && <Problem>{(!restarting && error) || bad || s?.error}</Problem>}
			{s && (
				<>
					<dl className="grid max-w-2xl grid-cols-[8rem_1fr] gap-x-4 gap-y-1 border-y py-3 text-sm">
						<dt className="text-muted">This copy</dt>
						<dd><span className="font-mono text-xs">{short(s.current) || 'not known yet'}</span> <span className="text-muted">· {s.mode === 'git' ? 'a git clone' : 'a downloaded copy'}</span></dd>
						<dt className="text-muted">On GitHub</dt>
						<dd>{s.latest ? <><span className="font-mono text-xs">{short(s.latest.sha)}</span>{s.latest.message && <span> {s.latest.message}</span>}</> : <span className="text-muted">not checked yet</span>} <span className="text-muted">· {s.repo}, {s.branch}</span></dd>
						<dt className="text-muted">Status</dt>
						<dd role="status" className={s.available ? 'font-medium' : ''}>{state || (s.available === null ? 'Not checked yet.' : s.available ? 'An update is ready.' : 'Up to date.')}{s.checkedAt && !state && <span className="text-muted"> Checked {fmtTime(s.checkedAt)}.</span>}</dd>
						{s.last && (
							<>
								<dt className="text-muted">Last update</dt>
								<dd>{s.last.message === 'Undid the last update' ? `Undone, back to ${short(s.last.to)}` : `${short(s.last.from) || 'first update'} → ${short(s.last.to)}`}, {fmtTime(s.last.at)} <span className="text-muted">· {s.last.written} written, {s.last.removed} removed</span></dd>
							</>
						)}
					</dl>
					<div className="mt-3 flex flex-wrap items-center gap-2">
						<Button onClick={() => void act('/update/check')} disabled={BUSY.includes(s.state)}>Check now</Button>
						<Button kind="primary" onClick={() => void act('/update/apply')} disabled={!s.available || BUSY.includes(s.state)}>Update now</Button>
						<Button onClick={() => void act('/update/settings', 'PUT', { auto: !s.auto })}>{s.auto ? 'Stop updating by itself' : 'Update by itself'}</Button>
						{s.canUndo && <Button kind="danger" onClick={() => window.confirm('Put back the version from before the last update? Updating by itself is switched off after.') && void act('/update/undo')} disabled={BUSY.includes(s.state)}>Undo the last update</Button>}
					</div>
					<p className="mt-2 max-w-2xl text-xs text-muted">
						{s.auto ? (s.launcher ? 'Updates by itself: it checks every 10 minutes, and updates when no agent is working.' : 'Onyx was not started with its shortcut, so it cannot restart itself: it says when an update is ready, and Update now downloads it.') : 'Does not update by itself. Check now and Update now still work.'}
					</p>
					{s.note && <p role="status" className="mt-2 max-w-2xl text-sm">{s.note}</p>}
				</>
			)}
		</Section>
	);
}

'use client';
import { useEffect, useState } from 'react';
import { api, fmtTime, useData } from '@/lib/api';
import { Button, Code, Problem, Section } from './ui';

/** A copy of everything (history, memories, reminders, settings) once a day, into a folder you choose. */
export function Backups() {
	const { data, error, reload } = useData<{ dir: string | null; keep: number; suggested: string; last: { file: string; at: string } | null }>('/backup');
	const [dir, setDir] = useState('');
	const [keep, setKeep] = useState(7);
	const [note, setNote] = useState<string | null>(null);
	const [bad, setBad] = useState<string | null>(null);
	useEffect(() => { if (data) (setDir(data.dir ?? ''), setKeep(data.keep)); }, [data]);
	const save = async (d: string | null) => {
		setBad(null);
		try {
			await api('/backup', { method: 'PUT', body: { dir: d, keep } });
			setNote(d ? 'Saved. Onyx backs up once a day while it runs.' : 'Backups are off.');
			reload();
		} catch (e) {
			setBad((e as Error).message);
		}
	};
	const now = async () => {
		setBad(null);
		setNote('Backing up…');
		try {
			const r = await api<{ file: string }>('/backup/now', { method: 'POST' });
			setNote(`Saved ${r.file}`);
			reload();
		} catch (e) {
			(setNote(null), setBad((e as Error).message));
		}
	};
	return (
		<Section title="Backups">
			<p className="mb-3 max-w-2xl text-sm text-muted">Once a day, Onyx copies your chats, memories, reminders and settings into this folder and keeps the newest copies. A folder in OneDrive also keeps them off this PC. To restore, stop Onyx and copy a backup over <Code>data/onyx.db</Code>.</p>
			{error && <Problem>{error}</Problem>}
			<form className="flex flex-wrap items-end gap-2" onSubmit={(e) => (e.preventDefault(), void save(dir.trim() || null))}>
				<label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted">Folder<input value={dir} onChange={(e) => setDir(e.target.value)} placeholder={data?.suggested} className="font-mono text-sm text-text" /></label>
				<label className="flex flex-col gap-1 text-xs text-muted">Keep<input type="number" min={1} max={60} value={keep} onChange={(e) => setKeep(Number(e.target.value))} className="w-20 font-mono text-sm text-text" /></label>
				{!dir && data && <Button onClick={() => setDir(data.suggested)}>Use suggested</Button>}
				<Button type="submit" kind="primary" disabled={!dir.trim() || (dir === data?.dir && keep === data?.keep)}>Save</Button>
				{data?.dir && <Button onClick={() => void now()}>Back up now</Button>}
				{data?.dir && <Button kind="danger" onClick={() => (setDir(''), void save(null))}>Turn off</Button>}
			</form>
			<p className="mt-2 text-xs text-muted" role="status">{note ?? (data?.last ? `Last backup ${fmtTime(data.last.at)}: ${data.last.file}` : data?.dir ? 'No backup yet.' : 'Off.')}</p>
			{bad && <div className="mt-2"><Problem>{bad}</Problem></div>}
		</Section>
	);
}

/** Starting Onyx, minimized, when you sign in to Windows. */
export function Autostart() {
	const { data, error, reload } = useData<{ supported: boolean; on: boolean }>('/autostart');
	const [bad, setBad] = useState<string | null>(null);
	if (data && !data.supported) return null;
	const flip = async () => {
		setBad(null);
		try {
			await api('/autostart', { method: 'PUT', body: { on: !data?.on } });
			reload();
		} catch (e) {
			setBad((e as Error).message);
		}
	};
	return (
		<Section title="Start with Windows">
			<p className="mb-3 max-w-2xl text-sm text-muted">Starts Onyx, minimized, each time you sign in, so reminders and your phone work without you opening it. The browser does not open; use the desktop shortcut or the address when you want the app.</p>
			{(error || bad) && <Problem>{error ?? bad}</Problem>}
			<div className="flex items-center gap-3">
				<Button kind={data?.on ? 'plain' : 'primary'} onClick={() => void flip()} disabled={!data}>{data?.on ? 'Turn off' : 'Turn on'}</Button>
				<span className="text-sm" role="status">{data ? (data.on ? 'On: Onyx starts when you sign in.' : 'Off.') : ''}</span>
			</div>
		</Section>
	);
}

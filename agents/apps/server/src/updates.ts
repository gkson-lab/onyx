// Updates from GitHub, by themselves or when asked. Every 10 minutes Onyx asks GitHub whether there is a newer
// version; when there is, and no agent is working, it brings this copy up to date and restarts through its launcher
// (scripts/launcher.mjs), which installs the new dependencies and rebuilds the app before starting it again.
// Started some other way (`pnpm start`), Onyx cannot restart itself: it says an update is there, and the files can be
// updated from Settings or with `pnpm onyx update`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { App } from './app.ts';
import { ROOT } from './config.ts';
import { now } from './db.ts';
import { Updater, type Release, type UpdateRecord } from './updater.ts';

export interface UpdateStatus {
	repo: string;
	branch: string;
	mode: 'git' | 'files';
	current: string | null;
	latest: Release | null;
	/** null until the first check. */
	available: boolean | null;
	checkedAt: string | null;
	state: 'idle' | 'checking' | 'waiting' | 'downloading' | 'restarting' | 'error';
	progress: { done: number; total: number } | null;
	error: string | null;
	note: string | null;
	auto: boolean;
	launcher: boolean;
	last: UpdateRecord | null;
	canUndo: boolean;
}

/** Where the launcher looks, after Onyx stops, for "I stopped to update: install, build and start me again". */
export const RESTART_MARKER = resolve(ROOT, 'data/update/restart');

export interface UpdatesOptions {
	updater?: Updater;
	/** Started by scripts/launcher.mjs, which restarts Onyx after an update. */
	launcher?: boolean;
	/** Stops Onyx so the launcher can restart it. */
	exit?: () => void;
	everyMs?: number;
	firstMs?: number;
	/** Check on a timer. Off in tests, which must never reach GitHub by themselves. */
	schedule?: boolean;
	marker?: string;
}

export function registerUpdates(server: FastifyInstance, app: App, o: UpdatesOptions = {}) {
	const db = app.db;
	let backupDir: string | null = null;
	// ONYX_UPDATE_REPO (owner/name) and ONYX_UPDATE_BRANCH follow a fork instead; ONYX_UPDATE_WEB, _API and _GIT_URL a
	// mirror of GitHub.
	const env = process.env;
	const updater = o.updater ?? new Updater({ root: resolve(ROOT, '..'), stateDir: resolve(ROOT, 'data/update'), repo: env.ONYX_UPDATE_REPO, branch: env.ONYX_UPDATE_BRANCH, web: env.ONYX_UPDATE_WEB, api: env.ONYX_UPDATE_API, gitUrl: env.ONYX_UPDATE_GIT_URL, keep: () => [backupDir] });
	const launcher = o.launcher ?? process.env.ONYX_LAUNCHER === '1';
	const exit = o.exit ?? (() => void server.close().finally(() => process.exit(0)));
	const s: UpdateStatus = { repo: updater.repo, branch: updater.branch, mode: 'files', current: null, latest: null, available: null, checkedAt: null, state: 'idle', progress: null, error: null, note: null, auto: true, launcher, last: updater.last(), canUndo: updater.canUndo() };
	let job: Promise<unknown> = Promise.resolve();
	const serial = <T>(f: () => Promise<T>): Promise<T> => {
		const next = job.then(f, f);
		job = next.catch(() => {});
		return next;
	};
	const setting = async <T>(key: string, fallback: T): Promise<T> => {
		const row = await db.selectFrom('settings').select('value').where('key', '=', key).executeTakeFirst();
		return row ? JSON.parse(row.value) : fallback;
	};
	const refresh = async () => {
		s.auto = await setting('update_auto', true);
		backupDir = (await setting<{ dir: string | null }>('backup', { dir: null })).dir;
		s.mode = await updater.mode();
		s.current = await updater.current().catch(() => null);
		s.last = updater.last();
		s.canUndo = updater.canUndo();
	};

	/** Asks GitHub for the newest version and says whether this copy has it. */
	const check = () =>
		serial(async () => {
			s.state = 'checking';
			s.error = null;
			try {
				await refresh();
				s.latest = await updater.latest();
				if (s.current === null) {
					// A downloaded copy whose version is not known yet: compare its files with GitHub's.
					const d = await updater.diff(s.latest);
					if (!d.write.length && !d.remove.length) (updater.markInstalled(s.latest.sha), (s.current = s.latest.sha));
					s.available = !!(d.write.length || d.remove.length);
				} else s.available = s.current !== s.latest.sha;
				s.checkedAt = now();
				s.state = 'idle';
			} catch (e) {
				s.state = 'error';
				s.error = (e as Error).message;
			}
			return s;
		});

	/** Brings this copy up to date; with the launcher, Onyx then stops to be installed, rebuilt and started again. */
	const update = () =>
		serial(async () => {
			s.error = null;
			s.note = null;
			try {
				await refresh();
				s.state = 'downloading';
				s.progress = null;
				const rec = await updater.apply(s.latest ?? undefined, (done, total) => (s.progress = { done, total }));
				s.last = rec;
				s.current = rec.to;
				s.available = false;
				s.canUndo = updater.canUndo();
				s.progress = null;
				await restartOrSay(rec, `Updated to ${rec.to.slice(0, 7)}${rec.message ? `: ${rec.message}` : ''}`);
			} catch (e) {
				s.state = 'error';
				s.error = (e as Error).message;
			}
			return s;
		});

	const restartOrSay = async (rec: UpdateRecord, what: string) => {
		if (!launcher) {
			s.state = 'idle';
			s.note = `${what}. To use it, stop Onyx, run pnpm install and pnpm build, and start it again.`;
			return;
		}
		s.state = 'restarting';
		app.bus.emit({ type: 'update', at: now(), runId: null, rootId: null, parentId: null, agentId: null, data: { phase: 'restarting', to: rec.to, message: rec.message } });
		const marker = o.marker ?? RESTART_MARKER;
		mkdirSync(join(marker, '..'), { recursive: true });
		writeFileSync(marker, rec.to);
		// A moment for the open apps to hear about it.
		setTimeout(exit, 800).unref();
	};

	/** The automatic part: check, and update when there is something new and no agent is working. */
	const tick = async () => {
		if (s.state === 'restarting' || s.state === 'downloading') return;
		await check();
		if (!s.available || !s.auto || !launcher) return;
		if (app.runtime.running().length) {
			s.state = 'waiting';
			s.note = 'An update is ready. It is installed when the agents finish what they are doing.';
			setTimeout(() => void tick(), 60_000).unref();
			return;
		}
		await update();
	};
	// ONYX_UPDATE=off turns the automatic part off altogether: for working on Onyx itself, whose changes an update
	// would set aside.
	if (o.schedule ?? (!process.env.VITEST && process.env.ONYX_UPDATE !== 'off')) {
		const every = o.everyMs ?? Math.max(2, Number(process.env.ONYX_UPDATE_EVERY_MIN) || 10) * 60_000;
		const timer = setInterval(() => void tick(), every);
		const first = setTimeout(() => void tick(), o.firstMs ?? 60_000);
		timer.unref();
		first.unref();
		server.addHook('onClose', async () => (clearInterval(timer), clearTimeout(first)));
	}

	server.get('/api/version', async () => {
		const sha = s.current ?? (await updater.current().catch(() => null));
		return { sha, short: sha?.slice(0, 7) ?? null };
	});
	server.get('/api/update', async () => (await refresh().catch(() => {}), s));
	server.post('/api/update/check', async () => check());
	server.post('/api/update/apply', async (_req, reply) => {
		if (s.state === 'downloading' || s.state === 'restarting') return reply.code(409).send({ error: 'An update is already being installed.' });
		if (app.runtime.running().length) return reply.code(409).send({ error: 'Agents are working. Update when they finish, or stop them first.' });
		return update();
	});
	server.post('/api/update/undo', async (_req, reply) => {
		if (app.runtime.running().length) return reply.code(409).send({ error: 'Agents are working. Undo when they finish, or stop them first.' });
		return serial(async () => {
			try {
				const rec = await updater.undo();
				s.last = rec;
				s.current = rec.to;
				s.canUndo = false;
				// No automatic update straight back to the version just undone: switched off until you turn it on.
				await db.insertInto('settings').values({ key: 'update_auto', value: 'false' }).onConflict((c) => c.column('key').doUpdateSet({ value: 'false' })).execute();
				s.auto = false;
				await restartOrSay(rec, 'Put back the version from before the last update. Automatic updates are now off');
				return s;
			} catch (e) {
				return reply.code(400).send({ error: (e as Error).message });
			}
		});
	});
	server.put('/api/update/settings', async (req, reply) => {
		const body = z.object({ auto: z.boolean() }).safeParse(req.body);
		if (!body.success) return reply.code(400).send({ error: 'Send { auto: true } or { auto: false }.' });
		const v = JSON.stringify(body.data.auto);
		await db.insertInto('settings').values({ key: 'update_auto', value: v }).onConflict((c) => c.column('key').doUpdateSet({ value: v })).execute();
		s.auto = body.data.auto;
		return s;
	});

	return { check, update, tick, status: () => s };
}

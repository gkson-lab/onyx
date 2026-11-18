import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import { gitHash, runGit, untar, Updater } from '../src/updater.ts';
import { registerUpdates } from '../src/updates.ts';
import { buildServer } from '../src/index.ts';
import Fastify from 'fastify';
import { testApp } from './helpers.ts';

const SHA1 = 'a'.repeat(40);
const SHA2 = 'b'.repeat(40);
const RULES = { '.gitattributes': '* text=auto eol=lf\n*.bat text eol=crlf\n', '.gitignore': 'private/\nnode_modules/\n', 'agents/.gitignore': 'node_modules/\n.env\ndata/\nconfig/*.local.yaml\nout/\n' };

/** A folder with these files (paths with forward slashes). */
function folder(files: Record<string, string | Buffer>): string {
	const root = mkdtempSync(join(tmpdir(), 'onyx-upd-'));
	for (const [p, c] of Object.entries(files)) {
		mkdirSync(dirname(join(root, p)), { recursive: true });
		writeFileSync(join(root, p), c);
	}
	return root;
}
const read = (root: string, p: string) => readFileSync(join(root, p), 'utf8');

/** A .tar.gz the way GitHub's archive makes it: one folder, Windows line endings for .bat, a pax header for long names. */
function tarGz(prefix: string, files: Record<string, string>): Buffer {
	const header = (name: string, size: number, type: string, mode: string) => {
		const h = Buffer.alloc(512);
		h.write(name.slice(0, 99), 0);
		h.write(`${mode}\0`, 100);
		h.write('0000000\0', 108);
		h.write('0000000\0', 116);
		h.write(`${size.toString(8).padStart(11, '0')}\0`, 124);
		h.write('00000000000\0', 136);
		h.write('        ', 148);
		h.write(type, 156);
		h.write('ustar\0', 257);
		h.write('00', 263);
		let sum = 0;
		for (const b of h) sum += b;
		h.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148);
		return h;
	};
	const pad = (n: number) => Buffer.alloc((512 - (n % 512)) % 512);
	const parts: Buffer[] = [];
	const global = Buffer.from('52 comment=0000000000000000000000000000000000000000\n');
	parts.push(header('pax_global_header', global.length, 'g', '0000666'), global, pad(global.length));
	parts.push(header(`${prefix}/`, 0, '5', '0000775'));
	for (const [p, c] of Object.entries(files)) {
		const data = Buffer.from(p.endsWith('.bat') ? c.replace(/\n/g, '\r\n') : c);
		const name = `${prefix}/${p}`;
		if (name.length > 99) {
			const rec = ` path=${name}\n`;
			let n = rec.length + 2;
			n = rec.length + String(n).length;
			const pax = Buffer.from(`${n}${rec}`);
			parts.push(header('PaxHeader', pax.length, 'x', '0000666'), pax, pad(pax.length));
		}
		parts.push(header(name, data.length, '0', p.endsWith('.sh') ? '0000775' : '0000664'), data, pad(data.length));
	}
	parts.push(Buffer.alloc(1024));
	return gzipSync(Buffer.concat(parts));
}

/**
 * GitHub, for one repository with one commit at a time: git's list of branches, the API (the commit and its file
 * list), the files one by one, and the whole version as an archive. `damage` sends that file wrong; `limited` makes the
 * API refuse, as it does when its hourly limit is used up.
 */
function fakeGitHub(commits: Record<string, Record<string, string>>, head: () => string, o: { damage?: string; limited?: boolean } = {}) {
	const calls: string[] = [];
	const f = (async (url: string) => {
		const u = new URL(url);
		calls.push(`${u.host}${u.pathname}`);
		const sha = head();
		if (u.host === 'web.test' && u.pathname === '/o/r.git/info/refs') return new Response(`001e# service=git-upload-pack\n0000015b${sha} HEAD\0multi_ack thin-pack side-band\n003f${sha} refs/heads/main\n0044${'c'.repeat(40)} refs/heads/gh-pages\n0000`);
		if (u.host === 'api.test' && o.limited) return new Response('{"message":"API rate limit exceeded"}', { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 600) } });
		const c = u.pathname.match(/^\/repos\/o\/r\/git\/commits\/(\w+)$/);
		if (c) return Response.json({ message: `Version ${c[1]!.slice(0, 1)}\n\nmore`, committer: { date: '2026-11-17T12:00:00Z' }, tree: { sha: `tree-${c[1]}` } });
		const t = u.pathname.match(/^\/repos\/o\/r\/git\/trees\/tree-(\w+)$/);
		if (t) return Response.json({ truncated: false, tree: Object.entries(commits[t[1]!]!).map(([path, text]) => ({ path, mode: path.endsWith('.sh') ? '100755' : '100644', type: 'blob', sha: gitHash(Buffer.from(text)), size: text.length })) });
		const r = u.pathname.match(/^\/o\/r\/(\w+)\/(.+)$/);
		if (r && u.host === 'raw.test') {
			const path = r[2]!.split('/').map(decodeURIComponent).join('/');
			const text = commits[r[1]!]![path];
			if (text === undefined) return new Response('no', { status: 404 });
			return new Response(path === o.damage ? `${text}!` : text);
		}
		const z = u.pathname.match(/^\/o\/r\/tar\.gz\/(\w+)$/);
		if (z && u.host === 'codeload.test') return new Response(new Uint8Array(tarGz(`r-${z[1]}`, commits[z[1]!]!)));
		return new Response('unexpected', { status: 500 });
	}) as unknown as typeof fetch;
	return { fetch: f, calls };
}

// What GitHub has now. Text files are stored with LF, as git stores them.
const REMOTE = {
	...RULES,
	'agents/Start Onyx.bat': '@echo off\necho new\n',
	'agents/src/a.ts': 'export const a = "new";\n',
	'agents/src/b.ts': 'export const b = 1;\n',
	'agents/src/new.ts': 'export const fresh = true;\n',
	'agents/scripts/run.sh': '#!/bin/sh\necho hi\n',
	'agents/data/.gitkeep': '',
	'docs/Read me (first).md': '# Hello\n',
};
// This copy: an older version, with its own things around it.
const LOCAL = {
	...RULES,
	'agents/Start Onyx.bat': '@echo off\r\necho old\r\n',
	'agents/src/a.ts': 'export const a = "old";\n',
	'agents/src/b.ts': 'export const b = 1;\n',
	'agents/src/old.ts': 'gone upstream\n',
	'agents/old-dir/x.txt': 'a folder GitHub no longer has\n',
	'stray.zip': 'something dropped here\n',
	'agents/.env': 'ONYX_PASSWORD=secret\n',
	'agents/data/onyx.db': 'your chats',
	'agents/config/tiers.local.yaml': 'your models',
	'agents/node_modules/pkg/index.js': 'a dependency',
	'agents/apps/web/out/index.html': 'the built app',
	'private/notes.txt': 'private',
	'my-backups/onyx-1.db': 'a backup',
};
const updaterFor = (root: string, gh: ReturnType<typeof fakeGitHub>) => new Updater({ root, stateDir: join(root, 'agents/data/update'), repo: 'o/r', branch: 'main', web: 'https://web.test', api: 'https://api.test', raw: 'https://raw.test', codeload: 'https://codeload.test', fetch: gh.fetch, keep: () => [join(root, 'my-backups')] });

describe('updating a downloaded copy from GitHub', () => {
	it('writes what changed, removes what GitHub no longer has, and keeps everything that is yours', async () => {
		const root = folder(LOCAL);
		const gh = fakeGitHub({ [SHA1]: REMOTE }, () => SHA1);
		const u = updaterFor(root, gh);
		expect(await u.mode()).toBe('files');
		expect(await u.current()).toBeNull();

		const d = await u.diff(await u.latest());
		expect(d.write.map((e) => e.path).sort()).toEqual(['agents/Start Onyx.bat', 'agents/scripts/run.sh', 'agents/src/a.ts', 'agents/src/new.ts', 'docs/Read me (first).md']);
		expect(d.remove.sort()).toEqual(['agents/old-dir/x.txt', 'agents/src/old.ts', 'stray.zip']);

		const rec = await u.apply();
		expect(rec).toMatchObject({ from: null, to: SHA1, mode: 'files', written: 5, removed: 3, message: 'Version a' });
		expect(read(root, 'agents/src/a.ts')).toBe('export const a = "new";\n');
		expect(read(root, 'docs/Read me (first).md')).toBe('# Hello\n');
		// Batch files get Windows line endings, as a checkout gives them.
		expect(read(root, 'agents/Start Onyx.bat')).toBe('@echo off\r\necho new\r\n');
		for (const gone of ['agents/src/old.ts', 'agents/old-dir/x.txt', 'stray.zip']) expect(existsSync(join(root, gone))).toBe(false);
		expect(existsSync(join(root, 'agents/old-dir'))).toBe(false);
		for (const kept of ['agents/.env', 'agents/data/onyx.db', 'agents/config/tiers.local.yaml', 'agents/node_modules/pkg/index.js', 'agents/apps/web/out/index.html', 'private/notes.txt', 'my-backups/onyx-1.db']) expect(existsSync(join(root, kept)), kept).toBe(true);
		expect(await u.current()).toBe(SHA1);
		// Run again: nothing left to do, batch files included.
		const again = await u.diff(await u.latest());
		expect([again.write.length, again.remove.length]).toEqual([0, 0]);
	});

	it("leaves out what GitHub's ZIP leaves out (export-ignore), and removes it when an older version put it here", async () => {
		const remote = { ...RULES, '.gitattributes': `${RULES['.gitattributes']}/trailer export-ignore\n`, 'trailer/onyx.mp4': 'a video', 'trailer/index.html': '<video>', 'agents/src/a.ts': 'export const a = 1;\n' };
		const root = folder({ ...RULES, 'trailer/onyx.mp4': 'an older video' });
		const gh = fakeGitHub({ [SHA1]: remote }, () => SHA1);
		const u = updaterFor(root, gh);
		const d = await u.diff(await u.latest());
		expect(d.write.map((e) => e.path).sort()).toEqual(['.gitattributes', 'agents/src/a.ts']);
		expect(d.remove).toEqual(['trailer/onyx.mp4']);
		await u.apply();
		expect(existsSync(join(root, 'trailer'))).toBe(false);
		expect(gh.calls.filter((c) => c.includes('trailer'))).toEqual([]);
		expect((await u.diff(await u.latest())).write).toEqual([]);
	});

	it("asks git's list of branches whether anything is new, which costs nothing of the API's hourly limit", async () => {
		const root = folder(RULES);
		const gh = fakeGitHub({ [SHA1]: RULES }, () => SHA1);
		const u = updaterFor(root, gh);
		expect(await u.latest()).toEqual({ sha: SHA1, message: 'Version a', date: '2026-11-17T12:00:00Z', tree: `tree-${SHA1}` });
		await u.latest();
		await u.latest();
		expect(gh.calls).toEqual(['web.test/o/r.git/info/refs', `api.test/repos/o/r/git/commits/${SHA1}`, 'web.test/o/r.git/info/refs', 'web.test/o/r.git/info/refs']);
	});

	it("when the API's hourly limit is used up, takes the whole version as one archive instead", async () => {
		const root = folder(LOCAL);
		const gh = fakeGitHub({ [SHA1]: REMOTE }, () => SHA1, { limited: true });
		const u = updaterFor(root, gh);
		const latest = await u.latest();
		expect(latest).toEqual({ sha: SHA1, message: '', date: '', tree: '' });
		const d = await u.diff(latest);
		expect(d.via).toBe('archive');
		expect(d.write.map((e) => e.path).sort()).toEqual(['agents/Start Onyx.bat', 'agents/scripts/run.sh', 'agents/src/a.ts', 'agents/src/new.ts', 'docs/Read me (first).md']);
		await u.apply(latest);
		expect(read(root, 'agents/Start Onyx.bat')).toBe('@echo off\r\necho new\r\n');
		expect(read(root, 'agents/src/a.ts')).toBe('export const a = "new";\n');
		expect(existsSync(join(root, 'stray.zip'))).toBe(false);
		expect((await u.diff(latest)).write).toEqual([]);
		expect(gh.calls.filter((c) => c.startsWith('raw.test'))).toEqual([]);
	});

	it('reads long file names from an archive', () => {
		const long = `agents/${'deep/'.repeat(20)}file.txt`;
		const files = untar(gunzipSync(tarGz('r-x', { [long]: 'deep down\n', 'short.txt': 'hi\n' })));
		expect(files.map((f) => [f.path, f.data.toString()])).toEqual([[`r-x/${long}`, 'deep down\n'], ['r-x/short.txt', 'hi\n']]);
	});

	it('changes nothing when a file arrives damaged', async () => {
		const root = folder(LOCAL);
		const u = updaterFor(root, fakeGitHub({ [SHA1]: REMOTE }, () => SHA1, { damage: 'agents/src/new.ts' }));
		await expect(u.apply()).rejects.toThrow(/agents\/src\/new\.ts could not be downloaded: arrived damaged/);
		expect(read(root, 'agents/src/a.ts')).toBe('export const a = "old";\n');
		expect(existsSync(join(root, 'agents/src/old.ts'))).toBe(true);
		expect(existsSync(join(root, 'agents/src/new.ts'))).toBe(false);
	});

	it('undoes the last update exactly', async () => {
		const root = folder(LOCAL);
		const u = updaterFor(root, fakeGitHub({ [SHA1]: REMOTE }, () => SHA1));
		await u.apply();
		expect(u.canUndo()).toBe(true);
		await u.undo();
		for (const [p, c] of Object.entries(LOCAL)) expect(read(root, p), p).toBe(c);
		expect(existsSync(join(root, 'agents/src/new.ts'))).toBe(false);
		expect(existsSync(join(root, 'docs'))).toBe(false);
		expect(u.canUndo()).toBe(false);
		await expect(u.undo()).rejects.toThrow('There is no update to undo.');
	});

	it('moves from one version to the next', async () => {
		const root = folder(LOCAL);
		let head = SHA1;
		const v2 = { ...REMOTE, 'agents/src/a.ts': 'export const a = "newer";\n' } as Record<string, string>;
		delete v2['agents/src/b.ts'];
		const u = updaterFor(root, fakeGitHub({ [SHA1]: REMOTE, [SHA2]: v2 }, () => head));
		await u.apply();
		head = SHA2;
		const rec = await u.apply();
		expect(rec).toMatchObject({ from: SHA1, to: SHA2, written: 1, removed: 1, message: 'Version b' });
		expect(read(root, 'agents/src/a.ts')).toBe('export const a = "newer";\n');
		expect(existsSync(join(root, 'agents/src/b.ts'))).toBe(false);
	});
});

describe('updating a git clone', () => {
	const git = (cwd: string, ...args: string[]) => execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'init.defaultBranch=main', ...args], { cwd, stdio: 'pipe' }).toString().trim();

	it('checks out what GitHub has, removes files git does not know, and keeps ignored ones', async () => {
		const origin = mkdtempSync(join(tmpdir(), 'onyx-origin-'));
		git(origin, 'init', '--bare', '--quiet');
		const author = folder({ ...RULES, 'agents/src/a.ts': 'v1\n', 'agents/src/b.ts': 'b\n', 'agents/Go.bat': '@echo off\n' });
		git(author, 'init', '--quiet', '-b', 'main');
		git(author, 'add', '-A');
		git(author, 'commit', '--quiet', '-m', 'v1');
		git(author, 'push', '--quiet', origin, 'main');
		const first = git(author, 'rev-parse', 'HEAD');

		const install = mkdtempSync(join(tmpdir(), 'onyx-clone-'));
		git(install, 'clone', '--quiet', origin, '.');
		writeFileSync(join(install, 'stray.txt'), 'left lying around');
		writeFileSync(join(install, 'agents/src/a.ts'), 'edited here\n');
		mkdirSync(join(install, 'agents/data'), { recursive: true });
		writeFileSync(join(install, 'agents/data/onyx.db'), 'your chats');
		writeFileSync(join(install, 'agents/.env'), 'ONYX_PASSWORD=secret\n');

		writeFileSync(join(author, 'agents/src/a.ts'), 'v2\n');
		writeFileSync(join(author, 'agents/src/c.ts'), 'c\n');
		git(author, 'rm', '--quiet', 'agents/src/b.ts');
		git(author, 'add', '-A');
		git(author, 'commit', '--quiet', '-m', 'v2: the second version');
		git(author, 'push', '--quiet', origin, 'main');
		const second = git(author, 'rev-parse', 'HEAD');

		const gh = fakeGitHub({}, () => second);
		const u = new Updater({ root: install, stateDir: join(install, 'agents/data/update'), repo: 'o/r', web: 'https://web.test', api: 'https://api.test', raw: 'https://raw.test', gitUrl: origin, fetch: gh.fetch, git: runGit });
		expect(await u.mode()).toBe('git');
		expect(await u.current()).toBe(first);
		const rec = await u.apply({ sha: second, message: 'v2: the second version', date: '', tree: '' });
		expect(rec).toMatchObject({ from: first, to: second, mode: 'git', written: 2, removed: 1 });
		expect(await u.current()).toBe(second);
		expect(read(install, 'agents/src/a.ts')).toBe('v2\n');
		expect(existsSync(join(install, 'agents/src/b.ts'))).toBe(false);
		expect(existsSync(join(install, 'stray.txt'))).toBe(false);
		expect(read(install, 'agents/data/onyx.db')).toBe('your chats');
		expect(read(install, 'agents/.env')).toBe('ONYX_PASSWORD=secret\n');
		expect(git(install, 'status', '--porcelain')).toBe('');
		// What was changed here was set aside, not lost.
		expect(git(install, 'stash', 'list')).toContain(`Onyx update to ${second.slice(0, 7)}: changes from before`);
		expect(git(install, 'show', '--format=', 'stash@{0}', '--', 'agents/src/a.ts')).toContain('+edited here');

		await u.undo();
		expect(await u.current()).toBe(first);
		expect(read(install, 'agents/src/b.ts')).toBe('b\n');
		expect(existsSync(join(install, 'agents/src/c.ts'))).toBe(false);
		expect(read(install, 'agents/data/onyx.db')).toBe('your chats');
	});
});

describe('updating by itself', () => {
	const setup = async (launcher: boolean) => {
		const root = folder(LOCAL);
		const { app } = await testApp({});
		const exits: number[] = [];
		const marker = join(root, 'agents/data/update/restart');
		const server = await buildServer(app, { webDir: '/nonexistent', updates: { updater: updaterFor(root, fakeGitHub({ [SHA1]: REMOTE }, () => SHA1)), launcher, exit: () => exits.push(1), schedule: false, marker } });
		const auto = registerUpdates(Fastify(), app, { updater: updaterFor(root, fakeGitHub({ [SHA1]: REMOTE }, () => SHA1)), launcher, exit: () => exits.push(1), schedule: false, marker });
		return { root, app, server, auto, exits, marker };
	};

	it('finds the update, waits while agents work, then updates and restarts', async () => {
		const { root, app, auto, exits, marker } = await setup(true);
		(app.runtime as any).running = () => ['a run'];
		await auto.tick();
		expect(auto.status()).toMatchObject({ available: true, state: 'waiting' });
		expect(read(root, 'agents/src/a.ts')).toBe('export const a = "old";\n');

		(app.runtime as any).running = () => [];
		await auto.tick();
		expect(auto.status()).toMatchObject({ available: false, state: 'restarting', current: SHA1 });
		expect(read(root, 'agents/src/a.ts')).toBe('export const a = "new";\n');
		expect(read(root, 'agents/data/update/restart')).toBe(SHA1);
		await new Promise((r) => setTimeout(r, 900));
		expect(exits).toEqual([1]);
		expect(existsSync(marker)).toBe(true);
	});

	it('does not update by itself when switched off, or when nothing can restart it', async () => {
		const off = await setup(true);
		await off.server.inject({ method: 'PUT', url: '/api/update/settings', payload: { auto: false } });
		await off.auto.tick();
		expect(off.auto.status()).toMatchObject({ available: true, auto: false, state: 'idle' });
		const plain = await setup(false);
		await plain.auto.tick();
		expect(plain.auto.status()).toMatchObject({ available: true, launcher: false, state: 'idle' });
		expect(read(plain.root, 'agents/src/a.ts')).toBe('export const a = "old";\n');
	});

	it('updates when asked, and says how to finish without the launcher', async () => {
		const { root, server } = await setup(false);
		expect((await server.inject({ method: 'POST', url: '/api/update/check' })).json()).toMatchObject({ available: true, current: null, latest: { sha: SHA1, message: 'Version a' } });
		const r = (await server.inject({ method: 'POST', url: '/api/update/apply' })).json();
		expect(r).toMatchObject({ state: 'idle', available: false, current: SHA1, canUndo: true });
		expect(r.note).toMatch(/^Updated to aaaaaaa: Version a\. To use it, stop Onyx, run pnpm install and pnpm build/);
		expect(read(root, 'agents/src/new.ts')).toBe('export const fresh = true;\n');
		expect((await server.inject({ method: 'GET', url: '/api/version' })).json()).toEqual({ sha: SHA1, short: 'aaaaaaa' });
		const undone = (await server.inject({ method: 'POST', url: '/api/update/undo' })).json();
		expect(undone).toMatchObject({ auto: false, canUndo: false });
		expect(read(root, 'agents/src/a.ts')).toBe('export const a = "old";\n');
	});

	it('will not update while agents are working', async () => {
		const { app, server } = await setup(true);
		(app.runtime as any).running = () => ['a run'];
		expect((await server.inject({ method: 'POST', url: '/api/update/apply' })).statusCode).toBe(409);
	});
});

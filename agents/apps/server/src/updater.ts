// Keeps this copy of Onyx the same as the newest version on GitHub: the files GitHub has are written here, and the
// files it does not have are removed. Your own things are never touched: .env files, data/ (chats, memories,
// settings), config/*.local.yaml, node_modules, anything the repository's .gitignore files ignore, and your backup
// folder.
//
// A git clone is updated with git (fetch, then check out). A downloaded ZIP copy is updated file by file: GitHub's
// list of the new version's files is compared with the files here, and only what differs is downloaded, each file
// checked against GitHub's own hash of it. When GitHub's API says no (it allows 60 requests an hour without an
// account), the whole version comes as one archive instead, which that limit does not cover. Every file has arrived
// before anything here is replaced, and what gets replaced or removed is kept first, so the last update can be undone.
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, renameSync, rmdirSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import ignore, { type Ignore } from 'ignore';

export interface Release { sha: string; message: string; date: string; tree: string }
export interface TreeEntry { path: string; mode: string; sha: string; size: number }
/** Reads one file of the new version, as git stores it (LF line endings). */
type Read = (e: TreeEntry) => Promise<Buffer>;
export interface Diff { release: Release; write: TreeEntry[]; remove: string[]; via: 'files' | 'archive'; read: Read }
export interface UpdateRecord { from: string | null; to: string; at: string; mode: 'git' | 'files'; written: number; removed: number; message: string }
interface State { installed: string | null; last: UpdateRecord | null }
interface Manifest { from: string | null; to: string; at: string; written: string[]; added: string[]; removed: string[] }

export type Git = (args: string[], cwd: string) => Promise<string>;
export const runGit: Git = (args, cwd) =>
	new Promise((done, fail) => execFile('git', args, { cwd, windowsHide: true, timeout: 300_000, maxBuffer: 16 * 1024 * 1024 }, (err, out, errOut) => (err ? fail(new Error(`git ${args[0]}: ${String(errOut || err.message).trim().split('\n').slice(-2).join(' ')}`)) : done(String(out)))));

export interface UpdaterOptions {
	/** The repository's folder: the one that holds agents/. */
	root: string;
	/** Where the updater keeps its record, its staging area and the files the last update replaced. */
	stateDir: string;
	repo?: string;
	branch?: string;
	/** github.com: git's list of branches, and where a clone fetches from. */
	web?: string;
	api?: string;
	raw?: string;
	codeload?: string;
	gitUrl?: string;
	fetch?: typeof fetch;
	git?: Git;
	/** More folders to keep, such as the backup folder when it is inside this one. */
	keep?: () => (string | null | undefined)[];
}

/** Git's own name for a file's content: SHA-1 of "blob <size>\0" and the bytes. GitHub's file list gives the same. */
export const gitHash = (bytes: Buffer): string => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const toLf = (b: Buffer) => Buffer.from(b.toString('latin1').replace(/\r\n/g, '\n'), 'latin1');
const toCrlf = (b: Buffer) => Buffer.from(b.toString('latin1').replace(/\r?\n/g, '\r\n'), 'latin1');
const posix = (p: string) => p.split('\\').join('/');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Paths that are yours, whatever .gitignore says. Relative to the repository folder, with forward slashes. */
const OWN = [/^\.git(\/|$)/, /(^|\/)node_modules(\/|$)/, /(^|\/)\.env(\..+)?$/, /^agents\/data(\/|$)/, /^agents\/config\/[^/]+\.local\.ya?ml$/, /^private(\/|$)/];

/** Windows can hold a file for a moment (an antivirus scan, an editor): try a few times before giving up. */
async function retry<T>(f: () => T): Promise<T> {
	for (let i = 0; ; i++) {
		try {
			return f();
		} catch (e) {
			const code = (e as NodeJS.ErrnoException).code;
			if (i >= 5 || !['EBUSY', 'EPERM', 'EACCES'].includes(code ?? '')) throw e;
			await sleep(100 * 2 ** i);
		}
	}
}

/** The files in a .tar archive (git archive's: ustar, with pax headers for long names). */
export function untar(tar: Buffer): { path: string; mode: number; data: Buffer }[] {
	const out: { path: string; mode: number; data: Buffer }[] = [];
	let pax: Record<string, string> = {};
	let longName: string | null = null;
	for (let off = 0; off + 512 <= tar.length; ) {
		const h = tar.subarray(off, off + 512);
		if (h.every((b) => b === 0)) break;
		const field = (a: number, b: number) => h.subarray(a, b).toString('utf8').replace(/\0[\s\S]*$/, '');
		const size = parseInt(field(124, 136).trim() || '0', 8);
		const type = String.fromCharCode(h[156]!);
		const body = tar.subarray(off + 512, off + 512 + size);
		off += 512 + Math.ceil(size / 512) * 512;
		if (type === 'x') {
			// Pax records: "<length> <key>=<value>\n", for the entry that follows.
			for (const rec of body.toString('utf8').split('\n')) {
				const m = rec.match(/^\d+ ([^=]+)=([\s\S]*)$/);
				if (m) pax[m[1]!] = m[2]!;
			}
			continue;
		}
		if (type === 'L') {
			longName = body.toString('utf8').replace(/\0[\s\S]*$/, '');
			continue;
		}
		if (type === 'g') continue;
		const prefix = field(345, 500);
		const path = pax.path ?? longName ?? (prefix ? `${prefix}/${field(0, 100)}` : field(0, 100));
		pax = {};
		longName = null;
		if (type === '0' || type === '\0') out.push({ path, mode: parseInt(field(100, 108).trim() || '644', 8), data: Buffer.from(body) });
	}
	return out;
}

export class Updater {
	readonly root: string;
	readonly repo: string;
	readonly branch: string;
	private readonly stateDir: string;
	private readonly web: string;
	private readonly api: string;
	private readonly raw: string;
	private readonly codeload: string;
	private readonly gitUrl: string;
	private readonly fetch: typeof fetch;
	private readonly git: Git;
	private readonly keepMore: () => (string | null | undefined)[];
	private cached: Release | null = null;

	constructor(o: UpdaterOptions) {
		this.root = resolve(o.root);
		this.stateDir = resolve(o.stateDir);
		this.repo = o.repo || 'gkson-lab/onyx';
		this.branch = o.branch || 'main';
		this.web = (o.web ?? 'https://github.com').replace(/\/+$/, '');
		this.api = (o.api ?? 'https://api.github.com').replace(/\/+$/, '');
		this.raw = (o.raw ?? 'https://raw.githubusercontent.com').replace(/\/+$/, '');
		this.codeload = (o.codeload ?? 'https://codeload.github.com').replace(/\/+$/, '');
		this.gitUrl = o.gitUrl ?? `${this.web}/${this.repo}.git`;
		this.fetch = o.fetch ?? fetch;
		this.git = o.git ?? runGit;
		this.keepMore = o.keep ?? (() => []);
	}

	/* ---------- where this copy stands ---------- */

	/** 'git' for a git clone (when git runs here), 'files' for a downloaded copy. */
	async mode(): Promise<'git' | 'files'> {
		if (!existsSync(join(this.root, '.git'))) return 'files';
		try {
			await this.git(['rev-parse', '--git-dir'], this.root);
			return 'git';
		} catch {
			return 'files';
		}
	}

	private readState(): State {
		try {
			return { installed: null, last: null, ...JSON.parse(readFileSync(join(this.stateDir, 'state.json'), 'utf8')) };
		} catch {
			return { installed: null, last: null };
		}
	}
	private writeState(s: State) {
		mkdirSync(this.stateDir, { recursive: true });
		writeFileSync(join(this.stateDir, 'state.json'), JSON.stringify(s, null, 1));
	}
	/** The last update made here, if any. */
	last(): UpdateRecord | null {
		return this.readState().last;
	}
	/** Whether the last update can be undone: git knows the commit before it, or the files it replaced are kept. */
	canUndo(): boolean {
		const last = this.readState().last;
		if (!last) return false;
		return last.mode === 'git' ? !!last.from : existsSync(join(this.stateDir, 'backup', 'manifest.json'));
	}

	/** The commit this copy is at: git's for a clone, else what the last update here recorded. Null when not known. */
	async current(): Promise<string | null> {
		if ((await this.mode()) === 'git') return (await this.git(['rev-parse', 'HEAD'], this.root)).trim();
		return this.readState().installed;
	}

	/** Records the commit a downloaded copy is at, once its files have been found to match GitHub's. */
	markInstalled(sha: string) {
		this.writeState({ ...this.readState(), installed: sha });
	}

	/* ---------- GitHub ---------- */

	private async get(url: string): Promise<Response> {
		const res = await this.fetch(url, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'onyx-updater' }, signal: AbortSignal.timeout(30_000) });
		if (res.ok) return res;
		const reset = Number(res.headers.get('x-ratelimit-reset'));
		if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') throw new Error(`GitHub's limit on requests without an account is used up until ${new Date(reset * 1000).toLocaleTimeString()}.`);
		throw new Error(`GitHub answered ${res.status} for ${url.replace(/^https?:\/\/[^/]+/, '')}: ${(await res.text().catch(() => '')).slice(0, 160)}`);
	}

	/**
	 * The newest commit on GitHub. Its id comes from git's own list of branches, the way `git fetch` asks: a kilobyte, and
	 * outside the API's hourly limit, so checking often costs nothing. Its description comes from the API, when it answers.
	 */
	async latest(): Promise<Release> {
		const res = await this.fetch(`${this.web}/${this.repo}.git/info/refs?service=git-upload-pack`, { headers: { 'user-agent': 'git/2.45 onyx-updater' }, signal: AbortSignal.timeout(30_000) });
		if (!res.ok) throw new Error(`GitHub answered ${res.status} when asked for the newest version of ${this.repo}.`);
		const branch = this.branch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		// The answer lists "<id> refs/heads/<name>" for each branch (with a tab instead of the space from a plain server).
		const m = (await res.text()).match(new RegExp(`([0-9a-f]{40})\\s+refs/heads/${branch}\\n`));
		if (!m) throw new Error(`${this.repo} on GitHub has no branch called ${this.branch}.`);
		const sha = m[1]!;
		if (this.cached?.sha === sha && this.cached.tree) return this.cached;
		let rel: Release = { sha, message: '', date: '', tree: '' };
		try {
			const c = (await (await this.get(`${this.api}/repos/${this.repo}/git/commits/${sha}`)).json()) as { message: string; committer?: { date: string }; author?: { date: string }; tree: { sha: string } };
			rel = { sha, message: c.message.split('\n')[0]!.slice(0, 200), date: c.committer?.date ?? c.author?.date ?? '', tree: c.tree.sha };
		} catch {
			// The API's hourly limit, most likely: the version is known, its description is not (yet).
		}
		this.cached = rel;
		return rel;
	}

	/** One file of a commit, checked against GitHub's hash; tried three times. */
	private async download(sha: string, e: TreeEntry): Promise<Buffer> {
		const url = `${this.raw}/${this.repo}/${sha}/${e.path.split('/').map(encodeURIComponent).join('/')}`;
		let last = '';
		for (let i = 0; i < 3; i++) {
			try {
				const res = await this.fetch(url, { headers: { 'user-agent': 'onyx-updater' }, signal: AbortSignal.timeout(300_000) });
				if (!res.ok) throw new Error(`answered ${res.status}`);
				const buf = Buffer.from(await res.arrayBuffer());
				if (gitHash(buf) !== e.sha) throw new Error("arrived damaged (its contents do not match GitHub's hash)");
				return buf;
			} catch (err) {
				last = (err as Error).message;
				if (i < 2) await sleep(500 * 2 ** i);
			}
		}
		throw new Error(`${e.path} could not be downloaded: ${last}`);
	}

	/**
	 * The new version's files: GitHub's list of them, each read on its own when needed; or, when the API says no, the
	 * whole version in one archive (which git makes with Windows line endings where .gitattributes asks: undone here,
	 * so every file is read as git stores it).
	 */
	private async source(release: Release): Promise<{ entries: TreeEntry[]; read: Read; via: 'files' | 'archive' }> {
		if (release.tree) {
			try {
				const t = (await (await this.get(`${this.api}/repos/${this.repo}/git/trees/${release.tree}?recursive=1`)).json()) as { truncated: boolean; tree: { path: string; mode: string; type: string; sha: string; size?: number }[] };
				if (!t.truncated) {
					// Files only: no folders, no submodules, and no symbolic links (which a downloaded copy cannot hold anyway).
					const entries = t.tree.filter((e) => e.type === 'blob' && e.mode !== '120000').map((e) => ({ path: e.path, mode: e.mode, sha: e.sha, size: e.size ?? 0 }));
					return { entries, read: (e) => this.download(release.sha, e), via: 'files' };
				}
			} catch {
				// Fall through to the archive.
			}
		}
		const res = await this.fetch(`${this.codeload}/${this.repo}/tar.gz/${release.sha}`, { headers: { 'user-agent': 'onyx-updater' }, signal: AbortSignal.timeout(600_000) });
		if (!res.ok) throw new Error(`GitHub answered ${res.status} for the archive of ${release.sha.slice(0, 7)}.`);
		const files = untar(gunzipSync(Buffer.from(await res.arrayBuffer())));
		// Inside, everything sits in one folder named after the repository and commit.
		const strip = (p: string) => p.split('/').slice(1).join('/');
		const attrs = files.find((f) => strip(f.path) === '.gitattributes');
		const crlf = ignore().add(attrs ? crlfPatterns(attrs.data.toString('utf8')) : []);
		const data = new Map<string, Buffer>();
		const entries: TreeEntry[] = [];
		for (const f of files) {
			const path = strip(f.path);
			if (!path) continue;
			const buf = crlf.ignores(path) ? toLf(f.data) : f.data;
			data.set(path, buf);
			entries.push({ path, mode: f.mode & 0o111 ? '100755' : '100644', sha: gitHash(buf), size: buf.length });
		}
		return { entries, read: async (e) => data.get(e.path)!, via: 'archive' };
	}

	/* ---------- what is yours ---------- */

	/**
	 * The repository's rules, from the new version: what .gitignore ignores, which files are written with CRLF, and
	 * what GitHub leaves out of its downloads (export-ignore in .gitattributes: the trailer, say).
	 */
	private async rules(entries: TreeEntry[], read: Read) {
		const text = async (e: TreeEntry) => {
			const abs = join(this.root, e.path);
			if (existsSync(abs)) {
				const b = readFileSync(abs);
				if (gitHash(b) === e.sha || gitHash(toLf(b)) === e.sha) return toLf(b).toString('utf8');
			}
			return (await read(e)).toString('utf8');
		};
		const ignores: { dir: string; ig: Ignore }[] = [];
		for (const e of entries.filter((x) => x.path === '.gitignore' || x.path.endsWith('/.gitignore'))) ignores.push({ dir: e.path.slice(0, -'.gitignore'.length), ig: ignore().add(await text(e)) });
		const attrs = entries.find((x) => x.path === '.gitattributes');
		const attrText = attrs ? await text(attrs) : '';
		const crlf = ignore().add(crlfPatterns(attrText));
		const leftOut = ignore().add(attrPatterns(attrText, 'export-ignore'));
		const extra = this.keepMore().filter((p): p is string => !!p).map((p) => posix(relative(this.root, resolve(this.root, p)))).filter((p) => p && !p.startsWith('..') && !isAbsolute(p));
		const own = (p: string) => OWN.some((re) => re.test(p)) || extra.some((k) => p === k || p.startsWith(`${k}/`));
		const ignored = (p: string, isDir = false) => ignores.some(({ dir, ig }) => (dir === '' || p.startsWith(dir)) && ig.ignores(p.slice(dir.length) + (isDir ? '/' : '')));
		return { own, ignored, crlf: (p: string) => crlf.ignores(p), leftOut: (p: string) => leftOut.ignores(p) };
	}

	/** Every file here, as forward-slash paths, leaving out folders that are yours or ignored (node_modules, data). */
	private walk(r: Awaited<ReturnType<Updater['rules']>>): string[] {
		const out: string[] = [];
		const go = (dir: string) => {
			for (const name of readdirSync(join(this.root, dir))) {
				const p = dir ? `${dir}/${name}` : name;
				const st = lstatSync(join(this.root, p));
				if (st.isDirectory()) {
					if (!r.own(p) && !r.ignored(p, true)) go(p);
				} else out.push(p);
			}
		};
		go('');
		return out;
	}

	/** What updating to `release` would write and remove. */
	async diff(release: Release): Promise<Diff> {
		const src = await this.source(release);
		const r = await this.rules(src.entries, src.read);
		// A downloaded copy holds what GitHub's ZIP holds, which leaves out what .gitattributes marks export-ignore (the
		// trailer, a video no PC needs); so those are not downloaded, and go if an older version put them here. A clone
		// has everything.
		const entries = (await this.mode()) === 'files' ? src.entries.filter((e) => !r.leftOut(e.path)) : src.entries;
		const inTree = new Set(entries.map((e) => e.path));
		const write = entries.filter((e) => {
			if (r.own(e.path)) return false;
			const abs = join(this.root, e.path);
			if (!existsSync(abs) || !lstatSync(abs).isFile()) return true;
			const b = readFileSync(abs);
			return gitHash(r.crlf(e.path) ? toLf(b) : b) !== e.sha;
		});
		const remove = this.walk(r).filter((p) => !inTree.has(p) && !r.own(p) && !r.ignored(p));
		return { release, write, remove, via: src.via, read: src.read };
	}

	/* ---------- updating ---------- */

	/** Brings this copy to `release` (the newest when not given). Returns what was done. */
	async apply(release?: Release, onProgress?: (done: number, total: number) => void): Promise<UpdateRecord> {
		const target = release ?? (await this.latest());
		if ((await this.mode()) === 'git') {
			try {
				return await this.applyGit(target);
			} catch (e) {
				// A clone git cannot update (a folder owned by another user, say) is updated file by file instead.
				console.log(`  updating with git failed (${(e as Error).message}); updating file by file instead`);
			}
		}
		return this.applyFiles(await this.diff(target), onProgress);
	}

	private async applyGit(release: Release): Promise<UpdateRecord> {
		const from = (await this.git(['rev-parse', 'HEAD'], this.root)).trim();
		const ref = `refs/remotes/onyx-update/${this.branch}`;
		await this.git(['fetch', '--quiet', '--no-tags', this.gitUrl, `+refs/heads/${this.branch}:${ref}`], this.root);
		const to = (await this.git(['rev-parse', ref], this.root)).trim();
		const count = async (filter: string) => (from === to ? 0 : (await this.git(['diff', '--name-only', `--diff-filter=${filter}`, from, to], this.root)).split('\n').filter(Boolean).length);
		const written = await count('ACMRT');
		const removed = await count('D');
		// Changes made here, and files git does not know, leave the folder, as asked; but into a stash rather than
		// nowhere, so `git stash list` and `git stash pop` can still get them back. (Ignored files, which are yours,
		// stay where they are.) Then what GitHub has is checked out, over anything still in the way.
		if ((await this.git(['status', '--porcelain'], this.root)).trim()) await this.git(['stash', 'push', '--include-untracked', '--quiet', '-m', `Onyx update to ${to.slice(0, 7)}: changes from before`], this.root);
		await this.git(['checkout', '--quiet', '--force', '-B', this.branch, to], this.root);
		const keep = this.keepMore().filter((p): p is string => !!p).map((p) => posix(relative(this.root, resolve(this.root, p)))).filter((p) => p && !p.startsWith('..') && !isAbsolute(p));
		await this.git(['clean', '-d', '--force', '--quiet', '-e', 'agents/data/', '-e', 'agents/config/*.local.yaml', '-e', '.env', '-e', 'private/', ...keep.flatMap((k) => ['-e', `${k}/`])], this.root);
		const message = to === release.sha ? release.message : (await this.git(['log', '-1', '--format=%s', to], this.root)).trim();
		const rec: UpdateRecord = { from, to, at: new Date().toISOString(), mode: 'git', written, removed, message };
		this.writeState({ installed: to, last: rec });
		return rec;
	}

	private async applyFiles(diff: Diff, onProgress?: (done: number, total: number) => void): Promise<UpdateRecord> {
		const { release } = diff;
		const from = this.readState().installed;
		const stage = join(this.stateDir, 'staging');
		rmSync(stage, { recursive: true, force: true });
		mkdirSync(stage, { recursive: true });
		const attrs = diff.write.find((e) => e.path === '.gitattributes');
		const crlf = ignore().add(crlfPatterns(attrs ? (await diff.read(attrs)).toString('utf8') : existsSync(join(this.root, '.gitattributes')) ? readFileSync(join(this.root, '.gitattributes'), 'utf8') : ''));

		// 1. Every file first, each checked, four at a time. Nothing here changes until all of them have arrived.
		let done = 0;
		const queue = [...diff.write];
		await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
			for (let e = queue.shift(); e; e = queue.shift()) {
				const buf = await diff.read(e);
				const out = join(stage, e.path);
				mkdirSync(dirname(out), { recursive: true });
				writeFileSync(out, crlf.ignores(e.path) ? toCrlf(buf) : buf);
				onProgress?.(++done, diff.write.length);
			}
		}));

		// 2. Keep what is about to be replaced or removed, and a list of it, so this update can be undone.
		const backup = join(this.stateDir, 'backup');
		rmSync(backup, { recursive: true, force: true });
		const m: Manifest = { from, to: release.sha, at: new Date().toISOString(), written: [], added: [], removed: [] };
		const keepCopy = (p: string) => {
			const dest = join(backup, 'files', p);
			mkdirSync(dirname(dest), { recursive: true });
			copyFileSync(join(this.root, p), dest);
		};
		for (const e of diff.write) {
			if (existsSync(join(this.root, e.path)) && lstatSync(join(this.root, e.path)).isFile()) (keepCopy(e.path), m.written.push(e.path));
			else m.added.push(e.path);
		}
		for (const p of diff.remove) (keepCopy(p), m.removed.push(p));
		writeFileSync(join(backup, 'manifest.json'), JSON.stringify(m, null, 1));

		// 3. Old files out (and folders left empty), then the new ones in. If anything fails half way, put it all back.
		try {
			for (const p of diff.remove) await retry(() => unlinkSync(join(this.root, p)));
			this.prune(diff.remove.map((p) => dirname(p)));
			for (const e of diff.write) {
				const dest = join(this.root, e.path);
				if (existsSync(dest) && lstatSync(dest).isDirectory()) rmSync(dest, { recursive: true, force: true });
				mkdirSync(dirname(dest), { recursive: true });
				await retry(() => renameSync(join(stage, e.path), dest));
				if (e.mode === '100755' && process.platform !== 'win32') chmodSync(dest, 0o755);
			}
		} catch (e) {
			await this.restore(m);
			throw new Error(`The update could not replace a file, so everything was put back as it was: ${(e as Error).message}`);
		}
		rmSync(stage, { recursive: true, force: true });
		const rec: UpdateRecord = { from, to: release.sha, at: m.at, mode: 'files', written: diff.write.length, removed: diff.remove.length, message: release.message };
		this.writeState({ installed: release.sha, last: rec });
		return rec;
	}

	/** Removes the given folders, and their parents, when they are empty and not yours. */
	private prune(dirs: string[]) {
		for (let d of [...new Set(dirs)].sort((a, b) => b.length - a.length)) {
			while (d && d !== '.' && !OWN.some((re) => re.test(posix(d)))) {
				const abs = join(this.root, d);
				if (!existsSync(abs) || readdirSync(abs).length) break;
				rmdirSync(abs);
				d = dirname(d);
			}
		}
	}

	private async restore(m: Manifest) {
		const backup = join(this.stateDir, 'backup', 'files');
		for (const p of m.added) rmSync(join(this.root, p), { force: true });
		this.prune(m.added.map((p) => dirname(p)));
		for (const p of [...m.written, ...m.removed]) {
			const dest = join(this.root, p);
			mkdirSync(dirname(dest), { recursive: true });
			await retry(() => copyFileSync(join(backup, p), dest));
		}
	}

	/** Puts back the version before the last update. */
	async undo(): Promise<UpdateRecord> {
		const s = this.readState();
		if (!s.last || !this.canUndo()) throw new Error('There is no update to undo.');
		let back: string | null;
		if (s.last.mode === 'git') {
			back = s.last.from!;
			await this.git(['checkout', '--quiet', '--force', '-B', this.branch, back], this.root);
		} else {
			const m = JSON.parse(readFileSync(join(this.stateDir, 'backup', 'manifest.json'), 'utf8')) as Manifest;
			await this.restore(m);
			rmSync(join(this.stateDir, 'backup'), { recursive: true, force: true });
			back = m.from;
		}
		// Recorded with no "from", so it cannot be undone in turn: the next update brings the newest version back.
		const rec: UpdateRecord = { from: null, to: back ?? 'the version before', at: new Date().toISOString(), mode: s.last.mode, written: s.last.written, removed: s.last.removed, message: 'Undid the last update' };
		this.writeState({ installed: back, last: rec });
		return rec;
	}
}

/** From a .gitattributes file, the patterns that set `attr`. */
function attrPatterns(attributes: string, attr: string): string[] {
	return attributes.split('\n').flatMap((line) => {
		const [pattern, ...attrs] = line.trim().split(/\s+/);
		return pattern && !pattern.startsWith('#') && attrs.includes(attr) ? [pattern] : [];
	});
}
/** The patterns whose files git writes with Windows line endings (eol=crlf). */
const crlfPatterns = (attributes: string) => attrPatterns(attributes, 'eol=crlf');

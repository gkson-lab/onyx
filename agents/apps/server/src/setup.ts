// Setup's model step: makes sure Ollama answers, then gets a model for each tier. Lite and Standard first, since
// nothing works without them; then Pro and Max, each falling back to a smaller model that fits when the first choice
// cannot be had (gpt-oss 20B then Qwen3 14B for Pro, and so on), so Setup ends with every tier on a model that is
// really there. Each download shows its progress on one line, and a failure says what Ollama said and what to do.
import { spawn } from 'node:child_process';
import { existsSync, statfsSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { TIERS, type Tier } from '@onyx/shared';
import { catalogEntry, type Plan } from './hardware.ts';

/** Bytes so far and in all, over every layer of the model, and what Ollama is doing ("pulling 3f2a…", "verifying sha256 digest"). */
export type Progress = (done: number, total: number, status: string) => void;
/** Downloads a model; resolves to null, or what went wrong. */
export type Pull = (id: string, onProgress: Progress) => Promise<string | null>;

export interface ModelStep {
	/** The model each tier ended up with. A tier is missing only when no model at all could be had. */
	chosen: Partial<Record<Tier, string>>;
	/** What went wrong, one line each, with what to do. */
	problems: string[];
	ok: boolean;
}

const GB = 1024 ** 3;
/** Ollama's base address (without /v1). */
export const ollamaBase = (env: NodeJS.ProcessEnv = process.env): string => (env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1').replace(/\/v1\/?$/, '').replace(/\/+$/, '');

/** Where Ollama keeps its models: OLLAMA_MODELS, or .ollama/models in the home folder. */
export const modelsDir = (env: NodeJS.ProcessEnv = process.env): string => env.OLLAMA_MODELS || join(homedir(), '.ollama', 'models');

/** Free space on the drive that holds Ollama's models, in bytes; null when it cannot be told. */
export function freeBytes(dir: string = modelsDir()): number | null {
	for (let d = dir; d; d = d.replace(/[\\/][^\\/]*$/, '')) {
		try {
			if (existsSync(d)) {
				const s = statfsSync(d);
				return Number(s.bavail) * Number(s.bsize);
			}
		} catch {
			return null;
		}
		if (!/[\\/]/.test(d)) break;
	}
	return null;
}

/** A download that the network cut off, which carries on where it stopped when tried again. */
const CUT_OFF = /connect|ECONNRESET|socket|network|fetch failed|\bEOF\b|timed out|timeout|forcibly closed|max retries|dial tcp|no such host|closed during|cut off/i;

/** A connection error as words, with its code ("aborted" alone says little). */
const connError = (e: NodeJS.ErrnoException): string =>
	e.message === 'aborted' ? 'the connection to Ollama was cut off during the download' : e.code && !e.message.includes(e.code) ? `${e.message} (${e.code})` : e.message;

/** What to do about a failed download, from what Ollama said. */
export function advice(error: string): string {
	if (/newer version/i.test(error)) return 'Your Ollama is too old for this model. Update Ollama (download it again from ollama.com, or run: winget upgrade Ollama.Ollama), then run Setup again.';
	if (/no space|not enough space|disk full|ENOSPC/i.test(error)) return 'The drive is full. Free some space, then run Setup again, or download the model later from the Models screen.';
	if (CUT_OFF.test(error)) return 'The download was cut off. Check the internet connection, then run Setup again: it carries on where it stopped.';
	if (/file does not exist|not found|manifest unknown/i.test(error)) return "Ollama's library has no model by that name. Update Onyx, then run Setup again.";
	return 'Run Setup again: a download picks up where it stopped. If it fails the same way, send the message above.';
}

/** Is Ollama answering? Its version, or null. */
export async function ollamaAnswers(base: string, fetchImpl: typeof fetch = fetch): Promise<string | null> {
	try {
		const r = await fetchImpl(`${base}/api/version`, { signal: AbortSignal.timeout(3000) });
		return r.ok ? ((await r.json()) as { version?: string }).version ?? 'unknown' : null;
	} catch {
		return null;
	}
}

/** Starts Ollama if it is not answering, and waits up to `ms` for it. Returns its version, or null. */
export async function ensureOllama(base: string, ms = 30_000, fetchImpl: typeof fetch = fetch, start: () => void = startOllama): Promise<string | null> {
	const v = await ollamaAnswers(base, fetchImpl);
	if (v) return v;
	start();
	for (const t0 = Date.now(); Date.now() - t0 < ms; ) {
		await new Promise((r) => setTimeout(r, 1000));
		const w = await ollamaAnswers(base, fetchImpl);
		if (w) return w;
	}
	return null;
}

/** Starts `ollama serve` in the background, with `env` added (the settings worked out for this PC). */
export function startOllama(env: Record<string, string> = {}): void {
	try {
		const child = spawn('ollama', ['serve'], { detached: true, stdio: 'ignore', windowsHide: true, shell: process.platform === 'win32', env: { ...process.env, ...env } });
		child.on('error', () => {});
		child.unref();
	} catch {
		// Not found: the caller says so.
	}
}

/** The models Ollama has, without ":latest". */
export async function installedModels(base: string, fetchImpl: typeof fetch = fetch): Promise<Set<string>> {
	const r = await fetchImpl(`${base}/api/tags`, { signal: AbortSignal.timeout(10_000) });
	if (!r.ok) throw new Error(`Ollama did not list its models (it answered ${r.status}).`);
	const j = (await r.json()) as { models?: { name: string }[] };
	return new Set((j.models ?? []).map((m) => m.name.replace(/:latest$/, '')));
}

/**
 * Downloads a model through Ollama's API (for Setup and the Models screen alike). A download the network cut off is
 * tried again, `tries` times in all: Ollama carries on from where it stopped.
 */
export function pullWith(base: string, tries = 3, pauseMs = 3000): Pull {
	return async (id, onProgress) => {
		for (let t = 1; ; t++) {
			const err = await pullOnce(base, id, onProgress);
			if (!err || t >= tries || !CUT_OFF.test(err)) return err;
			onProgress(0, 0, `cut off (${err.slice(0, 60)}), trying again`);
			await new Promise((r) => setTimeout(r, pauseMs));
		}
	};
}

/**
 * One download, reading Ollama's stream of progress lines. Plain http rather than fetch: fetch gives up on a reply
 * that is quiet for 5 minutes, and Ollama is quiet while it checks a finished download, a minute or more for a big
 * model on a hard disk.
 */
function pullOnce(base: string, id: string, onProgress: Progress): Promise<string | null> {
	return new Promise((resolve) => {
		const layers = new Map<string, { total: number; done: number }>();
		let status = '';
		let settled = false;
		const finish = (err: string | null) => {
			if (settled) return;
			settled = true;
			resolve(err);
		};
		/** One progress line; false when it carries an error. */
		const take = (line: string): boolean => {
			if (!line.trim()) return true;
			let m: { status?: string; digest?: string; total?: number; completed?: number; error?: string };
			try {
				m = JSON.parse(line);
			} catch {
				return true;
			}
			if (m.error) {
				finish(m.error);
				return false;
			}
			status = m.status ?? status;
			if (m.total) layers.set(m.digest ?? 'one', { total: m.total, done: m.completed ?? 0 });
			const all = [...layers.values()];
			onProgress(all.reduce((s, l) => s + l.done, 0), all.reduce((s, l) => s + l.total, 0), status);
			return true;
		};
		let url: URL;
		try {
			url = new URL(`${base}/api/pull`);
		} catch {
			return finish(`${base} is not a web address`);
		}
		const req = (url.protocol === 'https:' ? httpsRequest : httpRequest)(url, { method: 'POST', headers: { 'content-type': 'application/json' } }, (res) => {
			res.setEncoding('utf8');
			let buf = '';
			if (res.statusCode !== 200) {
				res.on('data', (c: string) => (buf += c));
				res.on('end', () => {
					let said = buf.trim().slice(0, 300);
					try {
						said = (JSON.parse(buf) as { error?: string }).error ?? said;
					} catch {
						// Not JSON: as it came.
					}
					finish(`Ollama answered ${res.statusCode}${said ? `: ${said}` : ''}`);
				});
				res.on('error', (e) => finish(connError(e)));
				return;
			}
			res.on('data', (chunk: string) => {
				buf += chunk;
				for (let nl = buf.indexOf('\n'); nl >= 0 && !settled; nl = buf.indexOf('\n')) {
					const line = buf.slice(0, nl);
					buf = buf.slice(nl + 1);
					if (!take(line)) return void req.destroy();
				}
			});
			res.on('end', () => {
				if (!settled && take(buf)) finish(status === 'success' ? null : `the download ended at "${status || 'nothing'}"`);
			});
			res.on('error', (e) => finish(connError(e)));
			res.on('close', () => finish('the connection to Ollama closed during the download'));
		});
		req.on('error', (e) => finish(connError(e)));
		// "model" is the field's name now; Ollama before 0.4 read "name".
		req.end(JSON.stringify({ model: id, name: id, stream: true }));
	});
}

/**
 * Gets a model for every tier. `plan` says the first choice for each; the fallbacks are smaller models that fit, and
 * at the last a tier uses the model the tier below it got, so one model that is here is enough for Onyx to work.
 * `free` is the space left on the models' drive (null: not known), and goes down as models arrive.
 */
export async function getModels(o: { plan: Plan; have: Set<string>; pull: Pull; free: number | null; log: (line: string) => void; progress?: (line: string) => void }): Promise<ModelStep> {
	const { plan, have, log } = o;
	const t = plan.tiers;
	const fits = (id: string) => plan.fits.find((f) => f.id === id)?.where !== 'no';
	const chosen: Partial<Record<Tier, string>> = {};
	const order = (tier: Tier): string[] => {
		const ids =
			tier === 'lite' ? [t.lite, 'qwen3:1.7b', t.standard]
			: tier === 'standard' ? [t.standard, chosen.lite ?? t.lite]
			: tier === 'pro' ? [t.pro, 'qwen3:14b', chosen.standard ?? t.standard]
			: [t.max, chosen.pro ?? t.pro, 'qwen3:14b', chosen.standard ?? t.standard];
		return [...new Set(ids)].filter((id) => !!catalogEntry(id) && fits(id));
	};
	let free = o.free;
	const problems: string[] = [];
	// A model that could not be had for one tier is not tried (or reported) again for the next.
	const missed = new Set<string>();
	for (const tier of TIERS) {
		for (const id of order(tier)) {
			if (missed.has(id)) continue;
			if (have.has(id)) {
				chosen[tier] = id;
				log(`${tier}: ${id}, already downloaded`);
				break;
			}
			const size = (catalogEntry(id)?.weightsGb ?? 0) * GB;
			// A little over the model's size: Ollama needs room to unpack as it goes.
			if (free !== null && size * 1.05 > free) {
				const why = `${id} needs about ${Math.ceil(size / GB)} GB, and only ${Math.floor(free / GB)} GB is free on the drive Ollama keeps its models on`;
				problems.push(`${why}. ${advice('no space')}`);
				log(`${tier}: skipped ${id}: ${why}`);
				missed.add(id);
				continue;
			}
			log(`${tier}: downloading ${id} (about ${Math.ceil(size / GB)} GB; safe to stop and run again, it carries on where it stopped)`);
			let last = 0;
			let lastStatus = '';
			const err = await o.pull(id, (done, total, status) => {
				const now = Date.now();
				const downloading = total > 0 && /^pulling [0-9a-f]/.test(status);
				const kind = downloading ? 'pulling' : status;
				if (status === 'success' || (kind === lastStatus && now - last < 400)) return;
				last = now;
				lastStatus = kind;
				o.progress?.(downloading ? `  ${id}  ${Math.floor((done / total) * 100)}% of ${(total / GB).toFixed(1)} GB` : `  ${id}  ${status}`);
			});
			if (!err) {
				have.add(id);
				chosen[tier] = id;
				if (free !== null) free -= size;
				log(`${tier}: ${id} downloaded`);
				break;
			}
			problems.push(`${id} could not be downloaded. Ollama said: ${err.replace(/[.\s]+$/, '')}. ${advice(err)}`);
			log(`${tier}: ${id} failed: ${err}`);
			missed.add(id);
		}
		if (!chosen[tier]) log(`${tier}: no model could be had`);
	}
	return { chosen, problems, ok: !!chosen.lite && !!chosen.standard };
}

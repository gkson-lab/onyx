import { createServer, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { advice, ensureOllama, getModels, pullWith, type Pull } from '../src/setup.ts';
import { plan, type Hardware } from '../src/hardware.ts';

const pc: Hardware = { gpu: { name: 'NVIDIA GeForce RTX 5060 Ti', vramGb: 15.9, bandwidthGbs: 448 }, ramGb: 32, ramMts: 6000, cpu: 'AMD Ryzen 7 8700F', notes: [] };
const laptop: Hardware = { gpu: null, ramGb: 16, ramMts: null, cpu: 'Intel Core i5', notes: [] };
const GB = 1024 ** 3;
const quiet = { log: () => {}, progress: () => {} };
/** A pull that fails for the models in `fail` (with that message), and for the rest says `otherwise`. */
const pulls = (fail: Record<string, string> = {}, otherwise: string | null = null) => {
	const asked: string[] = [];
	const pull: Pull = async (id, onProgress) => {
		asked.push(id);
		onProgress(1, 2, 'pulling 3f2a8f0e1d27');
		return fail[id] ?? otherwise;
	};
	return { pull, asked };
};
const TOO_OLD = 'pull model manifest: 412: The model you are attempting to pull requires a newer version of Ollama.';

describe('getting the models at setup', () => {
	it('an Ollama too old for gpt-oss: Pro uses the 14B already here, and says how to get gpt-oss', async () => {
		const { pull, asked } = pulls({ 'gpt-oss:20b': TOO_OLD });
		const r = await getModels({ plan: plan(pc), have: new Set(['qwen3:4b-instruct', 'qwen3:8b', 'qwen3:14b', 'qwen3:30b']), pull, free: 200 * GB, ...quiet });
		expect(r).toMatchObject({ ok: true, chosen: { lite: 'qwen3:4b-instruct', standard: 'qwen3:8b', pro: 'qwen3:14b', max: 'qwen3:30b' } });
		expect(asked).toEqual(['gpt-oss:20b']);
		expect(r.problems).toEqual([`gpt-oss:20b could not be downloaded. Ollama said: ${TOO_OLD.slice(0, -1)}. Your Ollama is too old for this model. Update Ollama (download it again from ollama.com, or run: winget upgrade Ollama.Ollama), then run Setup again.`]);
	});

	it('a Lite model that cannot be had: Lite uses the Standard model that is here, and setup goes on', async () => {
		const { pull, asked } = pulls({ 'qwen3:1.7b': TOO_OLD });
		const p = plan(laptop);
		expect(p.tiers).toMatchObject({ lite: 'qwen3:1.7b', standard: 'qwen3:4b-instruct' });
		const r = await getModels({ plan: p, have: new Set(['qwen3:4b-instruct']), pull, free: 50 * GB, ...quiet });
		expect(asked).toEqual(['qwen3:1.7b']);
		expect(r).toMatchObject({ ok: true, chosen: { lite: 'qwen3:4b-instruct', standard: 'qwen3:4b-instruct' } });
		expect(r.problems).toHaveLength(1);
	});

	it('a nearly full drive: the big models are skipped for smaller ones that fit, before any download fails', async () => {
		const { pull, asked } = pulls();
		const r = await getModels({ plan: plan(pc), have: new Set(), pull, free: 20 * GB, ...quiet });
		// 4B (2.5 GB) and 8B (5.2 GB) arrive; gpt-oss (13 GB) does not fit in what is left, the 14B (9.3 GB) does;
		// the 30B (19 GB) does not, so Max uses the 14B too.
		expect(asked).toEqual(['qwen3:4b-instruct', 'qwen3:8b', 'qwen3:14b']);
		expect(r).toMatchObject({ ok: true, chosen: { lite: 'qwen3:4b-instruct', standard: 'qwen3:8b', pro: 'qwen3:14b', max: 'qwen3:14b' } });
		expect(r.problems.map((x) => x.split(',')[0])).toEqual(['gpt-oss:20b needs about 13 GB', 'qwen3:30b needs about 19 GB']);
	});

	it('no model at all: setup stops, with the reasons, each model tried once', async () => {
		const { pull, asked } = pulls({}, 'read tcp 10.0.0.2:51234->104.21.0.1:443: wsarecv: An existing connection was forcibly closed by the remote host.');
		const r = await getModels({ plan: plan(pc), have: new Set(), pull, free: null, ...quiet });
		expect(r.ok).toBe(false);
		expect(r.chosen).toEqual({});
		expect(asked).toEqual(['qwen3:4b-instruct', 'qwen3:1.7b', 'qwen3:8b', 'gpt-oss:20b', 'qwen3:14b', 'qwen3:30b']);
		expect(r.problems[0]).toMatch(/Check the internet connection/);
	});

	it('everything already here: nothing is downloaded', async () => {
		const { pull, asked } = pulls();
		const r = await getModels({ plan: plan(pc), have: new Set(['qwen3:4b-instruct', 'qwen3:8b', 'gpt-oss:20b', 'qwen3:30b']), pull, free: 1 * GB, ...quiet });
		expect(asked).toEqual([]);
		expect(r).toMatchObject({ ok: true, problems: [], chosen: { pro: 'gpt-oss:20b' } });
	});

	it('starts Ollama when it is not answering, and waits for it', async () => {
		let started = false;
		const f = (async () => (started ? Response.json({ version: '0.40.16' }) : Promise.reject(new Error('connect ECONNREFUSED')))) as unknown as typeof fetch;
		expect(await ensureOllama('http://ollama.test', 5000, f, () => (started = true))).toBe('0.40.16');
		expect(started).toBe(true);
		expect(await ensureOllama('http://ollama.test', 1500, (async () => Promise.reject(new Error('no'))) as unknown as typeof fetch, () => {})).toBeNull();
	});
});

describe("downloading through Ollama's API", () => {
	const servers: { close: () => void }[] = [];
	afterEach(() => servers.splice(0).forEach((s) => s.close()));
	/** A stand-in Ollama: `answer` gets each request's body (and how many came before it) and writes the reply. */
	const ollama = (answer: (body: Record<string, unknown>, res: ServerResponse, n: number) => void) =>
		new Promise<string>((ok) => {
			let n = 0;
			const s = createServer(async (req, res) => {
				let raw = '';
				for await (const c of req) raw += c;
				answer(JSON.parse(raw || '{}'), res, n++);
			});
			servers.push(s);
			s.listen(0, '127.0.0.1', () => ok(`http://127.0.0.1:${(s.address() as AddressInfo).port}`));
		});
	const lines = (res: ServerResponse, ls: object[], end = true) => {
		res.writeHead(200, { 'content-type': 'application/x-ndjson' });
		for (const l of ls) res.write(`${JSON.stringify(l)}\n`);
		if (end) res.end();
	};

	it('reports progress over every layer, with what Ollama is doing, and asks by both field names', async () => {
		let asked: Record<string, unknown> = {};
		const base = await ollama((body, res) => {
			asked = body;
			lines(res, [{ status: 'pulling manifest' }, { status: 'pulling a', digest: 'a', total: 100, completed: 50 }, { status: 'pulling b', digest: 'b', total: 300, completed: 300 }, { status: 'pulling a', digest: 'a', total: 100, completed: 100 }, { status: 'verifying sha256 digest' }, { status: 'success' }]);
		});
		const seen: [number, number, string][] = [];
		expect(await pullWith(base)('qwen3:8b', (d, t, s) => seen.push([d, t, s]))).toBeNull();
		expect(asked).toEqual({ model: 'qwen3:8b', name: 'qwen3:8b', stream: true });
		expect(seen).toEqual([[0, 0, 'pulling manifest'], [50, 100, 'pulling a'], [350, 400, 'pulling b'], [400, 400, 'pulling a'], [400, 400, 'verifying sha256 digest'], [400, 400, 'success']]);
	});

	it("gives back Ollama's error, from the stream or from the reply", async () => {
		const full = await ollama((_, res) => lines(res, [{ status: 'pulling manifest' }, { error: 'write /models/blobs/x: no space left on device' }], false));
		const err = await pullWith(full)('gpt-oss:20b', () => {});
		expect(err).toBe('write /models/blobs/x: no space left on device');
		expect(advice(err!)).toMatch(/^The drive is full/);
		const old = await ollama((_, res) => res.writeHead(412, { 'content-type': 'application/json' }).end(JSON.stringify({ error: TOO_OLD })));
		expect(await pullWith(old)('gpt-oss:20b', () => {})).toBe(`Ollama answered 412: ${TOO_OLD}`);
		expect(await pullWith('http://127.0.0.1:1', 1)('qwen3:8b', () => {})).toMatch(/ECONNREFUSED/);
	});

	it('a download the network cuts off is tried again, and carries on', async () => {
		const base = await ollama((_, res, n) => {
			if (n === 0) {
				lines(res, [{ status: 'pulling a', digest: 'a', total: 100, completed: 40 }], false);
				return void setTimeout(() => res.socket?.destroy(), 20);
			}
			lines(res, [{ status: 'pulling a', digest: 'a', total: 100, completed: 100 }, { status: 'success' }]);
		});
		const statuses: string[] = [];
		expect(await pullWith(base, 3, 10)('qwen3:8b', (_d, _t, s) => statuses.push(s))).toBeNull();
		expect(statuses).toEqual(['pulling a', expect.stringMatching(/^cut off \(.*\), trying again$/), 'pulling a', 'success']);
		// An error that trying again would not mend is not tried again.
		let tries = 0;
		const refused = await ollama((_, res) => (tries++, lines(res, [{ error: TOO_OLD }])));
		await pullWith(refused, 3, 10)('gpt-oss:20b', () => {});
		expect(tries).toBe(1);
	});
});

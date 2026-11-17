// Which Qwen models this PC can run, and how fast. Everything here is arithmetic on published sizes: a model's
// weights, plus the memory its context needs (the KV cache), plus some working memory, against the graphics card's
// memory and then the system's. Speed is estimated from memory bandwidth, because generating a token means reading
// the model's weights once. The estimates are rough (expect +/- 40%): `ollama run <model> --verbose` measures real ones.
import { execFile } from 'node:child_process';
import { cpus, totalmem } from 'node:os';

export interface Hardware {
	gpu: { name: string; vramGb: number; bandwidthGbs: number | null } | null;
	ramGb: number;
	/** DDR transfer rate, e.g. 6000. Null when not known; a typical DDR5 speed is then assumed. */
	ramMts: number | null;
	cpu: string;
	notes: string[];
}

/**
 * Models in Ollama, at their default quantization (Q4_K_M; gpt-oss ships in MXFP4). kvKb: KV cache per token at fp16
 * (2 x layers x KV heads x head size x 2 bytes; sliding-window models count less). tools: reliable tool calls, which
 * every agent needs; a model without them is only offered for plain chat. vision: reads images.
 * The first six are Qwen3, the default family; the planner picks tiers from them, plus gpt-oss for Pro.
 */
export interface CatalogEntry { id: string; maker: string; params: string; weightsGb: number; activeGb: number; kvKb: number; moe: boolean; tools: boolean; vision?: boolean; good: string; extra?: Record<string, unknown> }
export const CATALOG: readonly CatalogEntry[] = [
	{ id: 'qwen3:1.7b', maker: 'Alibaba', params: '1.7B', weightsGb: 1.4, activeGb: 1.4, kvKb: 112, moe: false, tools: true, good: 'routing on a slow PC', extra: { reasoning_effort: 'none' } },
	{ id: 'qwen3:4b-instruct', maker: 'Alibaba', params: '4B', weightsGb: 2.5, activeGb: 2.5, kvKb: 144, moe: false, tools: true, good: 'routing and quick replies', extra: { reasoning_effort: 'none' } },
	{ id: 'qwen3:8b', maker: 'Alibaba', params: '8B', weightsGb: 5.2, activeGb: 5.2, kvKb: 144, moe: false, tools: true, good: 'everyday chat and agent steps', extra: { reasoning_effort: 'none' } },
	{ id: 'qwen3:14b', maker: 'Alibaba', params: '14B', weightsGb: 9.3, activeGb: 9.3, kvKb: 160, moe: false, tools: true, good: 'code and tool use', extra: { reasoning_effort: 'none' } },
	{ id: 'qwen3:30b', maker: 'Alibaba', params: '30B MoE, 3B active', weightsGb: 19, activeGb: 2.1, kvKb: 96, moe: true, tools: true, good: 'hard reasoning, thinks first' },
	{ id: 'qwen3:32b', maker: 'Alibaba', params: '32B', weightsGb: 20, activeGb: 20, kvKb: 256, moe: false, tools: true, good: 'hard reasoning on a big card' },
	{ id: 'gpt-oss:20b', maker: 'OpenAI', params: '21B MoE, 3.6B active', weightsGb: 13, activeGb: 2.4, kvKb: 48, moe: true, tools: true, good: 'reasoning and tool use, a strong Pro', extra: { reasoning_effort: 'low' } },
	{ id: 'qwen3-coder:30b', maker: 'Alibaba', params: '30B MoE, 3.3B active', weightsGb: 19, activeGb: 2.2, kvKb: 96, moe: true, tools: true, good: 'writing code' },
	{ id: 'mistral-small3.2:24b', maker: 'Mistral', params: '24B', weightsGb: 15, activeGb: 15, kvKb: 160, moe: false, tools: true, vision: true, good: 'general chat and writing' },
	{ id: 'gemma3:12b', maker: 'Google', params: '12B', weightsGb: 8.1, activeGb: 8.1, kvKb: 120, moe: false, tools: false, vision: true, good: 'reading images, other languages' },
	{ id: 'deepseek-r1:14b', maker: 'DeepSeek', params: '14B', weightsGb: 9, activeGb: 9, kvKb: 192, moe: false, tools: false, good: 'step-by-step reasoning (chat only)' },
	{ id: 'phi4:14b', maker: 'Microsoft', params: '14B', weightsGb: 9.1, activeGb: 9.1, kvKb: 200, moe: false, tools: false, good: 'maths and logic (chat only)' },
	{ id: 'llama3.1:8b', maker: 'Meta', params: '8B', weightsGb: 4.9, activeGb: 4.9, kvKb: 128, moe: false, tools: true, good: 'a fast everyday model' },
];
export type ModelId = string;
export const catalogEntry = (id: string): CatalogEntry | undefined => CATALOG.find((m) => m.id === id);

// Memory bandwidth in GB/s of common NVIDIA cards. Generation speed follows it almost directly.
const GPU_BANDWIDTH: [RegExp, number][] = [
	[/5090/, 1792], [/5080/, 960], [/5070 ?ti/i, 896], [/5070/, 672], [/5060 ?ti/i, 448], [/5060/, 448],
	[/4090/, 1008], [/4080 ?super/i, 736], [/4080/, 717], [/4070 ?ti ?super/i, 672], [/4070/, 504], [/4060 ?ti/i, 288], [/4060/, 272],
	[/3090 ?ti/i, 1008], [/3090/, 936], [/3080 ?ti/i, 912], [/3080/, 760], [/3070/, 448], [/3060 ?ti/i, 448], [/3060/, 360],
];
export const bandwidthOf = (gpuName: string): number | null => GPU_BANDWIDTH.find(([re]) => re.test(gpuName))?.[1] ?? null;

// Windows' desktop, the browser showing Onyx and the driver hold 1 to 2 GB of the card. 1 GB was too little: a model
// that does not quite fit is split onto the processor (slow) or fails to load.
const GPU_RESERVED_GB = 2.0;
// Onyx tells Ollama to keep the context cache at 8 bits (OLLAMA_KV_CACHE_TYPE=q8_0), which halves it, with no
// noticeable loss in answers.
const KV_FACTOR = 0.5;
const RAM_RESERVED_GB = 8; // Windows, Onyx, a browser
const OVERHEAD_GB = 0.6; // working memory beside the weights and the cache
const GPU_EFF = 0.75; // share of the card's bandwidth reached in practice (fits published Qwen3 14B results)
const RAM_EFF = 0.6;
const SPLIT_PENALTY = 0.8; // a model split across card and system memory loses some more to the handoff
const MOE_EFF = 0.5; // mixture-of-experts reads scattered experts, so it gets less out of the bandwidth

export interface Fit {
	id: ModelId;
	maker: string;
	tools: boolean;
	vision: boolean;
	good: string;
	params: string;
	needGb: number;
	where: 'gpu' | 'split' | 'cpu' | 'no';
	gpuShare: number;
	tokensPerSec: number | null;
}

export function fit(hw: Hardware, model: CatalogEntry, context: number): Fit {
	const about = { maker: model.maker, tools: model.tools, vision: !!model.vision, good: model.good };
	const needGb = Math.round((model.weightsGb + (model.kvKb * context * KV_FACTOR) / 1024 / 1024 + OVERHEAD_GB) * 10) / 10;
	const gpuFree = hw.gpu ? Math.max(0, hw.gpu.vramGb - GPU_RESERVED_GB) : 0;
	const ramFree = Math.max(0, hw.ramGb - RAM_RESERVED_GB);
	const share = needGb <= gpuFree ? 1 : gpuFree / needGb;
	const where = share === 1 ? 'gpu' : needGb > gpuFree + ramFree ? 'no' : share > 0 ? 'split' : 'cpu';
	if (where === 'no') return { ...about, id: model.id, params: model.params, needGb, where, gpuShare: 0, tokensPerSec: null };
	const gbw = (hw.gpu?.bandwidthGbs ?? 400) * GPU_EFF;
	const rbw = ((hw.ramMts ?? 5600) * 8 * 2) / 1000 * RAM_EFF; // two memory channels, 8 bytes each
	const seconds = (share * model.activeGb) / gbw + ((1 - share) * model.activeGb) / rbw;
	let tps = 1 / seconds;
	if (where === 'split') tps *= SPLIT_PENALTY;
	if (model.moe) tps *= MOE_EFF;
	return { ...about, id: model.id, params: model.params, needGb, where, gpuShare: Math.round(share * 100) / 100, tokensPerSec: Math.round(tps) };
}

export interface Plan {
	context: number;
	fits: Fit[];
	tiers: { lite: ModelId; standard: ModelId; pro: ModelId; max: ModelId };
	/** The model that reads attached images, if this PC can run it. */
	vision: ModelId | null;
	reasons: Record<'lite' | 'standard' | 'pro' | 'max', string>;
	env: Record<string, string>;
	warnings: string[];
}

/**
 * The context to run with: the largest of 32K, 16K and 8K at which Lite and Standard fit on the card together (so an
 * ordinary message never waits for a model to load) and 14B still fits on it alone. Failing that, the largest at
 * which Standard fits on the card.
 */
function chooseContext(hw: Hardware): number {
	const on = (i: number, ctx: number) => fit(hw, CATALOG[i]!, ctx);
	const room = hw.gpu ? hw.gpu.vramGb - GPU_RESERVED_GB : 0;
	// 32K only on a card of 24 GB or more: on a smaller one it leaves too little room to spare.
	const sizes = hw.gpu && hw.gpu.vramGb >= 24 ? [32768, 16384, 8192] : [16384, 8192];
	for (const ctx of sizes) if (on(1, ctx).needGb + on(2, ctx).needGb <= room && on(3, ctx).where === 'gpu') return ctx;
	for (const ctx of sizes.slice(0, -1)) if (on(2, ctx).where === 'gpu') return ctx;
	return 8192;
}

export function plan(hw: Hardware): Plan {
	const context = chooseContext(hw);
	const fits = CATALOG.map((m) => fit(hw, m, context));
	const vision = fits.find((x) => x.id === 'gemma3:12b' && x.where !== 'no')?.id ?? null;
	const f = (id: ModelId) => fits.find((x) => x.id === id)!;
	const fast = (id: ModelId, min: number) => (f(id).tokensPerSec ?? 0) >= min;
	const say = (id: ModelId) => `${f(id).tokensPerSec ?? '?'} tokens/s, ${f(id).where === 'gpu' ? 'all on the graphics card' : f(id).where === 'split' ? `${Math.round(f(id).gpuShare * 100)}% on the graphics card` : 'on the processor'}`;

	// Lite runs on every message (it routes), so it must be quick, and must not think: the Instruct 4B answers at once.
	const lite: ModelId = fast('qwen3:4b-instruct', 25) ? 'qwen3:4b-instruct' : 'qwen3:1.7b';
	const standard: ModelId = fast('qwen3:8b', 20) ? 'qwen3:8b' : 'qwen3:4b-instruct';
	// Pro does multi-step tool work: 14B is the strongest dense model that runs well; the 30B MoE when 14B would be slow.
	// OpenAI's gpt-oss 20B reasons and calls tools better than Qwen3 14B, and as a mixture of experts it stays quick
	// even when a little of it spills into system memory.
	const pro: ModelId = fast('gpt-oss:20b', 25) ? 'gpt-oss:20b' : fast('qwen3:14b', 15) ? 'qwen3:14b' : fast('qwen3:30b', 15) ? 'qwen3:30b' : standard;
	// Max thinks before it answers, often for thousands of tokens, so it needs real speed: 32B only if it is quick.
	const max: ModelId = fast('qwen3:32b', 12) ? 'qwen3:32b' : fast('qwen3:30b', 10) ? 'qwen3:30b' : pro;

	const warnings: string[] = [];
	if (!hw.gpu) warnings.push('No NVIDIA graphics card was found, so everything runs on the processor, slowly. If you have one, check that its driver is installed (nvidia-smi should work).');
	if (hw.gpu && hw.gpu.bandwidthGbs === null) warnings.push(`The speed of "${hw.gpu.name}" isn't in Onyx's table, so 400 GB/s was assumed.`);
	if (hw.ramMts === null) warnings.push('The memory speed was not given, so DDR5-5600 was assumed. Pass --ram-speed for a closer estimate.');
	const pair = f(lite).needGb + f(standard).needGb;
	if (hw.gpu && pair <= hw.gpu.vramGb - GPU_RESERVED_GB) warnings.push(`Lite and Standard fit on the card together (${pair.toFixed(1)} GB), so ordinary messages never wait for a model to load.`);
	else if (hw.gpu) warnings.push('Lite and Standard do not both fit on the card, so Ollama swaps them: expect a pause of a few seconds when it does.');
	if (pro !== standard) warnings.push(`Pro and Max load when first needed, which takes a few seconds from a fast SSD. After 5 idle minutes Ollama unloads them.`);
	return {
		context,
		fits,
		tiers: { lite, standard, pro, max },
		vision,
		reasons: { lite: say(lite), standard: say(standard), pro: say(pro), max: say(max) },
		// Ollama's default context on a card under 24 GB can be as small as 4K, too little for agents reading tool results.
		env: {
			OLLAMA_CONTEXT_LENGTH: String(context),
			OLLAMA_FLASH_ATTENTION: '1',
			OLLAMA_KV_CACHE_TYPE: 'q8_0',
			OLLAMA_MAX_LOADED_MODELS: '3',
			// Lite and Standard stay loaded for half an hour after use, not Ollama's default 5 minutes.
			OLLAMA_KEEP_ALIVE: '30m',
			// Ollama keeps this much of the card free for Windows and the browser, so a model that would not fit is split
			// onto the processor instead of failing to load.
			...(hw.gpu ? { OLLAMA_GPU_OVERHEAD: String(1024 ** 3) } : {}),
		},
		warnings,
	};
}

const run = (cmd: string, args: string[]): Promise<string> => new Promise((done) => execFile(cmd, args, { timeout: 8000, windowsHide: true }, (err, out) => done(err ? '' : String(out))));

/** Looks at this PC: the NVIDIA card through nvidia-smi, memory and processor through Node. */
export async function detect(o: { exec?: typeof run } = {}): Promise<Hardware> {
	const exec = o.exec ?? run;
	const notes: string[] = [];
	const smi = (await exec('nvidia-smi', ['--query-gpu=name,memory.total', '--format=csv,noheader,nounits'])).trim().split('\n')[0];
	let gpu: Hardware['gpu'] = null;
	if (smi) {
		const [name, mib] = smi.split(',').map((x) => x.trim());
		gpu = { name: name!, vramGb: Math.round((Number(mib) / 1024) * 10) / 10, bandwidthGbs: bandwidthOf(name!) };
	}
	let ramMts: number | null = null;
	if (process.platform === 'win32') {
		const speed = (await exec('powershell', ['-NoProfile', '-Command', '(Get-CimInstance Win32_PhysicalMemory | Select-Object -First 1).ConfiguredClockSpeed'])).trim();
		if (/^\d+$/.test(speed)) ramMts = Number(speed);
	}
	return { gpu, ramGb: Math.round(totalmem() / 1024 ** 3), ramMts, cpu: cpus()[0]?.model.trim() ?? 'unknown', notes };
}

/**
 * tiers.yaml with each tier's local model set to the plan's choice. Comments and everything else are kept; only the
 * `id` of the first local model in each tier changes.
 */
export async function applyToTiers(yamlText: string, tiers: Plan['tiers']): Promise<{ yaml: string; changed: string[] }> {
	const { parseDocument } = await import('yaml');
	const doc = parseDocument(yamlText);
	const data = doc.toJS() as { providers: Record<string, { local: boolean }>; models: Record<string, { provider: string; id: string }>; tiers: Record<string, { models: string[] }> };
	const changed: string[] = [];
	for (const [tier, id] of Object.entries(tiers)) {
		const key = data.tiers[tier]?.models.find((k) => data.providers[data.models[k]?.provider ?? '']?.local);
		if (!key || data.models[key]!.id === id) continue;
		doc.setIn(['models', key, 'id'], id);
		const extra = catalogEntry(id)?.extra;
		if (extra) doc.setIn(['models', key, 'extra'], doc.createNode(extra, { flow: true }));
		else doc.deleteIn(['models', key, 'extra']);
		changed.push(`${tier}: ${data.models[key]!.id} -> ${id}`);
	}
	// lineWidth 0 keeps each model on its one line, as written.
	return { yaml: doc.toString({ lineWidth: 0 }), changed };
}

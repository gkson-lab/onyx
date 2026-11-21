// What Setup would pick for a PC, and how fast it should run: the same sums Setup and the Models screen do, copied from
// agents/apps/server/src/hardware.ts (fit, chooseContext and plan, unchanged). Keep the two in step when the planner
// changes. Everything is arithmetic on published model sizes against the graphics card's memory and then the system's;
// speed comes from memory bandwidth. Expect +/- 40%.

export const CATALOG = [
	{ id: 'qwen3:1.7b', maker: 'Alibaba', params: '1.7B', weightsGb: 1.4, activeGb: 1.4, kvKb: 112, moe: false, tools: true },
	{ id: 'qwen3:4b-instruct', maker: 'Alibaba', params: '4B', weightsGb: 2.5, activeGb: 2.5, kvKb: 144, moe: false, tools: true },
	{ id: 'qwen3:8b', maker: 'Alibaba', params: '8B', weightsGb: 5.2, activeGb: 5.2, kvKb: 144, moe: false, tools: true },
	{ id: 'qwen3:14b', maker: 'Alibaba', params: '14B', weightsGb: 9.3, activeGb: 9.3, kvKb: 160, moe: false, tools: true },
	{ id: 'qwen3:30b', maker: 'Alibaba', params: '30B MoE, 3B active', weightsGb: 19, activeGb: 2.1, kvKb: 96, moe: true, tools: true },
	{ id: 'qwen3:32b', maker: 'Alibaba', params: '32B', weightsGb: 20, activeGb: 20, kvKb: 256, moe: false, tools: true },
	{ id: 'gpt-oss:20b', maker: 'OpenAI', params: '21B MoE, 3.6B active', weightsGb: 13, activeGb: 2.4, kvKb: 48, moe: true, tools: true },
	{ id: 'qwen3-coder:30b', maker: 'Alibaba', params: '30B MoE, 3.3B active', weightsGb: 19, activeGb: 2.2, kvKb: 96, moe: true, tools: true },
	{ id: 'mistral-small3.2:24b', maker: 'Mistral', params: '24B', weightsGb: 15, activeGb: 15, kvKb: 160, moe: false, tools: true, vision: true },
	{ id: 'gemma3:12b', maker: 'Google', params: '12B', weightsGb: 8.1, activeGb: 8.1, kvKb: 120, moe: false, tools: false, vision: true },
	{ id: 'deepseek-r1:14b', maker: 'DeepSeek', params: '14B', weightsGb: 9, activeGb: 9, kvKb: 192, moe: false, tools: false },
	{ id: 'phi4:14b', maker: 'Microsoft', params: '14B', weightsGb: 9.1, activeGb: 9.1, kvKb: 200, moe: false, tools: false },
	{ id: 'llama3.1:8b', maker: 'Meta', params: '8B', weightsGb: 4.9, activeGb: 4.9, kvKb: 128, moe: false, tools: true },
];

// NVIDIA cards with the memory they come with and the bandwidth hardware.ts uses for them.
export const CARDS = [
	{ name: 'RTX 5090', vramGb: 32, bandwidthGbs: 1792 },
	{ name: 'RTX 5080', vramGb: 16, bandwidthGbs: 960 },
	{ name: 'RTX 5070 Ti', vramGb: 16, bandwidthGbs: 896 },
	{ name: 'RTX 5070', vramGb: 12, bandwidthGbs: 672 },
	{ name: 'RTX 5060 Ti 16 GB', vramGb: 16, bandwidthGbs: 448 },
	{ name: 'RTX 5060 Ti 8 GB', vramGb: 8, bandwidthGbs: 448 },
	{ name: 'RTX 5060', vramGb: 8, bandwidthGbs: 448 },
	{ name: 'RTX 4090', vramGb: 24, bandwidthGbs: 1008 },
	{ name: 'RTX 4080', vramGb: 16, bandwidthGbs: 717 },
	{ name: 'RTX 4070 Ti Super', vramGb: 16, bandwidthGbs: 672 },
	{ name: 'RTX 4070', vramGb: 12, bandwidthGbs: 504 },
	{ name: 'RTX 4060 Ti 16 GB', vramGb: 16, bandwidthGbs: 288 },
	{ name: 'RTX 4060 Ti 8 GB', vramGb: 8, bandwidthGbs: 288 },
	{ name: 'RTX 4060', vramGb: 8, bandwidthGbs: 272 },
	{ name: 'RTX 3090', vramGb: 24, bandwidthGbs: 936 },
	{ name: 'RTX 3080 10 GB', vramGb: 10, bandwidthGbs: 760 },
	{ name: 'RTX 3060 12 GB', vramGb: 12, bandwidthGbs: 360 },
	{ name: 'No NVIDIA card', vramGb: 0, bandwidthGbs: null },
];

const GPU_RESERVED_GB = 2.0;
const KV_FACTOR = 0.5;
const RAM_RESERVED_GB = 8;
const OVERHEAD_GB = 0.6;
const GPU_EFF = 0.75;
const RAM_EFF = 0.6;
const SPLIT_PENALTY = 0.8;
const MOE_EFF = 0.5;

export function fit(hw, model, context) {
	const needGb = Math.round((model.weightsGb + (model.kvKb * context * KV_FACTOR) / 1024 / 1024 + OVERHEAD_GB) * 10) / 10;
	const gpuFree = hw.gpu ? Math.max(0, hw.gpu.vramGb - GPU_RESERVED_GB) : 0;
	const ramFree = Math.max(0, hw.ramGb - RAM_RESERVED_GB);
	const share = needGb <= gpuFree ? 1 : gpuFree / needGb;
	const where = share === 1 ? 'gpu' : needGb > gpuFree + ramFree ? 'no' : share > 0 ? 'split' : 'cpu';
	if (where === 'no') return { id: model.id, needGb, where, gpuShare: 0, tokensPerSec: null };
	const gbw = (hw.gpu?.bandwidthGbs ?? 400) * GPU_EFF;
	const rbw = (((hw.ramMts ?? 5600) * 8 * 2) / 1000) * RAM_EFF;
	const seconds = (share * model.activeGb) / gbw + ((1 - share) * model.activeGb) / rbw;
	let tps = 1 / seconds;
	if (where === 'split') tps *= SPLIT_PENALTY;
	if (model.moe) tps *= MOE_EFF;
	return { id: model.id, needGb, where, gpuShare: Math.round(share * 100) / 100, tokensPerSec: Math.round(tps) };
}

function chooseContext(hw) {
	const on = (i, ctx) => fit(hw, CATALOG[i], ctx);
	const room = hw.gpu ? hw.gpu.vramGb - GPU_RESERVED_GB : 0;
	const sizes = hw.gpu && hw.gpu.vramGb >= 24 ? [32768, 16384, 8192] : [16384, 8192];
	for (const ctx of sizes) if (on(1, ctx).needGb + on(2, ctx).needGb <= room && on(3, ctx).where === 'gpu') return ctx;
	for (const ctx of sizes.slice(0, -1)) if (on(2, ctx).where === 'gpu') return ctx;
	return 8192;
}

/** hw: { gpu: { vramGb, bandwidthGbs } | null, ramGb, ramMts: null } */
export function plan(hw) {
	const context = chooseContext(hw);
	const fits = CATALOG.map((m) => fit(hw, m, context));
	const f = (id) => fits.find((x) => x.id === id);
	const fast = (id, min) => (f(id).tokensPerSec ?? 0) >= min;
	const lite = fast('qwen3:4b-instruct', 25) ? 'qwen3:4b-instruct' : 'qwen3:1.7b';
	const standard = fast('qwen3:8b', 20) ? 'qwen3:8b' : 'qwen3:4b-instruct';
	const pro = fast('gpt-oss:20b', 25) ? 'gpt-oss:20b' : fast('qwen3:14b', 15) ? 'qwen3:14b' : fast('qwen3:30b', 15) ? 'qwen3:30b' : standard;
	const max = fast('qwen3:32b', 12) ? 'qwen3:32b' : fast('qwen3:30b', 10) ? 'qwen3:30b' : pro;
	const tiers = { lite, standard, pro, max };
	const pair = f(lite).needGb + f(standard).needGb;
	const together = !!hw.gpu && pair <= hw.gpu.vramGb - GPU_RESERVED_GB;
	// Setup downloads each tier's model once.
	const downloadGb = [...new Set(Object.values(tiers))].reduce((sum, id) => sum + CATALOG.find((m) => m.id === id).weightsGb, 0);
	return { context, fits, tiers, together, pair, downloadGb, vision: f('gemma3:12b').where !== 'no' };
}

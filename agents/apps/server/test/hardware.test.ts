import { describe, expect, it } from 'vitest';
import { bandwidthOf, detect, plan, type Hardware } from '../src/hardware.ts';

const pc = (vramGb: number | null, ramGb = 32, ramMts: number | null = 6000): Hardware => ({ gpu: vramGb ? { name: 'NVIDIA GeForce RTX 5060 Ti', vramGb, bandwidthGbs: 448 } : null, ramGb, ramMts, cpu: 'AMD Ryzen 7 8700F', notes: [] });

describe('which models a PC can run', () => {
	it('an RTX 5060 Ti 16 GB with 32 GB of DDR5-6000 runs every tier, with 14B fully on the card at 16K context', () => {
		const p = plan(pc(15.9));
		expect(p.context).toBe(16384);
		expect(p.tiers).toEqual({ lite: 'qwen3:4b', standard: 'qwen3:8b', pro: 'qwen3:14b', max: 'qwen3:30b' });
		const f = Object.fromEntries(p.fits.map((x) => [x.id, x]));
		expect(f['qwen3:14b']).toMatchObject({ where: 'gpu' });
		// Published llama.cpp results for Qwen3 14B on this card: about 33 tokens/s at 16K context, 41 at 4K.
		expect(f['qwen3:14b']!.tokensPerSec).toBeGreaterThanOrEqual(28);
		expect(f['qwen3:14b']!.tokensPerSec).toBeLessThanOrEqual(45);
		expect(f['qwen3:30b']).toMatchObject({ where: 'split' });
		expect(f['qwen3:32b']!.where).toBe('split');
		expect(f['qwen3:32b']!.tokensPerSec).toBeLessThan(8);
		expect(p.env.OLLAMA_CONTEXT_LENGTH).toBe('16384');
		expect(p.warnings.some((w) => w.startsWith('Lite and Standard fit on the card together'))).toBe(true);
	});

	it('the 8 GB version keeps Pro on 14B, split with system memory, and drops to 8K context', () => {
		const p = plan(pc(8));
		expect(p.context).toBe(8192);
		expect(p.tiers.lite).toBe('qwen3:4b');
		const f14 = p.fits.find((x) => x.id === 'qwen3:14b')!;
		expect(f14.where).toBe('split');
		expect(['qwen3:14b', 'qwen3:30b']).toContain(p.tiers.pro);
	});

	it('no graphics card: everything on the processor, small models only, and it says why', () => {
		const p = plan(pc(null, 16, 4800));
		expect(p.fits.every((x) => x.where === 'cpu' || x.where === 'no')).toBe(true);
		expect(p.fits.find((x) => x.id === 'qwen3:32b')!.where).toBe('no');
		expect(p.warnings[0]).toMatch(/No NVIDIA graphics card/);
	});

	it('reads nvidia-smi, and knows the bandwidth of common cards', async () => {
		const hw = await detect({ exec: async (cmd) => (cmd === 'nvidia-smi' ? 'NVIDIA GeForce RTX 5060 Ti, 16311\n' : '') });
		expect(hw.gpu).toEqual({ name: 'NVIDIA GeForce RTX 5060 Ti', vramGb: 15.9, bandwidthGbs: 448 });
		expect(bandwidthOf('NVIDIA GeForce RTX 4090')).toBe(1008);
		expect(bandwidthOf('Some Other Card')).toBeNull();
		expect((await detect({ exec: async () => '' })).gpu).toBeNull();
	});
});

describe('applying the plan', () => {
	it('changes only the local model of each tier, and keeps the comments', async () => {
		const { applyToTiers } = await import('../src/hardware.ts');
		const { TIERS_YAML } = await import('./helpers.ts');
		const { parseTiers } = await import('../src/config.ts');
		const yaml = `# a comment that must survive\n${TIERS_YAML}`;
		const r = await applyToTiers(yaml, { lite: 'qwen3:1.7b', standard: 'qwen3:8b', pro: 'qwen3:30b', max: 'qwen3:32b' });
		expect(r.changed).toEqual(['lite: qwen3:4b -> qwen3:1.7b', 'pro: qwen3:14b -> qwen3:30b', 'max: qwen3:30b -> qwen3:32b']);
		expect(r.yaml).toContain('# a comment that must survive');
		const t = parseTiers(r.yaml);
		expect(t.models['kimi-pro']!.id).toBe('kimi-pro-test');
		expect(t.models['qwen-pro']!.id).toBe('qwen3:30b');
	});
});

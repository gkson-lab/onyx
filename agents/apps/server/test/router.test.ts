import { describe, expect, it } from 'vitest';
import { heuristic, parseOverride } from '../src/models/router.ts';
import { parseTiers, Config } from '../src/config.ts';
import { TIERS_YAML, testApp } from './helpers.ts';

const routed = (args: unknown) => [{ toolCall: { name: 'route', args } }];

describe('the router', () => {
	it('reads a tier the person asked for and strips it from the message', () => {
		expect(parseOverride('/max prove it')).toEqual({ tier: 'max', text: 'prove it' });
		expect(parseOverride('/PRO fix this')).toEqual({ tier: 'pro', text: 'fix this' });
		expect(parseOverride('/think why is the sky blue')).toEqual({ tier: 'max', text: 'why is the sky blue' });
		expect(parseOverride('/maximum effort')).toEqual({ tier: null, text: '/maximum effort' });
		expect(parseOverride('use /max please')).toEqual({ tier: null, text: 'use /max please' });
	});

	it('asks the Lite model through a forced tool call, and logs the decision with its reason', async () => {
		const { app, seen } = await testApp({ 'qwen3:4b': routed({ tier: 'pro', complexity: 'medium', tools: ['code'], urgency: 'normal', reason: 'needs code written and run' }) });
		const d = await app.router.route('owner', 'write a script that renames my photos by date');
		expect(d).toMatchObject({ tier: 'pro', via: 'router', tools: ['code'], reason: 'needs code written and run' });
		expect(seen[0]!.model).toBe('qwen3:4b');
		expect(seen[0]!.body.tool_choice).toEqual({ type: 'function', function: { name: 'route' } });
		expect(seen[0]!.body.tools[0].function.name).toBe('route');
		const row = await app.db.selectFrom('routing_decisions').selectAll().executeTakeFirstOrThrow();
		expect(row).toMatchObject({ tier: 'pro', via: 'router', reason: 'needs code written and run', tools: '["code"]' });
		expect((await app.db.selectFrom('model_calls').select('purpose').executeTakeFirstOrThrow()).purpose).toBe('route');
	});

	it('an override skips the model entirely', async () => {
		const { app, seen } = await testApp({});
		const d = await app.router.route('owner', '/lite thanks');
		expect(d).toMatchObject({ tier: 'lite', via: 'override', text: 'thanks' });
		expect(seen).toHaveLength(0);
	});

	it('falls back to rules when the router model fails or answers badly, and says that it did', async () => {
		const down = await testApp({ 'qwen3:4b': [{ throw: 'connection refused' }] });
		const d1 = await down.app.router.route('owner', 'remind me to call mom tomorrow at 9am');
		expect(d1).toMatchObject({ via: 'heuristic', tier: 'pro', tools: ['schedule'] });
		expect(d1.reason).toContain('rule-based guess');
		const prose = await testApp({ 'qwen3:4b': [{ content: 'I think pro.' }] });
		expect((await prose.app.router.route('owner', 'hello')).via).toBe('heuristic');
		const junk = await testApp({ 'qwen3:4b': routed({ tier: 'ultra', reason: 'x' }) });
		expect((await junk.app.router.route('owner', 'hello')).via).toBe('heuristic');
	});

	it('the rules give sensible tiers', () => {
		expect(heuristic('thanks!').tier).toBe('lite');
		expect(heuristic('can you explain how tides work and why there are two a day').tier).toBe('standard');
		expect(heuristic('there is a bug in my python function').tier).toBe('pro');
		expect(heuristic('prove that the square root of 2 is irrational').tier).toBe('max');
		expect(heuristic('search for the latest news on fusion')).toMatchObject({ tier: 'pro', tools: ['web_search'] });
	});
});

describe('tiers.yaml', () => {
	it('rejects a tier that names an undefined model, and a model with an undefined provider', () => {
		expect(() => parseTiers(TIERS_YAML.replace('models: [qwen-lite]', 'models: [nope]'))).toThrow(/isn't defined: nope/);
		expect(() => parseTiers(TIERS_YAML.replace('qwen-lite:     { provider: ollama', 'qwen-lite:     { provider: mars'))).toThrow(/provider that isn't defined: mars/);
	});
	it('shows real model names and never a key or a URL', () => {
		const c = new Config(parseTiers(TIERS_YAML), { ONYX_CLOUD: 'on', MOONSHOT_API_KEY: 'sk-secret' });
		const pub = JSON.stringify(c.publicTiers());
		expect(c.publicTiers().find((t) => t.tier === 'pro')).toMatchObject({ label: 'Pro', model: 'kimi-pro-test', local: false, alternates: ['qwen3:14b'] });
		expect(pub).not.toContain('sk-secret');
		expect(pub).not.toContain('http');
	});
});

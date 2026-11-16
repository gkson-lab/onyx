import { describe, expect, it } from 'vitest';
import { MAX_DEPTH } from '../src/agents/runtime.ts';
import { testApp } from './helpers.ts';

const route = (tier: string, tools: string[] = []) => [{ toolCall: { name: 'route', args: { tier, complexity: 'medium', tools, urgency: 'normal', reason: 'test' } } }];
const types = (events: { type: string }[]) => events.map((e) => e.type);

describe('the agent loop', () => {
	it('a quick message is answered by Core directly, with no tools offered', async () => {
		const { app, seen, events } = await testApp({ 'qwen3:4b': [...route('lite'), { content: 'You are welcome.' }] });
		const r = await app.runtime.handle({ userId: 'owner', text: 'thanks', channel: 'web' });
		expect(r).toMatchObject({ status: 'done', output: 'You are welcome.', tier: 'lite', model: 'qwen3:4b' });
		expect(seen[1]!.body.tools).toBeUndefined();
		expect(types(events).filter((t) => t !== 'delta')).toEqual(['routed', 'started', 'thinking', 'finished']);
		expect(events.filter((e) => e.type === 'delta').map((e) => e.data.text).join('')).toBe('You are welcome.');
		expect(r.routing.via).toBe('router');
	});

	it('Core delegates to two specialists at once, each uses its own tools and tier, and the results come back', async () => {
		const { app, seen, events } = await testApp(
			{
				'qwen3:4b': route('standard', ['web_search', 'code']),
				'qwen3:8b': [{ toolCall: { name: 'delegate', args: { tasks: [{ agent: 'researcher', task: 'find the boiling point of water at altitude' }, { agent: 'coder', task: 'compute 2**10' }] } } }, { content: 'Water boils lower at altitude, and 2**10 is 1024.' }],
				// Researcher and Coder both run on Pro: their calls interleave, told apart by what they were asked.
				'qwen3:14b': [],
			},
			{},
			{
				tool: { exec: async (_c, args, input) => ({ code: 0, out: input.includes('2**10') ? '1024\n' : '?', err: '', timedOut: false }), fetch: (async () => new Response('<a class="result__a" href="https://example.org/boil">Boiling point</a><a class="result__snippet">Lower at altitude.</a>', { status: 200 })) as typeof fetch },
			},
		);
		// A scripted Pro model: first call uses the agent's tool, second call answers from the tool's result.
		const proCalls: Record<string, number> = {};
		const original = (app.gateway as any).fetch;
		(app.gateway as any).fetch = async (url: string, init: any) => {
			const body = JSON.parse(init.body);
			if (body.model !== 'qwen3:14b') return original(url, init);
			seen.push({ url, model: body.model, auth: undefined, body });
			const who = body.messages[0].content.includes('Researcher') ? 'researcher' : 'coder';
			const n = (proCalls[who] = (proCalls[who] ?? 0) + 1);
			const message = n === 1 ? { role: 'assistant', content: '', tool_calls: [{ id: `${who}_1`, type: 'function', function: who === 'researcher' ? { name: 'web_search', arguments: '{"query":"boiling point altitude"}' } : { name: 'run_code', arguments: '{"language":"python","code":"print(2**10)"}' } }] } : { role: 'assistant', content: who === 'researcher' ? 'It is lower. Sources: https://example.org/boil' : 'Output: 1024' };
			return { ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message, finish_reason: 'stop' }], usage: { prompt_tokens: 20, completion_tokens: 10 } }) };
		};
		const r = await app.runtime.handle({ userId: 'owner', text: 'boiling point at altitude, and what is 2**10?', channel: 'web' });
		expect(r).toMatchObject({ status: 'done', output: 'Water boils lower at altitude, and 2**10 is 1024.' });

		const runs = await app.db.selectFrom('runs').selectAll().where('root_id', '=', r.runId).execute();
		expect(runs.map((x) => `${x.agent_id}:${x.depth}:${x.status}:${x.tier}`).sort()).toEqual(['coder:1:done:pro', 'core:0:done:standard', 'researcher:1:done:pro']);
		expect(runs.filter((x) => x.depth === 1).every((x) => x.parent_id === r.runId)).toBe(true);
		// What the specialists returned is what Core was shown.
		const toolMsg = seen.filter((s) => s.model === 'qwen3:8b')[1]!.body.messages.find((m: any) => m.role === 'tool');
		expect(JSON.parse(toolMsg.content)).toEqual([{ agent: 'researcher', ok: true, result: 'It is lower. Sources: https://example.org/boil' }, { agent: 'coder', ok: true, result: 'Output: 1024' }]);
		expect(types(events).filter((t) => ['delegated', 'tool_call', 'tool_result'].includes(t)).length).toBe(1 + 3 + 3);
		const steps = await app.db.selectFrom('steps').selectAll().where('root_id', '=', r.runId).execute();
		expect(steps.some((s) => s.type === 'tool_result' && JSON.parse(s.data).tool === 'run_code' && JSON.parse(s.data).result.includes('1024'))).toBe(true);
		expect((await app.db.selectFrom('routing_decisions').select('run_id').executeTakeFirstOrThrow()).run_id).toBe(r.runId);
	});

	it('bad arguments and unknown tools go back to the model as errors it can correct', async () => {
		const { app, seen } = await testApp({ 'qwen3:8b': [{ toolCalls: [{ name: 'calculate', args: '{not json' }, { name: 'teleport', args: {} }, { name: 'calculate', args: { question: 5 } }] }, { toolCall: { name: 'calculate', args: { question: '17.5% of 2340' } } }, { content: '409.5' }] });
		const r = await app.runtime.run({ agentId: 'core', input: 'what is 17.5% of 2340', userId: 'owner', channel: 'web' });
		expect(r.output).toBe('409.5');
		const tools = seen[1]!.body.messages.filter((m: any) => m.role === 'tool').map((m: any) => m.content);
		expect(tools[0]).toMatch(/^Error: The arguments were not valid JSON/);
		expect(tools[1]).toMatch(/^Error: There is no tool called "teleport"/);
		expect(tools[2]).toMatch(/^Error: Bad arguments: question/);
		// The real calculator from Onyx 3 did the arithmetic.
		expect(seen[2]!.body.messages.at(-1).content).toContain('409.5');
	});

	it('stops at the step limit by taking the tools away and asking for a final answer', async () => {
		const loop = { toolCall: { name: 'calculate', args: { question: '1+1' } } };
		const { app, seen } = await testApp({ 'qwen3:4b': [loop, loop, { content: 'Final: 2' }] });
		await app.runtime.saveAgent({ ...(await app.runtime.agent('memory'))!, tools: ['calculate'], max_steps: 3 });
		const r2 = await app.runtime.run({ agentId: 'memory', input: 'go', userId: 'owner', channel: 'web' });
		expect(r2).toMatchObject({ status: 'done', output: 'Final: 2' });
		expect(seen).toHaveLength(3);
		const last = seen.at(-1)!.body;
		expect(last.tools).toBeUndefined();
		expect(last.messages.at(-1).content).toMatch(/step limit/);
	});

	it('stops when the token budget runs out, and a child cannot outspend its parent', async () => {
		const big = { toolCall: { name: 'calculate', args: { question: '1+1' } }, usage: { prompt_tokens: 400, completion_tokens: 200 } };
		const { app } = await testApp({ 'qwen3:4b': [big] });
		await app.runtime.saveAgent({ ...(await app.runtime.agent('memory'))!, tools: ['calculate'], token_budget: 1000, max_steps: 20 });
		const r = await app.runtime.run({ agentId: 'memory', input: 'go', userId: 'owner', channel: 'web' });
		expect(r).toMatchObject({ status: 'error' });
		expect(r.error).toMatch(/Out of budget/);
		expect(r.tokens).toBe(1200);
	});

	it(`subagents stop at depth ${MAX_DEPTH}: the deepest one is not offered delegate at all`, async () => {
		const down = (agent: string) => ({ toolCall: { name: 'delegate', args: { tasks: [{ agent, task: 'go deeper' }] } } });
		const { app, seen } = await testApp({ 'qwen3:8b': [down('researcher'), { content: 'core done' }], 'qwen3:14b': [down('coder'), down('researcher'), { content: 'bottom' }, { content: 'coder done' }, { content: 'researcher done' }] });
		const r = await app.runtime.run({ agentId: 'core', input: 'go', userId: 'owner', channel: 'web' });
		expect(r.status).toBe('done');
		const runs = await app.db.selectFrom('runs').select(['agent_id', 'depth']).where('root_id', '=', r.runId).orderBy('depth').execute();
		expect(runs.map((x) => x.depth)).toEqual([0, 1, 2, 3]);
		const deepest = seen.filter((s) => s.model === 'qwen3:14b')[2]!.body;
		expect((deepest.tools ?? []).map((t: any) => t.function.name)).not.toContain('delegate');
	});

	it('the kill switch stops a run and its children', async () => {
		const { app, events } = await testApp({ 'qwen3:8b': [{ toolCall: { name: 'delegate', args: { tasks: [{ agent: 'researcher', task: 'slow' }] } } }], 'qwen3:14b': [{ content: 'never', delayMs: 5000 }] });
		const p = app.runtime.run({ agentId: 'core', input: 'go', userId: 'owner', channel: 'web', runId: 'root-1' });
		await new Promise((r) => setTimeout(r, 80));
		expect(app.runtime.running()).toHaveLength(2);
		expect(app.runtime.kill('root-1')).toBe(true);
		const r = await p;
		expect(r).toMatchObject({ status: 'killed', error: 'stopped by you' });
		expect((await app.db.selectFrom('runs').select('status').where('root_id', '=', 'root-1').execute()).map((x) => x.status)).toEqual(['killed', 'killed']);
		expect(app.runtime.running()).toHaveLength(0);
		expect(app.runtime.kill('root-1')).toBe(false);
		expect(events.filter((e) => e.type === 'error')).toHaveLength(2);
	});

	it('an agent that is switched off, or missing, fails with a reason; a model failure is reported, not hidden', async () => {
		const { app } = await testApp({});
		await app.runtime.saveAgent({ ...(await app.runtime.agent('coder'))!, enabled: false });
		expect((await app.runtime.run({ agentId: 'coder', input: 'x', userId: 'owner', channel: 'web' })).error).toMatch(/switched off/);
		expect((await app.runtime.run({ agentId: 'ghost', input: 'x', userId: 'owner', channel: 'web' })).error).toMatch(/no agent called "ghost"/);
		const r = await app.runtime.run({ agentId: 'core', input: 'x', userId: 'owner', channel: 'web' });
		expect(r.status).toBe('error');
		expect(r.error).toMatch(/No model answered/);
	});
});

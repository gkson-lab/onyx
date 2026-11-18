// The agent runtime. One loop for every agent: ask the model, run the tools it calls, show it the results, repeat,
// until it answers or a limit stops it. The limits are real: a cap on steps, a token budget, a time budget, a depth
// limit for subagents, and a kill switch that reaches every child. Every event is published and written down.
import { randomUUID } from 'node:crypto';
import { AgentDef, type AgentEvent, type Channel, type ChatMessage, type RoutingDecision, type Tier, type ToolDef } from '@onyx/shared';
import type { Bus } from '../bus.ts';
import { now, type DB } from '../db.ts';
import { AllModelsFailed, LimitError, type Gateway } from '../models/gateway.ts';
import type { Router } from '../models/router.ts';
import type { ToolRegistry, ToolContext } from '../tools/types.ts';
import { DEFAULT_AGENTS } from './defaults.ts';

export const MAX_DEPTH = 3;

export interface RunResult {
	runId: string;
	status: 'done' | 'error' | 'killed';
	output: string;
	error: string | null;
	tier: Tier | null;
	model: string | null;
	tokens: number;
	costUsd: number | null;
	equivalentUsd: number | null;
}
interface Frame {
	runId: string;
	rootId: string;
	parentId: string | null;
	depth: number;
	userId: string;
	channel: Channel;
	controller: AbortController;
	deadline: number;
	parent: Frame | null;
	/** Tokens this run and its children may still spend. Shared down the tree, so a child can't outspend its parent. */
	budget: { left: number };
	/** A cloud model the person chose for the message (a key under models): every agent in the run tries it first. */
	model?: string;
}

export class Runtime {
	private readonly live = new Map<string, AbortController>();

	constructor(private readonly d: { db: DB; gateway: Gateway; router: Router; bus: Bus; tools: ToolRegistry; clock?: () => Date; timezone?: string }) {}

	/* ---------- Agents ---------- */

	async seed(): Promise<void> {
		for (const a of DEFAULT_AGENTS) {
			const have = await this.d.db.selectFrom('agents').select('id').where('id', '=', a.id).executeTakeFirst();
			if (!have) await this.saveAgent(a);
		}
	}
	async saveAgent(a: AgentDef): Promise<void> {
		const row = { id: a.id, name: a.name, description: a.description, system_prompt: a.system_prompt, tier: a.tier, tools: JSON.stringify(a.tools), enabled: a.enabled ? 1 : 0, max_steps: a.max_steps, token_budget: a.token_budget, time_budget_ms: a.time_budget_ms, builtin: a.builtin ? 1 : 0 };
		await this.d.db.insertInto('agents').values(row).onConflict((c) => c.column('id').doUpdateSet(row)).execute();
	}
	async agents(): Promise<AgentDef[]> {
		const rows = await this.d.db.selectFrom('agents').selectAll().orderBy('builtin', 'desc').orderBy('id').execute();
		return rows.map((r) => AgentDef.parse({ ...r, tools: JSON.parse(r.tools), enabled: !!r.enabled, builtin: !!r.builtin }));
	}
	async agent(id: string): Promise<AgentDef | null> {
		return (await this.agents()).find((a) => a.id === id) ?? null;
	}

	/* ---------- Events ---------- */

	private async emit(f: Frame | null, agentId: string | null, type: AgentEvent['type'], data: Record<string, unknown>, persist = true): Promise<void> {
		const e: AgentEvent = { type, at: now(), runId: f?.runId ?? null, rootId: f?.rootId ?? null, parentId: f?.parentId ?? null, agentId, data };
		this.d.bus.emit(e);
		if (persist && f) {
			const n = Number((await this.d.db.selectFrom('steps').select((eb) => eb.fn.countAll<number>().as('n')).where('run_id', '=', f.runId).executeTakeFirst())?.n ?? 0);
			await this.d.db.insertInto('steps').values({ run_id: f.runId, root_id: f.rootId, n, type, data: JSON.stringify(data), created_at: e.at }).execute();
		}
	}

	/** Stops a run and everything under it. Returns whether anything was running. */
	kill(runId: string): boolean {
		const c = this.live.get(runId);
		if (!c) return false;
		c.abort(new Error('stopped by you'));
		return true;
	}
	running(): string[] {
		return [...this.live.keys()];
	}

	/* ---------- A message from a person ---------- */

	/** Routes a message, runs Onyx Core on it, and returns its answer. `onDelta` receives the answer as it is written. */
	async handle(o: { userId: string; text: string; channel: Channel; history?: ChatMessage[]; runId?: string; attached?: string; model?: string }): Promise<RunResult & { routing: RoutingDecision }> {
		const runId = o.runId ?? randomUUID();
		const routing = await this.d.router.route(o.userId, o.text, runId);
		this.d.bus.emit({ type: 'routed', at: now(), runId, rootId: runId, parentId: null, agentId: 'core', data: { ...routing } });
		// A quick message needs no tools: Core answers it directly on the tier the router chose.
		// Only when the router model itself said so: a rule-based guess can miss a task that needs a tool, and Core
		// without tools would then claim to have done it. (Seen in a real run: "remember that..." answered "Got it".)
		const direct = routing.via === 'router' && routing.tier === 'lite' && routing.tools.length === 0;
		// A task that needs exactly one specialist goes straight to it. Core in between adds a model call, and in real
		// runs a small Core sometimes answered "I remember that" without ever calling Memory.
		const SPECIALIST: Record<string, string> = { memory: 'memory', schedule: 'scheduler', code: 'coder', web_search: 'researcher' };
		const only = routing.tools.length === 1 ? SPECIALIST[routing.tools[0]!] : undefined;
		const specialist = only ? await this.agent(only) : null;
		const agentId = specialist?.enabled ? specialist.id : 'core';
		// The router decides from the question and the files' names; the agent also gets what the files say.
		const input = o.attached ? `${routing.text}\n\n${o.attached}` : routing.text;
		const r = await this.run({ agentId, input, userId: o.userId, channel: o.channel, runId, tier: agentId === 'core' ? routing.tier : undefined, history: o.history, routing, noTools: direct && agentId === 'core', model: o.model });
		return { ...r, output: r.status === 'done' ? r.output + (await this.notDone(runId)) : r.output, routing };
	}

	/**
	 * What failed along the way, as a note under the answer. Written from the step log, not by a model, so a model that
	 * glosses over a failure (real run: "the script output is..." when the code never ran) cannot hide it.
	 */
	async notDone(rootId: string): Promise<string> {
		const steps = await this.d.db.selectFrom('steps').select(['data']).where('root_id', '=', rootId).where('type', '=', 'tool_result').execute();
		const failed = new Set<string>();
		for (const s of steps) {
			const d = JSON.parse(s.data) as { ok: boolean; tool: string; result: string };
			if (d.tool === 'delegate') continue;
			const text = String(d.result);
			if (!d.ok || text.startsWith('Error')) failed.add(`${d.tool}: ${text.replace(/^Error:\s*/, '').split(/(?<=\.)\s/)[0]!.slice(0, 200)}`);
		}
		return failed.size ? `\n\nNot done:\n${[...failed].map((f) => `- ${f}`).join('\n')}` : '';
	}

	/* ---------- One run of one agent ---------- */

	async run(o: { agentId: string; input: string; userId: string; channel: Channel; runId?: string; parent?: Frame; tier?: Tier; history?: ChatMessage[]; routing?: RoutingDecision; noTools?: boolean; model?: string }): Promise<RunResult> {
		const { db, gateway, tools: registry } = this.d;
		const runId = o.runId ?? randomUUID();
		const agent = await this.agent(o.agentId);
		const parent = o.parent ?? null;
		const controller = new AbortController();
		if (parent) parent.controller.signal.addEventListener('abort', () => controller.abort(parent.controller.signal.reason), { once: true });
		const started = Date.now();
		const f: Frame = {
			runId, rootId: parent?.rootId ?? runId, parentId: parent?.runId ?? null, depth: parent ? parent.depth + 1 : 0, userId: o.userId, channel: o.channel, controller,
			deadline: Math.min(parent?.deadline ?? Infinity, started + (agent?.time_budget_ms ?? 60000)),
			parent,
			budget: parent ? parent.budget : { left: agent?.token_budget ?? 20000 },
			model: o.model ?? parent?.model,
		};
		// A child gets its own cap as well as its parent's: whichever is smaller.
		let own = agent?.token_budget ?? 20000;
		await db.insertInto('runs').values({ id: runId, parent_id: f.parentId, root_id: f.rootId, depth: f.depth, user_id: o.userId, agent_id: o.agentId, channel: o.channel, status: 'running', input: o.input, output: null, error: null, tier: null, model: null, provider: null, tokens_in: 0, tokens_out: 0, cost_usd: null, steps: 0, routing: o.routing ? JSON.stringify(o.routing) : null, started_at: now(), finished_at: null }).execute();
		this.live.set(runId, controller);
		const totals = { in: 0, out: 0, cost: null as number | null, eq: null as number | null, tier: null as Tier | null, model: null as string | null, provider: null as string | null, steps: 0 };
		const finish = async (status: RunResult['status'], output: string, error: string | null): Promise<RunResult> => {
			this.live.delete(runId);
			await db.updateTable('runs').set({ status, output, error, tier: totals.tier, model: totals.model, provider: totals.provider, tokens_in: totals.in, tokens_out: totals.out, cost_usd: totals.cost, equivalent_usd: totals.eq, steps: totals.steps, finished_at: now() }).where('id', '=', runId).execute();
			await this.emit(f, o.agentId, status === 'done' ? 'finished' : 'error', { status, output, error, tokens_in: totals.in, tokens_out: totals.out, cost_usd: totals.cost, equivalent_usd: totals.eq, ms: Date.now() - started, tier: totals.tier, model: totals.model });
			return { runId, status, output, error, tier: totals.tier, model: totals.model, tokens: totals.in + totals.out, costUsd: totals.cost, equivalentUsd: totals.eq };
		};

		try {
			if (!agent) return await finish('error', '', `There is no agent called "${o.agentId}".`);
			if (!agent.enabled) return await finish('error', '', `The ${agent.name} agent is switched off.`);
			if (f.depth > MAX_DEPTH) return await finish('error', '', `Subagents can go ${MAX_DEPTH} levels deep, and this would be level ${f.depth}.`);
			// The router's tier applies to the run a person started; a specialist runs on its own tier.
			const tier = f.depth === 0 && o.tier ? o.tier : agent.tier;
			await this.emit(f, agent.id, 'started', { agent: agent.name, input: o.input, depth: f.depth, tier, channel: o.channel });

			const available = o.noTools ? [] : registry.for(agent.tools).filter((t) => t.name !== 'delegate' || f.depth < MAX_DEPTH);
			const defs: ToolDef[] = available.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.parameters } }));
			const clock = (this.d.clock ?? (() => new Date()))();
			const messages: ChatMessage[] = [
				{ role: 'system', content: `${agent.system_prompt}\n\nCurrent time: ${clock.toISOString()} (${this.d.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone}). Channel: ${o.channel}.` },
				...(o.history ?? []),
				{ role: 'user', content: o.input },
			];
			const ctx: ToolContext = {
				userId: o.userId, runId, rootId: f.rootId, agentId: agent.id, depth: f.depth, channel: o.channel, signal: controller.signal,
				delegate: async (tasks) => {
					await this.emit(f, agent.id, 'delegated', { tasks });
					const results = await Promise.all(tasks.map((t) => this.run({ agentId: t.agent, input: t.task, userId: o.userId, channel: o.channel, parent: f })));
					return Promise.all(results.map(async (r, i) => {
						if (r.status === 'done') return { agent: tasks[i]!.agent, ok: true, result: r.output };
						// What it finished before it failed, from its step log: a fact saved, a reminder made. Without this, Core
						// told the person a fact could not be saved when it had been (seen in a real run).
						const steps = await db.selectFrom('steps').select('data').where('run_id', '=', r.runId).where('type', '=', 'tool_result').execute();
						const did = steps.map((s) => JSON.parse(s.data) as { ok: boolean; tool: string; result: string }).filter((d) => d.ok && d.tool !== 'delegate' && !String(d.result).startsWith('Error')).map((d) => `${d.tool}: ${String(d.result).slice(0, 200)}`);
						return { agent: tasks[i]!.agent, ok: false, result: `FAILED: ${r.error}${did.length ? `. Before that, it did finish: ${did.join('; ')}` : ''}` };
					}));
				},
			};

			for (let step = 0; ; step++) {
				if (controller.signal.aborted) return await finish('killed', '', String((controller.signal.reason as Error)?.message ?? 'stopped'));
				if (Date.now() > f.deadline) return await finish('error', '', `Out of time: the ${Math.round((agent.time_budget_ms) / 1000)} s budget ran out after ${totals.steps} steps.`);
				if (f.budget.left <= 0 || own <= 0) return await finish('error', '', `Out of budget: the token budget ran out after ${totals.steps} steps.`);
				// The last allowed step gets no tools, so the model has to answer with what it has.
				const last = step >= agent.max_steps - 1;
				if (last && step > 0) messages.push({ role: 'user', content: 'You have reached the step limit. Give your final answer now from what you have, and say plainly what is missing.' });
				await this.emit(f, agent.id, 'thinking', { step: step + 1, of: agent.max_steps }, false);
				let streamed = '';
				const r = await gateway.complete({
					// The last step offers no tool calls (tool_choice "none") rather than no tools: Claude's earlier thinking is tied to
					// the tool list, and a changed list makes the API refuse it. The chat-completions providers are sent no tools.
					userId: o.userId, runId, purpose: agent.id, tier, messages, tools: defs.length ? defs : undefined, toolChoice: last ? 'none' : undefined, signal: controller.signal, preferModel: f.model,
					timeoutMs: Math.max(1000, Math.min(f.deadline - Date.now(), 10 * 60 * 1000)),
					deadline: f.deadline,
					// The wait for the graphics card is given back to this agent and to every agent waiting on it.
					onWait: (ms) => {
						for (let x: Frame | null = f; x; x = x.parent) x.deadline += ms;
					},
					onDelta: f.depth === 0 ? (t) => ((streamed += t), this.d.bus.emit({ type: 'delta', at: now(), runId, rootId: f.rootId, parentId: null, agentId: agent.id, data: { text: t } })) : undefined,
				});
				const spent = r.usage.input + r.usage.output;
				f.budget.left -= spent;
				own -= spent;
				totals.in += r.usage.input;
				totals.out += r.usage.output;
				if (r.costUsd != null) totals.cost = (totals.cost ?? 0) + r.costUsd;
				if (r.equivalentUsd != null) totals.eq = (totals.eq ?? 0) + r.equivalentUsd;
				totals.tier = r.tier;
				totals.model = r.model;
				totals.provider = r.provider;
				totals.steps = step + 1;
				for (const fb of r.fallbacks) await this.emit(f, agent.id, 'fallback', { ...fb });

				if (!r.toolCalls.length) return await finish('done', r.content, null);
				messages.push({ role: 'assistant', content: r.content || null, tool_calls: r.toolCalls, ...(r.raw ? { raw: r.raw } : {}) });
				for (const call of r.toolCalls) {
					const tool = available.find((t) => t.name === call.function.name);
					const t0 = Date.now();
					let result: string;
					let ok = true;
					let args: unknown = call.function.arguments;
					try {
						if (!tool) throw new Error(`There is no tool called "${call.function.name}". Tools you can use: ${available.map((t) => t.name).join(', ') || 'none'}.`);
						try {
							args = JSON.parse(call.function.arguments || '{}');
						} catch {
							throw new Error('The arguments were not valid JSON.');
						}
						const parsed = tool.schema.safeParse(args);
						if (!parsed.success) throw new Error(`Bad arguments: ${parsed.error.issues.map((i) => `${i.path.join('.') || 'value'}: ${i.message}`).join('; ')}`);
						await this.emit(f, agent.id, 'tool_call', { id: call.id, tool: tool.name, args: parsed.data });
						result = await tool.run(parsed.data, ctx);
					} catch (e) {
						ok = false;
						if (!tool || typeof args === 'string') await this.emit(f, agent.id, 'tool_call', { id: call.id, tool: call.function.name, args });
						result = `Error: ${(e as Error).message}`;
					}
					if (result.length > 12000) result = `${result.slice(0, 12000)}\n[cut: the result was ${result.length} characters long]`;
					await this.emit(f, agent.id, 'tool_result', { id: call.id, tool: call.function.name, ok, result, ms: Date.now() - t0 });
					messages.push({ role: 'tool', tool_call_id: call.id, content: result });
				}
			}
		} catch (e) {
			if (controller.signal.aborted) return await finish('killed', '', String((controller.signal.reason as Error)?.message ?? 'stopped'));
			const msg = e instanceof LimitError || e instanceof AllModelsFailed ? e.message : `Unexpected error: ${(e as Error).message}`;
			return await finish('error', '', msg);
		}
	}
}

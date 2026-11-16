import type { z } from 'zod';
import type { Channel } from '@onyx/shared';

export interface ToolContext {
	userId: string;
	runId: string;
	rootId: string;
	agentId: string;
	depth: number;
	channel: Channel;
	signal: AbortSignal;
	/** Runs other agents on tasks, at the same time, as children of this run. */
	delegate(tasks: { agent: string; task: string }[]): Promise<{ agent: string; ok: boolean; result: string }[]>;
}
export interface Tool<A = any> {
	name: string;
	description: string;
	/** JSON Schema, sent to the model. */
	parameters: Record<string, unknown>;
	/** The same shape as a zod schema: what the model sends is checked against it before the tool runs. */
	schema: z.ZodType<A>;
	run(args: A, ctx: ToolContext): Promise<string>;
}
export class ToolRegistry {
	private readonly tools = new Map<string, Tool>();
	add(...tools: Tool[]): this {
		for (const t of tools) this.tools.set(t.name, t);
		return this;
	}
	remove(prefix: string): void {
		for (const k of [...this.tools.keys()]) if (k.startsWith(prefix)) this.tools.delete(k);
	}
	get(name: string): Tool | undefined {
		return this.tools.get(name);
	}
	names(): string[] {
		return [...this.tools.keys()];
	}
	list(): { name: string; description: string }[] {
		return [...this.tools.values()].map((t) => ({ name: t.name, description: t.description }));
	}
	/** The tools an agent may use: those it names, plus every tool of a connector it names as `connector:<id>`. */
	for(allowed: string[]): Tool[] {
		const out: Tool[] = [];
		for (const a of allowed) {
			if (a.startsWith('connector:')) out.push(...[...this.tools.values()].filter((t) => t.name.startsWith(`mcp__${a.slice(10)}__`)));
			else if (this.tools.has(a)) out.push(this.tools.get(a)!);
		}
		return [...new Set(out)];
	}
}

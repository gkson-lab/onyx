import { describe, expect, it } from 'vitest';
import { formatFor, plain, split } from '../src/channels/format.ts';
import { isPrivate, localTime, nextFire } from '../src/tools/builtin.ts';
import type { ToolContext } from '../src/tools/types.ts';
import type { ChannelAdapter } from '../src/channels/outbox.ts';
import { buildServer } from '../src/index.ts';
import { testApp } from './helpers.ts';

const ctx = (over: Partial<ToolContext> = {}): ToolContext => ({ userId: 'owner', runId: 'r', rootId: 'r', agentId: 'a', depth: 0, channel: 'web', signal: new AbortController().signal, delegate: async () => [], ...over });

describe('tools', () => {
	it('the sandbox runs code in a container with no network and no host files, and says so when Docker is missing', async () => {
		let got: { cmd: string; args: string[]; input: string } | null = null;
		const { app } = await testApp({}, {}, { tool: { exec: async (cmd, args, input) => ((got = { cmd, args, input }), { code: 0, out: 'hi\n', err: '', timedOut: false }) } });
		const out = await app.tools.get('run_code')!.run({ language: 'python', code: 'print("hi")' }, ctx());
		expect(out).toContain('exit code 0');
		expect(out).toContain('hi');
		expect(got!.cmd).toBe('docker');
		expect(got!.args.join(' ')).toContain('--network none');
		expect(got!.args.join(' ')).toContain('--read-only');
		expect(got!.args.join(' ')).toContain('--cap-drop ALL');
		expect(got!.args.some((a) => a === '-v' || a.startsWith('--volume') || a.startsWith('--mount'))).toBe(false);
		expect(got!.input).toBe('print("hi")');
		const none = await testApp({}, {}, { tool: { exec: async () => ({ code: null, out: '', err: 'spawn docker ENOENT', timedOut: false }) } });
		expect(await none.app.tools.get('run_code')!.run({ language: 'python', code: 'x' }, ctx())).toMatch(/needs Docker.*NOT run/s);
		const stopped = await testApp({}, {}, { tool: { exec: async () => ({ code: 1, out: '', err: 'failed to connect to the docker API at unix:///var/run/docker.sock', timedOut: false }) } });
		expect(await stopped.app.tools.get('run_code')!.run({ language: 'python', code: 'x' }, ctx())).toMatch(/not running.*NOT run/s);
	});

	it('web_fetch refuses this machine and private networks, and labels what it reads as untrusted', async () => {
		expect(['127.0.0.1', '10.1.2.3', '192.168.1.1', '172.20.0.1', '169.254.169.254', '::1'].every(isPrivate)).toBe(true);
		expect(isPrivate('93.184.216.34')).toBe(false);
		const { app } = await testApp({}, {}, { tool: { fetch: (async () => new Response('<html><script>x()</script><p>Hello &amp; welcome</p></html>', { headers: { 'content-type': 'text/html' } })) as typeof fetch, resolveHost: async (h: string) => (h === 'inside.test' ? '192.168.0.5' : '93.184.216.34') } as never });
		const fetchTool = app.tools.get('web_fetch')!;
		await expect(fetchTool.run({ url: 'http://127.0.0.1:8787/api/settings' }, ctx())).rejects.toThrow(/private network/);
		await expect(fetchTool.run({ url: 'http://inside.test/' }, ctx())).rejects.toThrow(/private network/);
		await expect(fetchTool.run({ url: 'file:///etc/passwd' }, ctx())).rejects.toThrow(/Only http/);
		const page = await fetchTool.run({ url: 'https://example.org/' }, ctx());
		expect(page).toContain('untrusted text');
		expect(page).toContain('Hello & welcome');
		expect(page).not.toContain('x()');
	});

	it('memory saves facts and recalls the related ones', async () => {
		const { app } = await testApp({});
		const save = app.tools.get('memory_save')!;
		await save.run({ fact: 'Prefers metric units' }, ctx());
		await save.run({ fact: 'Has a dog named Biscuit' }, ctx());
		expect(await app.tools.get('memory_search')!.run({ query: 'what is the name of the dog' }, ctx())).toBe('- Has a dog named Biscuit');
		expect(await app.tools.get('memory_search')!.run({ query: 'favourite colour' }, ctx())).toBe('Nothing saved matches that.');
	});

	it('messages are fitted to the channel: plain text and numbered parts for SMS', () => {
		expect(plain('## Plan\n**Bold** and `code` and [a link](https://x.org)\n| a | b |\n|---|---|\n| 1 | 2 |', 'sms')).toBe('Plan\nBold and code and a link (https://x.org)\na · b\n1 · 2');
		expect(plain('**Bold**', 'whatsapp')).toBe('*Bold*');
		expect(formatFor('web', '**kept**')).toEqual(['**kept**']);
		const long = Array.from({ length: 60 }, (_, i) => `Sentence number ${i + 1} is here.`).join(' ');
		const parts = formatFor('sms', long);
		expect(parts.length).toBe(2);
		expect(parts.every((p) => p.length <= 1500)).toBe(true);
		expect(parts[0]).toMatch(/^\(1\/2\) Sentence number 1 /);
		expect(parts[0]!.endsWith('.')).toBe(true);
		expect(split('a'.repeat(25), 10)).toEqual(['a'.repeat(10), 'a'.repeat(10), 'a'.repeat(5)]);
		const huge = formatFor('sms', 'word '.repeat(3000));
		expect(huge).toHaveLength(4);
		expect(huge[3]).toContain('Cut short');
	});
});

describe('reminders and delivery', () => {
	it('a reminder fires when due, on the preferred channel, falls back when that channel is down, and repeats', async () => {
		let t = new Date('2026-11-16T15:00:00Z');
		const { app, events } = await testApp({}, {}, { clock: () => t });
		const sent: string[] = [];
		let smsUp = false;
		const sms: ChannelAdapter = { id: 'sms', status: async () => (smsUp ? { ok: true, detail: 'ok' } : { ok: false, detail: 'Twilio is not set up' }), send: async () => {}, sendProactive: async (_u, parts) => void sent.push(...parts) };
		app.outbox.add(sms);
		const made = await app.tools.get('schedule_create')!.run({ text: 'call mom', at: '2026-11-16T16:00:00Z', repeat: 'daily' }, ctx());
		expect(made).toBe(`Created reminder #1: "call mom" for ${localTime(new Date('2026-11-16T16:00:00Z'))}, repeating daily.`);
		// A time with no offset is the PC's own local time, which is what people mean.
		const local = await app.tools.get('schedule_create')!.run({ text: 'stretch', at: '2026-11-18T09:00', repeat: 'none' }, ctx());
		expect(local).toBe(`Created reminder #2: "stretch" for ${localTime(new Date(2026, 10, 18, 9, 0))}.`);
		await app.db.deleteFrom('schedules').where('id', '=', 2).execute();
		expect(await app.tools.get('schedule_create')!.run({ text: 'x', at: '2026-11-16T10:00:00Z', repeat: 'none' }, ctx())).toMatch(/in the past/);
		expect(await app.scheduler.tick()).toBe(0);

		t = new Date('2026-11-16T16:00:20Z');
		expect(await app.scheduler.tick()).toBe(1);
		// SMS was down: the reminder reached the app instead, and the failure was recorded.
		const web = events.filter((e) => e.type === 'message');
		expect(web).toHaveLength(1);
		expect(web[0]!.data).toMatchObject({ text: 'Reminder: call mom', proactive: true });
		const msg = await app.db.selectFrom('messages').selectAll().executeTakeFirstOrThrow();
		expect(msg).toMatchObject({ channel: 'web', status: 'sent_fallback' });
		expect(msg.error).toContain('sms: Twilio is not set up');
		expect((await app.db.selectFrom('schedules').selectAll().executeTakeFirstOrThrow()).next_fire).toBe('2026-11-17T16:00:00.000Z');
		expect(await app.scheduler.tick()).toBe(0);

		// The PC was off for three days: one late reminder, not three, and the next one is in the future.
		smsUp = true;
		t = new Date('2026-11-20T09:00:00Z');
		expect(await app.scheduler.tick()).toBe(1);
		expect(sent).toHaveLength(1);
		expect(sent[0]).toContain(`Late: this was due ${localTime(new Date('2026-11-17T16:00:00Z'))}.`);
		expect((await app.db.selectFrom('schedules').selectAll().executeTakeFirstOrThrow()).next_fire).toBe('2026-11-20T16:00:00.000Z');
		expect(nextFire(new Date('2026-11-20T16:00:00Z'), 'none')).toBeNull();
	});
});

describe('connectors', () => {
	it('an MCP server\'s tools become agent tools, and a connector without its token says what to set', async () => {
		const called: unknown[] = [];
		const { app } = await testApp({ 'qwen3:8b': [{ toolCall: { name: 'mcp__github__list_issues', args: { repo: 'gkson-lab/onyx' } } }, { content: 'There is one open issue.' }] }, { GITHUB_MCP_TOKEN: 't' }, {
			connect: async () => ({ listTools: async () => ({ tools: [{ name: 'list_issues', description: 'List issues', inputSchema: { type: 'object', properties: { repo: { type: 'string' } } } }] }), callTool: async (a) => (called.push(a), { content: [{ type: 'text', text: '#1 Fix the thing' }] }), close: async () => {} }),
		});
		const st = await app.connectors.start({ github: { transport: 'http', url: 'https://api.githubcopilot.com/mcp/readonly', token_env: 'GITHUB_MCP_TOKEN', enabled: true }, other: { transport: 'http', url: 'https://x.test/mcp', token_env: 'MISSING_TOKEN', enabled: true }, off: { transport: 'stdio', command: 'npx', args: [], enabled: false } });
		expect(st.map((c) => `${c.id}:${c.state}`)).toEqual(['github:connected', 'other:needs_token', 'off:off']);
		expect(st[1]!.error).toBe('Set MISSING_TOKEN in .env.');
		await app.runtime.saveAgent({ ...(await app.runtime.agent('core'))!, tools: ['connector:github'] });
		const r = await app.runtime.run({ agentId: 'core', input: 'any open issues?', userId: 'owner', channel: 'web' });
		expect(r.output).toBe('There is one open issue.');
		expect(called).toEqual([{ name: 'list_issues', arguments: { repo: 'gkson-lab/onyx' } }]);
		await app.connectors.stop();
		expect(app.tools.names().some((n) => n.startsWith('mcp__'))).toBe(false);
	});
});

describe('the server', () => {
	it('accepts a chat message, runs it, and serves the run with its steps; history is kept', async () => {
		const { app } = await testApp({ 'qwen3:4b': [{ toolCall: { name: 'route', args: { tier: 'standard', complexity: 'low', tools: [], urgency: 'normal', reason: 'small talk' } } }], 'qwen3:8b': [{ content: 'Hi.' }] });
		const server = await buildServer(app, { webDir: '/nonexistent' });
		const res = await server.inject({ method: 'POST', url: '/api/chat', payload: { text: 'hello there' } });
		expect(res.statusCode).toBe(202);
		const { runId } = res.json();
		let run: any;
		for (let i = 0; i < 50; i++) {
			run = (await server.inject({ method: 'GET', url: `/api/runs/${runId}` })).json();
			if (run.runs?.[0]?.status === 'done') break;
			await new Promise((r) => setTimeout(r, 20));
		}
		expect(run.runs[0]).toMatchObject({ status: 'done', output: 'Hi.', tier: 'standard', model: 'qwen3:8b', routing: { via: 'router', reason: 'small talk' } });
		expect(run.steps.map((s: any) => s.type)).toEqual(['started', 'finished']);
		await new Promise((r) => setTimeout(r, 30));
		expect((await server.inject({ method: 'GET', url: '/api/messages' })).json().messages.map((m: any) => `${m.direction}:${m.text}`)).toEqual(['in:hello there', 'out:Hi.']);
		const list = (await server.inject({ method: 'GET', url: '/api/runs?channel=web' })).json();
		expect(list.runs[0]).toMatchObject({ id: runId, tokens: 15, agents: 1 });
		expect((await server.inject({ method: 'GET', url: '/api/runs?channel=sms' })).json().runs).toHaveLength(0);
		expect((await server.inject({ method: 'POST', url: '/api/chat', payload: { text: '  ' } })).statusCode).toBe(400);
		const usage = (await server.inject({ method: 'GET', url: '/api/usage' })).json();
		expect(usage).toMatchObject({ plan: 'max', used_today: 30 });
		expect(usage.by_agent.map((a: any) => a.purpose).sort()).toEqual(['core', 'route']);
	});

	it('validates agent edits, protects Core, rejects a broken tiers file, and never sends a key', async () => {
		const { app } = await testApp({}, { MOONSHOT_API_KEY: 'sk-very-secret' });
		const server = await buildServer(app, { webDir: '/nonexistent', tiersPath: '/nonexistent/tiers.yaml' });
		const agents = (await server.inject({ method: 'GET', url: '/api/agents' })).json();
		expect(agents.agents.map((a: any) => a.id)).toEqual(['coder', 'core', 'memory', 'messenger', 'researcher', 'scheduler']);
		const core = agents.agents.find((a: any) => a.id === 'core');
		expect((await server.inject({ method: 'PUT', url: '/api/agents/core', payload: { ...core, enabled: false } })).statusCode).toBe(400);
		expect((await server.inject({ method: 'PUT', url: '/api/agents/core', payload: { ...core, max_steps: 999 } })).statusCode).toBe(400);
		expect((await server.inject({ method: 'PUT', url: '/api/agents/helper', payload: { name: 'Helper', system_prompt: 'Help.', tier: 'lite', tools: [] } })).statusCode).toBe(200);
		expect((await server.inject({ method: 'DELETE', url: '/api/agents/core' })).statusCode).toBe(400);
		expect((await server.inject({ method: 'DELETE', url: '/api/agents/helper' })).statusCode).toBe(200);
		expect((await server.inject({ method: 'PUT', url: '/api/tiers/raw', payload: { yaml: 'version: 1\nproviders: {}\n' } })).statusCode).toBe(400);
		const settings = await server.inject({ method: 'GET', url: '/api/settings' });
		expect(settings.json().keys.find((k: any) => k.name === 'MOONSHOT_API_KEY')).toEqual({ name: 'MOONSHOT_API_KEY', set: true });
		expect(settings.body).not.toContain('sk-very-secret');
		expect((await server.inject({ method: 'PUT', url: '/api/settings', payload: { preferred_channels: ['sms', 'web'] } })).statusCode).toBe(200);
		expect(await app.outbox.preferred()).toEqual(['sms', 'web']);
		expect((await server.inject({ method: 'GET', url: '/api/channels' })).json().channels.map((c: any) => `${c.id}:${c.ok}`)).toEqual(['web:true', 'whatsapp:false', 'sms:false']);
	});
});

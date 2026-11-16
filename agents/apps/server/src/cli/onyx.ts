// The terminal: `pnpm onyx chat` talks to Onyx on this machine; `pnpm onyx models` checks tiers.yaml against what
// each provider really has; `pnpm onyx tiers` prints the tiers.
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import type { ChatMessage } from '@onyx/shared';
import { createApp } from '../app.ts';
import { AllModelsFailed, LimitError } from '../models/gateway.ts';
import { listModels } from '../models/provider.ts';

const dim = (s: string) => (stdout.isTTY ? `\x1b[2m${s}\x1b[0m` : s);
const inv = (s: string) => (stdout.isTTY ? `\x1b[7m ${s} \x1b[0m` : `[${s}]`);
const money = (c: number | null) => (c === null ? 'no price set' : c === 0 ? '$0 (local)' : `$${c.toFixed(5)}`);

async function models(): Promise<number> {
	const app = await createApp();
	let bad = 0;
	for (const [name, p] of Object.entries(app.config.file.providers)) {
		const wanted = Object.entries(app.config.file.models).filter(([, m]) => m.provider === name).map(([, m]) => m.id);
		if (!app.config.usable(name)) {
			console.log(`${name}: off (${p.local ? 'local' : 'cloud: needs ONYX_CLOUD=on and its key'}). Configured: ${wanted.join(', ')}`);
			continue;
		}
		try {
			const have = await listModels(app.config.baseUrl(name), app.config.apiKey(name));
			console.log(`${name}: ${have.length} models available`);
			for (const id of wanted) {
				const ok = have.includes(id) || have.includes(`${id}:latest`);
				if (!ok) bad++;
				console.log(`  ${ok ? 'ok     ' : 'MISSING'} ${id}${ok ? '' : name === 'ollama' ? `   -> run: ollama pull ${id}` : '   -> not in this provider\'s list: fix the id in config/tiers.yaml'}`);
			}
		} catch (e) {
			bad++;
			console.log(`${name}: ${(e as Error).message}${name === 'ollama' ? '\n  Is Ollama running? Install it from ollama.com, then start it.' : ''}`);
		}
	}
	console.log(bad ? `\n${bad} problem${bad === 1 ? '' : 's'}. Chat will fall back where it can, and say so.` : '\nEvery configured model is available.');
	return bad ? 1 : 0;
}

async function tiers(): Promise<number> {
	const app = await createApp();
	for (const t of app.config.publicTiers()) console.log(`${t.label.toUpperCase().padEnd(9)} ${t.model ?? '(no usable model)'}${t.provider ? dim(`  ${t.provider}${t.local ? ', local' : ', cloud'}`) : ''}${t.alternates.length ? dim(`  then ${t.alternates.join(', ')}`) : ''}`);
	return 0;
}

async function chatLoop(): Promise<number> {
	const app = await createApp({ onFallback: (f) => console.log(dim(`  fallback (${f.kind}): ${f.from} -> ${f.to}: ${f.reason}`)) });
	const rl = createInterface({ input: stdin, output: stdout });
	const history: ChatMessage[] = [{ role: 'system', content: 'You are Onyx, an assistant by GK Labs. Be direct and brief. Say so when you do not know.' }];
	console.log('Onyx. Type a message. Start with /lite, /standard, /pro or /max to choose the tier. /quit to leave.\n');
	for (;;) {
		let line: string;
		try {
			line = (await rl.question('> ')).trim();
		} catch {
			break;
		}
		if (!line) continue;
		if (/^\/(quit|exit)$/i.test(line)) break;
		try {
			const d = await app.router.route(app.owner, line);
			console.log(dim(`  route (${d.via}): ${d.tier}: ${d.reason}`));
			history.push({ role: 'user', content: d.text });
			let shown = false;
			const r = await app.gateway.complete({ userId: app.owner, tier: d.tier, messages: history, onDelta: (t) => ((shown = true), stdout.write(t)) });
			if (!shown) stdout.write(r.content);
			history.push({ role: 'assistant', content: r.content });
			console.log(`\n${inv(app.config.file.tiers[r.tier].label.toUpperCase())} ${r.model}${dim(`  ${r.usage.input}+${r.usage.output} tokens${r.usage.estimated ? ' (estimated)' : ''} · ${money(r.costUsd)} · ${r.latencyMs} ms`)}\n`);
		} catch (e) {
			if (history.at(-1)?.role === 'user') history.pop();
			console.log(e instanceof LimitError || e instanceof AllModelsFailed ? `\n${e.message}\n` : `\nError: ${(e as Error).message}\n`);
		}
	}
	rl.close();
	return 0;
}

const cmd = process.argv[2] ?? 'chat';
const run = cmd === 'models' ? models : cmd === 'tiers' ? tiers : cmd === 'chat' ? chatLoop : null;
if (!run) {
	console.log('Usage: pnpm onyx [chat | models | tiers]');
	process.exit(2);
}
run().then((code) => process.exit(code), (e) => (console.error(e instanceof Error ? e.message : e), process.exit(1)));

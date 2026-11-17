// The terminal: `pnpm onyx chat` talks to Onyx on this machine; `pnpm onyx models` checks tiers.yaml against what
// each provider really has; `pnpm onyx tiers` prints the tiers.
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { createApp } from '../app.ts';
import { receive } from '../index.ts';
import { listModels } from '../models/provider.ts';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { LOCAL_TIERS, ROOT, parseTiers, tiersPath } from '../config.ts';
import { applyToTiers, bandwidthOf, detect, plan } from '../hardware.ts';

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
	const app = await createApp();
	const rl = createInterface({ input: stdin, output: stdout });
	let wrote = false;
	// The same events the app shows live, printed as they happen.
	app.bus.on((e) => {
		const who = e.agentId ?? '';
		const pad = '  '.repeat(e.parentId ? 2 : 1);
		if (e.type === 'routed') console.log(dim(`  route (${e.data.via}): ${e.data.tier}: ${e.data.reason}`));
		else if (e.type === 'delta') (wrote = true), stdout.write(String(e.data.text));
		else if (e.type === 'tool_call') console.log(dim(`${wrote ? '\n' : ''}${pad}${who} -> ${e.data.tool} ${JSON.stringify(e.data.args).slice(0, 160)}`)), (wrote = false);
		else if (e.type === 'tool_result') console.log(dim(`${pad}${who} <- ${e.data.ok ? 'ok' : 'failed'} ${String(e.data.result).replace(/\s+/g, ' ').slice(0, 160)} (${e.data.ms} ms)`));
		else if (e.type === 'fallback') console.log(dim(`${pad}fallback (${e.data.kind}): ${e.data.from} -> ${e.data.to}: ${e.data.reason}`));
		else if (e.type === 'started' && e.parentId) console.log(dim(`${pad}${who} started (${e.data.tier})`));
		else if ((e.type === 'finished' || e.type === 'error') && e.parentId) console.log(dim(`${pad}${who} ${e.data.status}${e.data.error ? `: ${e.data.error}` : ''} (${e.data.ms} ms)`));
	});
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
		wrote = false;
		const r = await receive(app, { userId: app.owner, text: line, channel: 'terminal' });
		if (!wrote || r.status !== 'done') stdout.write(r.reply);
		console.log(`\n${r.tier ? `${inv(app.config.file.tiers[r.tier].label.toUpperCase())} ${r.model}` : ''}${dim(`  ${r.tokens} tokens · ${money(r.costUsd)}${r.equivalentUsd != null ? ` · about $${r.equivalentUsd.toFixed(5)} if hosted` : ''}`)}\n`);
	}
	rl.close();
	return 0;
}

/** `pnpm onyx hardware [--vram 16] [--ram 32] [--ram-speed 6000] [--gpu "RTX 5060 Ti"] [--apply]` */
async function hardware(): Promise<number> {
	const arg = (name: string) => {
		const i = process.argv.indexOf(`--${name}`);
		return i > 0 ? process.argv[i + 1] : undefined;
	};
	const hw = await detect();
	if (arg('gpu') || arg('vram')) {
		const name = arg('gpu') ?? hw.gpu?.name ?? 'unknown card';
		hw.gpu = { name, vramGb: Number(arg('vram') ?? hw.gpu?.vramGb ?? 8), bandwidthGbs: bandwidthOf(name) ?? hw.gpu?.bandwidthGbs ?? null };
	}
	if (arg('ram')) hw.ramGb = Number(arg('ram'));
	if (arg('ram-speed')) hw.ramMts = Number(arg('ram-speed'));
	const p = plan(hw);
	console.log(`${hw.gpu ? `${hw.gpu.name}, ${hw.gpu.vramGb} GB` : 'No NVIDIA graphics card found'} · ${hw.ramGb} GB memory${hw.ramMts ? ` at ${hw.ramMts} MT/s` : ''} · ${hw.cpu}`);
	console.log(dim(`Context ${p.context.toLocaleString('en-US')} tokens. Estimates, +/- 40%: measure with ollama run <model> --verbose.\n`));
	console.log(dim('Model        Needs     Where                Speed'));
	for (const f of p.fits) console.log(`${f.id.padEnd(12)} ${`${f.needGb} GB`.padEnd(9)} ${(f.where === 'gpu' ? 'graphics card' : f.where === 'split' ? `split, ${Math.round(f.gpuShare * 100)}% on card` : f.where === 'cpu' ? 'processor' : "doesn't fit").padEnd(20)} ${f.tokensPerSec != null ? `${f.tokensPerSec} tokens/s` : ''}`);
	console.log('\nRecommended tiers:');
	for (const t of ['lite', 'standard', 'pro', 'max'] as const) console.log(`  ${inv(t.toUpperCase())} ${p.tiers[t]}${dim(`  ${p.reasons[t]}`)}`);
	console.log('');
	for (const w of p.warnings) console.log(dim(`- ${w}`));
	console.log(`\nSet these for Ollama (Windows: run each, then quit Ollama from the tray and start it again):`);
	for (const [k, v] of Object.entries(p.env)) console.log(`  setx ${k} ${v}`);
	console.log(`\nPull the models:\n${[...new Set(Object.values(p.tiers))].map((m) => `  ollama pull ${m}`).join('\n')}`);
	if (process.argv.includes('--apply')) {
		const r = await applyToTiers(readFileSync(tiersPath(), 'utf8'), p.tiers);
		parseTiers(r.yaml);
		writeFileSync(LOCAL_TIERS, r.yaml);
		console.log(r.changed.length ? `\nSaved in config/tiers.local.yaml: ${r.changed.join(', ')}` : '\nThe tiers already use these models.');
	} else console.log(dim('\nAdd --apply to use these models (saved in config/tiers.local.yaml, which updates leave alone).'));
	return 0;
}

/**
 * `pnpm onyx setup`: everything after the programs are installed, in one go, and safe to run again. Used by
 * "Setup Onyx.bat". It makes .env, asks for a password, picks models for this PC, writes them into tiers.yaml, sets
 * Ollama's settings (on Windows) and downloads the models.
 */
async function setup(): Promise<number> {
	const env = resolve(ROOT, '.env');
	if (!existsSync(env)) {
		copyFileSync(resolve(ROOT, '.env.example'), env);
		console.log('Made .env from .env.example.');
	}
	let text = readFileSync(env, 'utf8');
	if (!/^ONYX_PASSWORD=\S+/m.test(text)) {
		const rl = createInterface({ input: stdin, output: stdout, terminal: false });
		const ask = () => stdout.write('Choose a password for using Onyx from your phone (8 characters or more): ');
		let pw = '';
		ask();
		for await (const line of rl) {
			pw = line.trim();
			if (pw.length >= 8) break;
			console.log('That is shorter than 8 characters.');
			ask();
		}
		rl.close();
		if (pw.length < 8) {
			console.log('\nNo password was set, so setup stopped. Run it again and type one.');
			return 1;
		}
		text = /^ONYX_PASSWORD=.*$/m.test(text) ? text.replace(/^ONYX_PASSWORD=.*$/m, `ONYX_PASSWORD=${pw}`) : `${text.trimEnd()}\nONYX_PASSWORD=${pw}\n`;
		writeFileSync(env, text);
		console.log('Saved the password in .env.');
	} else console.log('A password is already set in .env.');

	const hw = await detect();
	const p = plan(hw);
	console.log(`\n${hw.gpu ? `${hw.gpu.name}, ${hw.gpu.vramGb} GB` : 'No NVIDIA graphics card found'} · ${hw.ramGb} GB memory. Models: ${Object.entries(p.tiers).map(([t, m]) => `${t} ${m}`).join(', ')}.`);
	const r = await applyToTiers(readFileSync(tiersPath(), 'utf8'), p.tiers);
	parseTiers(r.yaml);
	writeFileSync(LOCAL_TIERS, r.yaml);
	if (r.changed.length) console.log(`Saved in config/tiers.local.yaml: ${r.changed.join(', ')}`);

	if (process.platform === 'win32') {
		for (const [k, v] of Object.entries(p.env)) spawnSync('setx', [k, v], { stdio: 'ignore' });
		console.log(`Set Ollama's settings: ${Object.entries(p.env).map(([k, v]) => `${k}=${v}`).join(', ')}.`);
	} else console.log(`Set these in Ollama's environment: ${Object.entries(p.env).map(([k, v]) => `${k}=${v}`).join(' ')}`);

	const models = [...new Set(Object.values(p.tiers))].sort((a, b) => p.fits.find((f) => f.id === a)!.needGb - p.fits.find((f) => f.id === b)!.needGb);
	for (const m of models) {
		console.log(`\nDownloading ${m} (safe to stop and run again: it picks up where it left off)`);
		const pull = spawnSync('ollama', ['pull', m], { stdio: 'inherit', shell: process.platform === 'win32' });
		if (pull.status !== 0) {
			console.log(`\nCould not download ${m}. Is Ollama running? Start it from the Start menu, then run setup again.`);
			return 1;
		}
	}
	console.log('\nSetup is done.');
	return 0;
}

/**
 * `pnpm onyx ollama-env [--save]`: the settings Ollama should run with on this PC, one KEY=VALUE per line, for the
 * Windows scripts to start Ollama with. --save also stores them for Ollama's own start at sign-in (setx).
 */
async function ollamaEnv(): Promise<number> {
	const p = plan(await detect());
	for (const [k, v] of Object.entries(p.env)) {
		console.log(`${k}=${v}`);
		if (process.argv.includes('--save') && process.platform === 'win32') spawnSync('setx', [k, v], { stdio: 'ignore' });
	}
	return 0;
}

/** `pnpm onyx errors`: the latest failed model calls, with their messages. */
async function errors(): Promise<number> {
	const app = await createApp();
	const rows = await app.db.selectFrom('model_calls').select(['created_at', 'model_id', 'purpose', 'attempt', 'error']).where('status', '=', 'error').orderBy('id', 'desc').limit(20).execute();
	if (!rows.length) console.log('No failed model calls.');
	for (const r of rows) console.log(`${r.created_at.replace('T', ' ').slice(0, 19)}  ${r.model_id.padEnd(18)} ${r.purpose.padEnd(10)} try ${r.attempt + 1}  ${r.error}`);
	return 0;
}

const cmd = process.argv[2] ?? 'chat';
const run = cmd === 'models' ? models : cmd === 'tiers' ? tiers : cmd === 'chat' ? chatLoop : cmd === 'hardware' ? hardware : cmd === 'setup' ? setup : cmd === 'ollama-env' ? ollamaEnv : cmd === 'errors' ? errors : null;
if (!run) {
	console.log('Usage: pnpm onyx [chat | models | tiers | hardware | setup | ollama-env | errors]');
	process.exit(2);
}
run().then((code) => process.exit(code), (e) => (console.error(e instanceof Error ? e.message : e), process.exit(1)));

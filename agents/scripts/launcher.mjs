// Runs Onyx, and starts it again after it has updated itself.
//
// When Onyx updates itself from GitHub, it writes data/update/restart and stops. This then installs the new
// version's dependencies, rebuilds the app, and starts Onyx again. "Start Onyx.bat" runs it; on macOS or Linux, run
// `node scripts/launcher.mjs` in agents/ instead of `pnpm start` for the same.
//
// Plain JavaScript run by node itself, not through tsx: nothing it holds open is inside node_modules while pnpm
// replaces what is there (Windows will not replace a program that is running).
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const marker = join(dir, 'data', 'update', 'restart');
const pnpm = process.env.ONYX_PNPM || 'pnpm';
const win = process.platform === 'win32';

/** Runs pnpm with these arguments in agents/, showing what it prints, and resolves to its exit code. */
const run = (args) =>
	new Promise((done) => {
		// pnpm is a .cmd file on Windows, which needs a shell; quoted, for a path with spaces in it.
		const child = spawn(win ? `"${pnpm}"` : pnpm, args, { cwd: dir, stdio: 'inherit', shell: win, env: { ...process.env, ONYX_LAUNCHER: '1' } });
		child.on('error', (e) => (console.log(`  Could not run pnpm: ${e.message}`), done(1)));
		child.on('exit', (code) => done(code ?? 1));
	});

rmSync(marker, { force: true });
for (;;) {
	const code = await run(['start']);
	if (!existsSync(marker)) process.exit(code);
	const to = readFileSync(marker, 'utf8').trim();
	rmSync(marker, { force: true });
	console.log(`\n  Onyx updated itself to ${to.slice(0, 7)}. Installing and building the new version, then starting it again...\n`);
	if ((await run(['install'])) !== 0 || (await run(['build'])) !== 0) {
		console.log('\n  The new version is here, but installing or building it failed (the message is above).');
		console.log('  "Update Onyx" tries again; "Update Onyx.bat /undo" puts back the version from before.\n');
		process.exit(1);
	}
}

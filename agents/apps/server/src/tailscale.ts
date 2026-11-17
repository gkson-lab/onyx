// What Tailscale is doing on this PC, for the Settings screen: whether it is installed and signed in, whether HTTPS is
// on for the account, whether `tailscale serve` passes the PC's Tailscale address to Onyx, and that address, with a
// QR code for the phone's camera. It only reads (`tailscale status`, `tailscale serve status`); it never changes them.
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import QRCode from 'qrcode';

/** Runs the tailscale command with these arguments and resolves to what it printed. */
export type RunTailscale = (args: string[]) => Promise<string>;

export interface TailscaleStatus {
	installed: boolean;
	/** Tailscale's own word for its state: Running, NeedsLogin, Stopped, Starting. */
	state: string | null;
	signedIn: boolean;
	/** HTTPS certificates are on for the account: what lets the installed app on a phone show notifications. */
	https: boolean;
	/** This PC's address on Tailscale, like https://your-pc.tail1234.ts.net */
	address: string | null;
	/** `tailscale serve` passes that address to Onyx. */
	serving: boolean;
	/** The address as a QR code (SVG), once it works. */
	qrSvg: string | null;
	/** The one thing to do next, or null when it is all set up. */
	next: string | null;
}

/** Where Tailscale's command is: on Windows its installer puts it on PATH, but a window opened before may not know. */
function command(): string {
	if (process.platform === 'win32') {
		const exe = `${process.env.ProgramFiles ?? 'C:\\Program Files'}\\Tailscale\\tailscale.exe`;
		if (existsSync(exe)) return exe;
	}
	if (process.platform === 'darwin' && existsSync('/Applications/Tailscale.app/Contents/MacOS/Tailscale')) return '/Applications/Tailscale.app/Contents/MacOS/Tailscale';
	return 'tailscale';
}

export const runTailscale: RunTailscale = (args) =>
	new Promise((resolve, reject) => {
		// `tailscale status` exits with 1 while signed out but still prints its JSON, so output wins over the exit code.
		execFile(command(), args, { timeout: 5000, windowsHide: true }, (err, stdout) => (stdout.trim() ? resolve(stdout) : reject(err ?? new Error('no output'))));
	});

export async function tailscaleStatus(port: number, run: RunTailscale = runTailscale): Promise<TailscaleStatus> {
	const out: TailscaleStatus = { installed: false, state: null, signedIn: false, https: false, address: null, serving: false, qrSvg: null, next: null };
	let status: { BackendState?: string; Self?: { DNSName?: string }; CertDomains?: string[] | null };
	try {
		status = JSON.parse(await run(['status', '--json']));
	} catch (e) {
		if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
			out.next = 'Install Tailscale on this PC (tailscale.com/download) and sign in. Then close Onyx and start it again with the shortcut.';
			return out;
		}
		out.installed = true;
		out.next = 'Tailscale is installed but not answering. Open Tailscale from the Start menu and sign in.';
		return out;
	}
	out.installed = true;
	out.state = status.BackendState ?? null;
	out.signedIn = out.state === 'Running';
	if (!out.signedIn) {
		out.next = out.state === 'NeedsLogin' || out.state === 'NoState' ? 'Sign in to Tailscale on this PC. On Windows, its icon is by the clock.' : `Tailscale is ${out.state ? out.state.toLowerCase() : 'not running'}. Open it and connect.`;
		return out;
	}
	const name = String(status.Self?.DNSName ?? '').replace(/\.$/, '');
	if (name) out.address = `https://${name}`;
	out.https = Array.isArray(status.CertDomains) && status.CertDomains.length > 0;
	if (!out.https) {
		out.next = "Turn on MagicDNS and HTTPS Certificates on the DNS page of Tailscale's admin console (login.tailscale.com/admin/dns).";
		return out;
	}
	try {
		out.serving = new RegExp(`(127\\.0\\.0\\.1|localhost):${port}(?!\\d)`).test(await run(['serve', 'status', '--json']));
	} catch {
		// No serve settings at all; the next step says how.
	}
	if (!out.serving) {
		out.next = `Close Onyx and start it again with the shortcut: it shares Onyx with your phone. Or run this once: \`tailscale serve --bg ${port}\``;
		return out;
	}
	if (out.address) out.qrSvg = await QRCode.toString(out.address, { type: 'svg', margin: 1 });
	return out;
}

import { describe, expect, it } from 'vitest';
import { tailscaleStatus, type RunTailscale } from '../src/tailscale.ts';
import { buildServer } from '../src/index.ts';
import { testApp } from './helpers.ts';

const NAME = 'desktop-abc.tail1234.ts.net';
const SERVING = JSON.stringify({ TCP: { 443: { HTTPS: true } }, Web: { [`${NAME}:443`]: { Handlers: { '/': { Proxy: 'http://127.0.0.1:8787' } } } } });

/** A pretend tailscale command: `status` and `serve status` print these, or it is not installed at all. */
const fake = (status: object | null, serve = '{}'): RunTailscale => async (args) => {
	if (!status) throw Object.assign(new Error('spawn tailscale ENOENT'), { code: 'ENOENT' });
	return args[0] === 'serve' ? serve : JSON.stringify(status);
};
const running = { BackendState: 'Running', Self: { DNSName: `${NAME}.` }, CertDomains: [NAME] };

describe('Tailscale, step by step', () => {
	it('not installed', async () => {
		const s = await tailscaleStatus(8787, fake(null));
		expect(s).toMatchObject({ installed: false, signedIn: false, serving: false, address: null });
		expect(s.next).toMatch(/^Install Tailscale on this PC/);
	});

	it('installed, signed out', async () => {
		const s = await tailscaleStatus(8787, fake({ BackendState: 'NeedsLogin' }));
		expect(s).toMatchObject({ installed: true, state: 'NeedsLogin', signedIn: false });
		expect(s.next).toMatch(/^Sign in to Tailscale/);
	});

	it('signed in, HTTPS not on for the account', async () => {
		const s = await tailscaleStatus(8787, fake({ ...running, CertDomains: null }));
		expect(s).toMatchObject({ signedIn: true, https: false, address: `https://${NAME}`, serving: false, qrSvg: null });
		expect(s.next).toContain('HTTPS Certificates');
	});

	it('HTTPS on, but nothing serves Onyx yet (or only something else)', async () => {
		for (const serve of ['{}', JSON.stringify({ Web: { [`${NAME}:443`]: { Handlers: { '/': { Proxy: 'http://127.0.0.1:87870' } } } } })]) {
			const s = await tailscaleStatus(8787, fake(running, serve));
			expect(s).toMatchObject({ https: true, serving: false });
			expect(s.next).toContain('tailscale serve --bg 8787');
		}
	});

	it('all set: the address, and a QR code of it for the phone', async () => {
		const s = await tailscaleStatus(8787, fake(running, SERVING));
		expect(s).toMatchObject({ installed: true, signedIn: true, https: true, serving: true, address: `https://${NAME}`, next: null });
		expect(s.qrSvg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
	});
});

describe('through Tailscale, Onyx asks for the password', () => {
	it('a request Tailscale passed on is from another device, even though it arrives from this PC', async () => {
		const { app } = await testApp({});
		const server = await buildServer(app, { webDir: '/nonexistent', tailscale: fake(running, SERVING) });
		expect((await server.inject({ method: 'GET', url: '/api/runs' })).statusCode).toBe(200);
		const via = { 'tailscale-user-login': 'someone@example.com' };
		expect((await server.inject({ method: 'GET', url: '/api/runs', headers: via })).statusCode).toBe(401);
		expect((await server.inject({ method: 'GET', url: '/api/session', headers: via })).json()).toMatchObject({ signed_in: false, needs_password: true });
		expect((await server.inject({ method: 'GET', url: '/api/tailscale' })).json()).toMatchObject({ serving: true, address: `https://${NAME}` });
	});
});

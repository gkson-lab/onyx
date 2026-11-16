import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildServer, limiter } from '../src/index.ts';
import { testApp } from './helpers.ts';

const ENV = { WHATSAPP_TOKEN: 'wa-token', WHATSAPP_PHONE_ID: '1555', WHATSAPP_APP_SECRET: 'app-secret', WHATSAPP_VERIFY_TOKEN: 'verify-me', TWILIO_ACCOUNT_SID: 'AC1', TWILIO_AUTH_TOKEN: 'tw-token', TWILIO_FROM: '+15005550006', PUBLIC_URL: 'https://onyx.example.com' };
const routeLite = { toolCall: { name: 'route', args: { tier: 'lite', complexity: 'low', tools: [], urgency: 'normal', reason: 'short' } } };

async function setup(script = { 'qwen3:4b': [routeLite, { content: 'Hello from Onyx.' }] }, env: Record<string, string> = ENV) {
	const sent: { url: string; body: string; auth: string }[] = [];
	const phoneFetch = (async (url: string, init: any) => (sent.push({ url, body: String(init.body), auth: init.headers.authorization }), new Response('{}', { status: 200 }))) as unknown as typeof fetch;
	const t = await testApp(script, env, { phoneFetch });
	const server = await buildServer(t.app, { webDir: '/nonexistent' });
	return { ...t, server, sent };
}
const waBody = (from: string, text: string | null, type = 'text') => JSON.stringify({ entry: [{ changes: [{ value: { messages: [{ from, type, ...(text !== null ? { text: { body: text } } : {}) }] } }] }] });
const waSign = (raw: string) => `sha256=${createHmac('sha256', ENV.WHATSAPP_APP_SECRET).update(raw).digest('hex')}`;
const twSign = (params: Record<string, string>) => createHmac('sha1', ENV.TWILIO_AUTH_TOKEN).update(`${ENV.PUBLIC_URL}/webhooks/sms${Object.keys(params).sort().map((k) => k + params[k]).join('')}`).digest('base64');
const settle = () => new Promise((r) => setTimeout(r, 150));

describe('WhatsApp', () => {
	it('answers Meta\'s verification only with the right token', async () => {
		const { server } = await setup();
		const ok = await server.inject({ method: 'GET', url: '/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=4242' });
		expect([ok.statusCode, ok.body]).toEqual([200, '4242']);
		expect((await server.inject({ method: 'GET', url: '/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=1' })).statusCode).toBe(403);
	});

	it('rejects an unsigned or wrongly signed webhook, ignores strangers, links a number by its code, then answers it', async () => {
		const { server, app, sent, seen } = await setup();
		const post = (raw: string, sig = waSign(raw)) => server.inject({ method: 'POST', url: '/webhooks/whatsapp', payload: raw, headers: { 'content-type': 'application/json', 'x-hub-signature-256': sig } });
		expect((await post(waBody('15125550123', 'hi'), 'sha256=00')).statusCode).toBe(401);
		expect((await server.inject({ method: 'POST', url: '/webhooks/whatsapp', payload: waBody('15125550123', 'hi'), headers: { 'content-type': 'application/json' } })).statusCode).toBe(401);

		// A stranger: accepted from Meta, and nothing happens.
		expect((await post(waBody('19995550000', 'hello?'))).statusCode).toBe(200);
		await settle();
		expect(sent).toHaveLength(0);
		expect(seen).toHaveLength(0);

		const link = (await server.inject({ method: 'POST', url: '/api/identities', payload: { channel: 'whatsapp', handle: '+1 (512) 555-0123' } })).json();
		expect(link.handle).toBe('+15125550123');
		expect(link.code).toMatch(/^\d{6}$/);
		// Before the code: on the allowlist, but not answered.
		await post(waBody('15125550123', 'hi'));
		await settle();
		expect(seen).toHaveLength(0);
		await post(waBody('15125550123', link.code));
		expect(sent).toHaveLength(1);
		expect(JSON.parse(sent[0]!.body)).toMatchObject({ to: '15125550123', type: 'text', text: { body: 'This number is now linked to Onyx. Text me anything.' } });
		expect(sent[0]!.auth).toBe('Bearer wa-token');

		await post(waBody('15125550123', 'hi there'));
		await settle();
		expect(JSON.parse(sent[1]!.body).text.body).toBe('Hello from Onyx.');
		expect(sent[1]!.url).toBe('https://graph.facebook.com/v21.0/1555/messages');
		const runs = await app.db.selectFrom('runs').select(['channel', 'status']).execute();
		expect(runs).toEqual([{ channel: 'whatsapp', status: 'done' }]);

		await post(waBody('15125550123', null, 'audio'));
		expect(JSON.parse(sent[2]!.body).text.body).toMatch(/only read text messages.*voice notes/);
	});

	it('texts first with a plain message inside 24 hours of your last one, and with the template after that', async () => {
		const { app, sent } = await setup();
		await app.db.insertInto('identities').values({ user_id: 'owner', channel: 'whatsapp', handle: '+15125550123', verified_at: new Date().toISOString(), code: null, code_expires: null, last_inbound: new Date().toISOString() }).execute();
		await app.outbox.deliver('owner', 'Reminder: **stretch**', { proactive: true });
		expect(JSON.parse(sent[0]!.body)).toMatchObject({ type: 'text', text: { body: 'Reminder: *stretch*' } });
		await app.db.updateTable('identities').set({ last_inbound: new Date(Date.now() - 25 * 3600 * 1000).toISOString() }).execute();
		await app.outbox.deliver('owner', 'Reminder: stretch', { proactive: true });
		expect(JSON.parse(sent[1]!.body)).toMatchObject({ type: 'template', template: { name: 'onyx_alert', components: [{ type: 'body', parameters: [{ type: 'text', text: 'Reminder: stretch' }] }] } });
	});
});

describe('SMS', () => {
	it('checks Twilio\'s signature, answers a linked number through Twilio, and splits nothing short', async () => {
		const { server, app, sent } = await setup();
		await app.db.insertInto('identities').values({ user_id: 'owner', channel: 'sms', handle: '+15125550123', verified_at: new Date().toISOString(), code: null, code_expires: null, last_inbound: null }).execute();
		await server.inject({ method: 'PUT', url: '/api/settings', payload: { allowlist: ['+15125550123'] } });
		const params = { From: '+15125550123', To: '+15005550006', Body: 'hi there', MessageSid: 'SM1' };
		const post = (p: Record<string, string>, sig: string) => server.inject({ method: 'POST', url: '/webhooks/sms', payload: new URLSearchParams(p).toString(), headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-twilio-signature': sig } });
		expect((await post(params, 'nope')).statusCode).toBe(401);
		expect((await post({ ...params, Body: 'tampered' }, twSign(params))).statusCode).toBe(401);
		const ok = await post(params, twSign(params));
		expect([ok.statusCode, ok.body]).toEqual([200, '<Response></Response>']);
		await settle();
		expect(sent).toHaveLength(1);
		expect(sent[0]!.url).toBe('https://api.twilio.com/2010-04-01/Accounts/AC1/Messages.json');
		expect(Object.fromEntries(new URLSearchParams(sent[0]!.body))).toEqual({ To: '+15125550123', From: '+15005550006', Body: 'Hello from Onyx.' });
		expect(sent[0]!.auth).toBe(`Basic ${Buffer.from('AC1:tw-token').toString('base64')}`);
	});

	it('says exactly what is missing when it is not set up', async () => {
		const { server } = await setup(undefined, {});
		const ch = (await server.inject({ method: 'GET', url: '/api/channels' })).json().channels;
		expect(ch.find((c: any) => c.id === 'sms').detail).toContain('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, PUBLIC_URL missing');
		expect(ch.find((c: any) => c.id === 'whatsapp').ok).toBe(false);
	});
});

describe('access', () => {
	it('this PC needs no sign-in; anything arriving through a tunnel needs the password; webhooks stay reachable', async () => {
		const { server } = await setup(undefined, { ...ENV, ONYX_PASSWORD: 'correct horse' });
		const via = { 'x-forwarded-for': '203.0.113.9' };
		expect((await server.inject({ method: 'GET', url: '/api/agents' })).statusCode).toBe(200);
		expect((await server.inject({ method: 'GET', url: '/api/agents', headers: via })).statusCode).toBe(401);
		expect((await server.inject({ method: 'GET', url: '/api/session', headers: via })).json()).toEqual({ signed_in: false, needs_password: true, has_password: true });
		expect((await server.inject({ method: 'POST', url: '/api/login', headers: via, payload: { password: 'wrong' } })).statusCode).toBe(401);
		const login = await server.inject({ method: 'POST', url: '/api/login', headers: via, payload: { password: 'correct horse' } });
		expect(login.statusCode).toBe(200);
		const cookie = String(login.headers['set-cookie']).split(';')[0]!;
		expect(String(login.headers['set-cookie'])).toContain('HttpOnly');
		expect((await server.inject({ method: 'GET', url: '/api/agents', headers: { ...via, cookie } })).statusCode).toBe(200);
		expect((await server.inject({ method: 'GET', url: '/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=7', headers: via })).body).toBe('7');
		await server.inject({ method: 'POST', url: '/api/logout', headers: { ...via, cookie } });
		expect((await server.inject({ method: 'GET', url: '/api/agents', headers: { ...via, cookie } })).statusCode).toBe(401);
	});

	it('with no password set, nothing outside this PC gets in at all', async () => {
		const { server } = await setup();
		const res = await server.inject({ method: 'GET', url: '/api/settings', headers: { 'cf-connecting-ip': '203.0.113.9' } });
		expect(res.statusCode).toBe(401);
		expect(res.json().error).toContain('Set ONYX_PASSWORD');
	});

	it('limits how fast one number can send', () => {
		let t = 0;
		const allow = limiter(3, 1000, () => t);
		expect([allow('a'), allow('a'), allow('a'), allow('a'), allow('b')]).toEqual([true, true, true, false, true]);
		t = 1001;
		expect(allow('a')).toBe(true);
	});
});

describe('notifications and billing', () => {
	it('a reminder is pushed to subscribed devices, and a device that is gone is forgotten', async () => {
		const pushed: string[] = [];
		const { app, server } = await (async () => {
			const t = await testApp({}, {}, { pushSend: (async (sub: any, payload: string) => { if (sub.endpoint.includes('gone')) throw Object.assign(new Error('gone'), { statusCode: 410 }); pushed.push(payload); }) as never });
			return { ...t, server: await buildServer(t.app, { webDir: '/nonexistent' }) };
		})();
		expect((await server.inject({ method: 'GET', url: '/api/push' })).json().public_key).toMatch(/^[A-Za-z0-9_-]{80,}$/);
		await server.inject({ method: 'POST', url: '/api/push', payload: { endpoint: 'https://push.example/ok', keys: { p256dh: 'x', auth: 'y' } } });
		await server.inject({ method: 'POST', url: '/api/push', payload: { endpoint: 'https://push.example/gone', keys: { p256dh: 'x', auth: 'y' } } });
		await app.outbox.deliver('owner', 'Reminder: stretch', { proactive: true });
		await settle();
		expect(pushed.map((p) => JSON.parse(p))).toEqual([{ title: 'Onyx', body: 'Reminder: stretch' }]);
		expect(await app.push.count('owner')).toBe(1);
	});

	it('with billing off there is no limit and every tier is open; tokens are still counted', async () => {
		const { parseTiers } = await import('../src/config.ts');
		const { TIERS_YAML } = await import('./helpers.ts');
		const big = { content: 'x', usage: { prompt_tokens: 900, completion_tokens: 200 } };
		const { app } = await testApp({ 'qwen3:30b': [big] }, { ONYX_PLAN: 'free' }, { tiers: parseTiers(TIERS_YAML.replace('billing: { enabled: true }', 'billing: { enabled: false }')) });
		const ask = { userId: 'owner', tier: 'max' as const, messages: [{ role: 'user' as const, content: 'hi' }] };
		expect((await app.gateway.complete(ask)).tier).toBe('max');
		expect((await app.gateway.complete(ask)).fallbacks).toEqual([]);
		expect(await app.gateway.usedToday('owner')).toBe(2200);
		const server = await buildServer(app, { webDir: '/nonexistent' });
		expect((await server.inject({ method: 'GET', url: '/api/usage' })).json()).toMatchObject({ billing: false, limit: null, used_today: 2200 });
		const billing = (await server.inject({ method: 'GET', url: '/api/billing' })).json();
		expect(billing).toMatchObject({ enabled: false, users: [{ id: 'owner', plan: 'free', tokens: 2200 }] });
		expect((await server.inject({ method: 'PUT', url: '/api/billing/users/owner', payload: { plan: 'pro' } })).json()).toEqual({ plan: 'pro' });
		expect((await server.inject({ method: 'PUT', url: '/api/billing/users/owner', payload: { plan: 'gold' } })).statusCode).toBe(400);
	});
});

// The phone channels: WhatsApp through Meta's official Cloud API, and SMS through Twilio. Both check that a webhook
// really came from the provider (a signature over the request) before anything in it is read.
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Env } from '../config.ts';
import type { DB } from '../db.ts';
import type { ChannelAdapter, ChannelStatus } from './outbox.ts';

type Fetch = typeof fetch;
const same = (a: string, b: string): boolean => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
/** A phone number as both providers and the allowlist write it: + and digits. */
export const e164 = (s: string): string => `+${String(s).replace(/^whatsapp:/, '').replace(/\D/g, '')}`;

async function handleOf(db: DB, userId: string, channel: string) {
	return db.selectFrom('identities').selectAll().where('user_id', '=', userId).where('channel', '=', channel).where('verified_at', 'is not', null).executeTakeFirst();
}

/* ---------- WhatsApp ---------- */

export class WhatsAppChannel implements ChannelAdapter {
	id = 'whatsapp' as const;
	constructor(private readonly db: DB, private readonly env: Env, private readonly http: Fetch = globalThis.fetch) {}
	private missing(): string[] {
		return ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_ID', 'WHATSAPP_APP_SECRET', 'WHATSAPP_VERIFY_TOKEN'].filter((k) => !this.env[k]);
	}
	async status(): Promise<ChannelStatus> {
		const m = this.missing();
		return m.length ? { ok: false, detail: `Not set up: ${m.join(', ')} missing from .env. See SETUP_WHATSAPP.md.` } : { ok: true, detail: 'WhatsApp Business Cloud API. Outside 24 hours of your last message, Onyx can only send the approved template.' };
	}
	/** Meta's check when the webhook is registered: echo the challenge if the token matches. */
	verify(q: Record<string, string | undefined>): string | null {
		return q['hub.mode'] === 'subscribe' && !!this.env.WHATSAPP_VERIFY_TOKEN && q['hub.verify_token'] === this.env.WHATSAPP_VERIFY_TOKEN ? (q['hub.challenge'] ?? '') : null;
	}
	/** Whether the body was signed with the app secret (the X-Hub-Signature-256 header). */
	signed(raw: string, header: string | undefined): boolean {
		const secret = this.env.WHATSAPP_APP_SECRET;
		if (!secret || !header) return false;
		return same(header, `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`);
	}
	/** The messages in a webhook body: who sent each, and its text (or what kind of thing it was). */
	parse(body: any): { from: string; text: string | null; kind: string }[] {
		const out: { from: string; text: string | null; kind: string }[] = [];
		for (const e of body?.entry ?? []) for (const c of e.changes ?? []) for (const m of c.value?.messages ?? []) out.push({ from: e164(m.from), text: m.type === 'text' ? String(m.text?.body ?? '') : null, kind: String(m.type) });
		return out;
	}
	private async post(to: string, payload: Record<string, unknown>): Promise<void> {
		const res = await this.http(`https://graph.facebook.com/v21.0/${this.env.WHATSAPP_PHONE_ID}/messages`, { method: 'POST', headers: { authorization: `Bearer ${this.env.WHATSAPP_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace('+', ''), ...payload }), signal: AbortSignal.timeout(15000) });
		if (!res.ok) throw new Error(`WhatsApp answered HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
	}
	async sendTo(handle: string, parts: string[]): Promise<void> {
		for (const p of parts) await this.post(handle, { type: 'text', text: { body: p } });
	}
	async send(userId: string, parts: string[]): Promise<void> {
		const id = await handleOf(this.db, userId, 'whatsapp');
		if (!id) throw new Error('No verified WhatsApp number is linked to this account.');
		await this.sendTo(id.handle, parts);
	}
	async sendProactive(userId: string, parts: string[]): Promise<void> {
		const id = await handleOf(this.db, userId, 'whatsapp');
		if (!id) throw new Error('No verified WhatsApp number is linked to this account.');
		// Free-form messages are only allowed within 24 hours of the person's last message; after that, a template.
		const open = id.last_inbound && Date.now() - Date.parse(id.last_inbound) < 24 * 3600 * 1000 - 60000;
		if (open) return this.sendTo(id.handle, parts);
		await this.post(id.handle, { type: 'template', template: { name: this.env.WHATSAPP_TEMPLATE || 'onyx_alert', language: { code: 'en_US' }, components: [{ type: 'body', parameters: [{ type: 'text', text: parts.join(' ').replace(/\s+/g, ' ').slice(0, 900) }] }] } });
	}
}

/* ---------- SMS ---------- */

export class SmsChannel implements ChannelAdapter {
	id = 'sms' as const;
	constructor(private readonly db: DB, private readonly env: Env, private readonly http: Fetch = globalThis.fetch) {}
	async status(): Promise<ChannelStatus> {
		const m = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM', 'PUBLIC_URL'].filter((k) => !this.env[k]);
		return m.length ? { ok: false, detail: `Not set up: ${m.join(', ')} missing from .env. See SETUP_SMS.md.` } : { ok: true, detail: `Twilio, from ${this.env.TWILIO_FROM}.` };
	}
	/** Twilio's signature: HMAC-SHA1 of the full address followed by every form field, sorted by name. */
	signed(path: string, params: Record<string, string>, header: string | undefined): boolean {
		const token = this.env.TWILIO_AUTH_TOKEN;
		if (!token || !header || !this.env.PUBLIC_URL) return false;
		const data = this.env.PUBLIC_URL.replace(/\/+$/, '') + path + Object.keys(params).sort().map((k) => k + params[k]).join('');
		return same(header, createHmac('sha1', token).update(data).digest('base64'));
	}
	async sendTo(handle: string, parts: string[]): Promise<void> {
		for (const p of parts) {
			const res = await this.http(`https://api.twilio.com/2010-04-01/Accounts/${this.env.TWILIO_ACCOUNT_SID}/Messages.json`, { method: 'POST', headers: { authorization: `Basic ${Buffer.from(`${this.env.TWILIO_ACCOUNT_SID}:${this.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`, 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ To: handle, From: this.env.TWILIO_FROM ?? '', Body: p }).toString(), signal: AbortSignal.timeout(15000) });
			if (!res.ok) throw new Error(`Twilio answered HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
		}
	}
	async send(userId: string, parts: string[]): Promise<void> {
		const id = await handleOf(this.db, userId, 'sms');
		if (!id) throw new Error('No verified phone number is linked to this account for SMS.');
		await this.sendTo(id.handle, parts);
	}
	sendProactive(userId: string, parts: string[]): Promise<void> {
		return this.send(userId, parts);
	}
	/**
	 * Texts Twilio received in the last day. Twilio does not retry a webhook that failed, so a text sent while this PC
	 * was off would be lost; on start, Onyx asks for these and answers the ones it never saw.
	 */
	async recent(): Promise<{ sid: string; from: string; body: string; at: string }[]> {
		const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
		const q = new URLSearchParams({ To: this.env.TWILIO_FROM ?? '', 'DateSent>': since, PageSize: '50' });
		const res = await this.http(`https://api.twilio.com/2010-04-01/Accounts/${this.env.TWILIO_ACCOUNT_SID}/Messages.json?${q}`, { headers: { authorization: `Basic ${Buffer.from(`${this.env.TWILIO_ACCOUNT_SID}:${this.env.TWILIO_AUTH_TOKEN}`).toString('base64')}` }, signal: AbortSignal.timeout(15000) });
		if (!res.ok) throw new Error(`Twilio answered HTTP ${res.status}.`);
		const j: any = await res.json();
		return (j.messages ?? []).filter((m: any) => m.direction === 'inbound').map((m: any) => ({ sid: String(m.sid), from: String(m.from), body: String(m.body ?? ''), at: new Date(m.date_sent ?? m.date_created).toISOString() }));
	}
}

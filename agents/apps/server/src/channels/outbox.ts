// Channels and delivery. Every channel is one adapter with the same four calls, and everything Onyx says to a
// person goes out through `deliver`, which formats it for the channel and falls back when a channel fails.
import type { Channel } from '@onyx/shared';
import type { Bus } from '../bus.ts';
import { now, type DB } from '../db.ts';
import { formatFor } from './format.ts';

export interface ChannelStatus { ok: boolean; detail: string; lastError?: string | null }
export interface ChannelAdapter {
	id: Channel;
	/** Whether this channel is set up enough to send. */
	status(): Promise<ChannelStatus>;
	/** A reply to something the person just sent. */
	send(userId: string, parts: string[]): Promise<void>;
	/** A message Onyx starts: a reminder, a finished task. */
	sendProactive(userId: string, parts: string[]): Promise<void>;
}

/** The web channel: messages appear in the app, live over the WebSocket, and stay in history. */
export class WebChannel implements ChannelAdapter {
	id = 'web' as const;
	constructor(private readonly bus: Bus) {}
	async status(): Promise<ChannelStatus> {
		return { ok: true, detail: 'Messages appear in the Onyx app.' };
	}
	async send(userId: string, parts: string[]): Promise<void> {
		this.bus.emit({ type: 'message', at: now(), runId: null, rootId: null, parentId: null, agentId: null, data: { userId, channel: 'web', text: parts.join('\n\n'), proactive: false } });
	}
	async sendProactive(userId: string, parts: string[]): Promise<void> {
		this.bus.emit({ type: 'message', at: now(), runId: null, rootId: null, parentId: null, agentId: null, data: { userId, channel: 'web', text: parts.join('\n\n'), proactive: true } });
	}
}

export class Outbox {
	private readonly adapters = new Map<Channel, ChannelAdapter>();
	constructor(private readonly db: DB, private readonly bus: Bus) {
		this.add(new WebChannel(bus));
	}
	add(a: ChannelAdapter): void {
		this.adapters.set(a.id, a);
	}
	get(id: Channel): ChannelAdapter | undefined {
		return this.adapters.get(id);
	}
	list(): ChannelAdapter[] {
		return [...this.adapters.values()];
	}
	async preferred(): Promise<Channel[]> {
		const row = await this.db.selectFrom('settings').select('value').where('key', '=', 'preferred_channels').executeTakeFirst();
		const wanted: Channel[] = row ? JSON.parse(row.value) : ['whatsapp', 'sms', 'web'];
		// The app is always the last resort: a message is never dropped because a phone channel is down.
		return [...new Set<Channel>([...wanted, 'web'])].filter((c) => this.adapters.has(c));
	}

	/** Sends `text` to a person. `channel` is tried first when given; then their preferred channels in order. */
	async deliver(userId: string, text: string, o: { channel?: Channel | null; proactive?: boolean; runId?: string | null } = {}): Promise<{ channel: Channel; fellBack: string[] }> {
		const order = [...new Set<Channel>([...(o.channel && this.adapters.has(o.channel) ? [o.channel] : []), ...(await this.preferred())])];
		const failures: string[] = [];
		for (const id of order) {
			const adapter = this.adapters.get(id)!;
			const parts = formatFor(id, text);
			try {
				const st = await adapter.status();
				if (!st.ok) throw new Error(st.detail);
				await (o.proactive ? adapter.sendProactive(userId, parts) : adapter.send(userId, parts));
				await this.db.insertInto('messages').values({ user_id: userId, channel: id, direction: 'out', text, run_id: o.runId ?? null, status: failures.length ? 'sent_fallback' : 'sent', error: failures.join(' | ') || null, created_at: now() }).execute();
				return { channel: id, fellBack: failures };
			} catch (e) {
				failures.push(`${id}: ${(e as Error).message}`);
				this.bus.emit({ type: 'channel', at: now(), runId: null, rootId: null, parentId: null, agentId: null, data: { channel: id, ok: false, error: (e as Error).message } });
			}
		}
		await this.db.insertInto('messages').values({ user_id: userId, channel: order[0] ?? 'web', direction: 'out', text, run_id: o.runId ?? null, status: 'failed', error: failures.join(' | '), created_at: now() }).execute();
		throw new Error(`Could not deliver the message on any channel. ${failures.join(' | ')}`);
	}
}

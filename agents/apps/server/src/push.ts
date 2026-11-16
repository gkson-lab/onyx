// Push notifications for the installed app. The keys that sign them are made once and kept in the database.
import { createRequire } from 'node:module';
import type WebPush from 'web-push';

// web-push is a CommonJS package: loaded with require so it works the same under every runner.
const webpush = createRequire(import.meta.url)('web-push') as typeof WebPush;
import { now, type DB } from './db.ts';

export class Push {
	private keys: { publicKey: string; privateKey: string } | null = null;
	constructor(private readonly db: DB, private readonly send: typeof WebPush.sendNotification = webpush.sendNotification.bind(webpush)) {}

	async publicKey(): Promise<string> {
		if (!this.keys) {
			const row = await this.db.selectFrom('settings').select('value').where('key', '=', 'vapid').executeTakeFirst();
			this.keys = row ? JSON.parse(row.value) : webpush.generateVAPIDKeys();
			if (!row) await this.db.insertInto('settings').values({ key: 'vapid', value: JSON.stringify(this.keys) }).execute();
		}
		return this.keys!.publicKey;
	}
	async subscribe(userId: string, sub: { endpoint: string }): Promise<void> {
		const row = { endpoint: sub.endpoint, user_id: userId, data: JSON.stringify(sub), created_at: now() };
		await this.db.insertInto('push_subscriptions').values(row).onConflict((c) => c.column('endpoint').doUpdateSet(row)).execute();
	}
	async count(userId: string): Promise<number> {
		return (await this.db.selectFrom('push_subscriptions').select('endpoint').where('user_id', '=', userId).execute()).length;
	}
	/** Sends to every device the person turned notifications on for. A device that has gone away is forgotten. */
	async notify(userId: string, text: string): Promise<number> {
		await this.publicKey();
		const subs = await this.db.selectFrom('push_subscriptions').selectAll().where('user_id', '=', userId).execute();
		let sent = 0;
		for (const s of subs) {
			try {
				await this.send(JSON.parse(s.data), JSON.stringify({ title: 'Onyx', body: text.slice(0, 300) }), { vapidDetails: { subject: 'mailto:onyx@localhost', ...this.keys! }, TTL: 3600 });
				sent++;
			} catch (e) {
				if ([404, 410].includes((e as { statusCode?: number }).statusCode ?? 0)) await this.db.deleteFrom('push_subscriptions').where('endpoint', '=', s.endpoint).execute();
			}
		}
		return sent;
	}
}

// Fires reminders. Due ones are sent through the outbox on the person's preferred channel. If this PC was off when
// one was due, it is sent as soon as the PC is back, and says it is late. A repeating reminder is moved to its next
// time in the future, so a long outage doesn't produce a burst of old ones.
import { now, type DB } from './db.ts';
import type { Outbox } from './channels/outbox.ts';
import { localTime, nextFire, REPEATS } from './tools/builtin.ts';
import type { Channel } from '@onyx/shared';

export class Scheduler {
	private timer: ReturnType<typeof setInterval> | null = null;
	constructor(private readonly db: DB, private readonly outbox: Outbox, private readonly clock: () => Date = () => new Date()) {}

	start(everyMs = 15000): void {
		this.timer ??= setInterval(() => void this.tick().catch(() => {}), everyMs);
		void this.tick().catch(() => {});
	}
	stop(): void {
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
	}

	/** Sends everything that is due. Returns how many reminders fired. */
	async tick(): Promise<number> {
		const at = this.clock();
		const due = await this.db.selectFrom('schedules').selectAll().where('status', '=', 'active').where('next_fire', '<=', at.toISOString()).orderBy('next_fire').execute();
		let fired = 0;
		for (const s of due) {
			const lateMin = Math.round((at.getTime() - Date.parse(s.next_fire)) / 60000);
			const text = `Reminder: ${s.text}${lateMin >= 5 ? `\n(Late: this was due ${localTime(new Date(s.next_fire))}. Onyx was not running then.)` : ''}`;
			let error: string | null = null;
			try {
				await this.outbox.deliver(s.user_id, text, { channel: s.channel as Channel | null, proactive: true });
				fired++;
			} catch (e) {
				error = (e as Error).message;
			}
			const repeat = (REPEATS as readonly string[]).includes(s.repeat) ? (s.repeat as (typeof REPEATS)[number]) : 'none';
			let next = nextFire(new Date(s.next_fire), repeat);
			while (next && next.getTime() <= at.getTime()) next = nextFire(next, repeat);
			// A reminder that could not be delivered anywhere stays active and is tried again on the next tick.
			if (error && !next) continue;
			await this.db.updateTable('schedules').set({ status: next ? 'active' : 'done', next_fire: next ? next.toISOString() : s.next_fire, last_fired: now() }).where('id', '=', s.id).execute();
		}
		return fired;
	}
}

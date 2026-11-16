// The event bus: everything an agent does is published here. The WebSocket forwards it to the UI as it happens, and
// the runtime writes the same events to the step log, so a finished run can be replayed.
import type { AgentEvent } from '@onyx/shared';

export type Listener = (e: AgentEvent) => void;
export class Bus {
	private readonly listeners = new Set<Listener>();
	on(l: Listener): () => void {
		this.listeners.add(l);
		return () => this.listeners.delete(l);
	}
	emit(e: AgentEvent): void {
		for (const l of this.listeners) {
			try {
				l(e);
			} catch {
				// A listener that throws (a closed socket) must not stop the run.
			}
		}
	}
}

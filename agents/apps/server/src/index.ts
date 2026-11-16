// The server. For now: health, the tiers as the UI will show them, and a plain chat call. Agents, the event stream
// and the channels are added in the next milestones.
import Fastify from 'fastify';
import { z } from 'zod';
import { ChatMessage } from '@onyx/shared';
import { createApp, type App } from './app.ts';
import { AllModelsFailed, LimitError } from './models/gateway.ts';

const ChatBody = z.object({ text: z.string().min(1).max(20000), history: z.array(ChatMessage).max(200).default([]) });

export async function buildServer(app: App) {
	const server = Fastify({ logger: false });
	server.get('/health', async () => ({ ok: true }));
	server.get('/api/tiers', async () => ({ tiers: app.config.publicTiers(), cloud: app.config.cloud }));
	server.post('/api/chat', async (req, reply) => {
		const body = ChatBody.safeParse(req.body);
		if (!body.success) return reply.code(400).send({ error: 'bad request', issues: body.error.issues });
		try {
			const d = await app.router.route(app.owner, body.data.text);
			const r = await app.gateway.complete({ userId: app.owner, tier: d.tier, messages: [...body.data.history, { role: 'user', content: d.text }] });
			return { reply: r.content, routing: d, tier: r.tier, model: r.model, provider: r.provider, local: r.local, usage: r.usage, cost_usd: r.costUsd, latency_ms: r.latencyMs, fallbacks: r.fallbacks };
		} catch (e) {
			if (e instanceof LimitError) return reply.code(429).send({ error: e.message });
			if (e instanceof AllModelsFailed) return reply.code(502).send({ error: e.message, fallbacks: e.fallbacks });
			return reply.code(500).send({ error: (e as Error).message });
		}
	});
	return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const app = await createApp();
	const server = await buildServer(app);
	const port = Number(process.env.PORT ?? 8787);
	await server.listen({ port, host: '127.0.0.1' });
	console.log(`Onyx Agents on http://127.0.0.1:${port}`);
}

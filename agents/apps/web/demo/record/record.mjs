// Records what the demo replays (demo/fixtures.json): a fresh Onyx server on the stand-in model is asked a few things;
// every event it sends while answering is kept, and then every page's data. To record again:
//   node demo/record/stand-in-model.mjs &                      (a stand-in for Ollama on port 11556, no AI)
//   OLLAMA_BASE_URL=http://127.0.0.1:11556/v1 PORT=8800 ONYX_DB=/tmp/demo.db pnpm --filter @onyx/server start &
//   node demo/record/record.mjs demo/fixtures.json            (then set the hardware to a Mac's, as fixtures.json has it)
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:8800';
const api = async (path, init = {}) => {
	const r = await fetch(`${BASE}/api${path}`, { method: init.method ?? 'GET', headers: init.body ? { 'content-type': 'application/json' } : {}, body: init.body ? JSON.stringify(init.body) : undefined });
	return r.json();
};
const events = [];
const ws = new WebSocket(`${BASE.replace('http', 'ws')}/ws`);
await new Promise((ok) => (ws.onopen = ok));
ws.onmessage = (m) => { try { events.push(JSON.parse(m.data)); } catch {} };
const ask = async (conv, text) => {
	const from = events.length;
	const { runId } = await api('/chat', { method: 'POST', body: { text, tier: 'auto', conversation_id: conv } });
	for (let i = 0; i < 400; i++) {
		await new Promise((r) => setTimeout(r, 100));
		const done = events.slice(from).some((e) => e.runId === runId && (e.type === 'finished' || e.type === 'error'));
		const stored = done && (await api(`/messages?conversation=${conv}`)).messages.some((m) => m.run_id === runId && m.direction === 'out');
		if (stored) break;
	}
	return { text, runId, events: events.slice(from).filter((e) => e.rootId === runId || e.runId === runId) };
};
const chats = [
	['Rename my photos by date', ['write a script that renames my photos by the date they were taken']],
	['A weekend in Austin', ['plan a weekend in Austin for me']],
	['Liquid glass', ['how does liquid glass bend light?', 'thanks']],
	['Tides', ['why are there two tides a day?']],
];
const scripts = [];
for (const [, asks] of chats) {
	const { id } = await api('/conversations', { method: 'POST' });
	for (const a of asks) scripts.push({ conversation: id, ...(await ask(id, a)) });
}
const get = {};
const paths = ['/conversations', '/conversations?q=', '/runs', '/runs?limit=1', '/agents', '/tiers', '/tiers/raw', '/channels', '/connectors', '/models', '/models/catalog', '/hardware', '/ollama', '/health/last', '/settings', '/schedules', '/memories', '/identities', '/tailscale', '/backup', '/autostart', '/push', '/version', '/session', '/warmup', '/update', '/usage?days=7', '/usage?days=14', '/usage?days=30', '/usage?days=90'];
for (const p of paths) get[p] = await api(p).catch((e) => ({ error: String(e) }));
for (const c of get['/conversations'].conversations) get[`/messages?conversation=${c.id}`] = await api(`/messages?conversation=${c.id}`);
for (const s of scripts) get[`/runs/${s.runId}`] = await api(`/runs/${s.runId}`);
fs.writeFileSync(process.argv[2], JSON.stringify({ scripts, get }, null, 1));
console.log('scripts', scripts.map((s) => `${s.text.slice(0, 30)}: ${s.events.length} events`).join(' | '));
console.log('paths', Object.keys(get).length, Object.entries(get).filter(([, v]) => v && v.error).map(([k]) => k).join(', ') || 'all answered');
ws.close();

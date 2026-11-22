// A stand-in for Ollama for recording the demo's answers: like mock-ollama.mjs, but its agents answer cleanly, with no
// tools that would fail on this machine (no web, no Docker).
import http from 'node:http';
// With MOCK_TICK=1 a stream sends its next event only when GET /__tick asks, so a film made frame by frame can stream
// an answer at the pace of the film.
const TICK = process.env.MOCK_TICK === '1';
const streams = new Set();
const sse = (res, events) => {
	res.writeHead(200, { 'content-type': 'text/event-stream' });
	let i = 0;
	const next = () => { if (i < events.length) { res.write(`data: ${JSON.stringify(events[i++])}\n\n`); return true; } res.write('data: [DONE]\n\n'); res.end(); return false; };
	if (TICK) return void streams.add(next);
	const t = setInterval(() => next() || clearInterval(t), 60);
};
const call = (name, args) => ({ tool_calls: [{ index: 0, id: 'c' + Math.random().toString(36).slice(2, 8), type: 'function', function: { name, arguments: JSON.stringify(args) } }] });
http.createServer((req, res) => {
	if (req.url === '/__tick') { for (const next of [...streams]) if (!next()) streams.delete(next); return res.end(String(streams.size)); }
	if (req.url === '/v1/models') return res.end(JSON.stringify({ data: ['qwen3:4b', 'qwen3:8b', 'qwen3:14b'].map((id) => ({ id })) }));
	let body = '';
	req.on('data', (d) => (body += d));
	req.on('end', () => {
		const b = JSON.parse(body || '{}');
		// Ollama's own API (warming a model, listing what's loaded): answered plainly, as no chat is asked for.
		if (!Array.isArray(b.messages)) {
			const names = ['qwen3:4b-instruct', 'qwen3:8b', 'gpt-oss:20b'].map((name) => ({ name, model: name, size: 5e9, size_vram: 5e9 }));
			return res.end(JSON.stringify(/\/api\/(ps|tags)/.test(req.url) ? { models: names } : { done: true, response: '' }));
		}
		if (b.model === 'qwen3:30b') return (res.writeHead(404), res.end('{"error":{"message":"model \\"qwen3:30b\\" not found, try pulling it first"}}'));
		const sys = b.messages[0].content;
		const user = [...b.messages].reverse().find((m) => m.role === 'user')?.content ?? '';
		const tools = (b.tools ?? []).map((t) => t.function.name);
		const toolMsgs = b.messages.filter((m) => m.role === 'tool');
		let delta;
		if (tools.includes('route')) {
			const t = /photo|script|search|remind/i.test(user) ? 'pro' : /thanks|hi\b/i.test(user) ? 'lite' : 'standard';
			const msg = { role: 'assistant', content: '', tool_calls: [{ id: 'r1', type: 'function', function: { name: 'route', arguments: JSON.stringify({ tier: t, complexity: t === 'pro' ? 'medium' : 'low', tools: t === 'pro' ? ['web_search', 'code'] : [], urgency: 'normal', reason: t === 'pro' ? 'needs a web search and code run' : t === 'lite' ? 'a short social message' : 'an ordinary question' }) } }] };
			return res.end(JSON.stringify({ choices: [{ message: msg, finish_reason: 'tool_calls' }], usage: { prompt_tokens: 212, completion_tokens: 41 } }));
		}
		if (sys.includes('Onyx Core') && tools.includes('delegate') && !toolMsgs.length && /search|script|remind/i.test(user)) delta = call('delegate', { tasks: [{ agent: 'researcher', task: 'Find how EXIF dates are stored in JPEG photos.' }, { agent: 'coder', task: 'Write and run Python that builds a filename like 2026-11-16_001.jpg from a date and a counter.' }] });
		else if (sys.includes('Researcher')) delta = { content: 'A JPEG keeps the moment it was taken in its EXIF tag DateTimeOriginal, written like 2026:11:16 09:41:07. Phones and cameras both set it; a photo edited later keeps it.' };
		else if (sys.includes('the Coder')) delta = { content: 'Done: rename_photos.py reads DateTimeOriginal with Pillow and renames each photo to its date, numbering photos from the same day.' };
		else if (toolMsgs.length) delta = { content: 'Here is a script that renames your photos by the day they were taken. It reads each photo\'s EXIF DateTimeOriginal and names it like 2026-11-16_001.jpg, numbering the photos from one day in the order they were taken.\n\n```python\nfrom pathlib import Path\nfrom PIL import Image\n\nphotos = []\nfor p in Path(\'.\').glob(\'*.jpg\'):\n    taken = Image.open(p).getexif().get_ifd(0x8769).get(36867)  # DateTimeOriginal\n    if taken:\n        photos.append((taken, p))\n\nper_day = {}\nfor taken, p in sorted(photos):\n    day = taken[:10].replace(\':\', \'-\')\n    per_day[day] = per_day.get(day, 0) + 1\n    p.rename(f\'{day}_{per_day[day]:03d}{p.suffix.lower()}\')\n```\n\nRun it in the folder with your photos: `python rename_photos.py`. It needs Pillow (`pip install pillow`).' };
		else if (/weekend|austin/i.test(user)) delta = { content: 'A weekend in Austin: Saturday morning at Barton Springs Pool before it gets busy, then lunch on South Congress and the view from the Congress Avenue Bridge at dusk, when about a million bats fly out from under it (March to October). Sunday: Zilker Park, the Blanton Museum, and live music on Red River at night. Bring a jacket for the evenings in winter.' };
		else if (/glass/i.test(user)) delta = { content: 'Light slows down in glass, so a ray bends as it crosses in, and bends most where the surface curves, at the rim of a lens or a drop. Each colour bends by a slightly different amount, which is why a curved glass edge splits white light into a thin rainbow, and why liquid glass looks brightest round its edges.' };
		else delta = { content: /thanks/i.test(user) ? 'You are welcome.' : 'Tides come from the Moon pulling on the oceans. There are two a day because water bulges on the side facing the Moon and on the side opposite it.' };
		const events = [];
		if (delta.content) for (let i = 0; i < delta.content.length; i += 14) events.push({ choices: [{ delta: { content: delta.content.slice(i, i + 14) } }] });
		else events.push({ choices: [{ delta }] });
		events.push({ choices: [{ delta: {}, finish_reason: delta.content ? 'stop' : 'tool_calls' }] }, { choices: [], usage: { prompt_tokens: 300 + JSON.stringify(b.messages).length / 4 | 0, completion_tokens: 20 + (delta.content?.length ?? 80) / 4 | 0 } });
		if (b.stream) return sse(res, events);
		res.end(JSON.stringify({ choices: [{ message: { role: 'assistant', content: delta.content ?? '', tool_calls: delta.tool_calls }, finish_reason: 'stop' }], usage: events.at(-1).usage }));
	});
}).listen(11556, '127.0.0.1');

// The page's moving parts: the stone gradients, the chrome mark, the run replay, the agent picker, the PC planner,
// the app's screens and the section markers. Each part works on its own and leaves the page readable without it.
import { RUNS } from './runs.js';
import { plan, CARDS, CATALOG } from './planner.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(pointer: fine)').matches;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const num = (n) => n.toLocaleString('en-US');
const store = {
	get(key) { try { return localStorage.getItem(`onyx-intro:${key}`); } catch { return null; } },
	set(key, value) { try { localStorage.setItem(`onyx-intro:${key}`, value); } catch {} },
};
const TIER = { lite: 'Lite', standard: 'Standard', pro: 'Pro', max: 'Max' };
const NAME = { core: 'Onyx Core', scheduler: 'Scheduler', memory: 'Memory', researcher: 'Researcher', coder: 'Coder', messenger: 'Messenger', router: 'Router' };

/* ---------- Header: a rule once the page moves, and the section you are in ---------- */
const top = $('.top');
const onScroll = () => top.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

function spy(links) {
	const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
	const io = new IntersectionObserver((entries) => {
		for (const e of entries) {
			if (!e.isIntersecting) continue;
			for (const a of links) a.removeAttribute('aria-current');
			byId.get(e.target.id)?.setAttribute('aria-current', 'true');
		}
	}, { rootMargin: '-40% 0px -55% 0px' });
	for (const id of byId.keys()) { const el = document.getElementById(id); if (el) io.observe(el); }
}
spy($$('.top nav a'));
spy($$('.index a'));

/* ---------- The stone: gradients and the chrome mark ---------- */
// Without WebGL 2 the still mark and the CSS stone stay, and no 3D is loaded.
const gl = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
if (gl) import('./gradient.js').then(({ createGradient, PRESETS, STONES }) => {
	// A stone made in the playground and put behind the page is kept in this browser.
	let saved = null;
	try { saved = JSON.parse(store.get('stone') || 'null'); } catch {}
	const panels = [];
	for (const canvas of $$('canvas[data-gradient]')) {
		const g = createGradient(canvas, PRESETS[canvas.dataset.gradient], { onFirstFrame: () => canvas.classList.add('on') });
		if (!g) continue;
		panels.push({ g, preset: PRESETS[canvas.dataset.gradient] });
		if (saved) g.set(saved);
	}
	playground(createGradient, PRESETS, STONES, panels, saved);
}).catch(() => {});

/* ---------- The stone playground ---------- */
function playground(createGradient, PRESETS, STONES, panels, saved) {
	const box = $('[data-play-stone]');
	if (!box) return;
	const canvas = $('canvas', box), form = $('form', box), note = $('[data-mix-note]', box);
	const copy = (s) => ({ colors: [...s.colors], speed: s.speed, strength: s.strength, density: s.density, grain: s.grain });
	let cur = copy(saved || STONES.Onyx);
	const g = createGradient(canvas, { ...PRESETS.onyx, ...cur }, { onFirstFrame: () => canvas.classList.add('on') });
	if (!g) return;
	form.hidden = false;
	$('.play-fallback', box).hidden = true;

	const sliders = ['speed', 'strength', 'density', 'grain'].map((name) => form.elements[name]);
	const swatches = [0, 1, 2].map((i) => form.elements[`c${i}`]);
	const presets = Object.entries(STONES).map(([name, s]) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.innerHTML = `<i style="--a: ${s.colors[0]}; --b: ${s.colors[1]}; --c: ${s.colors[2]}" aria-hidden="true"></i>${name}`;
		b.addEventListener('click', () => { cur = copy(s); g.set(cur); show(); note.textContent = ''; });
		$('[data-presets]', form).append(b);
		return [b, s];
	});
	const same = (a, b) => JSON.stringify(copy(a)) === JSON.stringify(copy(b));
	const digits = { speed: 2, strength: 1, density: 2, grain: 3 };
	const show = () => {
		for (const input of sliders) {
			input.value = cur[input.name];
			input.nextElementSibling.textContent = Number(cur[input.name]).toFixed(digits[input.name]);
		}
		swatches.forEach((input, i) => { input.value = cur.colors[i]; });
		for (const [b, s] of presets) b.setAttribute('aria-pressed', String(same(cur, s)));
	};
	form.addEventListener('input', (e) => {
		const t = e.target;
		if (t.type === 'range') cur[t.name] = Number(t.value);
		else if (t.type === 'color') cur.colors[Number(t.name.slice(1))] = t.value;
		else return;
		g.set(cur);
		show();
		note.textContent = '';
	});
	$('[data-apply]', form).addEventListener('click', () => {
		for (const p of panels) p.g.set(cur);
		store.set('stone', JSON.stringify(cur));
		note.textContent = 'Now behind the top and bottom panels, and kept in this browser.';
	});
	$('[data-reset]', form).addEventListener('click', () => {
		cur = copy(STONES.Onyx);
		g.set(cur);
		for (const p of panels) p.g.set(p.preset);
		store.set('stone', '');
		show();
		note.textContent = "Back to the page's own stone.";
	});
	show();
}

const object = $('#object');
if (object && gl) {
	if (fine) object.classList.add('can-turn');
	import('./vendor/canvas-ui/chrome-object.js').then(({ createChromeObject }) => {
		const canvas = $('canvas', object);
		const chrome = createChromeObject({ canvas }, {
			src: new URL('mark.svg', import.meta.url).href,
			roughness: 0.1, flow: 0.35, flowSpeed: 0.3, flowScale: 1.4, streaks: 0.2, dispersion: 0.25,
			tint: '#f1e6d6', highlight: '#c2582f', environmentIntensity: 1.05, cursorInfluence: 1,
			depth: 0.16, bevel: 0.45, scale: 2.7, floatIntensity: 0.6, rotationIntensity: 0.7, floatSpeed: 1.6,
			orbit: fine, zoom: false, fov: 42, cameraDistance: 4,
			onLoad: () => object.classList.add('ready'),
		});
		// On a touch screen the mark must not catch the swipe that scrolls the page.
		if (chrome && !fine) canvas.style.touchAction = 'pan-y';
	}).catch(() => {});
}

/* ---------- Replay ---------- */
function markdown(src) {
	const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	const out = [];
	let list = null, para = [];
	const flush = () => { if (para.length) out.push(`<p>${para.join('<br>')}</p>`); para = []; };
	const close = () => {
		if (!list) return;
		out.push(`<${list.kind}${list.start > 1 ? ` start="${list.start}"` : ''}>${list.items.map((i) => `<li>${i}</li>`).join('')}</${list.kind}>`);
		list = null;
	};
	for (const raw of src.split('\n')) {
		const line = raw.replace(/\s+$/, '');
		if (!line.trim()) { flush(); continue; }
		const numbered = /^(\d+)\.\s+(.*)$/.exec(line), bullet = /^[-*]\s+(.*)$/.exec(line);
		if (numbered || bullet) {
			flush();
			const kind = numbered ? 'ol' : 'ul';
			if (!list || list.kind !== kind) { close(); list = { kind, items: [], start: numbered ? Number(numbered[1]) : 1 }; }
			list.items.push(inline(numbered ? numbered[2] : bullet[1]));
			continue;
		}
		if (list && /^\s/.test(raw)) { list.items[list.items.length - 1] += `<br>${inline(line.trim())}`; continue; }
		close();
		para.push(inline(line));
	}
	flush();
	close();
	return out.join('');
}

const clock = (s) => {
	const m = Math.floor(s / 60);
	return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
};
const took = (s) => (s < 10 ? `${s.toFixed(1)} s` : s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`);
const args = (a) => Object.entries(a).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ');

/** The lines a run shows, each with the moment it appears and, for a model call, the moment it ends. */
function linesOf(run) {
	const lines = [];
	for (const e of run.events) {
		const who = NAME[e.agent] ?? e.agent;
		switch (e.kind) {
			case 'message':
				lines.push({ at: 0, who: 'You', html: run.attachment ? `Sent, with <code>${esc(run.attachment.name)}</code> attached; its text was read on the PC` : 'Sent from the app' });
				break;
			case 'route':
				lines.push({ at: e.start, end: e.t, who: 'Router', router: true, wait: `<code>${e.model}</code> reads the message and picks a tier`,
					html: `<b>${TIER[e.chose]}</b>, picked by <code>${e.model}</code> in ${took(e.t - e.start)}: <q>${esc(e.reason)}</q>` });
				break;
			case 'call':
				lines.push({ at: e.start, end: e.t, who, agent: e.agent, cls: e.ok ? '' : 'bad', wait: `<code>${e.model}</code> is writing`,
					html: e.ok ? `<code>${e.model}</code> answered in ${took(e.t - e.start)} <span class="dim">· ${num(e.tokens)} tokens</span>`
						: `<code>${e.model}</code> failed after ${took(e.t - e.start)}: ${esc(e.error)}` });
				break;
			case 'fallback':
				lines.push({ at: e.t, who, cls: 'warn', html: e.type === 'tier'
					? `<b>Fell back to ${TIER[e.to]}</b>: ${esc(e.reason)}`
					: `<b>Tried again</b>: ${esc(e.reason)}` });
				break;
			case 'delegate':
				lines.push({ at: e.t, who, html: `<b>Handed out ${e.tasks.length} tasks, to run at once</b>: ${e.tasks.map((t) => `${NAME[t.agent]}, <q>${esc(t.task)}</q>`).join('; ')}` });
				break;
			case 'tool':
				lines.push({ at: e.t, who, html: `called <code>${esc(e.tool)}</code> <span class="dim">${esc(args(e.args))}</span>` });
				break;
			case 'result':
				lines.push({ at: e.t, who, cls: e.ok ? 'ok' : 'bad', html: `<span class="tick">${e.ok ? 'done' : 'failed'}</span> in ${e.ms} ms: ${esc(e.result)}` });
				break;
			case 'done':
				lines.push({ at: e.t, who, html: `<b>Reported back</b> <span class="dim">· ${num(e.tokens)} tokens</span>: <q>${esc(e.output)}</q>` });
				break;
		}
	}
	return lines.sort((a, b) => a.at - b.at);
}

/** When each agent was at work: model calls, and a specialist from its start to its report. */
function spansOf(run) {
	const spans = [];
	const starts = {};
	for (const e of run.events) {
		if (e.kind === 'call') spans.push({ agent: NAME[e.agent], from: e.start, to: e.t });
		if (e.kind === 'start') starts[e.agent] = e.t;
		if (e.kind === 'done') spans.push({ agent: NAME[e.agent], from: starts[e.agent] ?? e.t, to: e.t });
	}
	return spans;
}

const replay = $('[data-replay]');
if (replay) {
	const picker = $('.picker', replay);
	const log = $('[data-log]', replay);
	const playBtn = $('[data-play]', replay);
	const speedIn = $('[data-speed]', replay);
	const speedOut = $('[data-speed-out]', replay);
	const nowEl = $('[data-now]', replay), totalEl = $('[data-total]', replay);
	const router = $('[data-router]', replay);
	const facets = $$('.mini path', replay);
	const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z" fill="currentColor"/></svg>';
	const PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" stroke-width="2" fill="none"/></svg>';

	let run, lines, spans, answer, writer, p = 0, speed = 20, chosenSpeed = null, playing = false, last = 0, raf = 0, shown = 0, wasPlaying = false;
	const toSlider = (s) => Math.round(50 * Math.log10(s));
	const fromSlider = (v) => 10 ** (v / 50);
	const setSpeed = (s) => {
		speed = Math.min(100, Math.max(1, s));
		speedIn.value = toSlider(speed);
		speedOut.textContent = speed < 1.05 ? 'real time' : `${speed < 10 ? speed.toFixed(1) : Math.round(speed)}× faster`;
	};

	const buttons = RUNS.map((r, i) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.setAttribute('aria-pressed', 'false');
		const agents = r.agents.length === 1 ? 'Core alone' : `${r.agents.length} agents`;
		b.innerHTML = `<span class="msg">${esc(r.message)}</span><span class="facts">${TIER[r.tier]} · ${took(r.seconds)} · ${agents}</span>`;
		b.addEventListener('click', () => load(i, true));
		picker.append(b);
		return b;
	});

	function load(i, play) {
		run = RUNS[i];
		buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
		lines = linesOf(run);
		spans = spansOf(run);
		answer = run.events.find((e) => e.kind === 'answer');
		// The answer streams in during the last call that succeeded for Onyx Core.
		writer = run.events.filter((e) => e.kind === 'call' && e.agent === 'core' && e.ok).at(-1);
		$('[data-message]', replay).textContent = run.message;
		const attach = $('[data-attach]', replay);
		attach.hidden = !run.attachment;
		if (run.attachment) $('span', attach).textContent = `${run.attachment.name} (${run.attachment.pages} page)`;
		totalEl.textContent = clock(run.seconds);
		setSpeed(chosenSpeed ?? Math.max(3, run.seconds / 14));
		reset();
		if (play && !calm.matches) start(); else { p = run.seconds; draw(); }
	}
	function reset() {
		p = 0; shown = 0; log.textContent = '';
		for (const l of lines) { l.li = null; l.state = null; }
		draw();
	}
	function start() {
		if (p >= run.seconds) reset();
		playing = true; last = 0;
		playBtn.innerHTML = PAUSE; playBtn.setAttribute('aria-label', 'Pause');
		if (!raf) raf = requestAnimationFrame(tick);
	}
	function stop() {
		playing = false;
		playBtn.innerHTML = PLAY; playBtn.setAttribute('aria-label', p >= run.seconds ? 'Play again' : 'Play');
	}
	function tick(now) {
		raf = 0;
		const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
		last = now;
		if (playing) p = Math.min(run.seconds, p + dt * speed);
		draw();
		if (p >= run.seconds && playing) stop();
		if (playing) raf = requestAnimationFrame(tick);
	}
	function draw() {
		nowEl.textContent = clock(p);
		const stick = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
		while (shown < lines.length && lines[shown].at <= p) {
			const l = lines[shown++];
			const li = document.createElement('li');
			li.className = l.cls || '';
			li.innerHTML = `<span class="t">${clock(l.at)}</span><span class="a">${esc(l.who)}</span><span class="x"></span>`;
			l.li = li;
			log.append(li);
		}
		for (let i = 0; i < shown; i++) {
			const l = lines[i];
			const done = !l.end || p >= l.end;
			const state = done ? 'done' : 'wait';
			if (l.state !== state || !done) {
				const x = $('.x', l.li);
				if (done) { x.innerHTML = l.html; l.li.querySelector('.wait')?.remove(); }
				else {
					if (l.state !== 'wait') { x.innerHTML = `${l.wait}…`; const bar = document.createElement('span'); bar.className = 'wait'; bar.innerHTML = '<i></i>'; l.li.append(bar); }
					l.li.style.setProperty('--p', ((p - l.at) / (l.end - l.at)).toFixed(3));
				}
				l.state = state;
			}
		}
		// The answer, written while Core's last call ran.
		let card = $('li.answer', log);
		if (writer && p >= writer.start) {
			if (!card) {
				card = document.createElement('li');
				card.className = 'answer';
				card.innerHTML = '<div class="card"></div><p class="sum"></p>';
				log.append(card);
			}
			const f = Math.min(1, (p - writer.start) / Math.max(0.1, answer.t - writer.start));
			const text = f >= 1 ? answer.text : answer.text.slice(0, Math.floor(answer.text.length * f));
			const box = $('.card', card);
			if (box.dataset.len !== String(text.length)) {
				box.innerHTML = markdown(text);
				box.dataset.len = text.length;
				box.classList.toggle('caret', f < 1);
			}
			$('.sum', card).innerHTML = f < 1 ? '' : `<span><b>${run.agents.length === 1 ? 'Core alone' : `${run.agents.length} agents`}</b></span><span><b>${num(run.tokens)}</b> tokens</span><span><b>${took(run.seconds)}</b> on a 4-core processor</span><span><b>$0</b> on the PC</span><span>${run.hosted < 0.0001 ? '<b>under $0.0001</b>' : `<b>$${run.hosted.toFixed(4)}</b>`} if hosted</span>`;
		} else card?.remove();
		if (stick) log.scrollTop = log.scrollHeight;
		// The pieces of the mark: lit while their agent works, dimmer once it has.
		for (const path of facets) {
			const mine = spans.filter((s) => s.agent === path.dataset.agent);
			path.classList.toggle('on', mine.some((s) => p >= s.from && p < s.to));
			path.classList.toggle('done', mine.some((s) => p >= s.to));
		}
		const r = run.events.find((e) => e.kind === 'route');
		router.classList.toggle('on', !!r && p >= r.start && p < r.t);
	}

	playBtn.addEventListener('click', () => (playing ? stop() : start()));
	$('[data-restart]', replay).addEventListener('click', () => { reset(); start(); });
	$('[data-skip]', replay).addEventListener('click', () => { p = run.seconds; draw(); stop(); });
	speedIn.addEventListener('input', () => { setSpeed(fromSlider(Number(speedIn.value))); chosenSpeed = speed; });

	load(0, false);
	if (!calm.matches) {
		p = 0; reset(); stop();
		// It starts by itself the first time it comes into view, and waits while it is out of view.
		let started = false;
		new IntersectionObserver(([e]) => {
			if (e.isIntersecting) {
				if (!started) { started = true; start(); }
				else if (wasPlaying) start();
			} else if (started) { wasPlaying = playing; if (playing) stop(); }
		}, { threshold: 0.3 }).observe(replay);
	} else stop();
}

/* ---------- The PC planner ---------- */
const JOBS = { lite: 'Routing and quick replies', standard: 'Chat, summaries, most agent steps', pro: 'Code, tools, multi-step work', max: 'The hardest reasoning, thinking first' };
let current = null; // { plan, card }
const listeners = [];
const planner = $('[data-planner]');
if (planner) {
	const select = $('[data-card]', planner);
	const groups = [['RTX 50', /^RTX 50/], ['RTX 40', /^RTX 40/], ['RTX 30', /^RTX 30/], ['Other', /^No/]];
	for (const [label, re] of groups) {
		const g = document.createElement('optgroup');
		g.label = label;
		for (const c of CARDS.filter((c) => re.test(c.name))) {
			const o = document.createElement('option');
			o.value = c.name;
			o.textContent = c.vramGb ? `${c.name}${/GB/.test(c.name) ? '' : ` (${c.vramGb} GB)`}` : 'No NVIDIA card (processor only)';
			g.append(o);
		}
		select.append(g);
	}
	select.value = CARDS.some((c) => c.name === store.get('card')) ? store.get('card') : 'RTX 5060 Ti 16 GB';
	const ram = store.get('ram');
	if (['16', '32', '64'].includes(ram)) $(`input[value="${ram}"]`, planner).checked = true;

	const update = () => {
		const card = CARDS.find((c) => c.name === select.value);
		const ramGb = Number($('input[name="ram"]:checked', planner).value);
		const p = plan({ gpu: card.vramGb ? { vramGb: card.vramGb, bandwidthGbs: card.bandwidthGbs } : null, ramGb, ramMts: null });
		store.set('card', card.name);
		store.set('ram', String(ramGb));
		const rows = Object.entries(p.tiers).map(([tier, id]) => {
			const f = p.fits.find((x) => x.id === id);
			const m = CATALOG.find((x) => x.id === id);
			const where = f.where === 'gpu' ? 'all on the graphics card' : f.where === 'split' ? `${Math.round(f.gpuShare * 100)}% on the card, the rest in system memory` : 'on the processor';
			const v = Math.min(1, Math.sqrt((f.tokensPerSec ?? 0) / 300));
			return `<li><div class="tn"><b>${TIER[tier]}</b><span>${JOBS[tier]}</span></div>
				<div class="model"><code>${id}</code><span>${m.maker}, ${m.params}</span></div>
				<div class="speed"><div class="track"><i class="${f.where}" style="--v: ${v.toFixed(3)}"></i></div><p>about <b>${f.tokensPerSec}</b> tokens a second, ${where}</p></div></li>`;
		});
		$('[data-tiers]', planner).innerHTML = rows.join('');
		$('[data-download]', planner).textContent = `about ${Math.round(p.downloadGb)} GB`;
		$('[data-context]', planner).textContent = num(p.context);
		const std = p.fits.find((x) => x.id === p.tiers.standard).tokensPerSec;
		$('[data-answer-time]', planner).textContent = `about ${Math.max(1, Math.round(400 / std))} s`;
		const notes = [];
		if (!card.vramGb) notes.push('Without a graphics card everything runs on the processor, slowly, as in the replay above.');
		else if (p.together) notes.push(`Lite and Standard fit on the card together (${p.pair.toFixed(1)} GB), so ordinary messages never wait for a model to load.`);
		else notes.push('Lite and Standard do not both fit on the card, so Ollama swaps them: expect a pause of a few seconds when it does.');
		notes.push(p.vision ? 'Gemma 3 12B can read attached images here.' : 'Gemma 3 12B, which reads images, does not fit here.');
		notes.push('System memory is taken as DDR5-5600.');
		$('[data-plan-note]', planner).textContent = notes.join(' ');
		current = { plan: p, card };
		for (const fn of listeners) fn();
	};
	planner.addEventListener('change', update);
	update();
}

/* ---------- The agents ---------- */
const AGENTS = {
	'Onyx Core': { tier: null, role: 'Gets every message, and writes the one answer.', desc: "It answers quick things itself, plans the rest, hands it out and merges the results. A task that needs exactly one specialist skips Core and goes straight to it, which is faster.", tools: [['delegate', 'Hands tasks to other agents, several at once.'], ['memory_search', 'Looks up what Memory has kept about you.'], ['calculate', "Exact arithmetic, units and dates, from Onyx 3's calculator."]], limits: [8, 60000, '10 min'] },
	Researcher: { tier: 'pro', role: 'Searches the web and reads pages, citing its sources.', desc: "It never fetches a page on your PC or your home network, and what it reads reaches the models as untrusted text, not as instructions.", tools: [['web_search', "Brave Search with a key, or DuckDuckGo's plain page without one."], ['web_fetch', 'Reads one page.']], limits: [10, 60000, '5 min'] },
	Coder: { tier: 'pro', role: 'Writes Python or JavaScript, runs it, and reports what it really printed.', desc: 'The code runs in a Docker container with no network, a read-only disk, none of your files, 256 MB, one CPU and 30 seconds. Without Docker running, it says the code was not run.', tools: [['run_code', 'Runs the code in that container and returns its output.']], limits: [10, 60000, '5 min'] },
	Scheduler: { tier: 'standard', role: 'Sets reminders, one-off or repeating, in your local time.', desc: 'It lists or cancels them when you ask. Each one goes out on your preferred channel when it comes due.', tools: [['schedule_create', 'Sets a reminder.'], ['schedule_list', 'Lists them.'], ['schedule_cancel', 'Cancels one.']], limits: [5, 20000, '2 min'] },
	Messenger: { tier: 'lite', role: 'Fits a reply to the channel it goes out on, from the app to a text message.', desc: '', tools: [['format_message', 'Shapes a reply for its channel.']], limits: [3, 8000, '1 min'] },
	Memory: { tier: 'lite', role: 'Keeps lasting facts about you, and finds them again.', desc: 'By meaning, with a small embedding model, or by their words without it. Settings lists everything it keeps, each with a button to forget it.', tools: [['memory_save', 'Keeps a fact.'], ['memory_search', 'Finds the facts that help with a message.']], limits: [4, 12000, '1 min'] },
};
const pick = $('[data-agent-pick]');
const card = $('[data-agent-card]');
if (pick && card) {
	const radios = $$('[role="radio"]', pick);
	const paths = $$('path', pick);
	let chosen = 'Onyx Core';
	const show = (name, focus) => {
		chosen = name;
		const a = AGENTS[name];
		for (const r of radios) {
			const on = r.dataset.agent === name;
			r.setAttribute('aria-checked', String(on));
			r.tabIndex = on ? 0 : -1;
			if (on && focus) r.focus();
		}
		for (const p of paths) p.classList.toggle('sel', p.dataset.agent === name);
		const tierChip = a.tier ? `<span class="chip">${TIER[a.tier]} tier</span>` : '<span class="chip">tier picked by the router</span>';
		let here = '';
		if (current) {
			const where = current.card.vramGb ? `On an ${current.card.name}` : 'Without a graphics card';
			if (a.tier) {
				const id = current.plan.tiers[a.tier];
				const f = current.plan.fits.find((x) => x.id === id);
				here = `${where}, ${TIER[a.tier]} runs <b>${id}</b> at about ${f.tokensPerSec} tokens a second. <a href="#pc">Change the PC</a>`;
			} else here = `${where}, the router sends each message to Lite (<b>${current.plan.tiers.lite}</b>), Standard (<b>${current.plan.tiers.standard}</b>), Pro (<b>${current.plan.tiers.pro}</b>) or Max (<b>${current.plan.tiers.max}</b>). <a href="#pc">Change the PC</a>`;
		}
		card.innerHTML = `<div class="row"><h3>${name}</h3>${tierChip}</div>
			<p class="role">${a.role}</p>${a.desc ? `<p class="desc">${a.desc}</p>` : ''}
			<h4>Tools</h4><ul class="tools">${a.tools.map(([t, d]) => `<li><code>${t}</code><span>${d}</span></li>`).join('')}</ul>
			<h4>Limits</h4><div class="limits"><div><b>${a.limits[0]}</b><span>steps</span></div><div><b>${num(a.limits[1])}</b><span>tokens</span></div><div><b>${a.limits[2]}</b><span>at most</span></div></div>
			${here ? `<p class="here">${here}</p>` : ''}`;
	};
	radios.forEach((r, i) => {
		r.addEventListener('click', () => show(r.dataset.agent));
		r.addEventListener('keydown', (e) => {
			const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
			if (!step) return;
			e.preventDefault();
			show(radios[(i + step + radios.length) % radios.length].dataset.agent, true);
		});
	});
	for (const p of paths) p.addEventListener('click', () => show(p.dataset.agent));
	listeners.push(() => show(chosen));
	show(chosen);
}

/* ---------- The app's screens ---------- */
const zoom = $('[data-zoom]');
const openZoom = (img) => {
	if (!zoom?.showModal) return;
	let big = $('img', zoom);
	if (!big) { big = document.createElement('img'); zoom.prepend(big); }
	big.src = img.currentSrc || img.src;
	big.alt = img.alt;
	zoom.showModal();
};
if (zoom) {
	$('[data-close]', zoom).addEventListener('click', () => zoom.close());
	zoom.addEventListener('click', (e) => { if (e.target === zoom) zoom.close(); });
}
for (const img of $$('.window img, .phone-shot')) {
	const target = img.closest('.lens') || img;
	target.tabIndex = 0;
	target.setAttribute('role', 'button');
	target.setAttribute('aria-label', `Open full size: ${img.alt}`);
	target.style.cursor = 'zoom-in';
	target.addEventListener('click', () => openZoom(img));
	target.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openZoom(img); } });
}

// Canvas UI's Magnify lens over the active screen, where the browser can draw live HTML into a canvas.
let lensKit = null, lens = null;
async function lensOver(panel) {
	lens?.destroy(); lens = null;
	if (!lensKit) return;
	const box = $('.lens', panel);
	const img = $('img', box);
	if (!box || !img) return;
	if (!box.dataset.built) {
		box.style.aspectRatio = `${img.getAttribute('width')} / ${img.getAttribute('height')}`;
		const source = document.createElement('canvas');
		source.className = 'src';
		source.setAttribute('layoutsubtree', '');
		const content = document.createElement('div');
		content.style.cssText = 'position: relative; width: 100%; height: 100%;';
		img.loading = 'eager';
		content.append(img);
		source.append(content);
		const output = document.createElement('canvas');
		output.className = 'out';
		output.setAttribute('aria-hidden', 'true');
		box.append(source, output);
		box.dataset.built = '1';
	}
	lens = lensKit.createMagnify({ source: $('canvas.src', box), content: $('canvas.src > div', box), output: $('canvas.out', box) }, {
		size: 120, zoom: 2.2, color: [0.89, 0.53, 0.37], hud: 0.6, readout: false, ripples: false, aberration: 0.4, haze: 0.05, grid: false,
	});
	box.classList.toggle('lensing', !!lens);
}
const tabs = $('[data-tabs]');
if (tabs) {
	const list = $$('[role="tab"]', tabs);
	const select = (tab, focus) => {
		for (const t of list) {
			const on = t === tab;
			t.setAttribute('aria-selected', String(on));
			t.tabIndex = on ? 0 : -1;
			const panel = document.getElementById(t.getAttribute('aria-controls'));
			panel.hidden = !on;
			if (on) {
				if (focus !== undefined) { panel.classList.remove('enter'); void panel.offsetWidth; panel.classList.add('enter'); }
				lensOver(panel);
			}
		}
		if (focus) tab.focus();
	};
	list.forEach((t, i) => {
		t.addEventListener('click', () => select(t, false));
		t.addEventListener('keydown', (e) => {
			const to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 }[e.key];
			if (to === undefined) return;
			e.preventDefault();
			select(list[(to + list.length) % list.length], true);
		});
	});
	select(list[0]);
	// The other screens load once the tabs come near, so a tab shows its screen at once.
	new IntersectionObserver((seen, io) => {
		if (!seen.some((e) => e.isIntersecting)) return;
		for (const img of $$('img[loading="lazy"]', tabs)) img.loading = 'eager';
		io.disconnect();
	}, { rootMargin: '800px 0px' }).observe(tabs);
	if (fine) {
		import('./vendor/canvas-ui/magnify.js').then((kit) => {
			if (!kit.supportsHtmlInCanvas()) return;
			lensKit = kit;
			const hint = $('[data-lens-hint]');
			if (hint) hint.textContent = 'Move over a screen to look closer through the lens; click to open it full size.';
			select(list.find((t) => t.getAttribute('aria-selected') === 'true'));
		}).catch(() => {});
	}
}

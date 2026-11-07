// Onyx's internet connection: the host side of the internet port in onyx.js. Load it after host/host.js and Onyx can
// look things up online, but only with the person's permission: the engine asks before every lookup until they say
// "always", and never goes online once they say "stay offline". Without this file, Onyx cannot reach the internet.
//
// It talks to four public services over HTTPS, sends each one only the words being looked up, stores nothing, and
// needs no account or key:
//
//   Wikipedia, in English, Spanish or French   research, questions, "In the news"   *.wikipedia.org
//   Open-Meteo                                 places and weather forecasts         geocoding-api.open-meteo.com,
//                                                                                   api.open-meteo.com
//   Free Dictionary API (from Wiktionary)      words not in Onyx's dictionary       api.dictionaryapi.dev
//
// ask({ kind, query, topic?, place?, lang? }) resolves to { data } (shapes below, which onyx.js turns into replies) or
// null when a service can't be reached, is slow, or has nothing. Any failure is null, never an error.
(function (root) {
	'use strict';

	const AGENT = 'Onyx/2.1 (https://github.com/gkson-lab/onyx; on-device assistant)';
	const TIMEOUT = 6000;
	const inBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
	const enc = encodeURIComponent;
	const LANGS = ['en', 'es', 'fr'];
	const wiki = (lang) => `https://${LANGS.includes(lang) ? lang : 'en'}.wikipedia.org`;

	/** Text from a scrap of Wikipedia HTML: no tags, comments or entities. */
	const plain = (html) => String(html || '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

	/**
	 * { status, data } for a JSON URL; status 0 when it couldn't be reached at all. A connection that drops or hangs is
	 * tried once more (a first connection through a proxy sometimes stalls); a refusal such as 429 is not.
	 */
	async function get(url, fromWikipedia) {
		const first = await getOnce(url, fromWikipedia);
		return first.status === 0 ? getOnce(url, fromWikipedia) : first;
	}

	async function getOnce(url, fromWikipedia) {
		const fetcher = connector.fetch || root.fetch;
		if (typeof fetcher !== 'function') return { status: 0, data: null };
		const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
		const timer = ctrl && setTimeout(() => ctrl.abort(), TIMEOUT);
		try {
			const headers = { Accept: 'application/json' };
			// Wikimedia asks clients to say who they are. A browser can't set User-Agent, so it sends Api-User-Agent.
			if (fromWikipedia) headers[inBrowser ? 'Api-User-Agent' : 'User-Agent'] = AGENT;
			const res = await fetcher(url, { headers, signal: ctrl ? ctrl.signal : undefined });
			if (!res || !res.ok) return { status: res ? res.status : 0, data: null };
			return { status: res.status, data: await res.json() };
		} catch {
			return { status: 0, data: null };
		} finally {
			if (timer) clearTimeout(timer);
		}
	}

	/* ---------- Wikipedia ---------- */

	// Whether Wikipedia answered at all during a lookup, to tell "nothing found" from "couldn't reach it".
	let reached = false;

	async function search(query, lang) {
		const { status, data } = await get(`${wiki(lang)}/w/rest.php/v1/search/page?q=${enc(query)}&limit=5`, true);
		if (status && status !== 429) reached = true;
		return data && Array.isArray(data.pages) ? data.pages.map((p) => ({ title: p.title, description: p.description || '' })) : null;
	}

	async function summary(title, lang) {
		const { status, data } = await get(`${wiki(lang)}/api/rest_v1/page/summary/${enc(title.replace(/ /g, '_'))}`, true);
		if (status && status !== 429) reached = true;
		if (!data || !data.extract || data.type === 'disambiguation' || data.type === 'no-extract') return null;
		const url = (data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page) || `${wiki(lang)}/wiki/${enc(data.title.replace(/ /g, '_'))}`;
		return { title: data.title, description: data.description || '', extract: data.extract, url, lang: LANGS.includes(lang) ? lang : 'en' };
	}

	/** An article's plain text, for a research brief's key points (the first 24,000 characters is plenty). */
	async function article(title, lang) {
		const { data } = await get(`${wiki(lang)}/w/api.php?action=query&prop=extracts&explaintext=1&exsectionformat=plain&redirects=1&format=json&origin=*&titles=${enc(title)}`, true);
		const page = data && data.query && data.query.pages && Object.values(data.query.pages)[0];
		// Formulas are left out of plain-text extracts, leaving doubled spaces where they were.
		return page && page.extract ? page.extract.slice(0, 24000).replace(/[ \t]{2,}/g, ' ').replace(/ ([,.;:])/g, '$1') : null;
	}

	/**
	 * The article that best answers a question or names a topic. Wikipedia's search finds it; if search can't be
	 * reached (it is rate limited for busy networks), the topic itself is tried as an article title.
	 */
	async function find(query, topic, lang) {
		const hits = await search(query, lang);
		const titles = hits && hits.length ? hits.map((h) => h.title) : [topic || query].filter(Boolean);
		for (const title of titles.slice(0, 3)) {
			const page = await summary(title, lang);
			if (page) return { page, related: titles.filter((t) => t !== page.title).slice(0, 4) };
		}
		return null;
	}

	/** Wikipedia's "In the news", today's or, early in the day, yesterday's. */
	async function news() {
		const day = (offset) => {
			const d = new Date(Date.now() - offset * 86400000);
			return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}`;
		};
		for (const offset of [0, 1]) {
			const { data } = await get(`${wiki('en')}/api/rest_v1/feed/featured/${day(offset)}`, true);
			if (data && Array.isArray(data.news) && data.news.length) {
				const items = data.news.slice(0, 6).map((n) => ({ text: plain(n.story), date: (String(n.story).match(/<!--\s*([A-Z][a-z]{2} \d{1,2})\s*-->/) || [])[1] || '' }));
				return { kind: 'news', items, url: 'https://en.wikipedia.org/wiki/Portal:Current_events' };
			}
		}
		return null;
	}

	/* ---------- Open-Meteo ---------- */

	async function weather(place, lang) {
		const geo = await get(`https://geocoding-api.open-meteo.com/v1/search?name=${enc(place)}&count=1&language=${LANGS.includes(lang) ? lang : 'en'}&format=json`);
		if (geo.status === 0) return null;
		const p = geo.data && geo.data.results && geo.data.results[0];
		if (!p) return { kind: 'weather', found: false, place };
		const { data } = await get(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`);
		if (!data || !data.current) return null;
		return { kind: 'weather', found: true, place: { name: p.name, region: p.admin1 || '', country: p.country || '' }, current: data.current, daily: data.daily, url: 'https://open-meteo.com' };
	}

	/* ---------- Free Dictionary API ---------- */

	async function define(word) {
		const { status, data } = await get(`https://api.dictionaryapi.dev/api/v2/entries/en/${enc(word)}`);
		if (status === 404) return { kind: 'definition', found: false, word };
		const e = Array.isArray(data) && data[0];
		if (!e) return null;
		return {
			kind: 'definition',
			found: true,
			word: e.word,
			phonetic: e.phonetic || (e.phonetics || []).map((p) => p.text).find(Boolean) || '',
			meanings: (e.meanings || []).slice(0, 3).map((m) => ({ pos: m.partOfSpeech, definitions: (m.definitions || []).slice(0, 2).map((d) => ({ definition: d.definition, example: d.example || '' })), synonyms: (m.synonyms || []).slice(0, 5) })),
			url: (e.sourceUrls || [])[0] || 'https://dictionaryapi.dev',
		};
	}

	/* ---------- The port ---------- */

	const connector = {
		enabled: true,
		/** Where Onyx can go, shown to the person when it asks for permission. */
		sources: { search: 'Wikipedia', research: 'Wikipedia', news: 'Wikipedia', weather: 'Open-Meteo', define: 'the Free Dictionary API' },
		/** A fetch function to use instead of the global one (tests pass recorded responses through it). */
		fetch: null,
		async ask(request) {
			const { kind, query = '', topic, place, lang = 'en' } = request || {};
			if (kind === 'search' || kind === 'research') {
				reached = false;
				const found = await find(query, topic, lang);
				if (!found) return reached ? { data: { kind: 'article', found: false, query } } : null;
				const data = Object.assign({ kind: 'article', related: found.related }, found.page);
				if (kind === 'research') data.text = await article(found.page.title, lang);
				return { data };
			}
			if (kind === 'weather') {
				const data = place ? await weather(place, lang) : null;
				return data ? { data } : null;
			}
			if (kind === 'news') {
				const data = await news();
				return data ? { data } : null;
			}
			if (kind === 'define') {
				const data = await define(String(query).trim().toLowerCase());
				return data ? { data } : null;
			}
			return null;
		},
	};

	(root.Omni = root.Omni || {}).net = connector;
})(typeof window !== 'undefined' ? window : globalThis);

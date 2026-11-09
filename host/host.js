// A minimal host for running Onyx outside OmniTool: memory in localStorage (or in memory under Node), and no tools.
// Inside OmniTool, the app itself provides all of this, plus the tools Onyx can find and run.
(function (root) {
	'use strict';

	const memory = new Map();
	const local = (() => {
		try {
			const key = '__onyx_probe';
			root.localStorage.setItem(key, '1');
			root.localStorage.removeItem(key);
			return root.localStorage;
		} catch {
			// Node, or a browser that blocks storage: memory only.
			return null;
		}
	})();

	const store = {
		get(key, fallback) {
			try {
				const raw = local ? local.getItem('onyx:' + key) : memory.get(key);
				return raw == null ? fallback : JSON.parse(raw);
			} catch {
				return fallback;
			}
		},
		set(key, value) {
			const raw = JSON.stringify(value);
			if (local) local.setItem('onyx:' + key, raw);
			else memory.set(key, raw);
		},
		remove(key) {
			if (local) local.removeItem('onyx:' + key);
			else memory.delete(key);
		},
	};

	const random = {
		source: () => Math.random,
		shuffle(rand, list) {
			const a = [...list];
			for (let i = a.length - 1; i > 0; i--) {
				const j = Math.floor(rand() * (i + 1));
				[a[i], a[j]] = [a[j], a[i]];
			}
			return a;
		},
	};

	root.Omni = {
		edition: 'standalone',
		tools: [],
		byId: {},
		sortedTools: () => [],
		store,
		random,
		ai: { mode: async () => 'offline' },
		offline: { plan: () => null, run: async () => '', reset() {} },
		// The internet port, off: this host has no network code. Load host/net.js after this file to connect it to
		// Wikipedia, Open-Meteo and the Free Dictionary API; Onyx still asks the person before every lookup. See
		// "The internet, with your permission" in README.md for the request and reply shapes.
		net: { enabled: false, ask: async () => null },
		open() {},
		setTheme() {},
	};

	// Onyx 3's dictionaries (src/translations/onyx-translations-<code>.js) are loaded one language at a time, when a
	// language is first asked for: a script tag in a page, require() in Node. `base` is where they are.
	const here = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : null;
	const loading = new Map();
	root.Omni.languages = {
		base: here ? here.replace(/host\/host\.js(?:\?.*)?$/, 'src/translations/') : null,
		/** Loads a language's dictionary; resolves to whether it is there. */
		load(code) {
			if (root.Omni.onyxTranslations && root.Omni.onyxTranslations[code]) return Promise.resolve(true);
			if (!/^[a-z]{2}$/.test(code)) return Promise.resolve(false);
			if (loading.has(code)) return loading.get(code);
			const file = `onyx-translations-${code}.js`;
			const done = () => !!(root.Omni.onyxTranslations && root.Omni.onyxTranslations[code]);
			let p;
			if (typeof document !== 'undefined') {
				p = new Promise((resolve) => {
					const s = document.createElement('script');
					s.src = (this.base || 'src/translations/') + file;
					s.onload = () => resolve(done());
					s.onerror = () => resolve(false);
					document.head.appendChild(s);
				});
			} else {
				p = new Promise((resolve) => {
					try {
						require(this.base ? this.base + file : require('path').join(__dirname, '..', 'src', 'translations', file));
					} catch (e) { /* not installed: Onyx says it doesn't have that language */ }
					resolve(done());
				});
			}
			loading.set(code, p);
			return p;
		},
	};
})(typeof window !== 'undefined' ? window : globalThis);

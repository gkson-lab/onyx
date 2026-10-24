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
		// The internet port, prepared but not connected: Onyx asks it only when `enabled` is true, and this host has no
		// network code behind it. See "Internet port" in README.md for the request and reply shapes.
		net: { enabled: false, ask: async () => null },
		open() {},
		setTheme() {},
	};
})(typeof window !== 'undefined' ? window : globalThis);

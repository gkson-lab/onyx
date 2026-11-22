// Builds the intro page's scenes into intro/scenes/: plain browser modules, minified, with three.js left as an outside
// import (the page serves one copy, intro/vendor/three.module.min.js). WGSL files are prepared for vgpu here, at build
// time, so the browser never has to parse shaders. Run from this folder after `npm install`:  node build.mjs
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '../../intro/scenes');
mkdirSync(out, { recursive: true });

// `import shader from './prism.wgsl'` becomes vgpu's prepared shader artifact (plain JSON).
const wgsl = {
	name: 'wgsl',
	setup(b) {
		b.onLoad({ filter: /\.wgsl$/ }, async (args) => {
			const { prepareShader } = await import('@vgpu/wgsl/prepare');
			const artifact = prepareShader(readFileSync(args.path, 'utf8'), args.path.slice(here.length + 1));
			return { contents: `export default ${JSON.stringify(artifact)};`, loader: 'js' };
		});
	},
};

// Only three.js itself is shared with the page; its add-ons are bundled in (they import 'three', which stays outside).
const threeOnly = {
	name: 'three-only',
	setup(b) {
		b.onResolve({ filter: /^three$/ }, () => ({ path: 'three', external: true }));
		b.onResolve({ filter: /^three\/(addons|examples\/jsm)\// }, (args) => ({
			path: join(here, 'node_modules/three/examples/jsm', args.path.replace(/^three\/(addons|examples\/jsm)\//, '')),
		}));
	},
};

const scenes = (process.argv[2] ? process.argv.slice(2) : ['chrome', 'sky', 'prism', 'vram', 'glass']);
// Package name -> folder, and which scenes use it, for the licences file.
const bundled = new Map(), usedIn = new Map();
const entries = { chrome: 'chrome.js', sky: 'sky.js', prism: 'prism.js', vram: 'vram.jsx', glass: 'glass.jsx' };
// The liquid glass (glisse) is written for React but runs on Preact's compatibility layer, a tenth of the size. The
// graphics card keeps real React: React Three Fiber needs React's own reconciler.
const PREACT = { react: 'preact/compat', 'react-dom/client': 'preact/compat/client', 'react-dom': 'preact/compat', 'react/jsx-runtime': 'preact/jsx-runtime' };
for (const name of scenes) {
	const result = await build({
		entryPoints: [join(here, entries[name])],
		bundle: true,
		format: 'esm',
		platform: 'browser',
		// Every browser with import maps, which the page needs for three.js anyway.
		target: ['chrome89', 'edge89', 'firefox108', 'safari16.4'],
		minify: true,
		legalComments: 'eof',
		plugins: [threeOnly, wgsl],
		jsx: 'automatic',
		alias: name === 'glass' ? PREACT : {},
		loader: { '.frag': 'text' }, // the prism's GLSL, for browsers without WebGPU
		define: { 'process.env.NODE_ENV': '"production"' },
		outfile: join(out, `${name}.js`),
		metafile: true,
		logLevel: 'warning',
	});
	const kept = Object.values(result.metafile.outputs).flatMap((o) => Object.entries(o.inputs).filter(([, v]) => v.bytesInOutput > 0).map(([k]) => k));
	for (const input of kept) {
		const found = input.match(/node_modules\/((?:@[^/]+\/)?[^/]+)\//g);
		if (!found) continue;
		const last = found[found.length - 1];
		const pkg = last.slice('node_modules/'.length, -1);
		bundled.set(pkg, join(here, input.slice(0, input.lastIndexOf(last) + last.length)));
		if (!usedIn.has(pkg)) usedIn.set(pkg, new Set());
		usedIn.get(pkg).add(`${name}.js`);
	}
	const bytes = Object.values(result.metafile.outputs).reduce((s, o) => s + o.bytes, 0);
	console.log(`${name}.js: ${(bytes / 1024).toFixed(0)} KB`);
}

// The licences of everything bundled, beside the bundles: every package esbuild actually pulled into a scene. A few
// packages publish to npm without their licence file; for those, licences/ holds the one from their repository, taken
// at the release that matches the version here.
const UPSTREAM = {
	'@react-three/fiber': ['react-three-fiber.LICENSE', 'https://github.com/pmndrs/react-three-fiber/blob/v9.4.0/LICENSE', '9.4.0'],
	'@takram/three-atmosphere': ['three-atmosphere.LICENSE', 'https://github.com/takram-design-engineering/three-geospatial/blob/atmosphere%400.19.1/packages/atmosphere/LICENSE', '0.19.1'],
	'@takram/three-clouds': ['three-clouds.LICENSE', 'https://github.com/takram-design-engineering/three-geospatial/blob/clouds%400.7.6/packages/clouds/LICENSE', '0.7.6'],
	'@takram/three-geospatial': ['three-geospatial.LICENSE', 'https://github.com/takram-design-engineering/three-geospatial/blob/core%400.9.1/packages/core/LICENSE', '0.9.1'],
};
if (process.argv[2]) {
	console.log('Built some scenes only, so LICENSES.md is left as it was. Run with no names to rebuild it.');
	process.exit(0);
}
const lines = ['# Third-party code in intro/scenes', '', 'The scene bundles include the following libraries. Each licence follows.', ''];
for (const [pkg, dir] of [...bundled].sort((a, b) => a[0].localeCompare(b[0]))) {
	const meta = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
	const files = readdirSync(dir).filter((f) => /^(licen[cs]e|notice|copying)(\.(md|txt))?$/i.test(f)).sort();
	lines.push(`## ${pkg} ${meta.version}`, '', `Licence: ${meta.license ?? 'see below'}. Used in: ${[...usedIn.get(pkg)].sort().join(', ')}.`, '');
	if (files.length) {
		for (const f of files) lines.push('```', readFileSync(join(dir, f), 'utf8').trim(), '```', '');
		continue;
	}
	const upstream = UPSTREAM[pkg];
	if (!upstream) throw new Error(`${pkg} has no licence file; add it to licences/ and UPSTREAM.`);
	if (upstream[2] !== meta.version) throw new Error(`licences/${upstream[0]} is for ${pkg} ${upstream[2]}, but ${meta.version} is installed.`);
	lines.push(`From ${upstream[1]}`, '', '```', readFileSync(join(here, 'licences', upstream[0]), 'utf8').trim(), '```', '');
}
writeFileSync(join(out, 'LICENSES.md'), lines.join('\n'));
console.log(`LICENSES.md written: ${bundled.size} packages`);

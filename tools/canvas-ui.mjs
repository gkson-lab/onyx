// Builds the Canvas UI component the intro page uses, Magnify (the lens over the app's screens), into a plain browser
// module in intro/vendor/canvas-ui/. (The page once used Chrome Object too; the logo is now Paper Shaders' liquid metal,
// built with the other scenes in tools/intro-scenes.)
//
// Canvas UI (https://github.com/DavidHDev/canvas-ui, MIT + Commons Clause, (c) 2026 David Haz) ships each component
// as TypeScript, meant to be copied into a project. This compiles the vanilla WebGL build of Magnify with esbuild.
// three.js stays an outside import, served once by intro/vendor/three.module.min.js; any three.js add-ons it uses are
// bundled in from the three package.
//
//   ESBUILD=<path to the esbuild package> node tools/canvas-ui.mjs <canvas-ui checkout> <three package folder>
//
// The three package must be the version intro/vendor holds (0.185.1). The licence is copied beside the output.
import { copyFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [canvasUi, threePkg] = process.argv.slice(2).map((p) => p && resolve(p));
if (!canvasUi || !threePkg) {
	console.error('usage: ESBUILD=<esbuild package> node tools/canvas-ui.mjs <canvas-ui checkout> <three package folder>');
	process.exit(2);
}
const esbuild = await import(process.env.ESBUILD ? join(process.env.ESBUILD, 'lib/main.js') : 'esbuild');
const out = fileURLToPath(new URL('../intro/vendor/canvas-ui/', import.meta.url));
mkdirSync(out, { recursive: true });
const lib = join(canvasUi, 'src/lib');

const addons = {
	name: 'three-addons',
	setup(build) {
		build.onResolve({ filter: /^three\/addons\// }, (args) => ({ path: join(threePkg, 'examples/jsm', args.path.slice('three/addons/'.length)) }));
	},
};

const banner = `/* Canvas UI, https://github.com/DavidHDev/canvas-ui. Copyright (c) 2026 David Haz. MIT + Commons Clause, see
   LICENSE.md beside this file: use it as part of an application, website or product, not to sell or redistribute the
   components themselves. Built from the vanilla WebGL source by tools/canvas-ui.mjs. */`;

const parts = {
	'magnify.js': 'export { createMagnify, supportsHtmlInCanvas } from "./Magnify/MagnifyVanilla.ts";',
};
for (const [file, contents] of Object.entries(parts)) {
	const result = await esbuild.build({
		stdin: { contents, resolveDir: lib, loader: 'ts', sourcefile: file },
		bundle: true,
		format: 'esm',
		target: 'es2022',
		minify: true,
		legalComments: 'none',
		external: ['three'],
		plugins: [addons],
		banner: { js: banner },
		outfile: join(out, file),
		metafile: true,
	});
	const bytes = Object.values(result.metafile.outputs)[0].bytes;
	console.log(`${file}: ${(bytes / 1024).toFixed(1)} KB`);
}
copyFileSync(join(canvasUi, 'LICENSE.md'), join(out, 'LICENSE.md'));

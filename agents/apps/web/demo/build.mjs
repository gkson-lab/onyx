// Builds the Onyx demo: the real app in one HTML file that opens by double-clicking it, on a Mac or anywhere, with no
// server, no install and no AI (demo/backend.ts answers in the page).   pnpm --filter @onyx/web demo
// The styles and fonts come from the app's own Next build (so Tailwind, glisse's glass and Geist are exactly the
// app's); the code is bundled again with esbuild around demo/entry.tsx, with #hash paths in place of Next's router.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(web, '../../../mac-demo/Onyx-Demo.html');

execSync('pnpm build', { cwd: web, stdio: 'inherit' });
const built = path.join(web, 'out');
const cssDir = path.join(built, '_next/static/css');
let css = fs.readdirSync(cssDir).filter((f) => f.endsWith('.css')).map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8')).join('\n');
// The fonts, inlined: the file has to stand alone.
css = css.replace(/url\((["']?)\/_next\/static\/media\/([^)"']+)\1\)/g, (_, _q, name) => {
	const data = fs.readFileSync(path.join(built, '_next/static/media', name)).toString('base64');
	return `url(data:font/${path.extname(name).slice(1)};base64,${data})`;
});
// The font families Next named, from the page it built (layout.tsx puts them on <html>).
const html = fs.readFileSync(path.join(built, 'index.html'), 'utf8');
const fonts = (html.match(/<html[^>]*style="([^"]*)"/) ?? [])[1]?.replace(/&quot;/g, '"').replace(/&#x27;/g, "'") ?? '';

const shim = (f) => path.join(web, 'demo/shims', f);
const result = await esbuild.build({
	entryPoints: [path.join(web, 'demo/entry.tsx')],
	absWorkingDir: web,
	tsconfig: path.join(web, 'tsconfig.json'),
	bundle: true,
	minify: true,
	format: 'iife',
	platform: 'browser',
	target: ['safari15.4', 'chrome105', 'firefox110'],
	jsx: 'automatic',
	legalComments: 'none',
	write: false,
	alias: { 'next/link': shim('link.tsx'), 'next/navigation': shim('navigation.ts') },
	define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_API': 'undefined', 'process.env': '{}' },
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

// The demo bar: a pill of glass over the window's top edge (see entry.tsx).
const demoCss = `
#app { height: 100%; }
.demo-bar { position: fixed; z-index: 70; top: 4px; left: 50%; transform: translateX(-50%); display: none; align-items: center; gap: 2px; padding: 3px; border-radius: 999px; font: 500 12px/1 var(--font-sans); color: var(--text);
	background: rgb(20 20 24 / 0.55); -webkit-backdrop-filter: blur(14px) saturate(1.5); backdrop-filter: blur(14px) saturate(1.5); box-shadow: inset 0 0 0 0.5px rgb(255 255 255 / 0.18), inset 0 1px 0 rgb(255 255 255 / 0.12), 0 6px 20px -8px rgb(0 0 0 / 0.6); }
@media (min-width: 768px) { .demo-bar { display: flex; } }
.demo-label { padding: 0 10px 0 9px; color: var(--muted); white-space: nowrap; }
.demo-bar button { height: 22px; padding: 0 10px; border-radius: 999px; color: var(--muted); white-space: nowrap; }
.demo-bar button:hover { color: var(--text); }
.demo-bar button[aria-pressed='true'] { color: var(--text); background: rgb(255 255 255 / 0.14); box-shadow: inset 0 0 0 0.5px rgb(255 255 255 / 0.2); }
`;
const page = `<!doctype html>
<html lang="en" data-theme="dark" class="h-full" style="${fonts.replace(/"/g, '&quot;')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark">
<title>Onyx demo</title>
<style>${css}</style>
<style>${demoCss}</style>
</head>
<body>
<div id="app"></div>
<script>${js}</script>
</body>
</html>
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, page);
console.log(`${path.relative(process.cwd(), out)}: ${(page.length / 1024 / 1024).toFixed(2)} MB`);

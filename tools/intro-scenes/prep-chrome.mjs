// Prepares the mark for the liquid chrome effect: Paper Shaders' toProcessedLiquidMetal works out an edge map of the
// shape (a Poisson solve), which takes a phone a noticeable moment. It runs here once, in a headless browser, and the
// result is saved as intro/scenes/mark-chrome.png. Needs Playwright with Chromium. Run after `npm install`:
//   node prep-chrome.mjs
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const bundle = await build({
	stdin: { contents: "import { toProcessedLiquidMetal } from '@paper-design/shaders'; window.prep = toProcessedLiquidMetal;", resolveDir: here, loader: 'js' },
	bundle: true, format: 'iife', write: false, minify: true,
});
// The one-colour mark, white, with room round it so the metal's edge can roll off.
const svg = readFileSync(join(here, '../../brand/onyx-mark-solid.svg'), 'utf8').replace(/fill="currentColor"/g, 'fill="#ffffff"');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('about:blank');
await page.addScriptTag({ content: bundle.outputFiles[0].text });
const base64 = await page.evaluate(async (svgText) => {
	const size = 1000, pad = 0.06;
	const img = new Image();
	img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
	await img.decode();
	const c = document.createElement('canvas');
	c.width = c.height = size;
	c.getContext('2d').drawImage(img, size * pad, size * pad, size * (1 - 2 * pad), size * (1 - 2 * pad));
	const { pngBlob } = await window.prep(c.toDataURL('image/png'));
	const bytes = new Uint8Array(await pngBlob.arrayBuffer());
	let s = '';
	for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	return btoa(s);
}, svg);
await browser.close();
writeFileSync(join(here, '../../intro/scenes/mark-chrome.png'), Buffer.from(base64, 'base64'));
console.log('mark-chrome.png:', Math.round(base64.length * 0.75 / 1024), 'KB');

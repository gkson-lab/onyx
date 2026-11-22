# The intro page's scenes

The four 3D scenes on the Onyx Agents intro page (`intro/`) are built here into plain browser modules in
`intro/scenes/`. The page loads each one only as its section comes near, and nothing from other hosts.

| Scene | Source | Library | What it shows |
| --- | --- | --- | --- |
| `chrome.js` | `chrome.js` | [Paper Shaders](https://shaders.paper.design) (Apache-2.0) | The Onyx mark in liquid chrome, in the hero. |
| `sky.js` | `sky.js` | [three-geospatial](https://github.com/takram-design-engineering/three-geospatial) by Takram (MIT), with postprocessing (Zlib) | Volumetric clouds over Austin with the real sun, flown down through as you scroll. |
| `prism.js` | `prism.js`, `prism.wgsl`, `prism.frag` | [vgpu](https://github.com/vercel-labs/vgpu) by Vercel (MIT), on WebGPU | A 3D glass prism, ray traced once per colour channel so it splits light: one white beam (a message) in, five coloured beams (the specialists) out, their paths from Snell's law. The same shader runs on WebGL 2 where WebGPU is missing, and a flat drawing on Canvas 2D after that. |
| `vram.js` | `vram.jsx` | [React Three Fiber](https://github.com/pmndrs/react-three-fiber) (MIT) and React (MIT) | A graphics card (circuit board, power stage, marked memory chips, fin stacks, heat pipes, fans, bracket) and two DDR5 sticks on a motherboard. The card's chips fill with the model the planner picks; the sticks' light bars show what spills into system memory. |

three.js itself stays outside the bundles: the page serves one copy, `intro/vendor/three.module.min.js` (r185), and
the scenes import it as `three`.

## Building

```sh
cd tools/intro-scenes
npm install
node build.mjs            # all four scenes, and intro/scenes/LICENSES.md
node build.mjs prism      # just one (LICENSES.md is left alone)
```

`build.mjs` bundles with esbuild, prepares `prism.wgsl` for vgpu at build time, and writes `LICENSES.md` from the
packages esbuild actually put into the bundles. A few packages publish to npm without their licence file; for those,
`licences/` holds the one from their repository at the matching release, and the build stops if the installed
version ever stops matching.

Two files are made once and kept in `intro/scenes/`:

- `mark-chrome.png`, the mark's edge map for the liquid chrome: `node prep-chrome.mjs` (needs Playwright's Chromium).
  Paper's solver takes a phone a noticeable moment, so it runs here instead.
- `noise.bin`, the blue noise the clouds dither with: `python3 tools/intro-scenes/blue-noise.py` from the repository's
  top folder (needs numpy). It stands in for NVIDIA's spatiotemporal blue noise, which three-geospatial loads by default.

`sky-poster.jpg` is a still of the sky scene, shown before it loads and where WebGL 2 is missing.

## Fallbacks

Every scene is optional. Without WebGL 2 the hero keeps the flat mark, the sky keeps its poster, and the graphics card
gives way to the memory bars under it. Without WebGPU, or if the GPU drops out, the prism moves to WebGL 2 on a fresh
canvas, and to a flat Canvas 2D drawing if that fails too. With reduced motion, scenes draw only when something changes. Without JavaScript the page is all
there, with a still drawing of the prism.

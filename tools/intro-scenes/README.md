# The intro page's scenes

The four 3D scenes on the Onyx Agents intro page (`intro/`), and its liquid glass, are built here into plain browser
modules in `intro/scenes/`. The page loads each one only as its section comes near, and nothing from other hosts.

| Scene | Source | Library | What it shows |
| --- | --- | --- | --- |
| `chrome.js` | `chrome.js` | [Paper Shaders](https://shaders.paper.design) (Apache-2.0) | The Onyx mark in liquid chrome, in the hero. |
| `sky.js` | `sky.js` | [three-geospatial](https://github.com/takram-design-engineering/three-geospatial) by Takram (MIT), with postprocessing (Zlib) | Volumetric clouds over Austin with the real sun, flown down through as you scroll. |
| `prism.js` | `prism.js`, `prism.wgsl`, `prism.frag` | [vgpu](https://github.com/vercel-labs/vgpu) by Vercel (MIT), on WebGPU | A 3D glass prism, ray traced once per colour channel so it splits light: one white beam (a message) in, five coloured beams (the specialists) out, their paths from Snell's law. The same shader runs on WebGL 2 where WebGPU is missing, and a flat drawing on Canvas 2D after that. |
| `glass.js` | `glass.jsx` | [glisse](https://github.com/0kzh/glisse) by Kelvin Zhang (MIT), on [Preact](https://preactjs.com)'s React compatibility layer (MIT) | Liquid glass: the floating header, the sky's cards, the agent card, the download box and the small buttons, which bend what's behind them at their rim in Chromium (frost and a lit rim elsewhere); glisse's segmented controls for the memory and cost pickers, and its sliders for the sun, the replay speed and the background settings. The page's own controls stay underneath, hidden, and the two mirror each other both ways. |
| `vram.js` | `vram.jsx` | [React Three Fiber](https://github.com/pmndrs/react-three-fiber) (MIT) and React (MIT) | A graphics card (circuit board, power stage, marked memory chips, fin stacks, heat pipes, fans, bracket) and two DDR5 sticks on a motherboard. The card's chips fill with the model the planner picks; the sticks' light bars show what spills into system memory. |

three.js itself stays outside the bundles: the page serves one copy, `intro/vendor/three.module.min.js` (r185), and
the scenes import it as `three`. glisse is written for React; `build.mjs` points `react` at `preact/compat` for
`glass.js` alone, which makes it 87 KB instead of 263 KB. The graphics card keeps real React, which React Three Fiber
needs.

## Building

```sh
cd tools/intro-scenes
npm install
node build.mjs            # all four scenes and the glass, and intro/scenes/LICENSES.md
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

Four pictures rendered from the scenes themselves (in Playwright's Chromium, from the built bundles) stand in for them
where they don't run:

- `mark-still.webp` (and `mark-still.png` for browsers without WebP): the chrome mark at 960 px on transparency. It's
  the hero's picture until the live chrome is ready, and stays at the lowest quality level.
- `sky-poster.jpg` and `sky-below.jpg`: the sky over Austin at 4:30 to 4:50 PM on 21 November 2026, from above the
  clouds (scroll progress 0) and from under them (0.8), at 1280 by 720. They show before the live sky is ready, and
  in its place below the top quality level, crossing over as you scroll.
- `rig-still.jpg`: the graphics card and memory with no model loaded (16 GB card, 32 GB of memory), at 960 by 660.
  Wide screens show it where the 3D card doesn't run.

## Quality levels

The page picks a level for the device when it loads (`intro/quality.js`): `high`, `mid` or `low`, from the graphics
processor's name where the browser gives it, the memory, the processor count, whether it's a phone, and whether it asked
to save data. Software rendering, low-cost phone graphics and old laptop graphics start at `low`; phones and ordinary
laptop graphics at `mid`. While the page runs, two stretches of two seconds each under 25 frames a second step it down
one level (scenes starting up are given a few seconds' grace). It never steps back up. Add `?quality=high`, `mid` or
`low` to the address to try one.

| | high | mid | low |
| --- | --- | --- | --- |
| Stone (`intro/gradient.js`) | full resolution, 40 fps | 60%, 30 fps | CSS gradient; three.js isn't downloaded |
| Chrome | 2 px per CSS px, 60 fps | 1 px per px, 30 fps | `mark-still` |
| Sky | live | the two stills | the two stills |
| Prism | full, 60 fps | 75%, 30 fps | 55%, drawn only when something changes |
| Graphics card | up to 2 px per px | up to 1.25, fewer small parts, 30 fps | `rig-still` on wide screens, the memory bars |
| Liquid glass (glisse) | bends what's behind it | tinted glass with a drawn rim, no filter | not loaded: CSS glass on the header only |

Each scene's `setQuality(level)` takes it down a level in place. The live sky stops at the first step down, and at
`low` the stone and the chrome give way to their stills.

## Fallbacks

Every scene is optional. Without WebGL 2 the hero keeps the chrome mark's picture, the sky keeps its stills, and the
graphics card gives way to its picture (on wide screens) and the memory bars. Without WebGPU, or if the GPU drops out, the prism moves to WebGL 2 on a fresh
canvas, and to a flat Canvas 2D drawing if that fails too. With reduced motion, scenes draw only when something changes. Without JavaScript the page is all
there, with a still drawing of the prism.

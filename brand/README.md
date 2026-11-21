# The Onyx Agents mark

A pentagon-cut onyx seen from above: five facets round a lit table. The table is Onyx Core, the five facets are the
specialists it hands work to (Researcher, Coder, Scheduler, Messenger, Memory), and the cuts between them run to the
corners, as a cut stone's do. The light comes from the upper right, so the top-right facet is the brightest.

| File | Use |
|---|---|
| `onyx-mark.svg` | Shaded, the table white: on dark grounds (the website) |
| `onyx-mark-mono.svg` | One colour (`currentColor`), the facets at five strengths: the app, in either theme |
| `onyx-mark-solid.svg` | One flat colour: notification badges, the smallest sizes |
| `onyx-icon.svg` | The app icon: the shaded mark on a near-black rounded square |

All of them, the app's icons (`agents/apps/web/public/`: the tab icon, the phone's home-screen icons, the
notification badge) and the Windows shortcuts' icon (`agents/onyx.ico`) are drawn from one geometry by
[`tools/brand.py`](../tools/brand.py). Change the mark there and run `python3 tools/brand.py` from the repository's
top folder.

The website's intro page (`intro/`) shows the mark in liquid chrome: `intro/mark.svg`, the one-colour mark, extruded by Canvas UI's Chrome Object (built into `intro/vendor/canvas-ui/` by [`tools/canvas-ui.mjs`](../tools/canvas-ui.mjs)).

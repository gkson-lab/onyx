# Onyx demo: the app, with no AI inside

`Onyx-Demo.html` is the whole Onyx app in one file, to show off its liquid glass: nothing to install, no server, no
models to download, no AI. Its answers were recorded ahead of time and are replayed word by word, so the app (and the
glass) behaves just as it does with a real model.

## On a Mac

1. Download `Onyx-Demo.html` (on GitHub: open the file, then **Download raw file**).
2. Double-click it. It opens in your browser, works offline, and nothing leaves the computer. Chrome shows the most
   (panels also bend the light at their edges); Safari frosts them.

## What to try

- **Move the pointer near any edge.** The glass swells towards it and ripples.
- **Send a message.** While the answer comes in, the glass quickens and glows and a light runs round the app. Ask
  "write a script that renames my photos by the date they were taken" to watch three agents work together, then open
  **Agent graph**. Also: "plan a weekend in Austin", "how does liquid glass bend light?", "why are there two tides a
  day?". Anything else gets a note about the demo.
- **Switch the look** with the bar at the top (Standard, Liquid glass, Black chrome), or in Settings, Appearance.
- **Make the window narrow** for the phone layout.

## How it's made

This branch (`demo`) only exists to show the app off; it isn't meant to be merged. The app's server is replaced by a
stand-in that runs in the page (`agents/apps/web/demo/backend.ts`), answering from recordings of a real Onyx
(`demo/fixtures.json`, made with `demo/record/`). `pnpm --filter @onyx/web demo`, from `agents/`, builds this file
again.

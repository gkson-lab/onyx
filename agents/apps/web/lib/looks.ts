/**
 * The app's looks, chosen in Settings and kept on this device: html[data-look] is what the styles (tokens.css,
 * globals.css) and the liquid glass (components/liquid-border.tsx) read. No React here, so the root layout can use it.
 * - standard: flat and quiet, the app as it was before the glass: solid dark panels, hairlines, a white accent.
 * - glass: liquid glass whose edges flow outwards in waves of chromatic chrome (the first glass theme).
 * - black: the same liquid glass in black chrome, its light splitting into gold and blue (the second).
 */
export type Look = 'standard' | 'glass' | 'black';
// The demo opens in Liquid glass, as it's there to show the glass off.
export const DEFAULT_LOOK: Look = 'glass';
export const LOOK_KEY = 'onyx.look';
export const LOOKS: { value: Look; label: string; note: string }[] = [
	{ value: 'standard', label: 'Standard', note: 'Flat and quiet: solid dark panels and white accents, no glass. The lightest on the battery and the graphics card.' },
	{ value: 'glass', label: 'Liquid glass', note: 'Panels of liquid glass whose edges flow outwards in waves of chromatic chrome, and come alive while Onyx answers.' },
	{ value: 'black', label: 'Black chrome', note: 'The same liquid glass in black liquid metal, its light splitting into gold and blue at the edges.' },
];
export const isLook = (v: unknown): v is Look => v === 'standard' || v === 'glass' || v === 'black';

/** Run in the page's head, before anything is drawn, so the saved look shows from the first frame. */
export const LOOK_SCRIPT = `try{var l=localStorage.getItem('${LOOK_KEY}');document.documentElement.dataset.look=l==='glass'||l==='black'||l==='standard'?l:'${DEFAULT_LOOK}'}catch(e){document.documentElement.dataset.look='${DEFAULT_LOOK}'}`;

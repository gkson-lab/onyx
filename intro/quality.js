// How much this device can take, so the page stays smooth on everything from a gaming PC to an old phone.
//
// The level is 'high', 'mid' or 'low'. It starts from what the browser says about the device (its graphics processor,
// memory, processor cores, whether it is a phone, whether it asked to save data), and it steps down while the page
// runs if frames start to drag: four seconds at under 25 frames a second. It never steps back up, so nothing
// flickers between levels. Each scene reads the level and listens for it to drop:
//   high: everything live, at full detail.
//   mid:  lighter: lower resolution, fewer frames, no blur behind the glass, stills of the sky instead of the live one.
//   low:  pictures for the heavy scenes, no blur at all, and nothing moving that the page can do without.
// Add ?quality=high, ?quality=mid or ?quality=low to the address to try a level.

const ORDER = ['low', 'mid', 'high'];
const listeners = new Set();
let level = 'high';
let quietUntil = 0;

/** The name the browser gives the graphics processor, where it gives one (Chrome does; Safari says "Apple GPU"). */
function gpuName() {
	try {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
		if (!gl) return 'none';
		const info = gl.getExtension('WEBGL_debug_renderer_info');
		const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
		gl.getExtension('WEBGL_lose_context')?.loseContext();
		return name;
	} catch {
		return '';
	}
}

// No graphics processor at all: the browser draws 3D on the processor, far too slowly for these scenes.
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen|microsoft basic/i;
// Graphics in low-cost phones and old laptops: fine for the page, not for its 3D scenes in motion.
// (Intel's "HD Graphics" with no number, or a four-digit one up to 5xxx, is 2012 to 2016 vintage; "UHD" is newer.)
const WEAK = /PowerVR|Mali-(4\d\d|T\d+|G31|G51|G52)\b|Adreno \(TM\) ([1-4]\d\d|50\d|51[0-2]|61[0-3])\b|\bGMA\b|Intel.*[^U]HD Graphics( [1-5]\d{3})?(?!\s*\d)/i;
// Graphics built into ordinary laptops: most of the page at full speed, the heaviest parts lighter.
const MODEST = /Intel.*(UHD|HD) Graphics|Intel.*Iris(?![^,]*Xe)|Radeon(\(TM\))? (R[2-5]|Vega [3-8]\b)/i;
// A graphics card of its own (or Apple's own chips): the processor count no longer matters, as the card does the work.
const STRONG = /GeForce|RTX|Quadro|Radeon(\(TM\))? (RX|Pro)|Apple M\d|Intel.*Arc/i;

function detect() {
	const asked = new URLSearchParams(location.search).get('quality');
	if (ORDER.includes(asked)) return asked;
	const gpu = gpuName();
	if (gpu === 'none' || SOFTWARE.test(gpu)) return 'low';
	const connection = navigator.connection;
	if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) return 'low';
	// Memory in gigabytes, rounded; only Chrome and Edge say, so elsewhere it's taken as plenty.
	const memory = navigator.deviceMemory ?? 8;
	// iPhones and iPads always report two cores (Safari's guard against fingerprinting), so their count means nothing.
	const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
	const cores = ios ? 8 : navigator.hardwareConcurrency || 8;
	if (memory <= 2 || cores <= 2 || WEAK.test(gpu)) return 'low';
	const phone = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 768;
	if (phone || memory <= 4 || (cores <= 4 && !STRONG.test(gpu)) || MODEST.test(gpu)) return 'mid';
	return 'high';
}

function set(next) {
	if (next === level) return;
	level = next;
	document.documentElement.dataset.quality = level;
	for (const fn of listeners) fn(level);
}

/** The level now. */
export const quality = () => level;
/** True if the level is at least `min` ('low', 'mid' or 'high'). */
export const atLeast = (min) => ORDER.indexOf(level) >= ORDER.indexOf(min);
/** Calls `fn(level)` whenever the level drops. Returns a function that stops it. */
export function onQuality(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
/** One step down, as far as 'low'. */
export function lower() {
	const i = ORDER.indexOf(level);
	if (i > 0) set(ORDER[i - 1]);
}
/** Leaves the next `ms` out of the reckoning: a scene starting up (compiling shaders, building textures) stutters once. */
export function hold(ms = 2500) {
	quietUntil = Math.max(quietUntil, performance.now() + ms);
}

// Counts the frames the page manages while it's in view, two seconds at a time. Two slow stretches in a row (under
// 25 frames a second) step it down. Counting frames over time catches both ways a page drags: every frame a little
// late, or smooth frames broken up by long stalls while the graphics processor catches up. A screen held at 30 frames
// a second to save battery is above the mark, and a single hiccup (an image decoding) can't fill two stretches.
function watch() {
	const SPAN = 2000, MIN_FPS = 25;
	let start = 0, frames = 0, slow = 0;
	const tick = (now) => {
		if (level === 'low') return;
		requestAnimationFrame(tick);
		if (document.hidden || now < quietUntil) { start = 0; slow = 0; return; }
		if (!start) { start = now; frames = 0; return; }
		frames++;
		if (now - start < SPAN) return;
		const fps = (frames * 1000) / (now - start);
		start = now;
		frames = 0;
		slow = fps < MIN_FPS ? slow + 1 : 0;
		if (slow >= 2) {
			lower();
			slow = 0;
			hold(3000);
		}
	};
	requestAnimationFrame(tick);
}

level = detect();
document.documentElement.dataset.quality = level;
if (!new URLSearchParams(location.search).has('quality')) {
	hold(4000);
	watch();
}

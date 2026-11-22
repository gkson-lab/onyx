// Liquid glass for the intro page, from glisse (https://github.com/0kzh/glisse, MIT, Kelvin Zhang): Apple's iOS 26
// Liquid Glass for the web. In Chromium the glass bends what's behind it at its rim, splitting it into colours, through
// an SVG filter on the live backdrop; elsewhere it keeps its frost and its lit rim.
//
// The page keeps its own HTML and controls, which work without this (and without JavaScript). This puts glass behind
// chosen elements, and glisse's controls in front of chosen native ones, mirroring the two both ways: a slider dragged
// sets the native input and fires its event, and the page's code setting the native input moves the slider. So the
// page's code never needs to know which one you touched.
//
// glisse is written for React; here it runs on Preact's compatibility layer (https://preactjs.com, MIT), about a
// tenth of React's size (see build.mjs, which points `react` at it for this bundle only).
import { createRoot } from 'react-dom/client';
import { Glass, SegmentedControl, Slider } from 'glisse';

// The quality level (see intro/quality.js). At the top level glass is glisse's: it bends its backdrop. Below that it
// is tinted glass with a drawn rim and no filter at all, which costs next to nothing to draw.
let level = 'high';
const mounted = new Set();

function mount(host, view) {
	const root = createRoot(host);
	const entry = { draw: () => root.render(view()) };
	mounted.add(entry);
	entry.draw();
	return { draw: entry.draw, destroy() { mounted.delete(entry); root.unmount(); } };
}

/** Changes the level for every glass surface on the page. */
export function setLevel(next) {
	if (next === level) return;
	level = next;
	for (const entry of mounted) entry.draw();
}

const Layer = () => (level === 'high' ? <Glass className="lg-layer" /> : <div className="lg-glass lg-layer lg-plain" />);

/**
 * Glass behind `el`: a layer under its content, filling it and shaped by its corners. `el` gets the class `glassy`
 * (its own background should then go, so the glass sees what's behind it).
 */
export function layer(el) {
	const host = document.createElement('span');
	host.className = 'lg-host';
	host.setAttribute('aria-hidden', 'true');
	el.prepend(host);
	el.classList.add('glassy');
	const m = mount(host, () => <Layer />);
	// The page rewrites some of these elements' contents (a card's text, a button's icon), which takes the layer out
	// with it; it goes straight back, before anything is drawn, with its glass intact.
	const keep = new MutationObserver(() => { if (host.parentNode !== el) el.prepend(host); });
	keep.observe(el, { childList: true });
	return { destroy() { keep.disconnect(); m.destroy(); host.remove(); el.classList.remove('glassy'); } };
}

// Watches a property of an element that the page's code sets directly (an input's value, a radio's checked), calling
// `fn` after each set, without changing what the property does.
function watchProperty(el, name, fn) {
	const proto = Object.getPrototypeOf(el);
	let owner = proto;
	while (owner && !Object.getOwnPropertyDescriptor(owner, name)) owner = Object.getPrototypeOf(owner);
	const real = Object.getOwnPropertyDescriptor(owner, name);
	Object.defineProperty(el, name, {
		configurable: true,
		get() { return real.get.call(this); },
		set(v) { real.set.call(this, v); fn(); },
	});
	return () => delete el[name];
}

// A label, or [long, short] for a label that shortens on narrow screens (see site.css).
const labelOf = (l) => (Array.isArray(l) ? <><span className="long">{l[0]}</span><span className="short">{l[1]}</span></> : l);

// Puts a host for a glisse control just before `native`, and hides `native` (it stays in the page for its value).
function beside(native, className) {
	const host = document.createElement('div');
	host.className = `lg-control ${className || ''}`;
	native.before(host);
	native.classList.add('lg-mirrored');
	return { host, restore() { host.remove(); native.classList.remove('lg-mirrored'); } };
}

/**
 * A glisse segmented control in place of a group of native radio inputs (`group` holds them). `labels` can give
 * each value its own label (a node); `className` sizes it in CSS (--lg-tab-width).
 */
export function radios(group, { label, labels = {}, className } = {}) {
	const inputs = [...group.querySelectorAll('input[type="radio"]')];
	const items = inputs.map((i) => ({ value: i.value, label: labelOf(labels[i.value] ?? i.closest('label')?.textContent.trim() ?? i.value) }));
	const current = () => inputs.find((i) => i.checked)?.value ?? null;
	const { host, restore } = beside(group, className);
	const choose = (value) => {
		const input = inputs.find((i) => i.value === value);
		if (!input || input.checked) return;
		input.checked = true;
		input.dispatchEvent(new Event('change', { bubbles: true }));
	};
	const m = mount(host, () => <SegmentedControl aria-label={label} items={items} value={current()} onValueChange={choose} />);
	const unwatch = inputs.map((i) => watchProperty(i, 'checked', m.draw));
	group.addEventListener('change', m.draw);
	return { destroy() { unwatch.forEach((u) => u()); group.removeEventListener('change', m.draw); m.destroy(); restore(); } };
}

/**
 * A glisse segmented control in place of buttons that act as radios (role="radio", aria-checked), as the page's own
 * pickers are. Choosing clicks the button, so the page's click handler runs as before.
 */
export function buttonRadios(group, { label, labels = {}, className, value = (b) => b.dataset.value } = {}) {
	const buttons = [...group.querySelectorAll('[role="radio"]')];
	const items = buttons.map((b) => ({ value: value(b), label: labelOf(labels[value(b)] ?? b.textContent.trim()) }));
	const current = () => value(buttons.find((b) => b.getAttribute('aria-checked') === 'true') ?? buttons[0]);
	const { host, restore } = beside(group, className);
	const choose = (v) => buttons.find((b) => value(b) === v)?.click();
	const m = mount(host, () => <SegmentedControl aria-label={label} items={items} value={current()} onValueChange={choose} />);
	const watch = new MutationObserver(m.draw);
	watch.observe(group, { attributes: true, subtree: true, attributeFilter: ['aria-checked'] });
	return { destroy() { watch.disconnect(); m.destroy(); restore(); } };
}

/** A glisse slider in place of a native range input. Dragging it sets the input and fires `input`, then `change`. */
export function range(input, { label, className } = {}) {
	const { host, restore } = beside(input, className);
	const min = Number(input.min || 0), max = Number(input.max || 100), step = Number(input.step) || 1;
	let settle = 0;
	const set = (v) => {
		input.value = String(v);
		input.dispatchEvent(new Event('input', { bubbles: true }));
		clearTimeout(settle);
		settle = setTimeout(() => input.dispatchEvent(new Event('change', { bubbles: true })), 120);
	};
	const name = label ?? input.getAttribute('aria-label') ?? input.closest('label')?.firstElementChild?.textContent ?? undefined;
	const m = mount(host, () => (
		<Slider aria-label={name} aria-valuetext={input.getAttribute('aria-valuetext') || undefined} min={min} max={max} step={step} value={Number(input.value)} onValueChange={set} />
	));
	const unwatch = watchProperty(input, 'value', m.draw);
	return { destroy() { unwatch(); m.destroy(); restore(); } };
}

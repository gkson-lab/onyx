'use client';
import { useEffect, useRef } from 'react';

/**
 * The light behind the glass: three slow fields of colour drifting over near-black, and a soft light that follows the
 * pointer. The glass bends them at its edges, which is what makes it read as glass; over flat black it would have
 * nothing to bend. Only the compositor works on it (transforms of fixed layers, no repaints), and it stands still
 * when the system asks for reduced motion.
 */
export function Backdrop() {
	const light = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = light.current;
		if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(pointer: fine)').matches) return;
		let x = innerWidth * 0.72, y = innerHeight * 0.28, tx = x, ty = y, raf = 0;
		const step = () => {
			x += (tx - x) * 0.07;
			y += (ty - y) * 0.07;
			el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
			raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(step) : 0;
		};
		const move = (e: PointerEvent) => {
			tx = e.clientX;
			ty = e.clientY;
			if (!raf) raf = requestAnimationFrame(step);
		};
		window.addEventListener('pointermove', move, { passive: true });
		step();
		return () => {
			window.removeEventListener('pointermove', move);
			cancelAnimationFrame(raf);
		};
	}, []);
	return (
		<div aria-hidden className="backdrop">
			<div className="field f1" />
			<div className="field f2" />
			<div className="field f3" />
			<div ref={light} className="pointer-light" />
		</div>
	);
}

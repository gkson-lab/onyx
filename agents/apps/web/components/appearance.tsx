'use client';
import type { KeyboardEvent } from 'react';
import { Check } from 'lucide-react';
import { LOOKS, setLook, useLook } from '@/lib/look';
import { ICON, Section } from './ui';

/** Settings: the app's look (Standard, Liquid glass or Black chrome), kept on this device. Arrow keys move between them. */
export function Appearance() {
	const look = useLook();
	const step = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
		const by = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
		if (!by) return;
		e.preventDefault();
		const next = (i + by + LOOKS.length) % LOOKS.length;
		setLook(LOOKS[next]!.value);
		(e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
	};
	return (
		<Section title="Appearance" aside={<span className="text-xs text-muted">On this device</span>}>
			<div role="radiogroup" aria-label="Appearance" className="grid gap-3 py-3 md:grid-cols-3">
				{LOOKS.map((l, i) => {
					const on = l.value === look;
					return (
						<button key={l.value} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} onClick={() => setLook(l.value)} onKeyDown={(e) => step(e, i)} className="look-option">
							<span aria-hidden className="look-swatch" data-swatch={l.value} />
							<span className="flex items-center gap-2 px-1 text-sm font-medium">
								{l.label}
								{on && <Check {...ICON} size={15} aria-hidden />}
							</span>
							<span className="px-1 pb-1 text-xs text-muted">{l.note}</span>
						</button>
					);
				})}
			</div>
		</Section>
	);
}

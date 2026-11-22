'use client';
import { useEffect, useState } from 'react';
import { DEFAULT_LOOK, LOOK_KEY, isLook, type Look } from './looks';

export { LOOKS, type Look } from './looks';

/** The look the page shows now (see looks.ts). */
export function currentLook(): Look {
	const l = typeof document === 'undefined' ? null : document.documentElement.dataset.look;
	return isLook(l) ? l : DEFAULT_LOOK;
}

/** Changes the look, here and now, and keeps it on this device. */
export function setLook(look: Look) {
	document.documentElement.dataset.look = look;
	try {
		localStorage.setItem(LOOK_KEY, look);
	} catch {
		// A private window: the look holds until the page is closed.
	}
	window.dispatchEvent(new Event('onyx:look'));
}

/** The look now, following changes made here or in another tab. */
export function useLook(): Look {
	const [look, set] = useState<Look>(DEFAULT_LOOK);
	useEffect(() => {
		const update = () => set(currentLook());
		const other = (e: StorageEvent) => {
			if (e.key !== LOOK_KEY) return;
			document.documentElement.dataset.look = isLook(e.newValue) ? e.newValue : DEFAULT_LOOK;
			update();
		};
		update();
		window.addEventListener('onyx:look', update);
		window.addEventListener('storage', other);
		return () => {
			window.removeEventListener('onyx:look', update);
			window.removeEventListener('storage', other);
		};
	}, []);
	return look;
}

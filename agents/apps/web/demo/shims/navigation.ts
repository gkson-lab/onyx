// next/navigation for the one-file demo: the page's path lives in its #hash, so it opens from a file with no server.
import { useEffect, useState } from 'react';

const read = () => {
	const [path = '/', query = ''] = (location.hash.slice(1) || '/').split('?');
	return { path: path || '/', query };
};
function useHash() {
	const [hash, set] = useState(read);
	useEffect(() => {
		const update = () => set(read());
		window.addEventListener('hashchange', update);
		return () => window.removeEventListener('hashchange', update);
	}, []);
	return hash;
}
export const usePathname = () => useHash().path;
export const useSearchParams = () => new URLSearchParams(useHash().query);
export const useRouter = () => ({ push: (href: string) => void (location.hash = href), replace: (href: string) => location.replace(`#${href}`), back: () => history.back(), refresh: () => {} });

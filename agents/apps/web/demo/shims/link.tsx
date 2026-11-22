// next/link for the one-file demo: a plain link to the #hash path (see navigation.ts).
import { forwardRef, type AnchorHTMLAttributes } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean; replace?: boolean; scroll?: boolean };
const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, prefetch: _p, replace: _r, scroll: _s, ...rest }, ref) {
	return <a ref={ref} href={href.startsWith('/') ? `#${href}` : href} {...rest} />;
});
export default Link;

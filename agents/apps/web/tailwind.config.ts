// The Tailwind theme reads the design tokens in app/tokens.css. Change a token there and it changes everywhere.
import type { Config } from 'tailwindcss';

export default {
	content: ['./app/**/*.tsx', './components/**/*.tsx'],
	theme: {
		colors: { transparent: 'transparent', current: 'currentColor', bg: 'var(--bg)', surface: 'var(--surface)', line: 'var(--line)', text: 'var(--text)', muted: 'var(--muted)', accent: 'var(--accent)', bad: 'var(--bad)' },
		borderRadius: { none: '0', DEFAULT: 'var(--radius)', full: '9999px' },
		fontFamily: { sans: ['var(--font-sans)'], mono: ['var(--font-mono)'] },
		fontSize: { xs: ['12px', '16px'], sm: ['13px', '20px'], base: ['15px', '24px'], lg: ['18px', '26px'], xl: ['24px', '30px'] },
		boxShadow: { none: 'none' },
		extend: { transitionDuration: { DEFAULT: '160ms' }, spacing: { safe: 'env(safe-area-inset-bottom, 0px)' } },
	},
	plugins: [],
} satisfies Config;

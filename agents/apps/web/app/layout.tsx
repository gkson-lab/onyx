import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { LiveProvider } from '@/lib/api';
import { Shell } from '@/components/shell';

export const metadata: Metadata = { title: 'Onyx', description: 'Onyx by GK Labs: agents on your own machine.', manifest: '/manifest.webmanifest', appleWebApp: { capable: true, title: 'Onyx', statusBarStyle: 'black-translucent' }, icons: { icon: '/icon.svg', apple: '/apple-touch-icon.png' } };
export const viewport: Viewport = { themeColor: '#0a0a0a', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" style={{ ['--font-sans' as string]: GeistSans.style.fontFamily, ['--font-mono' as string]: GeistMono.style.fontFamily }} className={`${GeistSans.variable} ${GeistMono.variable} h-full`}>
			<body>
				<LiveProvider>
					<Shell>{children}</Shell>
				</LiveProvider>
			</body>
		</html>
	);
}

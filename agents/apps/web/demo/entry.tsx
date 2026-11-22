/**
 * The Onyx demo: the real app, in one file, with no server and no AI (demo/backend.ts answers in the page). Built by
 * demo/build.mjs into mac-demo/Onyx-Demo.html at the top of the repository.
 */
import { createRoot } from 'react-dom/client';
import { LiveProvider } from '@/lib/api';
import { Shell } from '@/components/shell';
import { LOOKS, setLook, useLook } from '@/lib/look';
import { DEFAULT_LOOK, LOOK_KEY, isLook } from '@/lib/looks';
import { usePathname } from 'next/navigation';
import Chat from '@/app/page';
import Graph from '@/app/graph/page';
import Runs from '@/app/runs/page';
import Agents from '@/app/agents/page';
import Channels from '@/app/channels/page';
import Connectors from '@/app/connectors/page';
import Models from '@/app/models/page';
import Usage from '@/app/usage/page';
import Settings from '@/app/settings/page';

const PAGES: Record<string, () => React.ReactNode> = { '/': Chat, '/graph': Graph, '/runs': Runs, '/agents': Agents, '/channels': Channels, '/connectors': Connectors, '/models': Models, '/usage': Usage, '/settings': Settings };

/** A pill over the window's top edge: what this is, and the three looks, one click each. */
function DemoBar() {
	const look = useLook();
	return (
		<div className="demo-bar" role="group" aria-label="Demo">
			<span className="demo-label">Onyx demo · no AI inside</span>
			{LOOKS.map((l) => (
				<button key={l.value} type="button" aria-pressed={look === l.value} onClick={() => setLook(l.value)}>{l.label}</button>
			))}
		</div>
	);
}

function App() {
	const path = usePathname().replace(/\/$/, '') || '/';
	const Page = PAGES[path] ?? Chat;
	return (
		<LiveProvider>
			<Shell>
				<Page />
			</Shell>
			<DemoBar />
		</LiveProvider>
	);
}

// The look saved on this computer, or Liquid glass, before anything is drawn.
try {
	const saved = localStorage.getItem(LOOK_KEY);
	document.documentElement.dataset.look = isLook(saved) ? saved : DEFAULT_LOOK;
} catch {
	document.documentElement.dataset.look = DEFAULT_LOOK;
}
createRoot(document.getElementById('app')!).render(<App />);

'use client';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api, useData } from '@/lib/api';
import { Button, Card, Code, Empty, ICON, Loading, Page, Problem } from '@/components/ui';

interface C { id: string; transport: string; enabled: boolean; state: 'off' | 'connected' | 'error' | 'needs_token'; tools: string[]; error: string | null; target: string }
const STATE = { off: 'Off', connected: 'Connected', error: 'Failed to connect', needs_token: 'Needs its token' } as const;

export default function Connectors() {
	const { data, error, reload } = useData<{ connectors: C[] }>('/connectors');
	const [busy, setBusy] = useState(false);
	const [failed, setFailed] = useState<string | null>(null);
	const again = async () => {
		setBusy(true);
		setFailed(null);
		await api('/connectors/reload', { method: 'POST' }).catch((e) => setFailed(e.message));
		setBusy(false);
		reload();
	};
	return (
		<Page title="Connectors" note={<>MCP servers whose tools agents can use: GitHub, files, anything that speaks MCP. They are listed in <Code>config/connectors.yaml</Code>. To let an agent use one, tick <Code>connector:name</Code> in that agent's tools.</>} actions={<Button onClick={() => void again()} disabled={busy}><RefreshCw {...ICON} size={16} aria-hidden />{busy ? 'Connecting' : 'Reconnect all'}</Button>}>
			{(error || failed) && <Problem>{error ?? failed}</Problem>}
			{!data && !error && <Loading what="connectors" />}
			{data && !data.connectors.length && <Empty title="No connectors are listed.">Add one to <Code>config/connectors.yaml</Code>, then press Reconnect all. The file ships with GitHub, switched off, and a commented example of a local file server.</Empty>}
			{data && data.connectors.length > 0 && (
				<Card>
				<ul className="rows">
					{data.connectors.map((c) => (
						<li key={c.id} className="grid gap-2 border-b py-4 md:grid-cols-[12rem_1fr]">
							<div><p className="text-sm font-medium">{c.id}</p><p className={`text-sm ${c.state === 'error' || c.state === 'needs_token' ? 'text-bad' : 'text-muted'}`}>{STATE[c.state]}</p></div>
							<div className="min-w-0 text-sm">
								<p className="font-mono text-xs text-muted">{c.transport} · {c.target}</p>
								{c.state === 'off' && <p className="mt-1 text-muted">Set <Code>enabled: true</Code> for {c.id} in <Code>config/connectors.yaml</Code>, then press Reconnect all.</p>}
								{c.error && <p className="mt-1 text-bad">{c.error}</p>}
								{c.state === 'connected' && <p className="mt-1 break-words font-mono text-xs">{c.tools.length} tools: <span className="text-muted">{c.tools.join(' ')}</span></p>}
							</div>
						</li>
					))}
				</ul>
				</Card>
			)}
		</Page>
	);
}

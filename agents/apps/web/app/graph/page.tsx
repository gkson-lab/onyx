'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, nodesFrom, useLive } from '@/lib/api';
import { RunTree, treeOf } from '@/components/run';
import { Empty, Page } from '@/components/ui';

function Graph() {
	const { live, dispatch } = useLive();
	const wanted = useSearchParams().get('run');
	const [latest, setLatest] = useState<string | null>(null);
	const rootId = wanted ?? live.lastRoot ?? latest;
	const tree = rootId ? treeOf(live.nodes, rootId) : [];
	// Opened with nothing live (a fresh page load): show the most recent stored run.
	useEffect(() => {
		if (wanted || live.lastRoot) return;
		api<{ runs: { id: string }[] }>('/runs?limit=1').then((r) => setLatest(r.runs[0]?.id ?? null), () => {});
	}, [wanted, live.lastRoot]);
	useEffect(() => {
		if (!rootId || tree.length) return;
		api(`/runs/${rootId}`).then((r) => dispatch({ type: '_load', nodes: nodesFrom(r), routing: r.runs[0]?.routing }), () => {});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rootId]);
	const running = tree.some((n) => n.status === 'running');
	return (
		<Page title="Agent graph" note={tree.length ? (running ? 'The run in progress. It updates as agents work.' : wanted ? 'A stored run, replayed from its step log.' : 'The most recent run, replayed from its step log.') : undefined}>
			{tree.length ? (
				<RunTree tree={tree} routing={rootId ? live.routing[rootId] : null} live />
			) : (
				<Empty title="No run to show yet.">
					Send a message in <Link href="/" className="text-text underline">Chat</Link> and its agents appear here as they start. To look at an earlier run, open it from <Link href="/runs" className="text-text underline">Runs</Link>.
				</Empty>
			)}
		</Page>
	);
}
export default function GraphPage() {
	return <Suspense><Graph /></Suspense>;
}

'use client';
import { Fragment, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { ICON } from './ui';

/** Copies text, and says so for two seconds. */
export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
	const [done, setDone] = useState(false);
	return (
		<button
			type="button"
			aria-label={done ? 'Copied' : label}
			title={done ? 'Copied' : label}
			onClick={() => void navigator.clipboard?.writeText(text).then(() => (setDone(true), setTimeout(() => setDone(false), 2000)))}
			className="flex h-8 w-8 items-center justify-center rounded text-muted hover:text-text"
		>
			{done ? <Check {...ICON} size={15} aria-hidden /> : <Copy {...ICON} size={15} aria-hidden />}
		</button>
	);
}

/**
 * The Markdown models write, inside a line: **bold**, *italic*, `code` and [links](https://...). Built as elements,
 * never as HTML, so nothing in a model's answer can add markup to the page. Unclosed marks (an answer still being
 * written) stay as they are.
 */
function inline(text: string, key = 0): ReactNode[] {
	const out: ReactNode[] = [];
	const re = /(\*\*|__)(.+?)\1|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])/g;
	let last = 0;
	let k = key;
	for (let m = re.exec(text); m; m = re.exec(text)) {
		if (m.index > last) out.push(text.slice(last, m.index));
		if (m[2] !== undefined) out.push(<strong key={k++} className="font-semibold">{inline(m[2], k * 100)}</strong>);
		else if (m[3] !== undefined) out.push(<code key={k++} className="glass-chip px-1 py-0.5 font-mono text-[0.85em]">{m[3]}</code>);
		else if (m[4] !== undefined) out.push(<a key={k++} href={m[5]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-text">{m[4]}</a>);
		else if (m[6] !== undefined) out.push(<em key={k++}>{inline(m[6], k * 100)}</em>);
		last = m.index + m[0].length;
	}
	if (last < text.length) out.push(text.slice(last));
	return out;
}

const LIST = /^\s*(?:[-*•]|(\d+)[.)])\s+(.*)$/;

/** Prose: headings, lists and paragraphs; a single line break stays a line break. */
function prose(text: string, className: string, key: number): ReactNode[] {
	const out: ReactNode[] = [];
	const lines = text.split('\n');
	let para: string[] = [];
	let list: { ordered: boolean; start: number; items: string[] } | null = null;
	let k = key;
	const flushPara = () => {
		if (para.length) out.push(<p key={k++} className={`whitespace-pre-wrap ${className}`}>{para.map((l, i) => <Fragment key={i}>{i > 0 && '\n'}{inline(l)}</Fragment>)}</p>);
		para = [];
	};
	const flushList = () => {
		if (!list) return;
		const Tag = list.ordered ? 'ol' : 'ul';
		out.push(
			<Tag key={k++} start={list.ordered ? list.start : undefined} className={`${list.ordered ? 'list-decimal' : 'list-disc'} space-y-1 pl-6 marker:text-muted ${className}`}>
				{list.items.map((item, i) => <li key={i}>{inline(item)}</li>)}
			</Tag>,
		);
		list = null;
	};
	for (const line of lines) {
		const heading = line.match(/^(#{1,4})\s+(.*)$/);
		const item = line.match(LIST);
		if (heading) {
			flushPara();
			flushList();
			out.push(<p key={k++} className={`font-semibold ${heading[1]!.length <= 2 ? 'text-base' : ''} ${className}`}>{inline(heading[2]!)}</p>);
		} else if (item) {
			flushPara();
			const ordered = item[1] !== undefined;
			if (!list || list.ordered !== ordered) (flushList(), (list = { ordered, start: Number(item[1] ?? 1), items: [] }));
			list!.items.push(item[2]!);
		} else if (!line.trim()) {
			flushPara();
			flushList();
		} else if (list && /^\s{2,}\S/.test(line)) {
			// A wrapped or indented line continues the list item above it.
			list.items[list.items.length - 1] += ` ${line.trim()}`;
		} else {
			flushList();
			para.push(line);
		}
	}
	flushPara();
	flushList();
	return out;
}

/** A message's text: Markdown as models write it, with ``` code blocks set apart, each with its language and a copy button. */
export function MessageText({ text, className = '' }: { text: string; className?: string }) {
	const parts = text.split(/```([\w+#.-]*)\n?([\s\S]*?)(?:```|$)/g);
	const out: ReactNode[] = [];
	for (let i = 0; i < parts.length; i += 3) {
		const before = parts[i]!.replace(/^\n+|\n+$/g, '');
		if (before) out.push(...prose(before, className, i * 1000));
		if (i + 2 < parts.length) {
			const lang = parts[i + 1] || 'code';
			const code = parts[i + 2]!.replace(/\n$/, '');
			out.push(
				<figure key={`c${i}`} className="glass-block my-2 overflow-hidden">
					<figcaption className="flex items-center justify-between border-b pl-3 font-mono text-xs text-muted">
						{lang}
						<CopyButton text={code} label={`Copy the ${lang}`} />
					</figcaption>
					<pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed"><code>{code}</code></pre>
				</figure>,
			);
		}
	}
	return <div className="space-y-2">{out}</div>;
}

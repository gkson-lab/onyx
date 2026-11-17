'use client';
import { useState } from 'react';
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

/** A message's text, with ``` code blocks set apart, each with its language and a copy button. */
export function MessageText({ text, className = '' }: { text: string; className?: string }) {
	const parts = text.split(/```([\w+#.-]*)\n?([\s\S]*?)(?:```|$)/g);
	const out = [];
	for (let i = 0; i < parts.length; i += 3) {
		const prose = parts[i]!.replace(/^\n+|\n+$/g, '');
		if (prose) out.push(<p key={i} className={`whitespace-pre-wrap ${className}`}>{prose}</p>);
		if (i + 2 < parts.length) {
			const lang = parts[i + 1] || 'code';
			const code = parts[i + 2]!.replace(/\n$/, '');
			out.push(
				<figure key={`c${i}`} className="my-2 overflow-hidden rounded border">
					<figcaption className="flex items-center justify-between border-b bg-surface pl-3 font-mono text-xs text-muted">
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

'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Mark } from '@/components/shell';
import { Button, Code, Problem } from '@/components/ui';

export default function Login() {
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [session, setSession] = useState<{ signed_in: boolean; has_password: boolean } | null>(null);
	useEffect(() => {
		api('/session').then((s) => (s.signed_in ? window.location.replace('/') : setSession(s)), (e) => setError(e.message));
	}, []);
	const submit = async () => {
		setError(null);
		try {
			await api('/login', { method: 'POST', body: { password } });
			window.location.replace('/');
		} catch (e) {
			setError((e as Error).message);
		}
	};
	return (
		<div className="enter mx-auto flex h-full w-full max-w-sm flex-col justify-center px-6">
			<Mark />
			<h1 className="mt-8 text-xl font-semibold tracking-tight">Sign in</h1>
			{session && !session.has_password ? (
				<p className="mt-2 text-sm text-muted">This Onyx has no password, so it only answers the PC it runs on. To use it from here, set <Code>ONYX_PASSWORD</Code> in <Code>.env</Code> on that PC and restart it.</p>
			) : (
				<form className="mt-4 space-y-3" onSubmit={(e) => (e.preventDefault(), void submit())}>
					<label className="flex flex-col gap-1 text-xs text-muted">Password<input type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-11 text-base" /></label>
					{error && <Problem>{error}</Problem>}
					<Button type="submit" kind="primary" disabled={!password}>Sign in</Button>
				</form>
			)}
		</div>
	);
}

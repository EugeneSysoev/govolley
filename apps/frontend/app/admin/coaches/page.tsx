"use client";

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { z } from 'zod';
import { api } from '@/lib/api';
import { profileSchema, roleCandidatesSchema } from '@/lib/contracts';

type Candidate = z.infer<typeof roleCandidatesSchema>[number];
const roleLabel = { ADMIN: 'Администратор', COACH: 'Тренер', USER: 'Ученик' };

export default function CoachManagementPage() {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const [allowedToken, setAllowedToken] = useState<string | null>(null);
  const allowed = !!token && allowedToken === token;
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    void api('/users/profile', profileSchema, { signal: controller.signal }, token)
      .then(async (profile) => {
        if (profile.role !== 'ADMIN') throw new Error('Управление тренерами доступно администратору');
        const list = await api('/users/role-candidates', roleCandidatesSchema, { signal: controller.signal }, token);
        if (!controller.signal.aborted) { setAllowedToken(token); setCandidates(list); }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Не удалось загрузить пользователей');
      })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [token]);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(null); setMessage('');
    try {
      setCandidates(await api(`/users/role-candidates?q=${encodeURIComponent(query)}`, roleCandidatesSchema, {}, token));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось найти пользователя');
    } finally { setBusy(false); }
  }

  async function changeRole(candidate: Candidate) {
    setBusy(true); setError(null); setMessage('');
    const role = candidate.role === 'COACH' ? 'USER' : 'COACH';
    try {
      const updated = await api(`/users/${candidate.id}/role`, profileSchema, {
        method: 'PATCH', body: JSON.stringify({ role }),
      }, token);
      setCandidates((current) => current.map((user) => user.id === updated.id ? { ...user, role: updated.role } : user));
      setMessage(`Пользователь #${updated.id}: ${roleLabel[updated.role]}. Изменение сохранено.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось изменить роль');
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen pt-40 pb-20 px-4 text-brand-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/profile" className="text-brand-lime underline">← Профиль</Link>
        <h1 className="text-3xl font-bold">Управление тренерами</h1>
        {status === 'unauthenticated' && <p>Войдите в аккаунт администратора.</p>}
        {status === 'loading' && <p>Загрузка…</p>}
        {error && <p role="alert" className="text-red-400">{error}</p>}
        {message && <p role="status" className="text-brand-lime">{message}</p>}
        {allowed && <>
          <form onSubmit={search} className="flex flex-wrap gap-3 items-end">
            <label className="flex-1 min-w-48">
              Найти пользователя
              <input value={query} onChange={(event) => setQuery(event.target.value)} maxLength={100}
                placeholder="ID, имя или username" className="block mt-2 w-full bg-white/10 border border-white/20 rounded-xl p-3" />
            </label>
            <button disabled={busy} className="rounded-xl bg-brand-lime text-black font-bold px-6 py-3 disabled:opacity-50">Найти</button>
          </form>
          <p className="text-white/60">Показано до 50 аккаунтов. Для точного выбора используйте ID пользователя.</p>
          {!busy && !candidates.length && <p>Пользователи не найдены.</p>}
          <ul className="space-y-3" aria-busy={busy}>
            {candidates.map((candidate) => <li key={candidate.id} className="rounded-2xl border border-white/20 p-5 flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="font-semibold">{[candidate.firstName, candidate.lastName].filter(Boolean).join(' ') || 'Без имени'} · #{candidate.id}</p>
                {candidate.username && <p>@{candidate.username}</p>}
                <p>{roleLabel[candidate.role]}</p>
              </div>
              {candidate.role !== 'ADMIN' && <button type="button" onClick={() => void changeRole(candidate)} disabled={busy}
                className="rounded-xl border border-brand-lime text-brand-lime px-5 py-3 disabled:opacity-50">
                {candidate.role === 'COACH' ? 'Снять роль тренера' : 'Назначить тренером'}
              </button>}
            </li>)}
          </ul>
        </>}
      </div>
    </main>
  );
}

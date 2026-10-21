"use client";

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { NotificationListSchema } from '@govolley/shared-types';
import type { NotificationList } from '@govolley/shared-types';
import { api } from '@/lib/api';

const statuses = { PENDING: 'Ожидает отправки', PROCESSING: 'Отправляется', RETRY: 'Повтор доставки', DELIVERED: 'Доставлено', UNDELIVERABLE: 'Не доставлено' };
const errors = { NO_RECIPIENT: 'Не указан Telegram получателя', TELEGRAM_UNAVAILABLE: 'Telegram временно недоступен', RATE_LIMITED: 'Telegram ограничил частоту отправки', TIMEOUT: 'Время ожидания Telegram истекло' };
export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const [onlyUndelivered, setOnlyUndelivered] = useState(true);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ token: string; data: NotificationList } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  useEffect(() => {
    if (!token) return;
    const request = ++generation.current;
    const controller = new AbortController();
    void api(`/notifications?undelivered=${onlyUndelivered}`, NotificationListSchema, { signal: controller.signal }, token)
      .then((data) => { if (!controller.signal.aborted && request === generation.current) { setResult({ token, data }); setError(null); setBusy(false); } })
      .catch((err: unknown) => { if (!controller.signal.aborted && request === generation.current) { setResult(null); setError(err instanceof Error ? err.message : 'Не удалось загрузить уведомления'); setBusy(false); } });
    return () => { generation.current++; controller.abort(); };
  }, [token, onlyUndelivered, revision]);
  const data = result?.token === token ? result?.data : null;
  async function more() {
    if (!data?.nextCursor || !token) return;
    const request = generation.current;
    setBusy(true);
    try {
      const next = await api(`/notifications?undelivered=${onlyUndelivered}&beforeId=${data.nextCursor}`, NotificationListSchema, {}, token);
      if (request === generation.current) setResult({ token, data: { items: [...data.items, ...next.items], nextCursor: next.nextCursor } });
    } catch (err) { if (request === generation.current) { setResult(null); setError(err instanceof Error ? err.message : 'Не удалось загрузить уведомления'); } }
    finally { if (request === generation.current) setBusy(false); }
  }
  return <main className="min-h-screen pt-40 pb-20 px-4 text-brand-white">
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/profile" className="text-brand-lime underline">← Профиль</Link>
      <h1 className="text-3xl font-bold">Telegram-уведомления</h1>
      {status === 'unauthenticated' && <p>Войдите в аккаунт сотрудника.</p>}
      {status === 'loading' && <p>Загрузка…</p>}
      {error && <p role="alert" className="text-red-400">{error}</p>}
      {data && <>
        <div className="flex flex-wrap items-center gap-4">
          <label><input type="checkbox" checked={onlyUndelivered} onChange={(event) => setOnlyUndelivered(event.target.checked)} /> Только недоставленные</label>
          <button type="button" onClick={() => setRevision((value) => value + 1)} className="rounded-xl border border-brand-lime text-brand-lime px-5 py-3">Обновить</button>
        </div>
        <p className="text-white/60">Доставка повторяется автоматически. Сбой Telegram не отменяет запись или отмену ученика.</p>
        {!data.items.length && <p role="status">Уведомлений нет.</p>}
        <ul className="space-y-4">
          {data.items.map((item) => <li key={item.id} className="rounded-2xl border border-white/20 p-5 space-y-2">
            <h2 className="font-semibold">{item.trainingTitle} · ученик #{item.userId}</h2>
            <p>{item.schoolDate.split('-').reverse().join('.')} · {item.startTime}–{item.endTime} · время Пхукета</p>
            <p>{item.kind === 'BOOKING_CONFIRMED' ? 'Подтверждение записи' : 'Подтверждение отмены учеником'} · запись #{item.bookingId}</p>
            <p>{statuses[item.status]} · Попыток: {item.attempts}</p>
            {item.lastError && <p>{errors[item.lastError]}</p>}
            <details><summary className="cursor-pointer text-brand-lime">Текст сообщения</summary><p className="whitespace-pre-wrap mt-2">{item.text}</p></details>
          </li>)}
        </ul>
        {data.nextCursor && <button type="button" disabled={busy} onClick={() => void more()} className="rounded-xl border border-brand-lime px-5 py-3">Показать ещё</button>}
      </>}
    </div>
  </main>;
}

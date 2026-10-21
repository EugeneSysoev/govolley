"use client";
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { z } from 'zod';
import { ParticipantActionSchema, ParticipantResponseSchema, type Participant } from '@govolley/shared-types';
import { api } from '@/lib/api';
import { formatSchoolDate, SCHOOL_TIME_LABEL } from '@/lib/training-display';

const labels: Record<string,string> = { UNMARKED: 'Не отмечено', ATTENDED: 'Посетил', NO_SHOW: 'Неявка', UNKNOWN: 'Нет сведений', true: 'Получена', false: 'Не получена' };
const name = (user: Participant['user'] | Participant['history'][number]['actor']) => [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || `Ученик #${user.id}`;

export default function ParticipantsPage() {
  const { id } = useParams<{id: string}>();
  const { data: session, status } = useSession();
  const canManage = session?.user?.role === 'COACH' || session?.user?.role === 'ADMIN';
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [attendance, setAttendance] = useState('UNMARKED');
  const [cash, setCash] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const pending = useRef<{signature: string; requestId: string} | null>(null);
  const selected = participants.find((item) => item.id === selectedId);
  useEffect(() => {
    if (!canManage || !session?.accessToken) { setParticipants([]); setLoading(false); return; }
    const controller = new AbortController(); setLoading(true);
    void api(`/training/${id}/participants`, z.array(ParticipantResponseSchema), { signal: controller.signal }, session.accessToken)
      .then((list) => { setParticipants(list); setSelectedId(list[0]?.id ?? null); })
      .catch((e: unknown) => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Не удалось загрузить участников'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, canManage, session?.accessToken]);
  useEffect(() => { setAttendance(selected?.attendanceStatus ?? 'UNMARKED'); setCash(selected?.cashReceived === true); setReason(''); pending.current = null; }, [selected]);
  async function save(field: 'ATTENDANCE'|'CASH_PAYMENT') {
    if (!selected || !session?.accessToken || saving) return;
    const value = field === 'ATTENDANCE' ? attendance : cash;
    const signature = JSON.stringify({ bookingId: selected.id, field, value, reason: reason.trim() });
    if (pending.current?.signature !== signature) pending.current = { signature, requestId: crypto.randomUUID() };
    setSaving(true); setError('');
    try {
      const body = ParticipantActionSchema.parse({ field, value, reason, requestId: pending.current.requestId });
      const updated = await api(`/training/${id}/participants/${selected.id}`, ParticipantResponseSchema, { method: 'PATCH', body: JSON.stringify(body) }, session.accessToken);
      setParticipants((list) => list.map((item) => item.id === updated.id ? updated : item));
      pending.current = null;
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось сохранить отметку'); }
    finally { setSaving(false); }
  }
  if (status === 'loading') return <main className="pt-40 px-8 text-white">Загрузка...</main>;
  if (!canManage) return <main className="pt-40 px-8 text-white">Доступ только тренеру и администратору</main>;
  return <main className="pt-40 pb-20 px-6 max-w-4xl mx-auto text-white space-y-6">
    <Link href={`/training/${id}`} className="text-brand-lime">← К тренировке</Link>
    <h1 className="text-3xl font-bold">Участники и учёт</h1>
    <p className="text-white/60">{SCHOOL_TIME_LABEL}</p>
    {error && <p role="alert" className="text-red-400">{error}</p>}
    {loading ? <p>Загрузка участников...</p> : participants.length === 0 ? <p>Пока нет записей</p> : <>
      <label className="block">Ученик<select aria-label="Ученик" value={selectedId ?? ''} onChange={(e) => setSelectedId(Number(e.target.value))} className="block bg-black border border-white/40 p-3 w-full mt-2">
        {participants.map((item) => <option key={item.id} value={item.id}>{name(item.user)} · запись #{item.id}{item.status === 'CANCELLED' ? ' · отменена' : ''}</option>)}
      </select></label>
      {selected && <section className="space-y-5 rounded-2xl border border-white/20 p-6">
        <h2 className="text-xl">{name(selected.user)} · #{selected.user.id}</h2>
        <p>Запись: {selected.status === 'CONFIRMED' ? 'Подтверждена' : 'Отменена'} · {selected.kind === 'SINGLE_CASH' ? `${selected.cashPrice} ฿ на месте` : 'Прежняя запись, условие оплаты не подтверждено'}</p>
        <p>Посещение: {labels[selected.attendanceStatus]} · Оплата: {selected.paymentStatus === 'PAID' ? 'получена' : selected.paymentStatus === 'UNPAID' ? 'не получена' : 'нет подтверждения'}</p>
        <label className="block">Посещение<select aria-label="Посещение" value={attendance} onChange={(e) => setAttendance(e.target.value)} className="block bg-black border border-white/40 p-3 mt-2">
          {['UNMARKED','ATTENDED','NO_SHOW'].map((value) => <option key={value} value={value}>{labels[value]}</option>)}
        </select></label>
        <label className="block"><input type="checkbox" checked={cash} onChange={(e) => setCash(e.target.checked)} /> Разовая оплата получена</label>
        <label className="block">Основание изменения<textarea aria-label="Основание изменения" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} className="block bg-black border border-white/40 p-3 w-full mt-2" /></label>
        <div className="flex gap-4 flex-wrap">
          <button disabled={saving || !reason.trim() || attendance === selected.attendanceStatus} onClick={() => void save('ATTENDANCE')} className="border px-4 py-3 disabled:opacity-40">Сохранить посещение</button>
          <button disabled={saving || !reason.trim() || cash === selected.cashReceived} onClick={() => void save('CASH_PAYMENT')} className="border px-4 py-3 disabled:opacity-40">Сохранить оплату</button>
        </div>
        <p className="text-sm text-white/60">Неявка и поздняя отмена разовой записи не создают автоматический долг или штраф. Подтверждайте только фактически полученную оплату.</p>
        <h3 className="text-xl">История изменений</h3>
        {selected.history.length === 0 ? <p>Изменений пока нет</p> : <ol className="space-y-4">{selected.history.map((entry) => <li key={entry.id} className="border-t border-white/20 pt-3">
          <p>{entry.field === 'ATTENDANCE' ? 'Посещение' : 'Разовая оплата'}: {labels[entry.oldValue] ?? entry.oldValue} → {labels[entry.newValue] ?? entry.newValue}</p>
          <p>{entry.reason}</p><p className="text-sm text-white/60">{name(entry.actor)} · #{entry.actor.id} · {formatSchoolDate(entry.createdAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </li>)}</ol>}
      </section>}
    </>}
  </main>;
}

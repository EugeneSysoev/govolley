"use client";
import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { api } from '@/lib/api';
const initialized = z.object({ sessionId: z.uuid(), expiresAt: z.iso.datetime(), botUrl: z.url().refine((url) => new URL(url).hostname === 't.me') });
const statusSchema = z.object({ status: z.enum(['pending','confirmed','expired','consumed']) });
export default function TelegramLogin() {
  const [isWaiting, setIsWaiting] = useState(false);
  const [login, setLogin] = useState<z.infer<typeof initialized> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialization = useRef<AbortController | null>(null);
  useEffect(() => () => initialization.current?.abort(), []);
  useEffect(() => {
    if (!login) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const fail = (message: string) => { setError(message); setIsWaiting(false); setLogin(null); };
    const poll = async () => {
      try {
        if (Date.now() >= Date.parse(login.expiresAt)) { fail('Время входа истекло. Начните заново.'); return; }
        const data = await api(`/bot-auth/session-status/${login.sessionId}`, statusSchema, { signal: controller.signal });
        if (controller.signal.aborted) return;
        if (data.status === 'confirmed') {
          const result = await signIn('telegram-session', { sessionId: login.sessionId, redirect: false });
          if (controller.signal.aborted) return;
          if (result?.ok && !result.error) window.location.assign('/profile');
          else fail('Вход не завершён. Начните заново: ссылка используется один раз.');
          return;
        }
        if (data.status !== 'pending') { fail('Сессия недоступна. Начните вход заново.'); return; }
        timer = setTimeout(() => { void poll(); }, 2500);
      } catch {
        if (!controller.signal.aborted) fail('Не удалось проверить вход. Начните заново.');
      }
    };
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [login]);
  const handleLogin = async () => {
    const controller = new AbortController();
    initialization.current = controller;
    setIsWaiting(true); setError(null);
    try {
      const data = await api('/bot-auth/init-session', initialized, { method: 'POST', signal: controller.signal });
      if (controller.signal.aborted) return;
      setLogin(data);
      window.open(data.botUrl, '_blank', 'noopener,noreferrer');
    } catch { if (!controller.signal.aborted) { setError('Не удалось начать вход'); setIsWaiting(false); } }
  };
  return <div className="w-full">
    <button onClick={handleLogin} disabled={isWaiting} className="w-full h-14 bg-brand-lime text-black rounded-2xl font-black uppercase text-sm disabled:opacity-70">
      {isWaiting ? 'Ждем подтверждения в боте' : 'Войти через Telegram'}
    </button>
    {error && <p role="alert" className="text-red-400 mt-4">{error}</p>}
    {login && <a href={login.botUrl} target="_blank" rel="noopener noreferrer" className="block mt-4 text-brand-lime text-center">Открыть Telegram</a>}
    {isWaiting && <button onClick={() => { initialization.current?.abort(); setLogin(null); setIsWaiting(false); }} className="w-full mt-4 text-white/50">Отмена</button>}
  </div>;
}

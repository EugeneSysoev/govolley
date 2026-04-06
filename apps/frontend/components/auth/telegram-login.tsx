"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

export default function TelegramLogin() {
  const [isWaiting, setIsWaiting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Проверяем статус сессии
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bot-auth/session-status/${sessionId}`);
        const data = await res.json();

        if (data.status?.toUpperCase() === "CONFIRMED") {
          clearInterval(interval);
          await signIn("telegram-session", {
            sessionId,
            callbackUrl: "/profile",
          });
        }
      } catch (e) {
        console.error(e);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [sessionId]);

  const handleLogin = async () => {
    setIsWaiting(true);
    try {
      const res = await fetch("/api/bot-auth/init-session", { method: "POST" });
      const data = await res.json();

      if (data.sessionId && data.botUrl) {
        setSessionId(data.sessionId);
        window.open(data.botUrl, "_blank");
      }
    } catch (e) {
      alert("Ошибка при инициализации сессии");
      setIsWaiting(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleLogin}
        disabled={isWaiting}
        className="w-full h-14 bg-brand-lime text-black rounded-2xl font-black uppercase text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
      >
        {isWaiting ? (
          <span className="flex items-center justify-center gap-2">
            Ждем подтверждения в боте
          </span>
        ) : (
          "Войти через Telegram"
        )}
      </button>

      {isWaiting && (
        <button
          onClick={() => {
            setSessionId(null);
            setIsWaiting(false);
          }}
          className="w-full text-center text-[10px] text-white/20 mt-4 uppercase tracking-widest hover:text-white/50"
        >
          Отмена
        </button>
      )}
    </div>
  );
}

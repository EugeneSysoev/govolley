"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

export default function TelegramLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [botUrl, setBotUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bot-auth/session-status/${sessionId}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data.status?.toUpperCase() === "CONFIRMED") {
          clearInterval(interval);

          const result = await signIn("telegram-session", {
            sessionId,
            callbackUrl: "/profile",
            redirect: true,
          });

          if (result?.error) {
            console.error("[Auth] SignIn failed:", result.error);
          }
        }
      } catch (error) {
        console.error("[Auth] Polling error:", error);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [sessionId]);

  const startLogin = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bot-auth/init-session", {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      if (!res.ok) throw new Error("Failed to init session");

      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setBotUrl(data.botUrl);
      }
    } catch (error) {
      console.error("[Auth] Init error:", error);
      alert("Ошибка связи с сервером.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!botUrl ? (
        <button
          onClick={startLogin}
          disabled={isSubmitting}
          className="px-6 py-3 bg-brand-lime text-black rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {isSubmitting ? "Подготовка..." : "Войти через Telegram"}
        </button>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-white/80 text-sm italic">
            Подтвердите вход в открывшемся боте
          </p>
          <a
            href={botUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-8 py-4 bg-[#24A1DE] text-white rounded-2xl font-bold animate-pulse shadow-lg shadow-[#24A1DE]/20"
          >
            Открыть Telegram
          </a>
          <button
            onClick={() => {
              setBotUrl(null);
              setSessionId(null);
            }}
            className="block mt-6 text-[10px] text-white/30 hover:text-white/60 underline mx-auto"
          >
            Отмена
          </button>
        </div>
      )}
    </div>
  );
}

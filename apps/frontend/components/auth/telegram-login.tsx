"use client";

import { useState } from "react";

export default function TelegramLogin() {
  // ВОТ ЭТИ СТРОКИ ДОЛЖНЫ БЫТЬ ТУТ:
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [botUrl, setBotUrl] = useState<string | null>(null);

  const startLogin = async () => {
    setIsSubmitting(true);
    try {
      // Идем на проксированный путь фронтенда
      const res = await fetch("/api/auth/init-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({}),
      });

      // Читаем JSON только ОДИН раз
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Backend Error Details:", data);
        throw new Error(data.message || "Backend unreachable");
      }

      const { sessionId, botUrl: receivedBotUrl } = data;

      if (receivedBotUrl) {
        setBotUrl(receivedBotUrl);
        // Редирект в телеграм, если нужно сразу:
        // window.location.href = receivedBotUrl;
      }

      console.log("Session initiated:", sessionId);
    } catch (error: any) {
      console.error("Auth error:", error);
      alert(error.message || "Произошла ошибка при входе");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={startLogin}
      disabled={isSubmitting}
      className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
    >
      {isSubmitting ? "Загрузка..." : "Войти через Telegram"}
    </button>
  );
}

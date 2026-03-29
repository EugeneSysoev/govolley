"use client";

import TelegramLogin from "@/components/auth/telegram-login";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function SignInPage() {
  const { data: session, status } = useSession();

  // Пока сессия подгружается, можно показать заглушку или ничего
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/40">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-mustica text-brand-lime">
          {session ? "Твой профиль" : "Вход в игру"}
        </h1>
        <p className="text-white/60">
          {session
            ? `Рады видеть тебя, ${session.user?.name}!`
            : "Используй Telegram для быстрой авторизации"}
        </p>
      </div>

      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[320px]">
        {session ? (
          /* Контент для авторизованного пользователя */
          <div className="flex flex-col items-center space-y-6">
            {session.user?.image && (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand-lime">
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            <div className="text-center">
              <p className="text-white font-medium">{session.user?.name}</p>
              <p className="text-xs text-brand-lime uppercase tracking-wider mt-1">
                {(session.user as any)?.role || "Игрок"}
              </p>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full py-3 px-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all active:scale-95 font-semibold"
            >
              Выйти из аккаунта
            </button>
          </div>
        ) : (
          /* Контент для гостя */
          <TelegramLogin />
        )}
      </div>

      <p className="text-xs text-white/40 max-w-70 text-center">
        {session
          ? "Готов к следующей тренировке на пляжах Пхукета? 🌴"
          : "Нажимая кнопку, ты подтверждаешь свое согласие на участие в самых жарких тренировках Пхукета 🌴"}
      </p>
    </div>
  );
}

"use client";

import TelegramLogin from "@/components/auth/telegram-login";
import { signOut, useSession } from "next-auth/react";

export default function SignInPage() {
  const { data: session, status } = useSession();

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
        <h1 className="text-3xl font-bold text-brand-lime">
          {session ? "Твой профиль" : "Вход в игру"}
        </h1>
        <p className="text-white/60">
          {session
            ? `Рады видеть тебя, ${session.user?.name}!`
            : "Используй Telegram для авторизации"}
        </p>
      </div>

      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[320px]">
        {session ? (
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
              className="w-full py-3 px-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all font-semibold"
            >
              Выйти из аккаунта
            </button>
          </div>
        ) : (
          <TelegramLogin />
        )}
      </div>
    </div>
  );
}

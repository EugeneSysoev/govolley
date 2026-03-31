"use client";

import TelegramLogin from "@/components/auth/telegram-login";
import { signOut, useSession } from "next-auth/react";

export default function SignInPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/40">
        <div className="animate-pulse font-medium tracking-widest uppercase text-xs">
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 px-4">
      {/* Заголовок и описание */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-lime tracking-tight">
          {session ? "Твой профиль" : "Вход в аккаунт"}
        </h1>
        {!session && (
          <p className="text-white/50 text-sm md:text-base max-w-70 mx-auto leading-relaxed">
            Используй Телеграм для авторизации
          </p>
        )}
      </div>

      {/* Основная карточка */}
      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md w-full max-w-87.5 shadow-2xl">
        {session ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-brand-lime shadow-lg shadow-brand-lime/20">
              <img
                src={session.user?.image || "/icons/default-avatar.svg"}
                alt="Avatar"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-xl tracking-tight">
                {session.user?.name}
              </p>
              <p className="text-[10px] text-brand-lime uppercase tracking-[0.3em] mt-2 font-black opacity-80">
                {(session.user as any)?.role || "Игрок"}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full py-4 px-6 bg-red-500/5 hover:bg-red-500/10 text-red-500/80 hover:text-red-500 rounded-2xl border border-red-500/10 transition-all font-bold text-xs uppercase tracking-widest"
            >
              Выйти из аккаунта
            </button>
          </div>
        ) : (
          /* Компонент с одной кнопкой внутри */
          <TelegramLogin />
        )}
      </div>
    </div>
  );
}

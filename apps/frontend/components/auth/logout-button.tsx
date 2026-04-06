"use client";

import { signOut } from "next-auth/react";

// Кнопка для выхода из системы
export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all active:scale-95 font-medium"
    >
      Выйти из системы
    </button>
  );
}

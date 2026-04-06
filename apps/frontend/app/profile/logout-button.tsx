"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full max-w-sm mx-auto mt-4 py-4 text-[10px] uppercase tracking-[0.25em] bg-white-500/20 border border-white-500/30 rounded-full hover:bg-red-500/40 hover:scale-105 transition-all text-white font-black"
    >
      Выйти из аккаунта
    </button>
  );
}

"use client";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div className="p-8 mt-20">
      <h1 className="text-2xl font-bold">Ваш профиль</h1>
      <div className="mt-4 p-4 bg-white shadow rounded-xl">
        <p>
          <strong>Имя:</strong> {user?.name}
        </p>
        <p>
          <strong>Уровень:</strong> {user?.skillLevel}
        </p>
        <p>
          <strong>Баланс:</strong> {user?.balance} THB
        </p>
      </div>
    </div>
  );
}

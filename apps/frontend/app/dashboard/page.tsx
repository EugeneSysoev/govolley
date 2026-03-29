import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogoutButton from "../../components/auth/logout-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Если сессии нет — отправляем на вход
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold font-mustica text-brand-lime">
          Личный кабинет
        </h1>
        <p className="mt-2 text-white/60">
          Добро пожаловать в игру,{" "}
          <span className="text-white font-semibold">{session.user?.name}</span>
          !
        </p>

        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-sm text-white/40 mb-4">Управление аккаунтом:</p>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

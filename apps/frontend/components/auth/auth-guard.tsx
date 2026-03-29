"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Если сессия еще грузится — ничего не делаем
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      const user = session.user as any;

      // Лог для отладки — проверьте его сразу после теста!
      console.log("GUARD CHECK:", user.skillLevel, "Path:", pathname);

      const isNotSet = !user.skillLevel || user.skillLevel === "NOT_SET";

      // Если уровень не установлен и мы не на онбординге — редирект
      if (isNotSet && pathname !== "/onboarding") {
        router.replace("/onboarding");
        return;
      }

      // Если уровень УСТАНОВЛЕН и мы на онбординге — уходим в профиль
      if (!isNotSet && pathname === "/onboarding") {
        router.replace("/profile");
      }
    }
  }, [session, status, pathname, router]);

  // Если мы в процессе редиректа на онбординг, не рендерим контент
  const user = session?.user as any;
  if (
    status === "authenticated" &&
    (!user?.skillLevel || user?.skillLevel === "NOT_SET") &&
    pathname !== "/onboarding"
  ) {
    return <div className="min-h-screen bg-orange-50" />;
  }

  return <>{children}</>;
}

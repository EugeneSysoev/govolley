"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo, memo } from "react";

const AuthGuard = memo(({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const isNotSet = useMemo(() => {
    const user = session?.user as any;
    return !user?.skillLevel || user.skillLevel === "NOT_SET";
  }, [session?.user]);

  useEffect(() => {
    if (status === "loading" || isRedirecting) return;

    if (status === "authenticated" && session?.user) {
      if (isNotSet && pathname !== "/onboarding") {
        setIsRedirecting(true);
        router.replace("/onboarding");
      } else if (!isNotSet && pathname === "/onboarding") {
        setIsRedirecting(true);
        router.replace("/profile");
      }
    }
  }, [session, status, pathname, router, isRedirecting, isNotSet]);

  useEffect(() => {
    setIsRedirecting(false);
  }, [pathname]);

  if (status === "loading" || isRedirecting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-lime/30 border-t-brand-lime rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
});

AuthGuard.displayName = "AuthGuard";

export default AuthGuard;

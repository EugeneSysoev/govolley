"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import IntroSequence from "./intro-sequence";
import GlobalBackground from "@/components/background/global-background";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { NextAuthProvider } from "@/providers/auth-provider";
import AuthGuard from "@/components/auth/auth-guard";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 1. Оптимизация: выносим список путей в мемо
  const shouldSkipIntro = useMemo(
    () => ["/auth/signin", "/auth/signup", "/onboarding"].includes(pathname),
    [pathname],
  );

  /**
   * 2. КРИТИЧЕСКИЙ ФИКС: Ленивая инициализация стейта.
   * Если мы на странице онбординга, introFinished сразу будет true.
   * Это убирает "черный экран" (opacity-0) при первой загрузке.
   */
  const [introFinished, setIntroFinished] = useState(() => {
    if (typeof window !== "undefined") {
      const hasSeen = sessionStorage.getItem("hasSeenIntro") === "true";
      // Если это не главная или мы уже видели интро, или путь в списке исключений
      return (
        ["/auth/signin", "/auth/signup", "/onboarding"].includes(pathname) ||
        (pathname !== "/" && hasSeen)
      );
    }
    return false;
  });

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Оптимизированный хэндлер скролла
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 50;
    setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
  }, []);

  useEffect(() => {
    // Синхронизируем стейт при смене роута
    if (shouldSkipIntro) {
      setIntroFinished(true);
    }

    setIsCheckingSession(false);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, shouldSkipIntro, handleScroll]);

  // Управление скроллом всей страницы
  useEffect(() => {
    if (!introFinished && !shouldSkipIntro) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [introFinished, shouldSkipIntro]);

  const handleIntroComplete = () => {
    setIntroFinished(true);
    sessionStorage.setItem("hasSeenIntro", "true");
  };

  if (isCheckingSession) return null;

  return (
    <NextAuthProvider>
      <AuthGuard>
        {/* Фон теперь знает, когда проявляться */}
        <GlobalBackground introFinished={introFinished} />

        <AnimatePresence mode="wait">
          {!introFinished && !shouldSkipIntro && (
            <IntroSequence key="intro-key" onComplete={handleIntroComplete} />
          )}
        </AnimatePresence>

        {/* Этот div отвечает за видимость контента. 
            Благодаря инициализации выше, на /onboarding он сразу получит opacity-100 
        */}
        <div
          className={`relative min-h-dvh transition-opacity duration-1000 ${
            introFinished ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          style={{ zIndex: 10 }}
        >
          <Navbar introFinished={introFinished} isScrolled={isScrolled} />

          <main className="relative grow">{children}</main>

          <Footer />
        </div>
      </AuthGuard>
    </NextAuthProvider>
  );
}

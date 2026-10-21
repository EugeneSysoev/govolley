"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import IntroSequence from "./intro-sequence";
import GlobalBackground from "@/components/background/global-background";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { NextAuthProvider } from "@/providers/auth-provider";
import AuthGuard from "@/components/auth/auth-guard";

// Определяем, была ли страница перезагружена (F5/CMD+R)
const wasPageReloaded = (): boolean => {
  if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") return false;
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0) {
    const nav = navEntries[0];
    return "type" in nav && nav.type === "reload";
  }
  return false;
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [introFinished, setIntroFinished] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const hasInitialized = useRef(false);

  // Эффект для инициализации интро (только на клиенте)
  useEffect(() => {
    if (pathname !== '/' && hasInitialized.current) {
      setIntroFinished(true);
      sessionStorage.setItem('hasSeenIntro', 'true');
      return;
    }
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // При перезагрузке страницы сбрасываем флаг, чтобы интро показалось снова
    if (wasPageReloaded()) {
      sessionStorage.removeItem("hasSeenIntro");
    }

    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro") === "true";
    const isHome = pathname === "/";
    const shouldShow = isHome && !hasSeenIntro;

    if (shouldShow) {
      setIntroFinished(false);
    } else {
      setIntroFinished(true);
      if (isHome && !hasSeenIntro) {
        sessionStorage.setItem("hasSeenIntro", "true");
      }
    }
  }, [pathname]);

  // ... остальные useEffect (скролл, блокировка) без изменений

  const handleScroll = useCallback(() => {
    setIsScrolled((prev) => {
      const scrolled = window.scrollY > 50;
      return prev !== scrolled ? scrolled : prev;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!introFinished && pathname === "/") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [introFinished, pathname]);

  const handleIntroComplete = useCallback(() => {
    setIntroFinished(true);
    sessionStorage.setItem("hasSeenIntro", "true");
  }, []);

  const showIntro = !introFinished && pathname === "/";

  return (
    <NextAuthProvider>
      <AuthGuard>
        <GlobalBackground introFinished={!showIntro} />
        <AnimatePresence mode="wait">
          {showIntro && <IntroSequence onComplete={handleIntroComplete} />}
        </AnimatePresence>
        <div
          className={`relative min-h-dvh transition-opacity duration-1000 ${
            !showIntro ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          style={{ zIndex: 10 }}
        >
          <Navbar introFinished={!showIntro} isScrolled={isScrolled} />
          <main className="relative grow">{children}</main>
          <Footer />
        </div>
      </AuthGuard>
    </NextAuthProvider>
  );
}

"use client";

import React, { useState, useEffect } from "react";
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
  const [introFinished, setIntroFinished] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Теперь исключаем только страницу входа
  const noIntroPages = ["/auth/signin"];
  const shouldSkipIntro = noIntroPages.includes(pathname);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    const isHomePage = pathname === "/";

    if (shouldSkipIntro || (!isHomePage && hasSeenIntro === "true")) {
      setIntroFinished(true);
    }

    setIsCheckingSession(false);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, shouldSkipIntro]);

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
      {/* AuthGuard должен быть внутри NextAuthProvider, чтобы иметь доступ к сессии */}
      <AuthGuard>
        <GlobalBackground />
        <AnimatePresence mode="wait">
          {!introFinished && !shouldSkipIntro && (
            <IntroSequence key="intro-key" onComplete={handleIntroComplete} />
          )}
        </AnimatePresence>

        <div
          className={`relative min-h-dvh transition-opacity duration-1000 ${
            introFinished ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          style={{ zIndex: 10 }}
        >
          <Navbar introFinished={introFinished} isScrolled={isScrolled} />

          <main>{children}</main>

          <Footer />
        </div>
      </AuthGuard>
    </NextAuthProvider>
  );
}

"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import NextImage from "next/image";
import { useState, useEffect } from "react";
import RollingLink from "@/components/navbar/RollingLink";
import WeatherWidget from "@/components/navbar/WeatherWidget";

interface NavbarProps {
  introFinished: boolean;
  isScrolled: boolean;
}

export default function Navbar({
  introFinished = true,
  isScrolled = false,
}: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);

  const { scrollY } = useScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setIsAtTop(latest < 10);
    if (latest > previous && latest > 10) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  if (!mounted) return null;

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      initial="visible"
      animate={isVisible ? "visible" : "hidden"}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      // МАКСИМАЛЬНАЯ ПРОЗРАЧНОСТЬ
      className="fixed top-0 left-0 right-0 z-9999 bg-transparent"
    >
      <div
        className={`container mx-auto px-10 md:px-25 flex items-center transition-[height] duration-500 ${
          isAtTop ? "h-30" : "h-20"
        }`}
      >
        <motion.div
          className={`shrink-0 flex items-center transition-all duration-500 ${isAtTop ? "mt-10 w-20" : "mt-0 w-16"}`}
        >
          <NextImage
            src="/icons/volleyball.svg"
            alt="Logo"
            width={70}
            height={70}
            priority
          />
        </motion.div>

        <div
          className={`flex-1 flex justify-left px-4 transition-all duration-500 ${isAtTop ? "mt-10" : "mt-0"}`}
        >
          <WeatherWidget />
        </div>

        <div
          className={`flex items-center gap-14 transition-all duration-500 ${isAtTop ? "mt-10" : "mt-0"}`}
        >
          <motion.nav className="hidden md:flex gap-12 font-extrabold text-base uppercase text-brand-white">
            {["Тренировки", "Комьюнити", "Локации", "Форматы"].map((item) => (
              <RollingLink key={item} title={item} href={`#${item}`} />
            ))}
          </motion.nav>
          <button className={`btn-nav ${!isAtTop && "scale-90"}`}>
            Войти в игру
          </button>
        </div>
      </div>
    </motion.header>
  );
}

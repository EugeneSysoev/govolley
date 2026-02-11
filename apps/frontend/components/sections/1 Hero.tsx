"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import NextImage from "next/image";

const ROTATING_WORDS = ["ТРЕНИРОВКИ", "КОМЬЮНИТИ", "ОБЩЕНИЕ", "ЭМОЦИИ"];

interface HeroProps {
  introFinished: boolean;
}

export default function Hero({ introFinished }: HeroProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const containerRef = useRef(null);

  // Настройка параллакса
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  useEffect(() => {
    if (!introFinished) return;

    const intervalId = setInterval(() => {
      setWordIndex((prevIndex) =>
        prevIndex === ROTATING_WORDS.length - 1 ? 0 : prevIndex + 1,
      );
    }, 2000);

    return () => clearInterval(intervalId);
  }, [introFinished]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-black"
    >
      {/* 1. ФОН С ПАРАЛЛАКСОМ */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0 will-change-transform"
      >
        <NextImage
          src="/photos/background1.jpg"
          alt="Beach Volleyball Phuket"
          fill
          priority
          quality={100}
          sizes="(max-width: 768px) 100vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>

      {/* 2. ОСНОВНОЙ КОНТЕЙНЕР */}
      <div className="relative z-10 min-h-screen w-full flex flex-col">
        <div className="grow flex items-center justify-center px-4 pt-20 md:pt-32">
          <div className="text-center max-w-6xl">
            <h1 className="heading-1 text-[12vw] md:text-[8rem] leading-[0.8] text-brand-lime mb-2 md:mb-4">
              GOVOLLEY
            </h1>

            <div className="h-[12vw] md:h-32 relative my-2 md:my-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={wordIndex}
                  initial={{ x: "-10%", opacity: 0 }}
                  animate={{ x: "0%", opacity: 1 }}
                  exit={{ x: "10%", opacity: 0 }}
                  transition={{
                    duration: 0.1,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <h1 className="heading-1 text-[12vw] md:text-[8rem] leading-[0.8] text-center text-brand-silver">
                    {ROTATING_WORDS[wordIndex]}
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ВТОРОЙ БЛОК: Описание */}
        <div className="shrink-0 px-4 pb-8">
          <motion.div
            className="w-full max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={introFinished ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xl md:text-2xl leading-snug text-brand-white font-bold uppercase tracking-tight">
              Твой старт начинается здесь
              <br />
              Почувствуй вкус игры на пляжах пхукета
              <br />
              Стань лучшей версией себя — вступай в игру
            </p>
          </motion.div>
        </div>

        {/* ТРЕТИЙ БЛОК: Бегущая строка */}
        <div className="shrink-0 border-t border-brand-dark bg-brand-dark text-brand-lime py-5 overflow-hidden">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="flex gap-4 font-heading font-medium uppercase text-xl tracking-[0.3em]"
          >
            {[...Array(8)].map((_, i) => (
              <span key={i} className="whitespace-nowrap">
                ШКОЛА • ПЛЯЖНОГО • ВОЛЕЙБОЛА • НА ПХУКЕТЕ •
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

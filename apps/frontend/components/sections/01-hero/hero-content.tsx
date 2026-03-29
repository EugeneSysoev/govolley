"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ROTATING_WORDS, HERO_ANIMATION_CONFIG } from "./constants";
import { ScrollIndicator } from "./scroll-indicator";

interface HeroContentProps {
  introFinished: boolean;
}

export const HeroContent = ({ introFinished }: HeroContentProps) => {
  const [wordIndex, setWordIndex] = useState(0);

  // Логика ротации слов после завершения интро
  useEffect(() => {
    if (!introFinished) return;

    const intervalId = setInterval(() => {
      setWordIndex((prev) =>
        prev === ROTATING_WORDS.length - 1 ? 0 : prev + 1,
      );
    }, HERO_ANIMATION_CONFIG.wordChangeInterval);

    return () => clearInterval(intervalId);
  }, [introFinished]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="text-center max-w-6xl flex flex-col items-center z-10 -mb-27">
        {/* Заголовок бренда */}
        <h1 className="heading-hero2 text-[clamp(7rem,18vw,11rem)] leading-none md:leading-none text-glow drop-shadow-lg/50 text-brand-lime tracking-tight">
          GOVOLLEY
        </h1>

        {/* Слайдер слов */}
        <div className="h-[12vw] md:h-32 w-full relative my-2 md:my-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={wordIndex}
              initial={{ x: "-10%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "10%", opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <h1 className="heading-hero2 text-[clamp(8rem,18vw,15rem)] text-center text-brand-white text-glow uppercase tracking-tight drop-shadow-lg/50">
                {ROTATING_WORDS[wordIndex]}
              </h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Текст ниже */}
        <motion.div
          className="mt-2 md:-mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={introFinished ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 4.2, duration: 0.5 }}
        >
          <p className="text-[3.2vw] md:text-[1.4rem] leading-none tracking-[0.2em] text-brand-white [word-spacing:2px] text-glow">
            {HERO_ANIMATION_CONFIG.motivateText}
          </p>
        </motion.div>

        {/* Скролл */}
        <ScrollIndicator introFinished={introFinished} />
      </div>
    </div>
  );
};

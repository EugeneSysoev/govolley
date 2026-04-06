"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ROTATING_WORDS, HERO_ANIMATION_CONFIG } from "./constants";

interface HeroContentProps {
  introFinished: boolean;
}

export const HeroContent = ({ introFinished }: HeroContentProps) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [showBottomText, setShowBottomText] = useState(false);
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    if (!introFinished) {
      setIsDelayed(true);
      const timer = setTimeout(() => setShowBottomText(true), 4200);
      return () => clearTimeout(timer);
    } else {
      setIsDelayed(false);
      setShowBottomText(true);
    }
  }, [introFinished]);

  useEffect(() => {
    if (!introFinished) return;
    let timeoutId: NodeJS.Timeout;
    const tick = () => {
      timeoutId = setTimeout(() => {
        setWordIndex((prev) =>
          prev === ROTATING_WORDS.length - 1 ? 0 : prev + 1,
        );
        tick();
      }, HERO_ANIMATION_CONFIG.wordChangeInterval);
    };
    tick();
    return () => clearTimeout(timeoutId);
  }, [introFinished]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="text-center max-w-6xl flex flex-col items-center z-10 mb-10">
        <h1 className="heading-hero2 text-[clamp(7rem,18vw,11rem)] leading-none drop-shadow-xl/25 text-brand-lime tracking-tight">
          GOVOLLEY
        </h1>

        <div className="h-[12vw] md:h-32 w-full relative my-2 md:my-4">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={wordIndex}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <h2 className="heading-hero2 text-[clamp(8rem,18vw,15rem)] text-center text-brand-white uppercase tracking-tight drop-shadow-xl/25">
                {ROTATING_WORDS[wordIndex]}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          className="mt-2 md:-mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={
            showBottomText ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
          }
          transition={isDelayed ? { duration: 0.5 } : { duration: 0 }}
        >
          <p className="text-[3.2vw] md:text-[1.4rem] leading-none tracking-[0.2em] text-brand-white [word-spacing:2px] drop-shadow-md/25">
            {HERO_ANIMATION_CONFIG.motivateText}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

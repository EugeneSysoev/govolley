"use client";

import { memo, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface WordPullUpProps {
  words: string;
  delayMultiple?: number;
  className?: string;
  start?: boolean;
  wrapperDelay?: number;
}

// Статические variants (не пересоздаются)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // будет переопределено через delayMultiple
      delayChildren: 0,
    },
  },
};

const wordVariants: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.215, 0.61, 0.355, 1],
    },
  },
};

const PremiumWordPullUp = memo(
  ({
    words,
    className,
    delayMultiple = 0.1,
    wrapperDelay = 0,
    start = true,
  }: WordPullUpProps) => {
    // Мемоизируем массив слов
    const wordsArray = useMemo(() => words.split(" "), [words]);

    if (!words) return null;

    // Динамически обновляем staggerChildren и delayChildren
    const dynamicContainerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: delayMultiple,
          delayChildren: wrapperDelay,
        },
      },
    };

    return (
      <motion.div
        variants={dynamicContainerVariants}
        initial="hidden"
        animate={start ? "visible" : "hidden"}
        className={cn("flex flex-wrap items-center gap-y-1", className)}
      >
        {wordsArray.map((word, i) => (
          <span key={i} className="overflow-hidden inline-block">
            <motion.span
              variants={wordVariants}
              className="inline-block pr-[0.3em] will-change-transform"
            >
              {word === "" ? "\u00A0" : word}
            </motion.span>
          </span>
        ))}
      </motion.div>
    );
  },
);

PremiumWordPullUp.displayName = "PremiumWordPullUp";

export default PremiumWordPullUp;

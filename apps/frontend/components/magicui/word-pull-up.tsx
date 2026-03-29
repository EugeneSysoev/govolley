"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface WordPullUpProps {
  words: string;
  className?: string;
  delayMultiple?: number;
  wrapperDelay?: number;
}

export default function PremiumWordPullUp({
  words,
  className,
  delayMultiple = 0.1,
  wrapperDelay = 0,
}: WordPullUpProps) {
  if (!words) return null;

  const wordsArray = words.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delayMultiple,
        delayChildren: wrapperDelay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { y: "110%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: [0.215, 0.61, 0.355, 1],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={cn("flex flex-wrap items-center gap-y-1", className)}
    >
      {wordsArray.map((word, i) => (
        <span
          key={i}
          className="overflow-hidden inline-block"
        >
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
}

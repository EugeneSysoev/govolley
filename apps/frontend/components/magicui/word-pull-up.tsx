"use client";

import { motion, Variants, Transition } from "framer-motion";
import { cn } from "@/lib/utils";

interface WordPullUpProps {
  words: string;
  className?: string;
  delayMultiple?: number;
}

export default function PremiumWordPullUp({
  words,
  className,
  delayMultiple = 0.12,
}: WordPullUpProps) {
  if (!words) return null;

  const wordsArray = words.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delayMultiple,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { y: "100%" },
    visible: {
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9] as any,
      } as Transition,
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={cn("flex flex-wrap justify-start", className)}
    >
      {wordsArray.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block py-2 -my-5 pr-5">  
          <motion.span
            variants={wordVariants}
            className="inline-block will-change-transform"
          >
            {word === "" ? "\u00A0" : word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
}

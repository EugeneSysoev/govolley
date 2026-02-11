"use client";

import { motion, Variants } from "framer-motion";

interface RevealHeadingProps {
  text: string;
  className?: string;
}

export const RevealHeading = ({ text, className }: RevealHeadingProps) => {
  // 1. Разбиваем текст на слова, чтобы сохранить пробелы между ними
  const words = text.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Задержка между буквами
        delayChildren: 0.1,
      },
    },
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: "110%", // Уводим ниже базовой линии
      rotateX: 60,
    },
  };

  return (
    <motion.div
      style={{ perspective: "1000px" }}
      className="block" // Убираем лишние обертки
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          className="inline-block whitespace-nowrap mr-[0.5em]"
        >
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              /* px-2 добавляет запас по бокам, чтобы наклонные буквы не резались.
                 -mx-2 компенсирует этот отступ, чтобы расстояние между буквами не росло. */
              className="relative inline-block overflow-hidden py-4 -my-4"
            >
              <motion.span
                variants={child}
                className={`inline-block whitespace-nowrap ${className}`}
                style={{
                  fontFamily: "var(--font-heading)",
                  transformOrigin: "bottom left",
                }}
              >
                {char}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </motion.div>
  );
};

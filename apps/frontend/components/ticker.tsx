"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function TextScrollTransition() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.01,
  });

  // Используем чуть меньший диапазон смещения
  const xLeft = useTransform(smoothProgress, [0, 1], ["0%", "-15%"]);
  const xRight = useTransform(smoothProgress, [0, 1], ["-15%", "0%"]);

  const words = ["BEACH", "СТАРТ", "VOLLEYBALL", "ЗДЕСЬ"];

  return (
    <section
      ref={containerRef}
      // Добавили контент-визибилити для оптимизации рендера
      className="relative pt-3 bg-transparent overflow-hidden flex flex-col gap-4 select-none"
      style={{ contentVisibility: 'auto' }} 
    >
      {words.map((word, index) => {
        const xMove = index % 2 === 0 ? xLeft : xRight;

        return (
          <div key={index} className="flex whitespace-nowrap">
            <motion.div
              style={{ 
                x: xMove,
                willChange: "transform", // Принудительный GPU-рендеринг
              }}
              className="flex gap-10 items-center"
            >
              {/* Уменьшили количество итераций до 8 (хватит с запасом) */}
              {[...Array(13)].map((_, i) => (
                <span
                  key={i}
                  className={`
                    text-[clamp(3rem,5vw,3.8rem)] heading-hero2 md:leading-[0.65]
                    ${i % 2 === 0 ? "text-brand-silver" : "text-transparent"}
                  `}
                  style={{
                    WebkitTextStroke: i % 2 !== 0 ? "1px rgba(237,237,237,0.8)" : "none",
                  }}
                >
                  {word}
                </span>
              ))}
            </motion.div>
          </div>
        );
      })}
    </section>
  );
}
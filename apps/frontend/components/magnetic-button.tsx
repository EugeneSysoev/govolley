// components/magnetic-button.tsx
"use client";

import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function MagneticButton({ children, strength = 1 }: { children: React.ReactNode, strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Плавная физика как в топовых студиях (Active Theory / Locomotive)
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    
    // Вычисляем дистанцию от центра
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    x.set((clientX - centerX) * 0.5 * strength);
    y.set((clientY - centerY) * 0.5 * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className="relative z-10"
      whileTap={{ scale: 0.8 }}
    >
      {/* ХАК ДЛЯ AWWWARDS: 
         Внутренний контейнер для еще более мягкого движения контента 
      */}
      <motion.div
        animate={{ x: x.get() * 0.2, y: y.get() * 0.2 }}
        transition={{ type: "spring", ...springConfig }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
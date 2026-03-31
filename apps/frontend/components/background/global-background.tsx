"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { memo } from "react";

interface GlobalBackgroundProps {
  introFinished?: boolean;
}

const GlobalBackground = memo(({ introFinished }: GlobalBackgroundProps) => {
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 35,
    restDelta: 0.001,
  });

  const layer1Y = useTransform(smoothProgress, [0, 1], ["0px", "-50px"]);
  const layer2Y = useTransform(smoothProgress, [0, 1], ["0px", "70px"]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: introFinished ? 1 : 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 overflow-hidden pointer-events-none bg-[#042540]"
      style={{ zIndex: -50 }}
    >
      {/* 1. СВЕТОВЫЕ ПЯТНА */}
      <motion.div
        style={{ y: layer2Y, translateZ: 0 }}
        className="absolute inset-0 will-change-transform"
      >
        <div className="absolute top-[15%] left-[-10%] md:left-[20%] w-[70vw] md:w-[50vw] h-[70vw] md:h-[50vw] bg-brand-lime/[0.03] rounded-full blur-[60px]" />
        <div className="absolute bottom-[20%] right-[-10%] md:right-[10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-brand-lime/[0.06] rounded-full blur-[80px]" />
      </motion.div>

      {/* 2. СЕТКА */}
      <div className="absolute inset-0" style={{ transform: "translateZ(0)" }}>
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            y: layer1Y,
            translateZ: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), 
              linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "clamp(50px, 10vw, 100px) clamp(50px, 10vw, 100px)",
            backfaceVisibility: "hidden",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#050506_150%)]" />
      </div>

      {/* 3. ШУМ (В дополнение к noise-overlay из layout, для глубины) */}
      <div
        className="absolute inset-0 opacity-[0.015] md:opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </motion.div>
  );
});

GlobalBackground.displayName = "GlobalBackground";

export default GlobalBackground;

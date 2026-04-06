"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { memo } from "react";

interface GlobalBackgroundProps {
  introFinished?: boolean;
}

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const GlobalBackground = memo(({ introFinished }: GlobalBackgroundProps) => {
  const { scrollYProgress } = useScroll();

  const layer1Y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [0, 70]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: introFinished ? 1 : 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="fixed inset-0 overflow-hidden pointer-events-none bg-[#042540]"
      style={{
        zIndex: -50,
        contain: "layout paint size",
      }}
    >
      {/* Световые пятна */}
      <motion.div
        style={{ y: layer2Y, willChange: "transform" }}
        className="absolute inset-0"
      >
        <div className="absolute top-[15%] left-[-10%] md:left-[20%] w-[70vw] md:w-[50vw] h-[70vw] md:h-[50vw] bg-brand-lime/[0.03] rounded-full blur-[60px]" />
        <div className="absolute bottom-[20%] right-[-10%] md:right-[10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-brand-lime/[0.06] rounded-full blur-[80px]" />
      </motion.div>

      {/* Сетка */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: layer1Y,
          willChange: "transform",
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "clamp(50px, 10vw, 100px) clamp(50px, 10vw, 100px)",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#050506_150%)]" />
      </motion.div>

      {/* Шум */}
      <div
        className="absolute inset-0 opacity-[0.015] md:opacity-[0.02] mix-blend-overlay"
        style={{ backgroundImage: NOISE_SVG }}
      />
    </motion.div>
  );
});

GlobalBackground.displayName = "GlobalBackground";

export default GlobalBackground;

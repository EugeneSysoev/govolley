"use client";

import { motion } from "framer-motion";
import { MARQUEE_TEXT } from "./constants";

export const MarqueeSection = () => {
  return (
    <section className="bg-brand-lime py-2 lg:py-3 overflow-hidden scale-105 relative z-20 border-y border-black/5 shadow-sm">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
        className="flex gap-4 heading-1 text-black drop-shadow-sm uppercase tracking-[0.2em] font-bold "
        style={{ fontSize: "clamp(0.75rem, 4vw, 1.1rem)" }}
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} className="whitespace-nowrap shrink-0">
            {MARQUEE_TEXT}
          </span>
        ))}
      </motion.div>
    </section>
  );
};

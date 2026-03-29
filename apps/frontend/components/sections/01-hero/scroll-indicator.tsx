"use client";

import { motion } from "framer-motion";
import { HERO_ANIMATION_CONFIG } from "./constants";

export const ScrollIndicator = ({
  introFinished,
}: {
  introFinished: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={introFinished ? { opacity: 1 } : {}}
    transition={{ delay: 4.5, duration: 1 }}
    className="mt-18 flex flex-col items-center gap-3"
  >
    <span className="text-white font-mono text-[clamp(9px,2vw,12px)] uppercase tracking-[0.3em] text-glow leading-relaxed md:leading-none">
      {HERO_ANIMATION_CONFIG.scrollText}
    </span>

    <div className="w-px h-15 bg-linear-to-b from-brand-lime to-transparent relative overflow-hidden">
      <motion.div
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-1/2 bg-brand-white"
      />
    </div>
  </motion.div>
);

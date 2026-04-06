"use client";

import { motion } from "framer-motion";

export const ScrollIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1, duration: 0.6 }}
    className="flex flex-col items-center gap-3"
  >
    <span className="text-white font-mono font-bold text-[clamp(9px,2vw,14px)] uppercase tracking-[0.3em] drop-shadow-md leading-relaxed md:leading-none [writing-mode:vertical-lr] rotate-180">
      Прокрути
    </span>

    <div className="w-px h-20 bg-linear-to-b from-brand-lime to-transparent relative overflow-hidden">
      <motion.div
        animate={{
          y: ["-100%", "0%", "100%"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-0 w-full h-1/2 bg-brand-white"
      />
    </div>
  </motion.div>
);

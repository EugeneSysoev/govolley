"use client";

import React from "react";
import { motion } from "framer-motion";

export function MagneticButton({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="relative z-10 inline-block"
      whileTap={{ scale: 1.3 }}
    >
      {children}
    </motion.div>
  );
}

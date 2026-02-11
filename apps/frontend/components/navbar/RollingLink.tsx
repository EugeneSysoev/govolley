"use client";

import { motion, Variants } from "framer-motion";

interface RollingLinkProps {
  title: string;
  href: string;
}

const slotEase = [0.45, 0.05, 0.55, 0.95] as [number, number, number, number];

const transition = {
  duration: 0.35,
  ease: slotEase,
};

export default function RollingLink({ title, href }: RollingLinkProps) {
  return (
    <a
      href={href}
      className="group relative block overflow-hidden whitespace-nowrap"
    >
      <motion.div
        initial="initial"
        whileHover="hover"
        className="relative flex flex-col"
      >
        {/* Верхний слой - уходит вверх */}
        <div className="flex">
          {title.split("").map((char, i) => (
            <motion.span
              key={i}
              variants={{
                initial: { y: 0 },
                hover: { y: "-120%" },
              }}
              transition={transition}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>

        {/* Нижний слой - залетает снизу */}
        <div className="absolute inset-0 flex">
          {title.split("").map((char, i) => (
            <motion.span
              key={i}
              variants={{
                initial: { y: "120%" },
                hover: { y: 0 },
              }}
              transition={transition}
              className="inline-block text-brand-white"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </a>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggle: () => void;
  index: number;
}

export const FaqItem = ({
  question,
  answer,
  isOpen,
  toggle,
  index,
}: FaqItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative border-b border-white/10"
    >
      <button
        onClick={toggle}
        className="w-full py-[clamp(1.2rem,2.5vw,1.8rem)] text-left flex justify-between items-center group transition-all duration-300"
      >
        <span
          className={`text-[clamp(0.8rem,1.8vw,1rem)] font-light drop-shadow-md/50 tracking-tight transition-colors duration-300 ${
            isOpen
              ? "text-brand-lime"
              : "text-white group-hover:text-brand-lime"
          }`}
        >

          {question}
        </span>

        <div className="relative flex items-center justify-center w-5 h-5 ml-4">
          <motion.div
            className={`absolute w-full h-px ${isOpen ? "bg-brand-lime" : "bg-white"}`}
            animate={{ rotate: isOpen ? 0 : 90 }}
          />
          <div
            className={`absolute w-full h-px ${isOpen ? "bg-brand-lime" : "bg-white"}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="pb-8 pl-2 lg:pl-[2.8rem] pr-13 text-[clamp(0.8rem,1.3vw,1rem)] drop-shadow-md/50 text-white/60 leading-relaxed max-w-2xl font-light">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

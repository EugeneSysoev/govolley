"use client";

import { motion } from "framer-motion";
import type { DictionaryItem } from "./constants";

interface DictionaryCardProps {
  item: DictionaryItem;
  index: number;
}

export default function DictionaryCard({ item }: DictionaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
    >
      {/* ЛЕВАЯ СТОРОНА: ОЖИДАНИЕ */}
      <div className="group relative flex flex-col justify-center p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
        
        <span className="text-brand-lime font-mono text-[0.7rem] md:text-[clamp(0.7rem,1.5vw,0.8rem)] uppercase tracking-[0.2em] mb-2 md:mb-4 block">
          Первая мысль:
        </span>
        <p className="text-white font-mono text-[1.1rem] md:text-[clamp(1.25rem,4vw,2rem)] italic leading-tight drop-shadow-lg/50">
          «{item.thought}»
        </p>
      </div>

      {/* ПРАВАЯ СТОРОНА: РЕАЛЬНОСТЬ */}
      <div className="relative flex flex-col justify-between p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-brand-lime/30 bg-brand-lime/5 shadow-[0_0_30px_rgba(163,230,53,0.05)] overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-brand-lime/10 blur-3xl rounded-full" />
        
        <div>
          <span className="text-brand-lime font-mono text-[0.7rem] md:text-[clamp(0.7rem,1.5vw,0.8rem)] uppercase tracking-[0.2em] mb-2 md:mb-4 block font-bold">
            На волейбольном:
          </span>
          <p className="text-white/90 text-[0.9rem] md:text-[clamp(0.875rem,2vw,1.125rem)] leading-relaxed mb-4 md:mb-6">
            {item.volley}
          </p>
        </div>

        {/* НИЖНЯЯ ЧАСТЬ: ЮМОР */}
        <div className="pt-4 md:pt-6 border-t border-white/20 flex items-start gap-3 md:gap-4">
          <span className="text-xl md:text-[clamp(1.25rem,3vw,1.5rem)] shrink-0">🎭</span>
          <p className="text-[0.75rem] md:text-[clamp(0.75rem,1.5vw,0.875rem)] font-mono italic text-white/60 leading-relaxed">
            {item.comic}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
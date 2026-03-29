"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import PremiumWordPullUp from "@/components/magicui/word-pull-up";
import DictionaryCard from "./dictionary-card";
import { DICTIONARY_DATA } from "./constants";


export default function DictionarySection() {
  const [activeItem, setActiveItem] = useState(DICTIONARY_DATA[0]);
  const { ref: dictRef } = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  return (
    <section id="dictionary"
      ref={dictRef}
      className="relative pt-20 px-5 lg:px-30 overflow-hidden bg-transparent"
    >
      <div className="container mx-auto">
        {/* Заголовок секции */}
        <div className="py-4 flex flex-col items-center">
          <PremiumWordPullUp
            words="Словарь пляжника"
            className="heading-hero2 text-center text-[clamp(4rem,8vw,6rem)] text-brand-white block drop-shadow-lg/50 tracking-tight leading-none"
          />
        </div>

        {/* НАВИГАЦИЯ */}
        <div className="flex flex-wrap justify-center gap-2 mb-4 md:mb-8 p-2 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm max-w-4xl mx-auto">
          {DICTIONARY_DATA.map((item) => (
            <button
              key={item.term}
              onClick={() => setActiveItem(item)}
              className={`relative px-4 py-2 text-[clamp(0.7rem,1.8vw,0.9rem)] font-mono drop-shadow-md/50 uppercase tracking-widest transition-colors duration-300 rounded-full ${
                activeItem.term === item.term
                  ? "text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {activeItem.term === item.term && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-brand-lime shadow-[0_0_20px_rgba(163,230,53,0.6)]"
                  style={{ borderRadius: 9999 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{item.term}</span>
            </button>
          ))}
        </div>

        {/* КОНТЕНТ */}
        <div className="max-w-4xl mx-auto pb-20">
          <AnimatePresence mode="wait">
            <DictionaryCard key={activeItem.term} item={activeItem} index={0} />
          </AnimatePresence>
        </div>
      </div>
    </section>
    
  );
}

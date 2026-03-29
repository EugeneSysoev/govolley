"use client";

import { motion } from "framer-motion";
import PremiumWordPullUp from "@/components/magicui/word-pull-up";
import { CREATOR_MANIFESTO } from "./constants";
import { DecorativeLine } from "./decorative-line";

export default function AboutCreatorSection() {
  return (
    <section className="relative bg-transparent overflow-hidden">
      <div className="container mx-auto px-5 lg:px-30">
        <DecorativeLine />

        <div className="max-w-5xl border-l border-brand-lime pl-5 md:pl-16">
          <div className="space-y-8">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-brand-lime font-mono text-[clamp(0.6rem,2vw,0.8rem)] tracking-[0.3em] uppercase block mb-4"
            >
              {CREATOR_MANIFESTO.badge}
            </motion.span>

            <PremiumWordPullUp
              words={CREATOR_MANIFESTO.text}
              className="text-brand-white/80 font-light whitespace-pre-line text-[clamp(0.6em,2vw,0.9rem)] leading-relaxed tracking-wider drop-shadow-md/50"
              delayMultiple={0.01}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-5 flex items-center gap-4"
          ></motion.div>
        </div>
      </div>
    </section>
  );
}

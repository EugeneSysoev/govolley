"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FAQ_DATA } from "./constants";
import { FaqItem } from "./faq-item";
import PremiumWordPullUp from "@/components/magicui/word-pull-up";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative w-full px-6 lg:px-20 bg-transparent">
      <div className="max-w-6xl mx-auto">
        {/* ВЕРХНИЙ БЛОК: ЦЕНТРИРОВАННЫЙ */}
        <div className="flex flex-col items-center text-center mb-10">
          <PremiumWordPullUp
            words={FAQ_DATA.title}
            className="heading-hero2 text-center text-[clamp(4rem,8vw,6rem)] text-brand-white block drop-shadow-lg/50 tracking-tight leading-none"
          />
        </div>

        {/* НИЖНИЙ БЛОК: FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 flex flex-col border-t border-white/10">
            {FAQ_DATA.items.map((item, index) => (
              <FaqItem
                key={index}
                index={index}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                toggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import PremiumWordPullUp from "@/components/magicui/word-pull-up";
import { ScrollIndicator } from "./scroll-indicator";

interface FeatureCardProps {
  item: (typeof import("./constants").FEATURES_DATA)[number];
  index: number;
}

const transitionImage = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1] as const,
};
const transitionContent = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1] as const,
  delay: 0.15,
};
const transitionNumber = { duration: 0.6, delay: 0.3 };

export const FeatureCard = memo(({ item, index }: FeatureCardProps) => {
  return (
    <section className="relative h-full w-full snap-start overflow-hidden group">
      {/* ФОН – всегда виден, анимация при входе в зону видимости */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1, opacity: 1 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={transitionImage}
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25 bg-linear-to-t from-black via-black/10 to-transparent" />
      </motion.div>

      {/* ИНДИКАТОР слева */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <ScrollIndicator />
      </div>

      {/* КОНТЕНТ – появляется с небольшой задержкой */}
      <motion.div
        className="relative z-10 w-full h-full p-8 md:p-12 flex flex-col items-end text-right justify-between"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={transitionContent}
      >
        <div className="max-w-xs md:max-w-sm mt-4">
          <PremiumWordPullUp
            words={item.title}
            className="text-brand-lime heading-1 font-medium text-[clamp(1.4rem,3vw,3rem)] mb-3 drop-shadow-md/50 block"
            delayMultiple={0.06}
            start={true} // триггерится анимацией появления контейнера
          />
          <PremiumWordPullUp
            words={item.description}
            className="text-white font-light text-[clamp(0.8rem,1.5vw,1rem)] drop-shadow-xs/25 leading-tight block"
            delayMultiple={0.015}
            start={true}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={transitionNumber}
          className="relative"
        >
          <span className="font-mono text-brand-lime/70 text-[clamp(3rem,8vw,5rem)] font-black italic select-none drop-shadow-lg/50 leading-none">
            0{index + 1}
          </span>
          <div className="md:hidden mt-2 flex justify-end">
            <ScrollIndicator />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
});

FeatureCard.displayName = "FeatureCard";

"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import WordPullUp from "@/components/magicui/word-pull-up";
import { FeatureCard } from "./feature-card";
import { FEATURES_DATA, FEATURES_CONFIG } from "./constants";

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 15,
    restDelta: 0.6,
  });

  return (
    <section className="relative py-20 lg:py-20 bg-transparent overflow-hidden">
      {/* ФОНОВЫЙ ДЕКОР */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-lime/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-brand-lime/5 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 md:px-25 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 items-center">
          
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end text-center lg:text-right">
            <div className="space-y-2 lg:space-y-10 w-full"> 
              <span className="text-brand-lime font-mono uppercase text-[clamp(0.7rem,2vw,0.8rem)] tracking-[0.3em] block">
                // {FEATURES_CONFIG.badge}
              </span>

              <div className="relative overflow-visible">
                <WordPullUp
                  words={FEATURES_CONFIG.title}
                  className="heading-hero2 drop-shadow-lg/50 text-[clamp(5rem,13vw,9.5rem)] [&_span]:overflow-visible [&_span]:whitespace-nowrap text-brand-white block tracking-[-0.05em] leading-[0.85] lg:leading-[0.8] py-4 lg:py-10 px-0 lg:px-10 lg:-mx-10 overflow-visible"
                />
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="lg:col-span-7 relative w-full">
            <div className="relative border border-brand-lime/50 rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(163,230,53,0.1)] bg-black">
              {/* КОНТЕЙНЕР СКРОЛЛА */}
              <div
                ref={containerRef}
                className="w-full aspect-square md:aspect-3/2 lg:aspect-4/3 overflow-y-auto snap-y snap-mandatory scrollbar-hide relative"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {FEATURES_DATA.map((item, index) => (
                  <FeatureCard key={index} item={item} index={index} />
                ))}
              </div>

              {/* ПРОГРЕСС-БАР */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-20">
                <motion.div
                  style={{ scaleX }}
                  className="h-full bg-brand-lime origin-left"
                />
              </div>
            </div>

            {/* ДЕКОРАТИВНЫЙ НОМЕР ТЕКУЩЕГО БЛОКА  */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-brand-lime rounded-full hidden lg:flex items-center justify-center -rotate-12 border-4 border-[#050506] z-30">
              <span className="text-black font-black text-2xl">GO</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

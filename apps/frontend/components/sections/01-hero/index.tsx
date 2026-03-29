"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { HeroBackground } from "./hero-background";
import { HeroContent } from "./hero-content";
import { useHeroAnimations } from "./use-hero-animations";
import VelocityText from "./velocity-text";
import { HERO_ANIMATION_CONFIG } from "./constants";

interface HeroProps {
  introFinished: boolean;
}

export default function Hero({ introFinished }: HeroProps) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const { backgroundY, contentOpacity, contentScale, contentBlur } =
    useHeroAnimations(scrollYProgress);

  const clipShape = "polygon(0% 0%, 100% 0%, 100% 90%, 73% 95%, 0% 80%)";

  return (
    <div className="bg-transparent w-full flex flex-col relative">
      {/* 1. ОБОЛОЧКА ДЛЯ СВЕЧЕНИЯ */}
      <div className="relative w-full h-dvh drop-shadow-[0_0_7px_rgba(163,230,53,0.5)]">
        {/* ВНЕШНИЙ КОНТЕЙНЕР-БОРДЕР */}
        <section
          ref={containerRef}
          className="relative w-full h-full overflow-hidden shrink-0 bg-brand-lime"
          style={{ clipPath: clipShape }}
        >
          {/* ВНУТРЕННИЙ КОНТЕЙНЕР */}
          <div
            className="relative w-full h-full overflow-hidden"
            style={{
              clipPath: clipShape,
              height: "calc(100% - 1px)",
            }}
          >
            <HeroBackground y={backgroundY} />

            <motion.div
              className="relative z-10 h-full w-full flex flex-col items-center justify-center px-4"
              style={{
                filter: contentBlur,
                opacity: contentOpacity,
                scale: contentScale,
                willChange: "filter, opacity, transform",
              }}
            >
              <HeroContent introFinished={introFinished} />
            </motion.div>
          </div>
        </section>
      </div>

      <VelocityText
        text1={HERO_ANIMATION_CONFIG.runningText1}
        text2={HERO_ANIMATION_CONFIG.runningText2}
      />
    </div>
  );
}

"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import PremiumWordPullUp from "@/components/magicui/word-pull-up";
import { COACH_DATA } from "./constants";
import { CoachInfoCard } from "./coach-info-card";

const ANIMATION_CONFIG: HTMLMotionProps<"div"> = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
};

export default function CoachSection() {
  const LeftColumn = (
    <motion.div
      {...ANIMATION_CONFIG}
      className="relative flex flex-col space-y-6 lg:space-y-12 order-1 text-left"
    >
      <div className="space-y-3 lg:space-y-6 max-w-md">
        <PremiumWordPullUp
          words={COACH_DATA.role}
          className="text-brand-lime font-mono uppercase text-[clamp(0.8rem,1.5vw,1rem)] tracking-widest opacity-60 pb-2 lg:pb-4"
        />
        <PremiumWordPullUp
          words={COACH_DATA.name}
          className="text-brand-white heading-1 font-medium text-[clamp(1.8rem,5vw,3.8rem)] drop-shadow-md/50 leading-tighter"
        />
      </div>

      <div className="space-y-3 lg:space-y-5 max-w-md border-l-2 border-brand-lime pl-4 lg:pl-6">
        <PremiumWordPullUp
          words={COACH_DATA.mission.label}
          className="text-brand-lime font-mono uppercase text-[clamp(0.8rem,1.5vw,1rem)] tracking-widest opacity-60"
        />
        <PremiumWordPullUp
          words={COACH_DATA.mission.text}
          className="text-[clamp(0.75rem,1.8vw,0.9rem)] text-white/90 leading-relaxed font-light"
        />
      </div>
    </motion.div>
  );

  // Правая колонка — без линии
  const RightColumn = (
    <motion.div {...ANIMATION_CONFIG} className="relative flex flex-col order-3 px-2">
      <div className="space-y-3 lg:space-y-5 max-w-md">
        <PremiumWordPullUp
          words={COACH_DATA.categories[0].title || ""}
          className="text-brand-lime font-mono uppercase text-[clamp(0.8rem,1.5vw,1rem)] tracking-widest opacity-60"
        />
        <div className="space-y-2">
          {COACH_DATA.categories.map((cat, idx) => (
            <CoachInfoCard
              key={idx}
              items={cat.items}
              className={
                idx === 0
                  ? "font-black text-white uppercase text-[clamp(0.8rem,1.5vw,1.2rem)] "
                  : "text-white/90 font-light text-[clamp(0.75rem,1.8vw,0.8rem)]"
              }
            />
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <section
      id="coach"
      className="relative min-h-screen w-full flex flex-col justify-start px-5 lg:px-20 overflow-hidden pt-20"
    >
      <header className="relative z-30">
        <PremiumWordPullUp
          words={COACH_DATA.title}
          className="heading-hero2 text-center text-[clamp(4rem,8vw,6rem)] text-brand-white block drop-shadow-lg/50 tracking-tight leading-none"
        />
      </header>

      <div className="hidden lg:flex absolute inset-0 z-0 items-center justify-center pointer-events-none pt-40">
        <div className="w-[22%] min-w-70 aspect-1/1.5 rounded-[3rem] border border-brand-lime/50 overflow-hidden shadow-[0_0_40px_rgba(163,230,53,0.1)]">
          <div className="w-full h-full bg-[url('/photos/coach2.jpg')] bg-cover bg-center bg-no-repeat" />
        </div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24 items-start pt-7">
        {LeftColumn}

        <div className="lg:hidden order-2 w-full flex justify-center py-5">
          <div className="w-[85%] aspect-square rounded-[3rem] border border-brand-lime/50 overflow-hidden shadow-[0_0_40px_rgba(163,230,53,0.1)]">
            <div className="w-full h-full bg-[url('/photos/coach2.jpg')] bg-cover bg-center bg-no-repeat" />
          </div>
        </div>

        <div className="hidden lg:block order-2 pointer-events-none" />

        {RightColumn}
      </div>
    </section>
  );
}

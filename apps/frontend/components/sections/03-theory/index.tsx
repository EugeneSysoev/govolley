"use client";

import { useInView } from "react-intersection-observer";
import PremiumWordPullUp from "@/components/magicui/word-pull-up";
import { THEORY_DATA } from "./constants";
import TheoryItem from "./theory-item";
import VolleyballScene from "./volley-ball-scene";

export default function TheorySection() {
  const { ref: sectionRef, inView: sectionInView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section id="theory"
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center py-25 px-5 relative bg-transparent text-white"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl items-center">
        {/* Контент: Текст и карточки */}
        <div className="order-2 lg:order-1 flex flex-col items-center text-center w-full">
          <div className="mb-5 flex flex-col items-center">
            <PremiumWordPullUp
              words="НЕМНОГО ТЕОРИИ"
              className="heading-hero2 text-center text-[clamp(4rem,8vw,6rem)] text-brand-white block drop-shadow-lg/50 tracking-tight leading-none"
            />
          </div>

          <div className="border border-brand-lime/30 rounded-4xl p-8 md:p-10 grid grid-cols-2 md:grid-cols-2 gap-x-5 gap-y-8 w-full bg-brand-lime/5 shadow-[0_0_30px_rgba(163,230,53,0.05)]">
            {THEORY_DATA.map((item, i) => (
              <TheoryItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* 3D Сцена с мячом */}
        <div className="order-1 lg:order-2 w-full h-100 lg:h-150 relative flex items-center justify-center">
          {/* Крути */}
          <div className="absolute top-1 lg:top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="text-brand-lime/90 font-mono text-[clamp(0.5rem,5vw,1.5rem)] uppercase tracking-widest drop-shadow-md/50 animate-pulse">
              Крути
            </span>
          </div>

          <VolleyballScene inView={sectionInView} />
        </div>
      </div>
    </section>
  );
}
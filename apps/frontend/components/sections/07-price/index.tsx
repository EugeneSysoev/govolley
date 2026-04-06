"use client";

import PremiumWordPullUp from "@/components/magicui/word-pull-up";
import { PRICING_DATA } from "./constants";
import { PricingCard } from "./pricing-card";

export default function PricingSection() {
  return (
    <section id="formats"
    className="relative min-h-screen w-full flex flex-col justify-center px-6 lg:px-20 pb-10 overflow-hidden">
      {/* ЗАГОЛОВОК СЕКЦИИ */}
      <div className="relative z-30 mb-5 text-center">
        <PremiumWordPullUp
          words={PRICING_DATA.title}
          className="heading-hero2 text-center text-[clamp(3.8rem,8vw,6rem)] text-brand-white block drop-shadow-lg/50 tracking-tight leading-none"
          delayMultiple={0.1}
        />
      </div>

      {/* КОНТЕЙНЕР С КАРТОЧКАМИ */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-4 h-auto lg:h-128">
        {PRICING_DATA.packages.map((pkg, index) => (
          <PricingCard key={index} index={index} {...pkg} />
        ))}
      </div>

      {/* ФОНОВЫЙ ДЕКОР */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.03)_0%,transparent_70%)] pointer-events-none z-0" />
    </section>
  );
}

"use client";

import { useRef } from "react";
import Image from "next/image";
import PremiumWordPullUp from "@/components/magicui/word-pull-up";
import { ScrollIndicator } from "./scroll-indicator";

export const FeatureCard = ({ item, index }: { item: any; index: number }) => {
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      className="relative h-full w-full snap-start overflow-hidden group"
    >
      {/* ФОНОВАЯ КАРТИНКА */}
      <div className="absolute inset-0 z-0">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-scale duration-700 "
        />
        <div className="absolute inset-0 bg-black/25 bg-linear-to-t from-black via-black/1 to-transparent" />
      </div>

      {/* ИНДИКАТОР СКРОЛЛА (Позиционируем его слева по центру) */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <ScrollIndicator />
      </div>

      {/* КОНТЕНТ */}
      <div className="relative z-10 w-full h-full p-8 md:p-12 flex flex-col items-end text-right justify-between">
        
        {/* ВЕРХНЯЯ ЧАСТЬ: ТЕКСТ */}
        <div className="max-w-xs md:max-w-sm mt-4">
          <PremiumWordPullUp
            words={item.title}
            className="text-brand-lime heading-1 font-medium text-[clamp(1.4rem,3vw,3rem)] mb-3 drop-shadow-md/50 block"
            delayMultiple={0.1}
          />

          <PremiumWordPullUp
            words={item.description}
            className="text-white font-light text-[clamp(0.8rem,1.5vw,1rem)] drop-shadow-xs/25 leading-tight block"
            delayMultiple={0.025}
          />
        </div>

        {/* НИЖНЯЯ ЧАСТЬ: НОМЕР СЕКЦИИ */}
        <div className="relative">
          <span className="font-mono text-brand-lime/70 text-[clamp(3rem,8vw,5rem)] font-black italic select-none drop-shadow-lg/50 leading-none">
            0{index + 1}
          </span>
          
          {/* Мобильная версия индикатора (внизу номера) */}
          <div className="md:hidden mt-2 flex justify-end">
            <ScrollIndicator />
          </div>
        </div>
      </div>
    </section>
  );
};
"use client";

import { Suspense } from "react";
import Hero from "@/components/sections/01-hero";
import Features from "@/components/sections/02-features";
import TheorySection from "@/components/sections/03-theory";
import DictionarySection from "@/components/sections/04-dictionary";
import CoachSection from "@/components/sections/05-coach/index";
import PricingSection from "@/components/sections/07-price/index";
import FaqSection from "@/components/sections/08-faq/index";
import AboutCreatorSection from "@/components/sections/06-about-creator";
import SectionDivider from "@/components/section-divider";
import SecretLanguage from "@/components/sections/03-theory/secret-language";
import TextScrollTransition from "@/components/ticker";

export default function Home() {

  return (
    <main className="min-h-screen bg-transparent text-brand-dark selection:bg-brand-dark selection:text-brand-lime font-body">
      <div className="relative">
        {/* 1. Hero */}
        <Hero introFinished={true} />

        {/* 2. Почему выбирают нас */}
        <Features />

        {/* 2.1 Переход */}
        <SectionDivider
          image="/photos/v1fon.jpg"
          text1="Тренировки"
          text2="на пляжах Пхукета"
        />

        {/* 3. ТЕОРИЯ (Новый модуль) */}
        <Suspense fallback={<div className="h-screen bg-transparent" />}>
          <TheorySection />
        </Suspense>

        {/* 3.1 Переход */}
        <SectionDivider image="/photos/v2fon.png" text1="Тайный" text2="язык" />

        <SecretLanguage />

        {/* 4. СЛОВАРЬ (Новый модуль) */}
        <DictionarySection />
        <TextScrollTransition />

        <CoachSection />
        <AboutCreatorSection />
        <PricingSection />
        <FaqSection />

      </div>
    </main>
  );
}

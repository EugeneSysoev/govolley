"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import WordPullUp from "@/components/magicui/word-pull-up";

const FEATURES = [
  {
    title: "ПЛЯЖНАЯ АТМОСФЕРА",
    description:
      "Современный подход к тренировкам. Группы под твой уровень и амбиции. Выбирай удобное время и сделай первые шаги к новым победам.",
    image: "/photos/1b.png",
  },
  {
    title: "ЛУЧШЕЕ КАРДИО",
    description:
      "Песок дает в 2.5 раза больше нагрузки, чем твердое покрытие. Сжигай калории на открытом воздухе без вреда для связок и суставов.",
    image: "/photos/2b.png",
  },
  {
    title: "КОМЬЮНИТИ",
    description:
      "Хочешь быстро влиться в тусовку и найти друзей на Пхукете? Присоединись к первой тренировке и познакомься с будущими партнерами по игре.",
    image: "/photos/3b.png",
  },
];

export default function Features() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={containerRef}
      className="relative py-18 bg-brand-dark overflow-hidden"
    >
      <div className="container mx-auto px-6 md:px-10">
        {/* Окно с тонкой лаймовой рамкой */}
        <div className="relative border border-brand-lime/40 rounded-[2.5rem] p-8 md:p-16">
          {/* Надпись в верхней части рамки */}
          <div className="absolute -top-3 left-10 bg-brand-dark px-4 flex items-center">
            <span className="huninn-regular text-brand-lime text-xs md:text-sm tracking-[0.2em] uppercase">
              GOVOLLEY — повышай градус игры
            </span>
          </div>

          {/* Заголовок внутри окна */}
          <div className="mb-16 flex justify-start">
            <WordPullUp
              words="Почему выбирают нас?"
              className="heading-1 text-3xl md:text-5xl text-white whitespace-nowrap tracking-tighter md:tracking-[-0.05em] [word-spacing:-0.9em]"
            />
          </div>

          {/* Сетка карточек с анимацией появления */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {FEATURES.map((item, index) => (
              <FeatureCard key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  item,
  index,
}: {
  item: (typeof FEATURES)[0];
  index: number;
}) {
  return (
    <motion.div
      // Анимация: появление снизу вверх по очереди
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.2, // Слева направо: 0s, 0.2s, 0.4s
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className="group flex flex-col"
    >
      {/* 1. Фото (Горизонтальное) */}
      <div className="relative aspect-16/10 w-full mb-6 overflow-hidden rounded-4xl border border-white/10">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Затемнение фото */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
      </div>

      {/* 2. Заголовок блока */}
      <h3 className="heading-1 text-2xl text-brand-lime mb-3 px-2">
        {item.title}
      </h3>

      {/* Полоска из центра */}
      <div className="relative w-full flex justify-start mb-4 px-2">
        <div className="w-12 h-0.5 bg-brand-lime scale-x-100 group-hover:w-full transition-all duration-500 ease-in-out origin-left" />
      </div>

      {/* 3. Описание блока */}
      <p className="huninn-regular text-lg leading-[1.4] text-white/70 px-2">
        {item.description}
      </p>
    </motion.div>
  );
}

"use client";

import React, { Suspense, ComponentPropsWithRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei";
import { VolleyballModel } from "@/components/canvas/VolleyballModel";
import { motion } from "framer-motion";

// Данные для левого блока
const THEORY_DATA = [
  {
    label: "Команды",
    text: "Игра ведется 2 на 2. Запасных игроков и замен нет.",
  },
  { label: "Матч", text: "До победы в 2 партиях (максимум 3 сета)." },
  {
    label: "Счет",
    text: "Первые две до 21 очка, третья — до 15. Разница минимум в 2 очка.",
  },
  {
    label: "Смена сторон",
    text: "Каждые 7 очков (в коротком сете — каждые 5), чтобы исключить влияние солнца и ветра.",
  },
  {
    label: "Поле",
    text: "16х8 метров. Разметка — это не краска, а натянутые на песке ленты.",
  },
  {
    label: "Касания",
    text: "Допускается 3 касания. Блок считается за полноценное касание.",
  },
];

const DICTIONARY_DATA = [
  {
    term: "🦀 КРАБ",
    desc: "Атака скрюченными пальцами. Позволяет метко перевести мяч, не нарушая правил мягкого касания.",
  },
  {
    term: "🍷 НАКАТИ",
    desc: "Удар с верхним вращением, чтобы мяч резко «нырнул» под сетку или в заднюю линию.",
  },
  {
    term: "📱 ЧЕХОЛ",
    desc: "Блок, после которого мяч прилетает атакующему прямо под ноги или в лицо. Вас «упаковали».",
  },
  {
    term: "🌤️ СКАЙБОЛ",
    desc: "Подача под облака. Пока мяч летит из стратосферы, можно успеть намазаться кремом от загара.",
  },
  {
    term: "🍭 КОНФЕТКА",
    desc: "Идеальная передача от партнера, которая замирает в воздухе прямо под вашу рабочую руку.",
  },
  {
    term: "🍳 СКОВОРОДКА",
    desc: "Удар абсолютно плоской ладонью. Звук как от чугунного сотейника, результат непредсказуем.",
  },
];

export default function InteractiveSection() {
  // Анимация для появления окон
  const windowVariants = {
    hidden: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.3, duration: 0.8, ease: "easeOut" },
    }),
  };

  return (
    <section className="w-full min-h-screen bg-brand-dark flex items-center justify-center relative overflow-hidden py-20 px-6">
      {/* Сетка интерфейса */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-10 items-center w-full max-w-400 z-20">
        {/* --- ЛЕВЫЙ БЛОК: ТЕОРИЯ --- */}
        <motion.div
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={windowVariants}
          className="order-2 lg:order-1 border border-brand-lime/30 rounded-4xl p-6 bg-brand-dark/40 backdrop-blur-sm h-`150` flex flex-col"
        >
          <div className="mb-6">
            <h3 className="heading-1 text-2xl text-brand-lime mb-1 uppercase italic font-black">
              Немного теории
            </h3>
            <div className="w-12 h-1 bg-brand-lime" />
          </div>

          <div className="overflow-y-auto pr-4 space-y-6 custom-scrollbar">
            <div>
              <h4 className="text-white font-bold mb-3 uppercase text-sm tracking-widest opacity-50">
                Правила игры
              </h4>
              <div className="space-y-4">
                {THEORY_DATA.map((item, idx) => (
                  <div
                    key={idx}
                    className="border-l border-brand-lime/20 pl-4 py-1"
                  >
                    <p className="text-brand-lime text-xs font-bold uppercase mb-1">
                      {item.label}
                    </p>
                    <p className="text-white/80 text-sm leading-snug">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="text-white font-bold mb-3 uppercase text-sm tracking-widest opacity-50">
                Интересные факты
              </h4>
              <p className="text-white/70 text-sm italic leading-relaxed">
                Мяч в пляжке больше и мягче (давление 0.175–0.225 кг/см²). Это
                позволяет ему дольше «зависать» в воздухе на ветру.
              </p>
            </div>
          </div>
        </motion.div>

        {/* --- ЦЕНТРАЛЬНЫЙ БЛОК: МЯЧ --- */}
        <div className="order-1 lg:order-2 w-full h-100 lg:w-100 lg:h-150 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="text-white/5 text-[120px] font-black uppercase tracking-tighter select-none rotate-90 lg:rotate-0">
              Mikasa
            </h2>
          </div>
          <Suspense fallback={null}>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <ambientLight intensity={1.5} />
              <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                intensity={2}
              />
              <VolleyballModel position={[0, 0, 0]} scale={2.2} />
              <Environment preset="city" />
              <OrbitControls
                enableZoom={false}
                autoRotate
                autoRotateSpeed={0.5}
              />
              <ContactShadows
                position={[0, -2, 0]}
                opacity={0.4}
                scale={5}
                blur={2.4}
                far={10}
              />
            </Canvas>
          </Suspense>
        </div>

        {/* --- ПРАВЫЙ БЛОК: ГИД ПО ТЕРМИНАМ --- */}
        <motion.div
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={windowVariants}
          className="order-3 border border-brand-lime/30 rounded-4xl p-6 bg-brand-dark/40 backdrop-blur-sm h-150 flex flex-col"
        >
          <div className="mb-6">
            <h3 className="heading-1 text-2xl text-brand-lime mb-1 uppercase italic font-black tracking-tight">
              Гид по терминам
            </h3>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">
              Что они орут на весь пляж
            </p>
          </div>

          <div className="overflow-y-auto pr-4 space-y-4 custom-scrollbar">
            {DICTIONARY_DATA.map((item, idx) => (
              <div
                key={idx}
                className="group p-4 rounded-xl border border-white/5 hover:border-brand-lime/40 transition-all duration-300"
              >
                <span className="text-brand-lime font-black block mb-1 tracking-tighter">
                  {item.term}
                </span>
                <p className="text-white/60 text-xs leading-relaxed group-hover:text-white transition-colors">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Фоновые элементы */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-lime/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-lime/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}

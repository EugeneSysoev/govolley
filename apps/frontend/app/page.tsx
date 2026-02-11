"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IntroSequence from "@/components/IntroSequence";
import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/sections/1 Hero";
import Features from "@/components/sections/2 Features";
import InteractiveSection from "@/components/sections/3 Interactive";

const FAQ_ITEMS = [
  {
    question: "Нужно ли быть профессионалом, чтобы присоединиться?",
    answer:
      "Нет! У нас есть группы для всех уровней — от новичков до опытных игроков. Главное — желание играть и общаться.",
  },
  {
    question: "Что взять с себя на первую тренировку?",
    answer:
      "Спортивную одежду, воду и хорошее настроение. Инвентарь мы предоставляем.",
  },
  {
    question: "Можно ли приходить без пары?",
    answer:
      "Конечно! Мы поможем найти партнера по игре на месте. Именно для этого и создано наше комьюнити.",
  },
  {
    question: "Что делать, если идет дождь?",
    answer:
      "Тренировки переносятся на следующую доступную дату. Мы следим за прогнозом и уведомляем всех участников за 6 часов.",
  },
];

export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Для отладки - логируем изменение состояния introFinished
  useEffect(() => {
    console.log("introFinished changed to:", introFinished);
  }, [introFinished]);

  // Эффект для отслеживания скролла (опционально)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Единый стиль кнопок
  const btnPrimary = "btn btn-primary";
  const btnSecondary = "btn btn-secondary";
  const btnLight = "btn bg-brand-lime text-brand-dark hover:shadow-lg";

  return (
    <main className="min-h-screen bg-brand-lime text-brand-dark selection:bg-brand-dark selection:text-brand-lime font-body">
      <AnimatePresence>
        {!introFinished && (
          <IntroSequence onComplete={() => setIntroFinished(true)} />
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Navbar рендерим сразу, но InteractiveSection — с задержкой */}
        <Navbar introFinished={introFinished} isScrolled={isScrolled} />

        <Hero introFinished={introFinished} />
        <Features />

        {/* Рендерим 3D только если интро закончено И прошло еще немного времени */}
        {introFinished && (
          <Suspense fallback={<div className="h-screen bg-brand-dark" />}>
            <InteractiveSection />
          </Suspense>
        )}

        {/* Секция "Проблема" */}
        <motion.section
          className="py-24 border-t border-brand-dark/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-6">
            <h2 className="heading-2 mb-6">Проблема одиночества</h2>
            <p className="body-large text-brand-dark/70 mb-16 max-w-2xl">
              Как мы меняем правила игры.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div
                className="border border-brand-dark/15 bg-white/50 p-10 rounded-2xl backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="heading-3 mb-8 tracking-tight">Без нас</h3>
                <ul className="space-y-6">
                  {[
                    "Играешь один → Нет прогресса",
                    "Незнакомые партнеры → Нет химии",
                    "Случайные встречи → Нет глубины",
                    "Разные уровни → Нет удовольствия",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start text-xl"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                    >
                      <span className="mr-4 text-2xl font-heading">→</span>
                      <span className="font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                className="border-2 border-brand-dark bg-brand-dark text-brand-lime p-10 rounded-2xl"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="heading-3 mb-8 tracking-tight text-brand-lime">
                  С GoVolley
                </h3>
                <ul className="space-y-6">
                  {[
                    "Команда единомышленников → Быстрый рост",
                    "Постоянные партнеры → Идеальная связь",
                    "Глубокие знакомства → Настоящая дружба",
                    "Сбалансированные группы → Максимум драйва",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start text-xl text-brand-lime"
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    >
                      <span className="mr-4 text-2xl font-heading">→</span>
                      <span className="font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Секция "Для кого" */}
        <motion.section
          className="py-24 border-t border-brand-dark/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-6">
            <h2 className="heading-2 mb-6">Для кого это</h2>
            <p className="body-large text-brand-dark/70 mb-16 max-w-2xl">
              Наше комьюнити объединяет разных людей с общей страстью.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Новички",
                  desc: "Кто хочет научиться с нуля в поддерживающей атмосфере без давления и оценок.",
                },
                {
                  title: "Опытные игроки",
                  desc: "Кто ищет достойных партнеров для игры на результат и участия в турнирах.",
                },
                {
                  title: "Экспаты и путешественники",
                  desc: "Кто хочет быстро влиться в локальное комьюнитети и найти друзей на Пхукете.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="border border-brand-dark/10 bg-white p-10 rounded-3xl hover:shadow-2xl transition-all duration-500 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-full bg-brand-dark/5 mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-dark"></div>
                  </motion.div>
                  <h3 className="heading-3 mb-6">{item.title}</h3>
                  <p className="text-brand-dark/80">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Секция "Форматы" */}
        <motion.section
          className="py-24 border-t border-brand-dark/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-6">
            <h2 className="heading-2 mb-6">Форматы участия</h2>
            <p className="body-large text-brand-dark/70 mb-16 max-w-2xl">
              Выбери свой путь к игре и новым знакомствам.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Разовое участие",
                  features: [
                    "Персональный подход",
                    "Готовое расписание",
                    "Поддержка куратора",
                    "Доступ к событиям",
                  ],
                  cta: "Записаться",
                  popular: false,
                },
                {
                  title: "Базовый",
                  features: [
                    "Персональный подход",
                    "Готовое расписание",
                    "Поддержка куратора",
                    "Доступ к событиям",
                  ],
                  cta: "Выбрать",
                  popular: true,
                },
                {
                  title: "Про",
                  features: [
                    "Персональный подход",
                    "Готовое расписание",
                    "Поддержка куратора",
                    "Доступ к событиям",
                  ],
                  cta: "Выбрать",
                  popular: false,
                },
                {
                  title: "Командный",
                  features: [
                    "Персональный подход",
                    "Готовое расписание",
                    "Поддержка куратора",
                    "Доступ к событиям",
                  ],
                  cta: "Узнать больше",
                  popular: false,
                },
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  className={`border-2 ${plan.popular ? "border-brand-dark bg-brand-dark text-brand-lime" : "border-brand-dark/20 bg-white"} p-10 rounded-3xl hover:shadow-2xl transition-all duration-500`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {plan.popular && (
                    <motion.span
                      className="inline-block px-5 py-2 bg-brand-lime text-brand-dark text-sm font-heading font-semibold uppercase tracking-wider rounded-full mb-8"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", delay: 0.3 }}
                    >
                      Популярный
                    </motion.span>
                  )}
                  <h3 className="heading-3 mb-8">{plan.title}</h3>
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, j) => (
                      <motion.li
                        key={j}
                        className="flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.2 + j * 0.05 }}
                      >
                        <span className="mr-3 text-lg">•</span>
                        <span className="font-medium">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <motion.button
                    className={`w-full ${plan.popular ? btnLight : btnPrimary}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {plan.cta}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Секция "Как это работает" */}
        <motion.section
          className="py-24 border-t border-brand-dark/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-6">
            <h2 className="heading-2 mb-6">Как это работает</h2>
            <p className="body-large text-brand-dark/70 mb-20 max-w-2xl">
              Простой путь от решения до первой игры.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                {
                  step: "01",
                  title: "Выбирай формат",
                  desc: "Подбираем подходящую группу по уровню и целям. Определяем расписание и локацию.",
                },
                {
                  step: "02",
                  title: "Знакомимся с командой",
                  desc: "Присоединяешься к первой тренировке и знакомишься с будущими партнерами по игре.",
                },
                {
                  step: "03",
                  title: "Играешь и развиваешься",
                  desc: "Регулярные тренировки, участие в турнирах и ивентах комьюнити.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                >
                  <div className="text-[5rem] md:text-[6rem] font-heading font-black text-brand-dark/10 mb-8 leading-none">
                    {item.step}
                  </div>
                  <h3 className="heading-3 mb-6">{item.title}</h3>
                  <p className="text-brand-dark/80 body-regular">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          className="py-24 border-t border-brand-dark/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-6">
            <h2 className="heading-2 mb-6">Частые вопросы</h2>
            <p className="body-large text-brand-dark/70 mb-16 max-w-2xl">
              Все, что нужно знать перед первой игрой.
            </p>

            <div className="max-w-3xl">
              {FAQ_ITEMS.map((item, index) => (
                <motion.div
                  key={index}
                  className="border-b border-brand-dark/10 last:border-b-0"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <button
                    className="w-full py-8 text-left flex justify-between items-center hover:bg-brand-dark/5 transition-all duration-300 rounded-xl px-6 group"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="text-xl font-semibold text-left pr-8 group-hover:text-brand-dark transition-colors">
                      {item.question}
                    </span>
                    <motion.span
                      className="text-3xl font-light"
                      animate={{ rotate: openFaq === index ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-10 px-6 text-lg text-brand-dark/80 body-regular">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA секция */}
        <motion.section
          className="py-28 border-t border-brand-dark bg-brand-dark text-brand-lime"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-6 text-center">
            <h2 className="heading-2 mb-10 text-brand-lime">
              Готов найти свою стаю?
            </h2>
            <p className="body-large mb-12 max-w-2xl mx-auto text-brand-lime/90">
              Присоединяйся к крупнейшему пляжному волебольному комьюнити на
              Пхукете
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <motion.button
                className={`${btnLight} px-14`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Записаться на первую тренировку
              </motion.button>
              <motion.button
                className="btn border-2 border-brand-lime text-brand-lime hover:bg-brand-lime hover:text-brand-dark px-14"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Позвонить нам
              </motion.button>
            </div>
            <p className="mt-16 text-sm text-brand-lime/70 tracking-wider">
              Пхукет, Таиланд • +66 12 345 6789 • info@govolley.phuket
            </p>
          </div>
        </motion.section>

        {/* Бегущая строка */}
        <div className="bg-brand-dark text-brand-lime py-5 overflow-hidden border-t border-brand-dark">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="flex gap-16 font-heading font-medium uppercase text-xl tracking-[0.3em]"
          >
            {[...Array(8)].map((_, i) => (
              <span key={i} className="whitespace-nowrap">
                • ИГРАТЬ • ОБЩАТЬСЯ • ЖИТЬ • ПХУКЕТ • GOVOLLEY
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  );
}

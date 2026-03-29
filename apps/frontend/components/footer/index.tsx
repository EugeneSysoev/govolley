"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { NAVIGATION_LINKS, CONTACTS, SCHEDULE, SOCIALS } from "./constants";
import { MarqueeSection } from "./running-line";

// Вспомогательный UI-компонент заголовка
const FooterHeading = ({ children }: { children: React.ReactNode }) => (
  <h4
    className="font-bold text-brand-lime uppercase tracking-[0.2em] opacity-90"
    style={{ fontSize: "clamp(0.8rem, 2vw, 1rem)" }}
  >
    {children}
  </h4>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden mt-10 lg:mt-25 border-t border-white/5">
      {/* 1. БЕГУЩАЯ СТРОКА */}
      <MarqueeSection />

      {/* 2. КОНТЕНТ */}
      <div className="pt-16 pb-8 lg:pt-25 lg:pb-12 bg-[#021524] relative z-10">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 lg:gap-8">
            {/* ЛОГО И СОЦСЕТИ */}
            <div className="col-span-1 lg:col-span-1 flex flex-col items-start lg:items-center -mt-5">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="relative h-40 w-40 lg:h-44 lg:w-44 group mb-4"
              >
                <Image
                  src="/icons/volleyball1.svg"
                  alt="Logo"
                  fill
                  className="object-contain transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-brand-lime/10 blur-3xl -z-10 rounded-full" />
              </motion.div>

              <div className="flex justify-start lg:justify-center space-x-4">
                {SOCIALS.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 ${social.color} hover:text-white hover:border-transparent transition-all duration-300`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* НАВИГАЦИЯ */}
            <div className="space-y-6">
              <FooterHeading>Навигация</FooterHeading>
              <ul className="space-y-4">
                {NAVIGATION_LINKS.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-white/60 font-mono uppercase hover:text-brand-lime transition-colors tracking-wider inline-block"
                      style={{ fontSize: "clamp(0.75rem, 2.5vw, 1rem)" }}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* КОНТАКТЫ */}
            <div className="space-y-6">
              <FooterHeading>Контакты</FooterHeading>
              <ul className="space-y-5 font-mono uppercase">
                {CONTACTS.map((item) => (
                  <li key={item.label} className="flex flex-col space-y-1">
                    <span
                      className="text-brand-lime/40"
                      style={{ fontSize: "clamp(0.6rem, 2vw, 0.75rem)" }}
                    >
                      ✦ {item.label}
                    </span>
                    <a
                      href={item.href}
                      className="text-white/80 hover:text-brand-lime transition-colors wrap-break-words"
                      style={{ fontSize: "clamp(0.75rem, 2.5vw, 1rem)" }}
                    >
                      {item.value}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ВРЕМЯ */}
            <div className="col-span-1 lg:col-span-1 space-y-6 pt-6 lg:pt-0 border-t lg:border-none border-white/5">
              <FooterHeading>Время игры</FooterHeading>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {SCHEDULE.map((group) => (
                  <div
                    key={group.title}
                    className="border-l border-brand-lime/30 pl-4 space-y-1"
                  >
                    <div
                      className="text-white/90 font-mono uppercase font-bold"
                      style={{ fontSize: "clamp(0.75rem, 2vw, 1rem)" }}
                    >
                      {group.title}
                    </div>
                    <div
                      className="text-white/40 font-mono"
                      style={{ fontSize: "clamp(0.75rem, 2vw, 1rem)" }}
                    >
                      {group.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* НИЗ */}
          <div className="border-t border-white/5 font-mono mt-16 lg:mt-20 pt-8 flex justify-between items-center text-[10px] text-white/30 uppercase tracking-[0.2em]">
            <p>© {currentYear} GoVolley</p>
            <p>Phuket, TH</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

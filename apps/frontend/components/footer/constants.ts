import { Send, MessageCircle, Instagram } from "lucide-react";
import React from "react";
import { SocialLink, ContactItem, ScheduleItem } from "./types";

export const MARQUEE_TEXT = "Простой путь от решения до первой игры •";

export const NAVIGATION_LINKS = [
  { name: "Главная", href: "/#" },
  { name: "Немного теории", href: "/#theory" },
  { name: "Словарь пляжника", href: "/#dictionary" },
  { name: "Тренер", href: "/#coach" },
  { name: "Форматы тренировок", href: "/#formats" },
];

export const CONTACTS: ContactItem[] = [
  { label: "Phone", value: "+7 924 537 91 55", href: "tel:+79245379155" },
  { label: "E-mail", value: "sport-eugene@yandex.ru", href: "mailto:sport-eugene@yandex.ru" },
];

export const SCHEDULE: ScheduleItem[] = [
  { title: "Утро", time: "07:30 — 09:30" },
  { title: "Вечер", time: "16:00 — 18:00" },
];

export const SOCIALS: SocialLink[] = [
  { id: "tg", icon: React.createElement(Send, { size: 18 }), href: "https://t.me/eugene_138", color: "hover:bg-[#229ED9]" },
  { id: "wa", icon: React.createElement(MessageCircle, { size: 18 }), href: "https://wa.me/79245379155", color: "hover:bg-[#25D366]" },
  { id: "ig", icon: React.createElement(Instagram, { size: 18 }), href: "https://instagram.com/govolley.phuket", color: "hover:bg-[#E4405F]" },
];
"use client";

import { motion } from "framer-motion";
import { MagneticButton } from "@/components/magnetic-button";
import { Training } from "../types";

const CLAMP_LABEL = "text-[clamp(0.65rem,1.5vw,0.7rem)]";
const CLAMP_VALUE = "text-[clamp(0.85rem,2vw,0.95rem)]";

export function BookingSidebar({ training: t }: { training: Training }) {
  const isFull = t.currentParticipants >= t.maxParticipants;
  const progress = (t.currentParticipants / t.maxParticipants) * 100;

  const formattedDate = new Date(t.date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  const InfoBlock = ({
    label,
    value,
    isAccent = false,
  }: {
    label: string;
    value: string | number;
    isAccent?: boolean;
  }) => (
    <div className="flex flex-col border-l border-white/30 pl-4 py-1">
      <span
        className={`${CLAMP_LABEL} text-white/40 uppercase font-mono tracking-[0.2em] mb-1.5`}
      >
        {label}
      </span>
      <span
        className={`truncate font-bold uppercase tracking-wider ${CLAMP_VALUE} ${
          isAccent ? "text-brand-lime" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-32 bg-white/2 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 md:p-10 flex flex-col shadow-2xl overflow-hidden"
    >
      {/* СЕТКА */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
        <InfoBlock label="Дата" value={formattedDate} />
        <InfoBlock
          label="Время"
          value={`${t.startTime} — ${t.endTime}`}
          isAccent
        />
        <InfoBlock label="Уровень" value={t.targetLevel} />
        <InfoBlock label="Локация" value={t.location} />
        <InfoBlock
          label="Места"
          value={`${t.currentParticipants} / ${t.maxParticipants}`}
          isAccent={!isFull}
        />
        <InfoBlock label="Тренер" value={t.coachName || "—"} />
      </div>

      {/* ПРОГРЕСС-БАР */}
      <div className="mb-10 px-1">
        <div className="h-px w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className={`h-full ${isFull ? "bg-white/40" : "bg-brand-lime"}`}
          />
        </div>
      </div>

      {/* КНОПКА */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-60">
          <MagneticButton strength={0.02}>
            <button
              disabled={isFull}
              className={`btn-nav-premium w-full py-4 text-[10px] flex items-center justify-center text-center tracking-[0.25em] transition-all ${
                isFull ? "opacity-20 pointer-events-none" : ""
              }`}
            >
              {isFull ? "Мест нет" : "Подтвердить"}
            </button>
          </MagneticButton>
        </div>
      </div>
    </motion.div>
  );
}

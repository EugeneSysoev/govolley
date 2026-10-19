"use client";

import { motion } from "framer-motion";
import { Training } from "./types";
import { BookingButton } from "./router-button";

const LEVEL_LABELS: Record<string, string> = {
  NOT_SET: "Не указан",
  BEGINNER: "Начинающий",
  INTERMEDIATE: "Средний",
  ADVANCED: "Продвинутый",
};

interface TrainingCardProps {
  training: Training;
  onEdit: () => void;
  onDelete: () => void;
  userRole?: string;
}

const CLAMP_TITLE = "text-[clamp(1.4rem,3vw,1.8rem)]";
const CLAMP_LABEL = "text-[clamp(0.65rem,1.5vw,0.7rem)]";
const CLAMP_VALUE = "text-[clamp(0.85rem,2vw,0.95rem)]";

export function TrainingCard({
  training: t,
  onEdit,
  onDelete,
  userRole,
}: TrainingCardProps) {
  const isFull = t.currentParticipants >= t.maxParticipants;
  const progress = (t.currentParticipants / t.maxParticipants) * 100;

  const formattedDate = new Date(t.date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  const levelLabel = LEVEL_LABELS[t.targetLevel] || t.targetLevel;
  const canManage = userRole === "COACH" || userRole === "ADMIN";

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
        className={`${CLAMP_LABEL} text-white/40 uppercase font-mono tracking-[0.2em] mb-1.5 drop-shadow-md/50`}
      >
        {label}
      </span>
      <span
        className={`truncate font-bold uppercase drop-shadow-md/50 tracking-wider ${CLAMP_VALUE} ${isAccent ? "text-brand-lime" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-white/2 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col hover:border-brand-lime/20 transition-all duration-500 group relative overflow-hidden w-full mx-auto max-w-137.5"
    >
      {/* Блок управления (только для COACH/ADMIN) */}
      {canManage && (
        <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
            className="text-white/20 transition-colors hover:text-brand-lime"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="text-white/20 transition-colors hover:text-red-500"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      )}

      {/* Заголовок */}
      <div className="mb-5">
        <h3 className={`${CLAMP_TITLE} heading-1 tracking-wide text-white`}>
          {t.title}
        </h3>
      </div>

      {/* Сетка информации */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-5">
        <InfoBlock label="Дата" value={formattedDate} />
        <InfoBlock
          label="Время"
          value={`${t.startTime} — ${t.endTime}`}
          isAccent
        />
        <InfoBlock label="Уровень" value={levelLabel} />
        <InfoBlock label="Локация" value={t.location ?? "Уточняется"} />
        <InfoBlock
          label="Места"
          value={`${t.currentParticipants} / ${t.maxParticipants}`}
          isAccent={!isFull}
        />
        <InfoBlock label="Тренер" value={t.coachName || "—"} />
      </div>

      {/* Прогресс заполнения */}
      <div className="mb-5 px-1">
        <div className="h-px w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className={`h-full ${isFull ? "bg-white/40" : "bg-brand-lime"}`}
          />
        </div>
      </div>

      <BookingButton trainingId={t.id} isFull={isFull} />
    </motion.div>
  );
}

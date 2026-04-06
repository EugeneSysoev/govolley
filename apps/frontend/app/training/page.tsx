"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import GlobalBackground from "@/components/background/global-background";
import { SwipeCalendar } from "./swipe-calendar";
import { TrainingCard } from "./training-card";
import { TrainingModal } from "./training-modal";
import { trainingApi } from "./api";
import { Training } from "./types";

export default function TrainingPage() {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role as string | undefined;

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  // Инициализация даты из localStorage
  const getInitialDate = (): Date => {
    if (typeof window === "undefined") return new Date();
    const stored = localStorage.getItem("training_selected_date");
    if (!stored) return new Date();
    const parsed = new Date(stored);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate);

  // Сохранение даты при изменении
  useEffect(() => {
    localStorage.setItem("training_selected_date", selectedDate.toISOString());
  }, [selectedDate]);

  // Функция загрузки тренировок (была удалена – восстанавливаем)
  const refreshData = async () => {
    try {
      const data = await trainingApi.getAll();
      setTrainings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to refresh data:", err);
      setTrainings([]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Фильтрация тренировок по выбранной дате
  const filteredTrainings = useMemo(() => {
    if (!Array.isArray(trainings)) return [];
    return trainings.filter((t) => {
      if (!t.date) return false;
      return new Date(t.date).toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, trainings]);

  const handleEdit = (t: Training) => {
    setEditingTraining(t);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Удалить эту тренировку?")) {
      try {
        await trainingApi.delete(id);
        await refreshData();
      } catch (err) {
        alert("Ошибка при удалении");
      }
    }
  };

  // Форматирование выбранной даты для отображения
  const formattedDate = selectedDate.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Проверка прав на создание / редактирование
  const canManage = userRole === "COACH" || userRole === "ADMIN";

  // Пока ничего не рендерим, пока сессия загружается (опционально)
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white/60">Загрузка...</div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen pt-30 lg:pt-40 overflow-hidden">
      <GlobalBackground />

      <div className="container relative z-10 mx-auto px-4">
        <header className="mb-2">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-hero2 text-center text-[clamp(3.5rem,8vw,6rem)] text-brand-white block drop-shadow-lg/50 tracking-tight"
          >
            Расписание тренировок
          </motion.h1>
        </header>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/"
              className="group inline-flex items-center mb-2 text-white/40 hover:text-brand-lime transition-colors"
            >
              <span className="mr-2 transition-transform group-hover:-translate-x-2 text-xl">
                ←
              </span>
              <span className="text-[10px] uppercase font-black tracking-[0.2em]">
                На главную
              </span>
            </Link>
          </motion.div>

          {/* Блок выбора даты */}
          <div className="flex items-center justify-between max-w-md mx-auto mt-4 mb-6 px-6 py-4 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex flex-col">
              <span className="text-white font-light text-lg tracking-tight">
                {formattedDate}
              </span>
            </div>

            <button
              onClick={() => setCalendarOpen(true)}
              className="group relative flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-brand-lime rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-lime/50"
              aria-label="Открыть календарь"
            >
              <svg
                className="w-4 h-4 text-white/80 group-hover:text-black transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="hidden sm:inline text-xs font-medium uppercase tracking-wider text-white/80 group-hover:text-black transition-colors">
                Выбрать дату
              </span>
            </button>
          </div>

          {/* Кнопка создания тренировки (только для COACH/ADMIN) */}
          {canManage && (
            <div className="flex justify-center w-full">
              <button
                onClick={() => {
                  setEditingTraining(null);
                  setModalOpen(true);
                }}
                className="mt-4 px-10 py-4 bg-brand-lime text-black font-black uppercase text-[11px] tracking-widest rounded-full hover:scale-105 transition-transform drop-shadow-xl/25"
              >
                + Создать тренировку
              </button>
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 mt-8">
          <AnimatePresence mode="wait">
            {filteredTrainings.length > 0 ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 justify-items-center"
              >
                {filteredTrainings.map((t) => (
                  <TrainingCard
                    key={t.id}
                    training={t}
                    onEdit={() => handleEdit(t)}
                    onDelete={() => handleDelete(t.id)}
                    userRole={userRole} // передаём роль для отображения кнопок
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <EmptyState />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <TrainingModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={refreshData}
          initialData={editingTraining}
          selectedDate={selectedDate}
        />

        <SwipeCalendar
          isOpen={isCalendarOpen}
          onClose={() => setCalendarOpen(false)}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto w-full max-w-2xl py-32 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/2 backdrop-blur-sm">
      <p className="text-brand-lime/80 uppercase font-light tracking-[0.3em] text-[0.8rem]">
        На этот день ничего не запланировано
      </p>
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import GlobalBackground from "@/components/background/global-background";
import { CalendarStrip } from "./calendar-strip";
import { TrainingCard } from "./training-card";
import { TrainingModal } from "./training-modal";
import { trainingApi } from "./api";
import { Training } from "./types";

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);

  // Загрузка данных с защитой от некорректных ответов
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

  const calendarDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
      }),
    [],
  );

  // Защищенная фильтрация
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

  return (
    <main className="relative min-h-screen pt-30 lg:pt-40 pb-20 overflow-hidden">
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

          <CalendarStrip
            dates={calendarDates}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />

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

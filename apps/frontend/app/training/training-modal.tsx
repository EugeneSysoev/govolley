"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Training } from "./types";
import { trainingApi } from "./api";

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Training | null;
  selectedDate: Date;
}

interface FormFieldProps {
  label: string;
  field: keyof Training;
  value: any;
  onChange: (field: keyof Training, value: any) => void;
  required?: boolean;
}

// --- Русские названия уровней (аналогично skillLevelLabels) ---
const LEVEL_LABELS: Record<string, string> = {
  NOT_SET: "Не указан",
  BEGINNER: "Начинающий",
  INTERMEDIATE: "Средний",
  ADVANCED: "Продвинутый",
};

const GROUP_LEVELS = Object.keys(LEVEL_LABELS);
const LOCATIONS = ["Karon Beach", "Kata-Noi Beach", "Nai-Harn beach"];

const FIELD_CLASSES =
  "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-brand-lime outline-none transition-all font-medium placeholder:text-white/5 appearance-none text-[clamp(0.8rem,2vw,1rem)]";

const LABEL_CLASSES =
  "text-[clamp(0.5rem,1.5vw,0.6rem)] uppercase font-medium text-white/50 tracking-[0.2em] ml-2";

const FormInput = ({
  label,
  field,
  type = "text",
  required = false,
  value,
  onChange,
}: FormFieldProps & { type?: string }) => (
  <div className="space-y-1">
    <label className={LABEL_CLASSES}>{label}</label>
    <div className="relative group">
      <input
        type={type}
        required={required}
        className={`${FIELD_CLASSES} ${
          type === "time"
            ? "cursor-pointer scheme-dark [&::-webkit-calendar-picker-indicator]:filter-none [&::-webkit-calendar-picker-indicator]:invert"
            : ""
        }`}
        value={value || ""}
        onChange={(e) =>
          onChange(
            field,
            type === "number" ? Number(e.target.value) : e.target.value,
          )
        }
      />
    </div>
  </div>
);

const FormSelect = ({
  label,
  field,
  options,
  required = false,
  value,
  onChange,
}: FormFieldProps & { options: string[] }) => (
  <div className="space-y-1 relative">
    <label className={LABEL_CLASSES}>{label}</label>
    <div className="relative">
      <select
        required={required}
        className={FIELD_CLASSES}
        value={value || ""}
        onChange={(e) => onChange(field, e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#161618] text-white">
            {LEVEL_LABELS[opt] || opt}
          </option>
        ))}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[10px]">
        ▼
      </div>
    </div>
  </div>
);

export function TrainingModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  selectedDate,
}: TrainingModalProps) {
  const [formData, setFormData] = useState<Partial<Training>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData || {
          title: "",
          location: LOCATIONS[0],
          coachName: "Евгений Сысоев",
          targetLevel: GROUP_LEVELS[0], // "NOT_SET"
          startTime: "07:00",
          endTime: "09:00",
          maxParticipants: 10,
          date: selectedDate.toISOString(),
        },
      );
    }
  }, [isOpen, initialData, selectedDate]);

  const handleChange = (field: keyof Training, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const action = initialData?.id
        ? trainingApi.update(Number(initialData.id), formData)
        : trainingApi.create({ ...formData, date: selectedDate.toISOString() });

      await action;
      onSave();
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      alert("Ошибка при сохранении.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#161618]/80 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="mb-6 block">
              <span className="text-[clamp(1.5rem,4vw,2.2rem)] heading-1 tracking-wide text-brand-lime leading-none block">
                {initialData ? "Редактировать" : "Новая тренировка"}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              <FormInput
                label="Название тренировки"
                field="title"
                required
                value={formData.title || ""}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Уровень группы"
                  field="targetLevel"
                  options={GROUP_LEVELS}
                  required
                  value={formData.targetLevel || "NOT_SET"}
                  onChange={handleChange}
                />
                <FormInput
                  label="Макс. мест"
                  field="maxParticipants"
                  type="number"
                  value={formData.maxParticipants || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Начало"
                  field="startTime"
                  type="time"
                  required
                  value={formData.startTime || ""}
                  onChange={handleChange}
                />
                <FormInput
                  label="Конец"
                  field="endTime"
                  type="time"
                  required
                  value={formData.endTime || ""}
                  onChange={handleChange}
                />
              </div>

              <FormSelect
                label="Локация"
                field="location"
                options={LOCATIONS}
                required
                value={formData.location || ""}
                onChange={handleChange}
              />

              <FormInput
                label="Тренер"
                field="coachName"
                value={formData.coachName || ""}
                onChange={handleChange}
              />

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 text-[clamp(0.6rem,1.5vw,0.7rem)] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-2 btn-nav-premium text-[clamp(0.6rem,1.5vw,0.7rem)] uppercase tracking-[0.2em]"
                >
                  {initialData ? "Обновить данные" : "Создать тренировку"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

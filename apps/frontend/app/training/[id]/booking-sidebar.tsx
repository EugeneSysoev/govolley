"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { MagneticButton } from '@/components/magnetic-button';
import type { Training } from '../types';
import { trainingApi } from '../api';
const CLAMP_LABEL = 'text-[clamp(0.65rem,1.5vw,0.7rem)]';
const CLAMP_VALUE = 'text-[clamp(0.85rem,2vw,0.95rem)]';
const LEVEL_LABELS: Record<string,string> = { NOT_SET: 'Не указан', BEGINNER: 'Новичок', INTERMEDIATE: 'Средний', ADVANCED: 'Продвинутый' };
export function BookingSidebar({ training: initialTraining }: { training: Training }) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [training, setTraining] = useState(initialTraining);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBookedByUser = training.isBooked;
  const isFull = training.currentParticipants >= training.maxParticipants;
  const progress = Math.min(100, training.currentParticipants / training.maxParticipants * 100);
  const formattedDate = new Date(training.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const levelLabel = LEVEL_LABELS[training.targetLevel];
  useEffect(() => {
    const controller = new AbortController();
    setIsFetching(true);
    void trainingApi.get(initialTraining.id, accessToken, controller.signal)
      .then(setTraining).catch(() => { if (!controller.signal.aborted) setError('Не удалось обновить тренировку'); })
      .finally(() => { if (!controller.signal.aborted) setIsFetching(false); });
    return () => controller.abort();
  }, [initialTraining.id, accessToken]);
  const changeBooking = async (cancel: boolean) => {
    if (!accessToken) { setError('Необходимо авторизоваться'); return; }
    setIsLoading(true); setError(null);
    try { setTraining(await (cancel ? trainingApi.unbook(training.id, accessToken) : trainingApi.book(training.id, accessToken))); }
    catch (error) { setError(error instanceof Error ? error.message : 'Не удалось изменить запись'); }
    finally { setIsLoading(false); }
  };
  const handleBooking = () => changeBooking(false);
  const handleCancel = () => changeBooking(true);
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
      animate={{ opacity: isFetching ? 0.7 : 1, x: 0 }}
      className="sticky top-32 bg-white/2 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 md:p-10 flex flex-col shadow-2xl overflow-hidden"
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
        <InfoBlock label="Дата" value={formattedDate} />
        <InfoBlock
          label="Время"
          value={`${training.startTime} — ${training.endTime}`}
          isAccent
        />
        <InfoBlock label="Уровень" value={levelLabel} />
        <InfoBlock label="Локация" value={training.location ?? "Уточняется"} />
        <InfoBlock
          label="Места"
          value={`${training.currentParticipants} / ${training.maxParticipants}`}
          isAccent={!isFull}
        />
        <InfoBlock label="Тренер" value={training.coachName || "—"} />
      </div>

      <div className="mb-10 px-1">
        <div className="h-px w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`h-full ${isFull ? "bg-white/40" : "bg-brand-lime"}`}
          />
        </div>
      </div>

      {error && <p role="alert" className="text-red-400 mb-4">{error}</p>}
      <div className="flex justify-center w-full">
        <div className="w-55">
          <MagneticButton>
            <button
              onClick={isBookedByUser ? handleCancel : handleBooking}
              disabled={isLoading || (!isBookedByUser && (isFull || !training.isActive))}
              className={`
                btn-nav-premium w-full h-13.5 relative
                flex items-center justify-center
                text-[10px] tracking-[0.25em] uppercase
                transition-all
                ${isBookedByUser ? "opacity-80" : ""}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <span className="invisible whitespace-nowrap px-4">
                Отменить запись
              </span>

              <span className="absolute inset-0 flex items-center justify-center px-4 whitespace-nowrap">
                {isLoading
                  ? "Обработка..."
                  : isBookedByUser
                    ? "Отменить запись"
                    : !training.isActive
                      ? "Тренировка отменена"
                    : isFull
                      ? "Мест нет"
                      : "Подтвердить"}
              </span>
            </button>
          </MagneticButton>
        </div>
      </div>
    </motion.div>
  );
}

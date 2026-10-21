"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
  forwardRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { schoolDateKey } from '@govolley/shared-types';
import { formatSchoolDate, SCHOOL_TIME_LABEL } from '@/lib/training-display';

// A stable midday instant keeps UTC arithmetic on the same Bangkok calendar day.
const calendarDay = (value: Date) => new Date(`${schoolDateKey(value)}T12:00:00Z`);

interface SwipeCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

interface DayItemData {
  date: Date;
  timestamp: string;
  day: number;
  weekday: string;
  key: string;
}

const generateDateRange = (
  centerDate: Date,
  daysRange: number,
): DayItemData[] => {
  const dates: DayItemData[] = [];
  const start = calendarDay(centerDate);
  start.setUTCDate(start.getUTCDate() - daysRange);

  for (let i = 0; i <= daysRange * 2; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);

    dates.push({
      date: d,
      timestamp: schoolDateKey(d),
      day: d.getUTCDate(),
      weekday: formatSchoolDate(d, { weekday: "short" }),
      key: schoolDateKey(d),
    });
  }

  return dates;
};

/* ===================== DAY ITEM ===================== */

const DayItem = memo(
  forwardRef<
    HTMLButtonElement,
    { item: DayItemData; isActive: boolean; onClick: () => void }
  >(({ item, isActive, onClick }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={item.key}
        aria-pressed={isActive}
        onClick={onClick}
        className={`
            relative shrink-0 w-20 h-20 rounded-3xl flex flex-col items-center justify-center
            transition-all duration-200 border select-none
            ${
              isActive
                ? "bg-brand-lime text-brand-dark border-brand-lime scale-110 shadow-lg"
                : "bg-white/10 border-white/20 text-white/80 hover:border-brand-lime/40 hover:text-white hover:scale-105"
            }
          `}
      >
        <span className="text-xl font-black leading-none">{item.day}</span>
        <span className="text-[11px] uppercase mt-1 opacity-60 font-bold">
          {item.weekday}
        </span>
      </button>
    );
  }),
);

/* ===================== MAIN ===================== */

export function SwipeCalendar({
  isOpen,
  onClose,
  selectedDate,
  onSelect,
}: SwipeCalendarProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [dates] = useState(() => generateDateRange(new Date(), 180));
  const [activeIndex, setActiveIndex] = useState(0);
  const [tempSelected, setTempSelected] = useState<Date>(() => calendarDay(selectedDate));

  /* ===== months ===== */
  const uniqueMonths = useMemo(() => {
    const map = new Map();

    dates.forEach((d) => {
      const key = `${d.date.getUTCFullYear()}-${d.date.getUTCMonth()}`;
      if (!map.has(key)) {
        map.set(key, {
          year: d.date.getUTCFullYear(),
          month: d.date.getUTCMonth(),
          label: formatSchoolDate(d.date, {
              month: "long",
              year: "numeric",
            })
            .replace(" г.", ""),
        });
      }
    });

    return Array.from(map.values());
  }, [dates]);

  /* ===== sync open ===== */
  useEffect(() => {
    if (!isOpen) return;

    const ts = schoolDateKey(selectedDate);

    const idx = dates.findIndex((d) => d.timestamp === ts);

    if (idx !== -1) {
      setActiveIndex(idx);
      setTempSelected(calendarDay(selectedDate));
    }
  }, [isOpen, selectedDate, dates]);

  /* ===== scroll to active day ===== */
  useEffect(() => {
    const activeElement = dayRefs.current[activeIndex];
    if (activeElement && viewportRef.current) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [activeIndex]);

  /* ===== handlers ===== */
  const handleSelect = useCallback(
    (idx: number) => {
      setActiveIndex(idx);
      setTempSelected(dates[idx].date);
    },
    [dates],
  );

  const goToMonth = useCallback(
    (year: number, month: number) => {
      const index = dates.findIndex(
        (d) => d.date.getUTCFullYear() === year && d.date.getUTCMonth() === month,
      );

      if (index !== -1) {
        setActiveIndex(index);
        setTempSelected(dates[index].date);
      }
    },
    [dates],
  );

  const goToPrevMonth = useCallback(() => {
    const key = `${tempSelected.getUTCFullYear()}-${tempSelected.getUTCMonth()}`;
    const idx = uniqueMonths.findIndex((m) => `${m.year}-${m.month}` === key);

    if (idx > 0) {
      const prev = uniqueMonths[idx - 1];
      goToMonth(prev.year, prev.month);
    }
  }, [tempSelected, uniqueMonths, goToMonth]);

  const goToNextMonth = useCallback(() => {
    const key = `${tempSelected.getUTCFullYear()}-${tempSelected.getUTCMonth()}`;
    const idx = uniqueMonths.findIndex((m) => `${m.year}-${m.month}` === key);

    if (idx !== -1 && idx < uniqueMonths.length - 1) {
      const next = uniqueMonths[idx + 1];
      goToMonth(next.year, next.month);
    }
  }, [tempSelected, uniqueMonths, goToMonth]);

  const activeTs = schoolDateKey(tempSelected);

  /* ===================== RENDER ===================== */

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-4xl bg-white/5 backdrop-blur-2xl border border-white/20 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button onClick={goToPrevMonth} className="text-white text-xl">
                  ←
                </button>

                <select
                  aria-label="Месяц по Пхукету"
                  value={`${tempSelected.getUTCFullYear()}-${tempSelected.getUTCMonth()}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split("-").map(Number);
                    goToMonth(year, month);
                  }}
                  className="bg-white/10 text-white rounded-lg px-2 py-1"
                >
                  {uniqueMonths.map(({ year, month, label }) => (
                    <option
                      key={`${year}-${month}`}
                      value={`${year}-${month}`}
                      className="bg-gray-900 text-white border border-white/20 rounded-lg px-2 py-1 text-sm font-mono font-extralight uppercase focus:outline-none cursor-pointer"
                    >
                      {label}
                    </option>
                  ))}
                </select>

                <button onClick={goToNextMonth} className="text-white text-xl">
                  →
                </button>
              </div>

              <button onClick={onClose} className="text-white/80 text-sm">
                Закрыть
              </button>
            </div>

            {/* calendar */}
            <div ref={viewportRef} className="overflow-hidden py-8">
              <motion.div
                drag="x"
                dragMomentum={false}
                className="cursor-grab active:cursor-grabbing"
              >
                <div
                  ref={dragContainerRef}
                  className="flex gap-5 px-6"
                  style={{ width: "max-content" }}
                >
                  {dates.map((item, idx) => (
                    <DayItem
                      key={item.key}
                      ref={(el) => {
                        dayRefs.current[idx] = el;
                      }}
                      item={item}
                      isActive={item.timestamp === activeTs}
                      onClick={() => handleSelect(idx)}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <span className="text-white/40 text-xs">
                {SCHOOL_TIME_LABEL}. Потяните для навигации
              </span>
              <button
                onClick={() => {
                  onSelect(tempSelected);
                  onClose();
                }}
                className="px-6 py-2 rounded-xl bg-brand-lime text-brand-dark font-bold uppercase tracking-wide hover:scale-105 transition"
              >
                Выбрать
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

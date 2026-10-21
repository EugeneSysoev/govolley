"use client";
import Link from "next/link";

import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Clock, MapPin } from "lucide-react";
import { Booking } from "./profile-types";
import { formatSchoolDate, locationLabel, SCHOOL_TIME_LABEL } from '@/lib/training-display';

interface ProfileBookingsProps {
  bookings: Booking[];
  initialLimit?: number; // количество отображаемых по умолчанию
}

const formatDate = (dateString: string): string => {
  if (!dateString) return "Дата неизвестна";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Дата неизвестна";
    return formatSchoolDate(date, { day: "numeric", month: "long" });
  } catch {
    return "Дата неизвестна";
  }
};

export function ProfileBookings({
  bookings,
  initialLimit = 3,
}: ProfileBookingsProps) {
  const [showAll, setShowAll] = useState(false);

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return (
      <div className="mt-12">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-[clamp(1.2rem,3vw,1.8rem)] font-black text-white tracking-wide uppercase">
            Мои тренировки
          </h3>
          <span className="bg-white/10 text-white/50 px-3 py-1 rounded-full text-xs font-mono font-bold border border-white/5">
            0
          </span>
        </div>
        <div className="bg-white/2 backdrop-blur-sm rounded-4xl p-10 text-center border border-dashed border-white/10">
          <p className="text-brand-lime/50 uppercase font-mono tracking-[0.2em]">
            Пока нет активных бронирований
          </p>
        </div>
      </div>
    );
  }

  const displayedBookings = showAll
    ? bookings
    : bookings.slice(0, initialLimit);
  const hasMore = bookings.length > initialLimit;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-[clamp(1.2rem,3vw,1.8rem)] font-black text-white tracking-wide uppercase">
          Мои тренировки
        </h3>
        <span className="bg-white/10 text-white/50 px-3 py-1 rounded-full text-xs font-mono font-bold border border-white/5">
          {bookings.length}
        </span>
      </div>

      <p className="text-white/50 text-xs mb-4">{SCHOOL_TIME_LABEL}</p>
      <div className="grid grid-cols-1 gap-4">
        {displayedBookings.map((booking) => {
          const { training, status } = booking;
          const isConfirmed = status === "CONFIRMED";
          const formattedDate = formatDate(training?.date);

          return (
            <div
              key={booking.id}
              className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[1.5rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-lime/30 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex-1">
                <h4 className="text-[clamp(1.2rem,2vw,1.8rem)] font-bold text-white mb-2 tracking-wide">
                  <Link href={`/training/${training.id}`}>{training.title || "Без названия"}</Link>
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[clamp(0.7rem,1.5vw,0.8rem)] font-mono uppercase tracking-widest text-white/40">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-lime" />
                    <span className="text-brand-lime">{formattedDate}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{training.startTime} — {training.endTime}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-37.5 sm:max-w-none">
                      {locationLabel(training?.location)}
                    </span>
                  </div>
                </div>
              </div>

              <Link href={`/training/${training.id}`} className="text-brand-lime text-xs">Детали и отмена записи →</Link>
              <div
                className={`shrink-0 px-4 py-2 rounded-full border text-[0.65rem] uppercase font-black tracking-[0.2em] transition-colors ${
                  isConfirmed
                    ? "bg-brand-lime/10 border-brand-lime/20 text-brand-lime group-hover:bg-brand-lime/20"
                    : "bg-red-500/10 border-red-500/20 text-red-400 group-hover:bg-red-500/20"
                }`}
              >
                {isConfirmed ? "Подтверждено" : "Отменено"}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-6 mx-auto flex items-center gap-2 px-6 py-2 rounded-full border border-brand-lime/30 text-brand-lime text-xs font-mono uppercase tracking-wider hover:bg-brand-lime/10 transition-all"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Скрыть
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Показать все ({bookings.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}

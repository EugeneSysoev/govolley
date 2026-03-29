"use client";

interface CalendarStripProps {
  dates: Date[];
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export function CalendarStrip({ dates, selectedDate, onSelect }: CalendarStripProps) {
  const currentMonthYear = selectedDate.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  }).replace(" г.", "");

  return (
    <div className="space-y-2 w-full">
      {/* Заголовок месяца и года */}
      <div className="flex items-center gap-6 max-w-4xl mx-auto px-4">
        <div className="h-px grow bg-linear-to-r from-transparent to-brand-lime/70" />
        <h2 
          className="uppercase font-mono tracking-[0.2em] text-brand-lime whitespace-nowrap drop-shadow-md/50"
          style={{ fontSize: "clamp(0.9em, 2vw, 1em)" }} 
        >
          {currentMonthYear}
        </h2>
        <div className="h-px grow bg-linear-to-l from-transparent to-brand-lime/70" />
      </div>

      {/* Лента кнопок */}
      <div className="flex justify-center w-full">
        {/* Добавлен класс no-scrollbar */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-4 scroll-smooth md:justify-center w-full items-center">
          {dates.map((date, i) => {
            const isActive = date.toDateString() === selectedDate.toDateString();
            
            return (
              <button
                key={i}
                onClick={() => onSelect(date)}
                className={`shrink-0 w-11 h-11 rounded-2xl md:w-15 md:h-15 md:rounded-[1.5rem] flex flex-col items-center justify-center transition-all duration-500 border ${
                  isActive
                    ? "bg-brand-lime border-brand-lime text-brand-dark scale-110 "
                    : "bg-white/5 border-white/10 text-white/40 hover:border-brand-lime/40 hover:text-white"
                }`}
              >
                {/* Дата */}
                <span 
                  className="font-black leading-none tracking-tighter"
                  style={{ fontSize: "clamp(0.3em, 3vw, 1em)" }} 
                >
                  {date.getDate()}
                </span>
                
                {/* День недели */}
                <span 
                  className="uppercase font-black leading-none mt-1 opacity-60 tracking-widest"
                  style={{ fontSize: "clamp(0.2em, 3vw, 0.8em)" }}
                >
                  {date.toLocaleDateString("ru-RU", { weekday: "short" })}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
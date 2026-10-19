"use client";
import type { ProfileUser } from "./profile-types";

const skillLevelLabels: Record<string, string> = {
  NOT_SET: "Не указан",
  BEGINNER: "Новичок",
  INTERMEDIATE: "Средний",
  ADVANCED: "Продвинутый",
};

interface ProfileStatsProps {
  user?: ProfileUser;
  userRole: string;
  onVerify: () => void;
  isVerifying: boolean;
}

export function ProfileStats({
  user,
  userRole,
  onVerify,
  isVerifying,
}: ProfileStatsProps) {
  const InfoLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[clamp(0.65rem,1.5vw,0.7rem)] text-white/40 uppercase font-mono tracking-[0.2em] mb-1.5 drop-shadow-md/50 block">
      {children}
    </span>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-white/10 pt-8">
      <div className="flex flex-col border-l border-white/30 pl-4 py-1">
        <div className="flex items-center justify-between mb-2">
          <InfoLabel>Уровень игры</InfoLabel>
          {user?.isLevelVerified && (
            <span className="text-[10px] uppercase font-black tracking-widest text-brand-lime bg-brand-lime/10 px-3 py-1 rounded-full border border-brand-lime/20">
              ✓
            </span>
          )}
        </div>

        {/* Всегда показываем уровень без возможности редактирования */}
        <span className="truncate font-bold uppercase drop-shadow-md/50 tracking-wider text-[clamp(1rem,2vw,1.2rem)] text-white">
          {skillLevelLabels[user?.skillLevel ?? "NOT_SET"] || "—"}
        </span>

        {(userRole === "COACH" || userRole === "ADMIN") &&
          !user?.isLevelVerified && (
            <button
              onClick={onVerify}
              disabled={isVerifying}
              className="mt-4 px-6 py-2 bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-brand-lime hover:text-black transition-colors"
            >
              {isVerifying ? "Обработка..." : "Подтвердить уровень"}
            </button>
          )}
      </div>

      <div className="flex flex-col border-l border-white/30 pl-4 py-1">
        <InfoLabel>Баланс тренировок</InfoLabel>
        <span className="font-bold uppercase drop-shadow-md/50 tracking-wider text-[clamp(1.5rem,3vw,2rem)] text-brand-lime leading-none mt-1">
          {user?.balance || 0}
        </span>
      </div>
    </div>
  );
}

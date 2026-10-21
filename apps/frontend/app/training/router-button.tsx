"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/magnetic-button";

interface BookingButtonProps {
  trainingId: number;
  isFull: boolean;
  isLoading?: boolean;
}

export function BookingButton({
  trainingId,
  isFull,
  isLoading = false,
}: BookingButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (isLoading) return;
    router.push(`/training/${trainingId}`);
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-55">
        <MagneticButton>
          <motion.button
            onClick={handleClick}
            disabled={isLoading}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className={`
              btn-nav-premium
              w-full h-13.5
              relative flex items-center justify-center

              text-[10px] tracking-[0.25em] uppercase

              transition-all duration-300 ease-out
              will-change-transform

              disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            {/* Эталон ширины (самый длинный текст) */}
            <span className="invisible whitespace-nowrap px-4">
              Отменить запись
            </span>

            {/* ТЕКСТ */}
            <span
              className={`
                absolute inset-0 flex items-center justify-center px-4
                transition-opacity duration-200
                whitespace-nowrap
                ${isLoading ? "opacity-0" : "opacity-100"}
              `}
            >
              {isFull ? "Посмотреть детали" : "Выбрать тренировку"}
            </span>

            {/* LOADER */}
            <span
              className={`
                absolute inset-0 flex items-center justify-center
                transition-opacity duration-200
                ${isLoading ? "opacity-100" : "opacity-0"}
              `}
            >
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-white" />
              </span>
            </span>
          </motion.button>
        </MagneticButton>
      </div>
    </div>
  );
}

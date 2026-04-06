"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoModalProps {
  isOpen: boolean;
  photoUrl: string | null;
  onClose: () => void;
}

export function PhotoModal({ isOpen, photoUrl, onClose }: PhotoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!photoUrl) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фотографии"
          onClick={onClose} // Закрытие по клику на фон
        >
          {/* Затемнение */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Контейнер изображения — тоже закрывает по клику */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex items-center justify-center w-full h-full"
            onClick={onClose} // Закрытие по клику на фото
          >
            <img
              src={photoUrl}
              alt="Увеличенное фото"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/800x600?text=Ошибка+загрузки";
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

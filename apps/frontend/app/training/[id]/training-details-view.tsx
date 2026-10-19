"use client";

import { motion } from "framer-motion";

interface TrainingLocationViewProps {
  name: string;
  image?: string;
  googleUrl?: string;
  fullHeight?: boolean; // Добавляем определение пропса
}

const CLAMP_LABEL = "text-[clamp(0.7rem,1.5vw,0.85rem)]";
const CLAMP_TITLE = "text-[clamp(1.5rem,4vw,3rem)]";
const CLAMP_LINK = "text-[clamp(0.65rem,1.2vw,0.8rem)]";

export function TrainingLocationView({
  name,
  image,
  googleUrl,
  fullHeight, // Деструктурируем
}: TrainingLocationViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`group relative w-full bg-white/5 rounded-[3.5rem] overflow-hidden border border-white/20 shadow-2xl 
        ${fullHeight ? "h-full min-h-100" : "aspect-video"}`} 
    >
      {/* Фоновое изображение */}
      <div className="absolute inset-0 z-0">
        {image && <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-all duration-1000 scale-110 group-hover:scale-100 opacity-60"
        />}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent opacity-90" />
      </div>

      {/* Информационный контент */}
      <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-10 pr-12">
        <p className={`${CLAMP_LABEL} font-mono uppercase tracking-[0.3em] text-brand-lime mb-3 font-bold`}>
          Место проведения
        </p>

        <h2 className={`${CLAMP_TITLE} font-black uppercase tracking-tighter text-white leading-none mb-4 md:mb-6`}>
          {name}
        </h2>

        {googleUrl && (
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center ${CLAMP_LINK} font-black text-brand-lime hover:text-white transition-all tracking-[0.2em] group/link`}
          >
            <span className="border-b border-brand-lime/30 pb-1 font-mono group-hover/link:border-white transition-colors">
              ОТКРЫТЬ В GOOGLE MAPS ↗
            </span>
          </a>
        )}
      </div>
    </motion.div>
  );
}

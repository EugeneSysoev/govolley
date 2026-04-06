"use client";

import { motion } from "framer-motion";

interface SectionDividerProps {
  image: string;
  text1: string;
  text2: string;
}

export default function SectionDivider({
  image,
  text1,
  text2,
}: SectionDividerProps) {
  const clipPathShape = "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)";

  return (
    <div
      className="relative w-full h-[30vh] md:h-[40vh]"
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 5%)",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 10%)",
      }}
    >
      {/* Лаймовая подложка (бордер) */}
      <div
        className="absolute inset-0 bg-brand-lime/80"
        style={{ clipPath: clipPathShape }}
      >
        {/* Контейнер с картинкой */}
        <div
          className="relative w-full"
          style={{
            clipPath: clipPathShape,
            height: "calc(100% - 1px)",
          }}
        >
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${image})`,
              backgroundAttachment: "fixed",
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Затемнение фона */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Центрированный текст через пропсы */}
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center relative"
              >
                <h2 className="font-bold tracking-tight leading-[0.9] uppercase text-brand-white text-[clamp(0.8rem,4vw,2rem)] text-shadow-lg/25">
                  {text1} <br />
                  <span className="text-brand-lime">{text2}</span>
                </h2>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

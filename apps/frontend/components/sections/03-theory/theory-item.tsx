"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import PremiumWordPullUp from "@/components/magicui/word-pull-up";
import { TheoryItemType } from "./constants";

interface TheoryItemProps {
  item: TheoryItemType;
  index: number;
}

const TheoryItem = memo(({ item, index }: TheoryItemProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        ease: "easeOut",
      }}
      className="relative group flex flex-col items-center text-center w-full cursor-pointer will-change-transform"
    >
      <div className="mb-3 w-full">
        <PremiumWordPullUp
          words={item.label}
          className="heading-1 font-medium text-[clamp(0.8rem,4vw,1.5rem)] text-brand-lime drop-shadow-md/50 justify-center block"
          delayMultiple={0.2}
          start={inView} // ← запуск только когда карточка в зоне видимости
        />
      </div>

      {/* Линия */}
      <div className="relative w-full flex justify-center mb-4 px-2">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: 0.1 + index * 0.1, duration: 0.2 }}
          className="relative w-12 h-0.5 bg-brand-lime transition-all duration-500 ease-in-out origin-center group-hover:w-2/3 shadow-[0_0_10px_rgba(194,255,63,0.4)]"
        />
      </div>

      <div>
        <PremiumWordPullUp
          words={item.text}
          className="text-[clamp(0.15rem,2.1vw,0.8rem)] text-white/80 drop-shadow-md/50 justify-center transition-colors duration-300 group-hover:text-white"
          delayMultiple={0.035}
          start={inView} // ← аналогично
        />
      </div>
    </motion.div>
  );
});

TheoryItem.displayName = "TheoryItem";
export default TheoryItem;

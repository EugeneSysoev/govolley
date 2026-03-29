"use client";

import { motion } from "framer-motion";

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  features: string[];
  index: number;
}

export const PricingCard = ({
  title,
  subtitle,
  price,
  features,
  index,
}: PricingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        opacity: { duration: 0.8, delay: index * 0.2 },
        default: { ease: [0.21, 0.47, 0.32, 0.98], duration: 0.8 },
      }}
      className="group relative flex-1 flex flex-col justify-between p-6 md:p-10 rounded-3xl border border-brand-lime/30 bg-transparent text-white transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-brand-lime hover:text-black lg:hover:flex-[1.6] cursor-pointer overflow-hidden"
    >
      {/* ВЕРХНЯЯ ЧАСТЬ */}
      <div className="relative z-10">
        <p className="text-[clamp(0.8rem,1.2vw,0.85rem)] tracking-[0.2em] opacity-60 group-hover:text-black transition-colors font-mono uppercase mb-6 lg:mb-10">
          {subtitle}
        </p>

        <h3 className="text-[clamp(3.5rem,5vw,4.2rem)] heading-hero2 mb-6 text-brand-lime group-hover:text-black leading-none">
          <span className="text-brand-lime group-hover:text-black transition-colors animate-pulse">
            ✦{" "}
          </span>
          {title}
        </h3>

        <ul className="space-y-4 lg:space-y-5">
          {features.map((feature, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-[clamp(0.6rem,1.5vw,0.75rem)] group-hover:opacity-100 transition-opacity leading-snug font-medium"
            >
              <span className="opacity-40 group-hover:text-black">•</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* НИЖНЯЯ ЧАСТЬ */}
      <div className="relative z-10 flex flex-row items-center justify-between gap-2 pt-6 mt-8 border-t border-brand-lime/20 group-hover:border-black/10 transition-colors">
        <div className="text-[clamp(2.5rem,4vw,3.3rem)] heading-hero2 leading-none">
          {price}
        </div>
      </div>
    </motion.div>
  );
};

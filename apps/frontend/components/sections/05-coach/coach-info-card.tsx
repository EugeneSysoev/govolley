"use client";

import { memo } from "react";
import PremiumWordPullUp from "@/components/magicui/word-pull-up";

interface CoachInfoCardProps {
  items: string[];
  className?: string;
}

export const CoachInfoCard = memo(
  ({ items, className }: CoachInfoCardProps) => (
    <div className="md:space-y-3 space-y-1 w-full mb-6">
      {items.map((text, idx) => (
        <div key={idx} className="flex justify-start">
          <PremiumWordPullUp
            words={text}
            className={`text-start text-light drop-shadow-md/50 md:leading-relaxed group-hover:text-white transition-colors duration-300 text-[clamp(0.7rem,1.5vw,0.7rem)] ${className}`}
            delayMultiple={0.06}
          />
        </div>
      ))}
    </div>
  ),
);

CoachInfoCard.displayName = "CoachInfoCard";

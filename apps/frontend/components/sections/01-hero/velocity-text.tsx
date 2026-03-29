"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface ParallaxProps {
  children: string;
  baseVelocity: number;
  className?: string;
}

function ParallaxText({
  children,
  baseVelocity = 100,
  className,
}: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap py-4 select-none pointer-events-none">
      <motion.div
        className="flex whitespace-nowrap flex-nowrap"
        style={{
          x,
          translateZ: 0,
          perspective: "1000px",
          backfaceVisibility: "hidden",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`${className} block will-change-transform`}
            style={{ paddingRight: "1.2rem" }}
          >
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function VelocityText({
  text1,
  text2,
}: {
  text1: string;
  text2: string;
}) {
  return (
    <div>
      <ParallaxText
        baseVelocity={-1}
        className="text-brand-lime heading-1 tracking-wider text-[clamp(1.5rem,3vw,1.5rem)] [word-spacing:0.8rem] md:[word-spacing:1.2rem]"
      >
        {text1}
      </ParallaxText>

      <div className="-mt-5">
        <ParallaxText
          baseVelocity={1}
          className="text-brand-white heading-hero2 text-[clamp(2.5rem,6vw,2.5rem)] leading-[0.4] [word-spacing:0.4rem] md:[word-spacing:0.6rem]"
        >
          {text2}
        </ParallaxText>
      </div>
    </div>
  );
}

"use client";

import { useRef, useEffect } from "react";
import { motion, MotionValue, useInView } from "framer-motion";

interface HeroBackgroundProps {
  y: MotionValue<string>;
}

const VIDEO_SRC = "/videos/hero-optimized.webm";

export const HeroBackground = ({ y }: HeroBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { amount: 0.1, once: false });

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play().catch((err) => {
          console.warn("Autoplay was prevented:", err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView]);

  return (
    <motion.div
      style={{ y, translateZ: 0 }}
      className="absolute inset-0 z-0 will-change-transform overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        style={{ backfaceVisibility: "hidden" }}
      />
    </motion.div>
  );
};

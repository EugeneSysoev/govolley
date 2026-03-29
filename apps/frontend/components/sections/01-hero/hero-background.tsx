"use client";

import { useState, useRef } from "react";
import { motion, MotionValue } from "framer-motion";

interface HeroBackgroundProps {
  y: MotionValue<string>;
}

const VIDEOS = ["/photos/v1.mp4", "/photos/v2.mp4", "/photos/v3.mp4"];

export const HeroBackground = ({ y }: HeroBackgroundProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    setCurrentIndex((prev) => (prev + 1) % VIDEOS.length);
  };

  return (
    <motion.div
      style={{ y, translateZ: 0 }}
      className="absolute inset-0 z-0 will-change-transform overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        src={VIDEOS[currentIndex]}
        autoPlay
        muted
        loop={false}
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
        className="absolute inset-0 w-full h-full object-cover opacity-60 contrast-[1.1] brightness-[1.1]"
        style={{ backfaceVisibility: "hidden" }}
      />
    </motion.div>
  );
};

"use client";

import { useRef, useEffect, useState } from "react";
import { motion, MotionValue, useInView } from "framer-motion";

interface HeroBackgroundProps {
  y: MotionValue<string>;
}

const VIDEO_SRC = "/videos/hero-optimized.webm";
const POSTER_SRC = "/videos/hero-poster.jpg";

export const HeroBackground = ({ y }: HeroBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  const isInView = useInView(containerRef, { amount: 0.1 });

  // Предзагрузка видео в фоне
  useEffect(() => {
    if (!window.__heroVideoPreloaded) {
      const preloadVideo = document.createElement("video");
      preloadVideo.src = VIDEO_SRC;
      preloadVideo.preload = "auto";
      preloadVideo.muted = true;
      preloadVideo.style.display = "none";
      document.body.appendChild(preloadVideo);
      window.__heroVideoPreloaded = true;
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setShowVideo(true);
    video.addEventListener("canplay", handleCanPlay);

    if (isInView && video.paused) {
      video.play().catch(() => {});
    } else if (!isInView && !video.paused) {
      video.pause();
    }

    return () => video.removeEventListener("canplay", handleCanPlay);
  }, [isInView]);

  return (
    <motion.div
      ref={containerRef}
      style={{ y }}
      className="absolute inset-0 z-0 overflow-hidden bg-black will-change-transform"
    >
      {/* Постер (заглушка) – показывается, пока видео не готово */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: showVideo ? 0 : 1 }}
      >
        <img
          src={POSTER_SRC}
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Видео – появляется, когда готово */}
      <motion.video
        ref={videoRef}
        src={VIDEO_SRC}
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full opacity-60"
        style={{
          backfaceVisibility: "hidden",
          objectFit: "cover",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: showVideo ? 0.6 : 0 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
};

declare global {
  interface Window {
    __heroVideoPreloaded?: boolean;
  }
}

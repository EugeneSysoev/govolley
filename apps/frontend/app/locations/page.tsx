"use client";

import dynamic from "next/dynamic";
import GlobalBackground from "@/components/background/global-background";
import { motion } from "framer-motion";
import Link from "next/link";

const LocationMap = dynamic(
  () => import("./locations-map").then((mod) => mod.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-130 w-full bg-white/5 animate-pulse rounded-[40px]" />
    ),
  },
);

export default function LocationsPage() {
  return (
    <main className="relative min-h-screen pt-30 lg:pt-40 overflow-hidden">
      <GlobalBackground />

      <div className="container relative z-10 mx-auto px-4">
        <header className="mb-5">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-hero2 text-center text-[clamp(4.6rem,10vw,6rem)] text-brand-white block drop-shadow-lg/50 tracking-tight"
          >
            Наши локации
          </motion.h1>
        </header>

        <div className="mb-4">
          <Link
            href="/"
            className="group inline-flex items-center text-white/40 hover:text-brand-lime transition-colors"
          >
            <span className="mr-2 transition-transform group-hover:-translate-x-2 text-xl">
              ←
            </span>
            <span className="text-[clamp(0.5rem,1vw,0.625rem)] uppercase font-black tracking-[0.2em]">
              На главную
            </span>
          </Link>
        </div>

        <LocationMap />
      </div>
    </main>
  );
}

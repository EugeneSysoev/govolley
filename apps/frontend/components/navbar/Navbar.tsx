"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import NextImage from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import RollingLink from "@/components/navbar/rolling-link";
import WeatherWidget from "@/components/navbar/weather-widget";
import { MagneticButton } from "@/components/magnetic-button";
import { MobileMenu } from "@/components/navbar/mobile-menu";

interface NavbarProps {
  introFinished: boolean;
  isScrolled?: boolean;
}

const NAV_LINKS = [
  { name: "Главная", href: "/#" },
  { name: "Тренировки", href: "/training" },
  { name: "Площадки", href: "/locations" },
];

const NAV_ANIMATION = {
  visible: { y: 0, opacity: 1 },
  hidden: { y: "-100%", opacity: 0 },
};
const NAV_TRANSITION = { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const };

export default function Navbar({ introFinished }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [localIsAtTop, setLocalIsAtTop] = useState(true);

  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const { scrollY } = useScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const delta = Math.abs(latest - previous);
    if (delta < 2) return;

    const atTop = latest < 5;
    setLocalIsAtTop(atTop);
    setIsVisible(latest < previous || atTop);
  });

  const isLocked =
    status === "authenticated" &&
    (session?.user as any)?.skillLevel === "NOT_SET";

  const filteredLinks = isLocked
    ? NAV_LINKS.filter((link) => link.href === "/")
    : NAV_LINKS;

  const handleAuthClick = () => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    const user = session?.user as any;
    if (!user?.skillLevel || user?.skillLevel === "NOT_SET") {
      router.push("/onboarding");
    } else {
      router.push("/profile");
    }
  };

  const getButtonText = () => {
    if (status === "loading") return "Загрузка...";
    if (status === "authenticated") {
      if (pathname === "/onboarding") return "Тестирование";
      return session.user?.name || "Профиль";
    }
    return "Войти в игру";
  };

  if (!mounted || !introFinished) return null;

  const backgroundColor = localIsAtTop ? "transparent" : "rgba(0, 0, 0, 0.5)";
  const backdropBlur = localIsAtTop ? "none" : "blur(4px)";

  return (
    <motion.header
      variants={NAV_ANIMATION}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      transition={NAV_TRANSITION}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor,
        backdropFilter: backdropBlur,
        paddingTop: "env(safe-area-inset-top)",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
      className="transition-[background-color,backdrop-filter] duration-300"
    >
      <div
        className={`container mx-auto px-6 md:px-25 flex items-center transition-[height] duration-500 ${
          localIsAtTop ? "h-24 md:h-30" : "h-16 md:h-20"
        }`}
      >
        <div className="flex items-center gap-4 md:gap-10 shrink-0">
          <div className="lg:hidden flex items-center justify-center">
            <MobileMenu links={filteredLinks} />
          </div>

          <motion.div
            className={`shrink-0 flex items-center transition-all duration-500 ${
              localIsAtTop ? "w-14 md:w-20" : "w-10 md:w-14"
            }`}
          >
            <NextImage
              src="/icons/volleyball.svg"
              alt="Logo"
              width={70}
              height={70}
              priority
              className="w-full h-auto select-none pointer-events-none drop-shadow-xs/50"
            />
          </motion.div>

          <div className="hidden sm:flex">
            <WeatherWidget />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end gap-8 md:gap-12">
          <motion.nav className="tracking-wider uppercase text-sm hidden lg:flex gap-8 md:gap-10 text-brand-white drop-shadow-xs/50">
            {filteredLinks.map((item) => (
              <MagneticButton key={item.name}>
                <div className="px-2 py-1">
                  <RollingLink title={item.name} href={item.href} />
                </div>
              </MagneticButton>
            ))}
          </motion.nav>

          <div className="shrink-0">
            <MagneticButton>
              <button
                onClick={handleAuthClick}
                className={`btn-nav-premium whitespace-nowrap transition-all duration-500 font-bold drop-shadow-xs/50
                scale-90 px-4 py-2 text-[11px] 
                ${
                  localIsAtTop
                    ? "md:scale-100 md:px-6 md:py-3 md:text-sm"
                    : "md:scale-90 md:px-4 md:py-2 md:text-xs"
                }`}
              >
                {getButtonText()}
              </button>
            </MagneticButton>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

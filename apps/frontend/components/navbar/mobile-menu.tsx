"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, Variants, SVGMotionProps } from "framer-motion";
import Link from "next/link";

const sidebarVariants: Variants = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 0px 0px)`,
    transition: { type: "spring", stiffness: 20, restDelta: 2 },
  }),
  closed: {
    clipPath: "circle(0px at 0px 0px)",
    transition: { delay: 0.1, type: "spring", stiffness: 400, damping: 40 },
  },
};

const navVariants = {
  open: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: { y: { stiffness: 1000, velocity: -100 } },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: { y: { stiffness: 1000 } },
  },
};

export const MobileMenu = ({
  links,
}: {
  links: { name: string; href: string }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(1000);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      custom={windowHeight}
      ref={containerRef}
      className="relative z-10000 lg:hidden w-12 h-12 flex items-center justify-center"
    >
      <motion.div
        variants={sidebarVariants}
        className="fixed top-0 left-0 w-75 h-screen bg-white/2 backdrop-blur-xl shadow-2xl pointer-events-none"
        style={{ zIndex: -1, transform: "none" }}
      />

      <motion.ul
        variants={navVariants}
        className={`fixed top-0 left-0 w-75 h-screen p-8 pt-30 flex flex-col gap-6 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {links.map((link, i) => (
          <motion.li
            key={i}
            variants={itemVariants}
            whileHover={{ scale: 1.1, x: 10 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-2xl font-black uppercase tracking-wide text-white drop-shadow-xs/50 block hover:text-brand-lime transition-colors duration-200"
            >
              {link.name}
            </Link>
          </motion.li>
        ))}
      </motion.ul>

      <MenuToggle toggle={toggle} isOpen={isOpen} />
    </motion.nav>
  );
};

const Path = (props: SVGMotionProps<SVGPathElement>) => (
  <motion.path
    fill="transparent"
    strokeWidth="3"
    strokeLinecap="round"
    {...props}
  />
);

const MenuToggle = ({
  toggle,
  isOpen,
}: {
  toggle: () => void;
  isOpen: boolean;
}) => (
  <button
    onClick={toggle}
    className="relative w-full h-full flex items-center justify-center z-10001 bg-transparent outline-none cursor-pointer"
    style={{ color: isOpen ? "#000" : "#fff" }}
  >
    <svg width="23" height="23" viewBox="0 0 23 23">
      <Path
        stroke="currentColor"
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open: { d: "M 3 16.5 L 17 2.5" },
        }}
      />
      <Path
        stroke="currentColor"
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 },
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        stroke="currentColor"
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open: { d: "M 3 2.5 L 17 16.346" },
        }}
      />
    </svg>
  </button>
);

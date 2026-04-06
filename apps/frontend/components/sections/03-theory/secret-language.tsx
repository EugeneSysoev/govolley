"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { SECRET_LANGUAGE } from "./constants";

const badgeTransition = { duration: 0.6 };
const textTransition = { duration: 0.8, delay: 0.2 };

const SecretLanguage = memo(() => {
  return (
    <section className="relative bg-transparent overflow-hidden pt-20">
      <div className="container mx-auto px-5 lg:px-30">
        <div className="max-w-4xl border-l-2 border-brand-lime pl-5 md:pl-16">
          <div className="space-y-6">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={badgeTransition}
              className="relative text-brand-lime font-mono text-[clamp(0.6rem,2vw,0.8rem)] tracking-[0.3em] uppercase block mb-4"
            >
              // {SECRET_LANGUAGE.badge}
            </motion.span>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={textTransition}
              className="relative text-brand-white/80 font-light whitespace-pre-line text-[clamp(0.6em,2vw,0.9rem)] leading-relaxed tracking-wider drop-shadow-md/50"
            >
              {SECRET_LANGUAGE.text}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
});

SecretLanguage.displayName = "SecretLanguage";
export default SecretLanguage;

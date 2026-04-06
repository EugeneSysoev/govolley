import { motion } from "framer-motion";

export const DecorativeLine = () => (
  <div className="flex justify-start mb-20">
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "circOut" }}
      className="relative w-3/4 h-px bg-brand-lime origin-left"
    />
  </div>
);

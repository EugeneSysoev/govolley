import { useTransform, MotionValue } from "framer-motion";

export const useHeroAnimations = (scrollYProgress: MotionValue<number>) => {
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.05]);

  const contentBlur = useTransform(
    scrollYProgress,
    [0, 0.35],
    ["blur(0px)", "blur(12px)"],
  );

  return { backgroundY, contentOpacity, contentScale, contentBlur };
};

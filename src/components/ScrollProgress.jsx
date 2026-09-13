import { motion, useScroll, useTransform } from 'motion/react';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  // Color travels from a lighter red at the start to the full brand red at
  // 100% — so the bar visibly "deepens" as you get further down the page,
  // not just growing in length with a flat color.
  const background = useTransform(
    scrollYProgress,
    [0, 1],
    ['linear-gradient(90deg, #f4cfd5, #c8102e)', 'linear-gradient(90deg, #c8102e, #7a0a1d)']
  );

  return (
    <motion.div
      style={{ scaleX: scrollYProgress, background }}
      className="fixed left-0 top-16 z-40 h-[3px] w-full origin-left"
    />
  );
}
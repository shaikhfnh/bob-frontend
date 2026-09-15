import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export default function ParallaxSection({ children, className = '' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [12, 0, -12]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.94]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -60]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ perspective: '1200px' }}>
      <motion.div
        style={{ rotateX, scale, y, transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
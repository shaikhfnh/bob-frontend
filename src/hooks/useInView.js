import { useRef } from 'react';
import { useInView as useMotionInView } from 'motion/react';

export function useInView(amount = 0.3) {
  const ref = useRef(null);
  const inView = useMotionInView(ref, { once: true, amount });
  return [ref, inView];
}
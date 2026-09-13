import { motion } from 'motion/react';
import { pressTap } from '../styles/motion';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors';
  const variants = {
    primary: 'bg-brand-red text-white hover:bg-brand-red-dark',
    outline: 'border border-neutral-300 text-brand-ink hover:border-brand-red hover:text-brand-red',
  };
  return (
    <motion.button
      whileTap={pressTap}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
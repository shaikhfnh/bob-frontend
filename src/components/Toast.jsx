import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';

export default function Toast({ show, message, type = 'success' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={springs.snappy}
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl ${
            type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
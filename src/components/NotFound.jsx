import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { springs } from '../styles/motion';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 text-center">
      {/* Ambient background glow — one soft shape, slowly breathing.
          Restrained on purpose: a single accent, not a busy scene. */}
      <motion.div
        className="pointer-events-none absolute h-[28rem] w-[28rem] rounded-full bg-red-50 blur-3xl"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative">
        {/* The "4 0 4" numerals drift apart slightly on load, as if
            something came loose — a small, specific idea rather than a
            generic fade-in. */}
        <div className="flex items-center justify-center gap-1">
          {['4', '0', '4'].map((digit, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -24, rotate: i === 1 ? 0 : (i === 0 ? -8 : 8) }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ ...springs.default, delay: i * 0.08 }}
              className="text-8xl font-bold tracking-tight text-brand-red md:text-9xl"
            >
              {digit}
            </motion.span>
          ))}
        </div>

        {/* A small compass-like marker, gently floating — reinforces
            "you've wandered off the map" without literal illustration. */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springs.default, delay: 0.3 }}
          className="mx-auto -mt-4 flex h-14 w-14 items-center justify-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl"
          >
            🧭
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.4 }}
          className="mt-6 text-xl font-bold text-brand-ink"
        >
          You've wandered off the map
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.48 }}
          className="mt-2 max-w-xs text-sm text-brand-muted"
        >
          The page you're looking for doesn't exist, or may have moved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.56 }}
          className="mt-8"
        >
          <Link to="/">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark"
            >
              ← Back to homepage
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
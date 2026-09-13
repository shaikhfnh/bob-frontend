import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';
import { useLanguage } from '../context/LanguageContext';

export default function SessionPicker({ sessions, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { t, language } = useLanguage();
  const selected = sessions.find((s) => s.id === value);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Same fallback rule as Experts.jsx: use the Arabic field if it exists,
  // otherwise fall back to English rather than showing blank.
  function displayTitle(s) {
    return language === 'ar' && s.title_ar ? s.title_ar : s.title;
  }

  return (
    <div className="relative" ref={ref}>
      <label className="mb-1.5 block text-xs font-semibold text-brand-muted">{t('register.session')}</label>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-left text-sm"
      >
        {selected ? (
          <div>
            <p className="font-semibold text-brand-ink">{displayTitle(selected)}</p>
            <p className="text-xs text-brand-muted">
              {selected.date}{selected.format === 'offline' && selected.location ? ` · ${selected.location}` : ''}
            </p>
          </div>
        ) : (
          <span className="text-brand-muted">{t('register.selectSession')}</span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springs.snappy} className="text-brand-muted">⌄</motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={springs.snappy}
            className="absolute z-20 mt-1.5 w-full max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-neutral-200 bg-white shadow-lg"
          >
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { onChange(s.id); setOpen(false); }}
                className={`flex w-full flex-col items-start border-b border-neutral-100 px-3.5 py-3 text-left last:border-0 hover:bg-neutral-50 ${value === s.id ? 'bg-red-50' : ''}`}
              >
                <p className="text-sm font-semibold text-brand-ink">{displayTitle(s)}</p>
                <p className="text-xs text-brand-muted">
                  {s.date} · {s.host}
                  {s.format === 'offline' && s.location ? ` · ${s.location}` : ''}
                </p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
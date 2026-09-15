import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../../styles/motion';
import { useInView } from '../../hooks/useInView';
import { useLanguage } from '../../context/LanguageContext';

function ChevronIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const [ref, inView] = useInView();
  const { t } = useLanguage();

  const FAQS = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
  ];

  return (
    <section id="faq" ref={ref} className="w-full bg-neutral-50 px-6 py-16 md:px-12 md:py-20 lg:px-16">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-red">{t('faq.eyebrow')}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-brand-ink md:text-4xl">{t('faq.title')}</h2>

      <div className="mx-auto mt-8 max-w-3xl space-y-2.5">
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <motion.div
              key={item.q}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...springs.default, delay: i * 0.05 }}
              className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-200 ${
                open ? 'border-brand-red/40 shadow-[0_4px_20px_rgba(200,16,46,0.06)]' : 'border-neutral-200'
              }`}
            >
              <motion.button
                whileTap={{ scale: 0.995 }}
                onClick={() => setOpenIndex(open ? -1 : i)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-black/[0.015]"
              >
                {/* Numbered accent — small, specific detail that also
                    doubles as a wayfinding cue (which question is this) */}
                <span
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-200 ${
                    open ? 'bg-brand-red text-white' : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {i + 1}
                </span>

                <span className={`flex-1 text-sm font-semibold transition-colors duration-200 ${open ? 'text-brand-red' : 'text-brand-ink'}`}>
                  {item.q}
                </span>

                <motion.span
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={springs.snappy}
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                    open ? 'bg-red-50 text-brand-red' : 'text-neutral-400'
                  }`}
                >
                  <ChevronIcon className="h-4 w-4" />
                </motion.span>
              </motion.button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={springs.sheet}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 pl-[3.25rem] text-sm leading-relaxed text-brand-muted">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
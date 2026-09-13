import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../../styles/motion';
import { useInView } from '../../hooks/useInView';
import { useLanguage } from '../../context/LanguageContext';

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
    <section id="faq" ref={ref} className="w-full bg-neutral-50 px-6 py-20 md:px-16 md:py-28 lg:px-24">
<p className="text-xs font-bold uppercase tracking-wide text-brand-red">{t('faq.eyebrow')}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-brand-ink md:text-4xl">{t('faq.title')}</h2>

      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <motion.div
              key={item.q}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...springs.default, delay: i * 0.05 }}
              className={`rounded-2xl border bg-white ${open ? 'border-brand-red' : 'border-neutral-200'}`}
            >
              <button
                onClick={() => setOpenIndex(open ? -1 : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className={`text-sm font-semibold ${open ? 'text-brand-red' : 'text-brand-ink'}`}>{item.q}</span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springs.snappy} className="text-brand-muted">
                  ⌄
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={springs.sheet}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-brand-muted">{item.a}</p>
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
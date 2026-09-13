import { motion } from 'motion/react';
import { useInView } from '../hooks/useInView';
import { springs } from '../styles/motion';
import { useLanguage } from '../context/LanguageContext';

export default function TopicsCard({ session }) {
  const [ref, inView] = useInView(0.2);
  const { language, t } = useLanguage();

  const raw = language === 'ar' ? session.topics_ar : session.topics;
  if (!raw) return null; // no topics data yet for this session — render nothing

  let topics;
  try {
    topics = JSON.parse(raw);
  } catch {
    return null; // malformed data shouldn't crash the page
  }
  if (!Array.isArray(topics) || topics.length === 0) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={springs.default}
      className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-6 md:p-8"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-brand-red">
        {t('topics.eyebrow')}
      </p>
      <h3 className="mt-1 text-lg font-bold text-brand-ink">{t('topics.title')}</h3>

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {topics.map((topic, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ ...springs.default, delay: i * 0.06 }}
            className="flex items-start gap-2.5 text-sm text-brand-ink"
          >
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            {topic}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
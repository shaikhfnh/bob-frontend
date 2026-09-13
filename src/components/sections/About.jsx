import { motion } from 'motion/react';
import { springs } from '../../styles/motion';
import { useInView } from '../../hooks/useInView';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../Button';

export default function About() {
  const [ref, inView] = useInView();
  const { t } = useLanguage();

  return (
    <section id="about" ref={ref} className="w-full bg-white px-6 py-20 md:p-16 ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={springs.default}
        className="mx-auto max-w-7xl"
      >
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-red">{t('about.eyebrow')}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-brand-ink md:text-4xl">
              {t('about.title')}
            </h2>
          </div>

          {/* Stat pair — confirm this is actually rendering on your live page */}
          <div className="flex flex-shrink-0 gap-4 rounded-2xl border border-neutral-200 px-5 py-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-brand-ink">12</p>
              <p className="text-[11px] font-semibold uppercase text-brand-muted">{t('about.statSessions')}</p>
            </div>
            <div className="w-px bg-neutral-200" />
            <div className="text-center">
              <p className="text-2xl font-extrabold text-brand-ink">100%</p>
              <p className="text-[11px] font-semibold uppercase text-brand-muted">{t('about.statFree')}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-brand-muted">
          <p>{t('about.paragraph1')}</p>
          <p>{t('about.paragraph2')}</p>
          <p>{t('about.paragraph3')}</p>
          <p>{t('about.paragraph4')}</p>
        </div>

        <p className="mt-6 font-semibold text-brand-ink">{t('about.cta')}</p>

        <div className="mt-6">
          <Button
            variant="primary"
            onClick={() => {logFunnelEvent('session_card_click', null, 'about_cta');document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}}
          >
            {t('about.ctaButton')}
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useInView } from '../hooks/useInView';
import { springs } from '../styles/motion';
import { useLanguage } from '../context/LanguageContext';
import bannerDesktop from '../assets/images/banner/speaker-banner-desktop.png';
import bannerMobile from '../assets/images/banner/speaker-banner-mobile.png';

function useCountUp(target, active) {
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!active || hasRun.current) return;
    hasRun.current = true;
    let raf;
    const start = performance.now();
    const duration = 1000;
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);

  // Fallback: if useInView never fires (race condition on cold load),
  // just show the final number after a short delay rather than staying at 0
  useEffect(() => {
    const fallback = setTimeout(() => {
      if (!hasRun.current) setValue(target);
    }, 2000);
    return () => clearTimeout(fallback);
  }, [target]);

  return value;
}

export default function SeparatorSpeaker() {
  const [ref, inView] = useInView(0.2);
  const { t } = useLanguage();
  const count = useCountUp(12, inView);

  return (
    <section  ref={ref} className="w-full bg-white">
      <div className="mx-auto max-w-3xl px-6 pt-16 text-center md:pt-20">
        <motion.p
        id='sessions'
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={springs.default}
          className="text-xl font-bold tracking-[-0.02em] text-brand-red md:text-3xl"
        >
          {count} {t('separator.title')}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...springs.default, delay: 0.1 }}
          className="mt-3 text-sm text-brand-muted md:text-base"
        >
          {t('separator.subtitle')}
        </motion.p>
      </div>

      <motion.div
      
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...springs.default, delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="mx-auto mt-10 w-full px-4 pb-10 sm:px-6 "
      >
        <div className="overflow-hidden rounded-3xl shadow-sm md:mx-20">
          <picture>
            <source media="(min-width:1024px)" srcSet={bannerDesktop} />
            <img src={bannerMobile} alt="" className="w-full" />
          </picture>
        </div>
      </motion.div>
    </section>
  );
}
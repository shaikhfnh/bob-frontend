import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { springs } from '../../styles/motion';
import { useInView } from '../../hooks/useInView';
import { useLanguage } from '../../context/LanguageContext';
import { getSessions } from '../../services/sessionService';
import Button from '../Button';
import TopicsCard from '../TopicsCard';
import SkeletonCard from '../SkeletonCard';

function initials(name) {
  return (name || 'GS')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function scrollToRegister() {
  document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
}

export default function Experts() {
  const [ref, inView] = useInView();
  const { t, language } = useLanguage();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch((err) => console.error('Failed to load sessions:', err));
  }, []);

  return (
    <section
      id="hosts"
      ref={ref}
      className="w-full bg-white px-6 py-20 md:px-16 md:py-28 lg:px-24"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-brand-red">
        {t('experts.eyebrow')}
      </p>

      <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-brand-ink md:text-4xl">
        {t('experts.title')}
      </h2>

      <p className="mt-2 max-w-2xl text-brand-muted">
        {t('experts.subtitle')}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {sessions.length === 0 && (
  <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
    {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
  </div>
)}
        {sessions.map((s, i) => {
          const title = language === 'ar' && s.title_ar ? s.title_ar : s.title;
          const desc = language === 'ar' && s.description_ar ? s.description_ar : s.description;
          const speakerName =
            (language === 'ar' && s.speaker_name_ar ? s.speaker_name_ar : s.speaker_name) ||
            t('experts.guestSpeaker');

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...springs.default, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="flex flex-col rounded-2xl border border-neutral-200 p-6 shadow-sm"
            >
              {s.speaker_photo ? (
                <img
                  src={s.speaker_photo}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-red-50"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-400">
                  {initials(speakerName)}
                </div>
              )}

              <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-brand-muted">
                {t('experts.sessionLabel')} {String(i + 1).padStart(2, '0')}
              </p>

              <p className="text-xs font-bold text-brand-red">{speakerName}</p>

              <h3 className="mt-2 min-h-[3.4em] text-base font-bold leading-snug text-brand-ink">
                {title}
              </h3>

              <p className="mt-2 line-clamp-3 text-sm text-brand-muted">{desc}</p>

              <div className="mt-4">
  <TopicsCard session={s} />
</div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-brand-muted">
                <span>
                  ⏱ {s.duration_minutes || 90} {t('speaker.min')}
                </span>
                <span>
                  {s.format === 'online'
                    ? `💻 ${t('speaker.online')}`
                    : `📍 ${t('speaker.inPerson')}`}
                </span>
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-4">
                {s.seats_limited === 1 && (
                  <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                    {t('speaker.limitedSeating')}
                  </span>
                )}
                <Button variant="primary" onClick={scrollToRegister}>
                  {t('speaker.registerNow')}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={() => { logFunnelEvent('session_card_click', s.id, 'experts_card'); scrollToRegister(); }}>
          {t('speaker.registerNow')}
        </Button>
      </div>
    </section>
  );
}
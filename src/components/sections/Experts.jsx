import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { springs } from '../../styles/motion';
import { useInView } from '../../hooks/useInView';
import { useLanguage } from '../../context/LanguageContext';
import { getSessions } from '../../services/sessionService';
import { logFunnelEvent } from '../../services/funnelService';
import Button from '../Button';
import SkeletonCard from '../SkeletonCard';
import ParallaxSection from '../ParallaxSection';

function initials(name) {
  return (name || 'GS').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}
function scrollToRegister() {
  document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
}
function parseTopics(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export default function Experts() {
  const [ref, inView] = useInView();
  const { t, language } = useLanguage();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    getSessions().then(setSessions).catch((err) => console.error('Failed to load sessions:', err));
  }, []);

  return (
    <section id="hosts" ref={ref} className="w-full bg-white px-6 py-10 md:px-12  lg:px-16">
      <ParallaxSection>
        <p className="text-xs font-bold uppercase tracking-wide text-brand-red">{t('experts.eyebrow')}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-brand-ink md:text-4xl">{t('experts.title')}</h2>
        <p className="mt-2 max-w-2xl text-brand-muted">{t('experts.subtitle')}</p>
      </ParallaxSection>

      {sessions.length === 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {sessions.map((s, i) => {
            const title = language === 'ar' && s.title_ar ? s.title_ar : s.title;
            const desc = language === 'ar' && s.description_ar ? s.description_ar : s.description;
            const speakerName = (language === 'ar' && s.speaker_name_ar ? s.speaker_name_ar : s.speaker_name) || t('experts.guestSpeaker');
            const topics = parseTopics(language === 'ar' && s.topics_ar ? s.topics_ar : s.topics);

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...springs.default, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                // flex + h-full is what makes every card in the row stretch
                // to match the tallest one, so the button-anchoring below
                // actually has equal-height cards to align within.
                className="flex h-full flex-col rounded-2xl border border-neutral-200/70 bg-white/70 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-center gap-3">
                  {s.speaker_photo ? (
                    <img src={s.speaker_photo} alt="" className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-red-50" />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-400">
                      {initials(speakerName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                      {t('experts.sessionLabel')} {String(i + 1).padStart(2, '0')}
                    </p>
                    <p className="text-xs font-bold text-brand-red">{speakerName}</p>
                  </div>
                </div>

                <h3 className="mt-3.5 text-base font-bold leading-snug text-brand-ink">{title}</h3>
                <p className="mt-1.5 text-sm text-brand-muted">{desc}</p>

                {topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {topics.slice(0, 3).map((topic, ti) => (
                      <span key={ti} className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
                        {topic}
                      </span>
                    ))}
                    {topics.length > 3 && (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-brand-red">
                        +{topics.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-brand-muted">
                  <span>⏱ {s.duration_minutes || 90} {t('speaker.min')}</span>
                  <span className="h-1 w-1 rounded-full bg-neutral-300" />
                  <span>{s.format === 'online' ? `💻 ${t('speaker.online')}` : `📍 ${t('speaker.inPerson')}`}</span>
                  {s.seats_limited === 1 && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      {t('speaker.limitedSeating')}
                    </span>
                  )}
                </div>

                {/* mt-auto is the actual fix — it pushes the button to the
                    bottom of the card's available space regardless of how
                    much content sits above it, so every button lines up
                    across the row once cards share equal height (h-full above). */}
                <Button
                  variant="primary"
                  className="mt-auto w-full justify-center pt-4"
                  onClick={() => { logFunnelEvent('session_card_click', s.id, 'experts_card'); scrollToRegister(); }}
                >
                  {t('speaker.registerNow')}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button
          variant="outline"
          onClick={() => { logFunnelEvent('session_card_click', null, 'experts_footer'); scrollToRegister(); }}
        >
          {t('speaker.registerNow')}
        </Button>
      </div>
    </section>
  );
}
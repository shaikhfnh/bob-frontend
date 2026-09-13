import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';
import Button from '../components/Button';
import { useLanguage } from '../context/LanguageContext';

const NAV_LINKS = [
  { key: 'home', href: '#' },
  { key: 'about', href: '#about' },
  { key: 'sessions', href: '#sessions' },
  { key: 'hosts', href: '#hosts' },
];

function GlobeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
    </svg>
  );
}

// Fixed: dropped the AnimatePresence crossfade entirely — that's what was
// causing the label to get stuck on "العربية" regardless of state. A plain
// span re-renders correctly every time `language` changes; no exit/enter
// animation was worth trading for a broken label.
function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-brand-muted transition-colors hover:border-brand-red hover:text-brand-red"
      aria-label="Switch language"
    >
      <GlobeIcon />
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </motion.button>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#" className="text-lg font-bold text-brand-red">
          Boubyan <span className="text-brand-ink">Webinar</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className="text-sm font-medium text-brand-muted transition-colors hover:text-brand-red"
            >
              {t(`nav.${link.key}`)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitch />
          <Button variant="primary">{t('nav.register')}</Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitch />
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <motion.span
              className="h-0.5 w-5 bg-brand-ink"
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
              transition={springs.snappy}
            />
            <motion.span
              className="h-0.5 w-5 bg-brand-ink"
              animate={{ opacity: menuOpen ? 0 : 1 }}
              transition={{ duration: 0.15 }}
            />
            <motion.span
              className="h-0.5 w-5 bg-brand-ink"
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
              transition={springs.snappy}
            />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springs.sheet}
            className="overflow-hidden border-t border-neutral-200 bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  {t(`nav.${link.key}`)}
                </a>
              ))}
              <Button variant="primary" className="mt-2 w-full">{t('nav.register')}</Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
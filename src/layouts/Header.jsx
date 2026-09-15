import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';
import Button from '../components/Button';
import { useLanguage } from '../context/LanguageContext';

const NAV_LINKS = [
  { key: 'home', href: '#' },
  { key: 'about', href: '#about' },
  { key: 'hosts', href: '#hosts' },
  { key: 'faq', href: '#faq' },
];

function GlobeIcon(props) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
    </svg>
  );
}

function LanguageSwitch({ full, iconOnly }) {
  const { language, setLanguage } = useLanguage();
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className={`flex items-center justify-center gap-2 rounded-md bg-black/[0.03] py-3 text-sm font-semibold text-brand-ink transition-colors hover:bg-black/[0.06] ${
        full ? 'w-full' : iconOnly ? 'h-9 w-9 p-0' : 'px-3 py-1.5 text-xs'
      }`}
      aria-label="Switch language"
    >
      <GlobeIcon className={full ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      {!iconOnly && <span>{language === 'en' ? 'العربية' : 'English'}</span>}
    </motion.button>
  );
}

function MobileDrawer({ open, onClose }) {
  const { t } = useLanguage();

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[999] bg-black/30"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={springs.sheet}
            className="fixed right-0 top-0 z-[1000] flex h-full w-[82%] max-w-xs flex-col border-l border-white/40 bg-white/70 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header row — fixed, never scrolls */}
            <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-black/5 px-5">
              <span className="text-sm font-bold text-brand-red">
                Boubyan <span className="text-brand-ink">Webinar</span>
              </span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-neutral-700 transition-colors hover:bg-black/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav — takes remaining space, scrolls independently if ever needed */}
            <div className="flex-1 overflow-y-auto p-4">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.key}
                  href={link.href}
                  onClick={onClose}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springs.default, delay: i * 0.05 }}
                  className="block rounded-xl px-4 py-3.5 text-base font-semibold text-brand-ink transition-colors hover:bg-black/5"
                >
                  {t(`nav.${link.key}`)}
                </motion.a>
              ))}
            </div>

            {/* Footer — pinned to the bottom via flex-shrink-0 on a
                flex-col parent, not pushed down by content length */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.default, delay: 0.15 }}
              className="flex-shrink-0 space-y-3 border-t border-black/5 bg-black/[0.02] p-4"
            >
              <Button
                variant="primary"
                className="w-full justify-center py-3 text-base"
                onClick={() => {
                  onClose();
                  document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('nav.register')}
              </Button>
              <LanguageSwitch full />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
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
            <a key={link.key} href={link.href} className="text-sm font-medium text-brand-muted transition-colors hover:text-brand-red">
              {t(`nav.${link.key}`)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitch />
          <Button variant="primary" onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}>
            {t('nav.register')}
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitch iconOnly/>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className="h-0.5 w-5 bg-brand-ink" />
            <span className="h-0.5 w-5 bg-brand-ink" />
            <span className="h-0.5 w-5 bg-brand-ink" />
          </motion.button>
        </div>
      </div>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
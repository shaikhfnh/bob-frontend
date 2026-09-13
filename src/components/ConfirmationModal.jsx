import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';
import { useLanguage } from '../context/LanguageContext';

export default function ConfirmationModal({ open, onClose }) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={springs.default}
              className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...springs.default, delay: 0.1 }}
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl"
              >
                ✅
              </motion.div>

              <h3 className="mt-4 text-lg font-bold text-brand-ink">{t('confirmation.title')}</h3>
              <p className="mt-2 text-sm text-brand-muted">{t('confirmation.body')}</p>

              <p className="mt-4 text-xs text-brand-muted">
                {t('confirmation.noEmail')}{' '}
                <a href="mailto:sakan@boubyan.com" className="font-semibold text-brand-red underline">
                  {t('confirmation.contactUs')}
                </a>
              </p>

              <button
                onClick={onClose}
                className="mt-6 w-full rounded-lg bg-brand-red py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98]"
              >
                {t('confirmation.done')}
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
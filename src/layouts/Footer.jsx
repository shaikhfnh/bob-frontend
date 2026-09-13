import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="w-full bg-neutral-900 px-6 py-14 text-neutral-400 md:px-16 lg:px-24">
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">Boubyan <span className="text-brand-red">Webinar</span></p>
          <p className="mt-3 max-w-xs text-sm">{t('footer.collab')}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">{t('footer.navigate')}</p>
          <div className="mt-3 space-y-2 text-sm">
            <a href="#about" className="block hover:text-white">{t('nav.about')}</a>
            <a href="#sessions" className="block hover:text-white">{t('nav.sessions')}</a>
            <a href="#hosts" className="block hover:text-white">{t('nav.hosts')}</a>
            <a href="#faq" className="block hover:text-white">{t('faq.title')}</a>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">{t('footer.contact')}</p>
          <div className="mt-3 space-y-2 text-sm">
            <a href="tel:1820082" className="block hover:text-white">📞 1820082</a>
            <a href="#register" className="block hover:text-white">{t('footer.registerLink')}</a>
          </div>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-neutral-600">© 2026 Boubyan Bank. {t('footer.rights')}</p>
    </footer>
  );
}
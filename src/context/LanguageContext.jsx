import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
      localStorage.setItem('current_language', language);
  }, [language]);

  // t('register.firstName') walks the nested object and returns the right language's string
  function t(key) {
    const parts = key.split('.');
    let value = translations;
    for (const part of parts) value = value?.[part];
    return value?.[language] ?? key; // falls back to showing the key itself if a translation is missing — visible, not silently blank
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
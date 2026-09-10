import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supportedLanguages, translations } from '@/locales/translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'daniya-language';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return translations[saved] ? saved : 'ar';
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [direction, language]);

  const setLanguageDirect = useCallback((nextLanguage) => {
    if (translations[nextLanguage]) setLanguage(nextLanguage);
  }, []);

  const t = useCallback((key, replacements = {}) => {
    const value = translations[language]?.[key] ?? translations.en[key] ?? key;
    if (typeof value !== 'string') return value;
    return Object.entries(replacements).reduce(
      (text, [token, replacement]) => text.replaceAll(`{${token}}`, String(replacement)),
      value,
    );
  }, [language]);

  const value = useMemo(() => ({
    language,
    direction,
    t,
    setLanguageDirect,
    supportedLanguages,
  }), [direction, language, setLanguageDirect, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

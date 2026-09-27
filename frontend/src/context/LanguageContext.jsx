import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS, LANGUAGES } from '../constants/translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'loanlens_language';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['en', 'hi', 'mr'].includes(saved)) {
      return saved;
    }
    return 'en';
  });

  const setLanguage = useCallback((langCode) => {
    if (['en', 'hi', 'mr'].includes(langCode)) {
      setLanguageState(langCode);
      localStorage.setItem(STORAGE_KEY, langCode);
      document.documentElement.lang = langCode;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key, fallback = '') => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  }, [language]);

  const currentLanguageObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const value = {
    language,
    currentLanguage: currentLanguageObj,
    setLanguage,
    t,
    languages: LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

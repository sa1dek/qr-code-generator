import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "../i18n/translations";

//--------------|| Context Types Interface ||--------------//
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.ar) => string;
  isRTL: boolean;
}

//--------------|| Language Context Creation ||--------------//
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

//--------------|| Language Provider Component ||--------------//
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  //--------------|| Language State Initialization ||--------------//
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_lang");
    return saved === "en" || saved === "ar" ? saved : "ar";
  });

  //--------------|| Language State Handler ||--------------//
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const isRTL = language === "ar";

  //--------------|| Document Direction & Language Effect ||--------------//
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  //--------------|| Translation Helper Function ||--------------//
  const t = (key: keyof typeof translations.ar): string => {
    return translations[language][key] || translations["ar"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

//--------------|| Custom Hook ||--------------//
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

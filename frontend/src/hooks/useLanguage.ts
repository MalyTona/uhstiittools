import { useCallback, useEffect, useMemo, useState } from "react";
import { translate, type Translate } from "../i18n";
import type { Language } from "../types/pdf";

const STORAGE_KEY = "uhst-iit-language";

function storedLanguage(): Language {
  try {
    return localStorage.getItem(STORAGE_KEY) === "km" ? "km" : "en";
  } catch {
    return "en";
  }
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(storedLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // The interface still works when storage is unavailable.
    }
  }, [language]);

  const setLanguage = useCallback((next: Language) => setLanguageState(next), []);
  const t: Translate = useMemo(
    () => (key, variables) => translate(language, key, variables),
    [language],
  );
  return { language, setLanguage, t };
}


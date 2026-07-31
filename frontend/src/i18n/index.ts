import en from "./en";
import km from "./km";
import type { Language } from "../types/pdf";

export type TranslationKey = keyof typeof en;
export type Translate = (
  key: TranslationKey,
  variables?: Record<string, string | number>,
) => string;

const translations: Record<Language, Record<TranslationKey, string>> = { en, km };

export function translate(
  language: Language,
  key: TranslationKey,
  variables: Record<string, string | number> = {},
): string {
  return Object.entries(variables).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
    translations[language][key],
  );
}


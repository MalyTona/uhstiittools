import type { Translate } from "../i18n";
import type { Language } from "../types/pdf";

interface LanguageSwitcherProps {
  language: Language;
  onChange: (language: Language) => void;
  t: Translate;
}

export function LanguageSwitcher({ language, onChange, t }: LanguageSwitcherProps) {
  return (
    <div className="language-switcher" role="group" aria-label={t("languageLabel")}>
      <button
        type="button"
        className={language === "en" ? "is-active" : ""}
        aria-pressed={language === "en"}
        onClick={() => onChange("en")}
      >
        {t("english")}
      </button>
      <span aria-hidden="true">|</span>
      <button
        type="button"
        className={language === "km" ? "is-active" : ""}
        aria-pressed={language === "km"}
        onClick={() => onChange("km")}
      >
        {t("khmer")}
      </button>
    </div>
  );
}

import type { Translate } from "../i18n";
import type { Language } from "../types/pdf";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AppHeaderProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  t: Translate;
}

export function AppHeader({ language, onLanguageChange, t }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="page-shell header-inner">
        <div className="brand-block">
          <img className="brand-logo" src="/images/uhst-logo.png" alt="" />
          <p className="brand-title">{t("appName")}</p>
        </div>
        <nav className="primary-navigation" aria-label={t("appName")}>
          <a className="is-active" href="#pdf-tools">{t("navTools")}</a>
          <a href="#privacy-notice">{t("navSecurity")}</a>
          <a href="#upload-help">{t("navHelp")}</a>
        </nav>
        <LanguageSwitcher language={language} onChange={onLanguageChange} t={t} />
      </div>
    </header>
  );
}

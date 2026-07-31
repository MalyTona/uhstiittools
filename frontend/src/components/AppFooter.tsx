import type { Translate } from "../i18n";

export function AppFooter({ t }: { t: Translate }) {
  return (
    <footer className="app-footer">
      <div className="page-shell footer-inner">
        <p>{t("footerDeveloped")} · {t("footerUniversity")}</p>
        <div className="footer-links">
          <span>{t("privacyPolicy")}</span>
          <span>{t("termsOfService")}</span>
          <span>{t("institutionalContact")}</span>
        </div>
      </div>
    </footer>
  );
}

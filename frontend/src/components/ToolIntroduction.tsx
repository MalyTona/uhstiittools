import type { Translate } from "../i18n";
import type { PdfTool } from "../types/pdf";

export function ToolIntroduction({ t, tool = "merge" }: { t: Translate; tool?: PdfTool }) {
  const title = tool === "merge" ? t("title") : t("splitTitle");
  const secondaryTitle = tool === "merge" ? t("titleSecondary") : t("splitTitleSecondary");
  return (
    <section className="tool-introduction" aria-labelledby="tool-title">
      <h1 id="tool-title">
        <span>{title}</span>
        <span className="title-separator" aria-hidden="true"> / </span>
        <span>{secondaryTitle}</span>
      </h1>
      <div className="privacy-notice" id="privacy-notice">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2ZM10 6a2 2 0 0 1 4 0v2h-4V6Zm7 13H7v-9h10v9Z" />
        </svg>
        <p>
          <span>{t("privacy")}</span>
          <span className="privacy-separator" aria-hidden="true"> / </span>
          <span>{t("privacySecondary")}</span>
        </p>
      </div>
    </section>
  );
}

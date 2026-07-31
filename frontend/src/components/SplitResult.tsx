import { useEffect, useRef } from "react";
import type { Translate } from "../i18n";
import type { SplitResult as SplitResultType } from "../types/pdf";

interface SplitResultProps {
  result: SplitResultType;
  onStartAnother: () => void;
  t: Translate;
}

export function SplitResult({ result, onStartAnother, t }: SplitResultProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <section className="merge-result" aria-labelledby="split-success-title">
      <span className="success-icon" aria-hidden="true">✓</span>
      <div className="split-result-content">
        <h2 id="split-success-title" ref={headingRef} tabIndex={-1}>{t("splitSuccessTitle")}</h2>
        <p>{t("splitSuccessSummary", { pages: result.pages.length })}</p>
        <h3 className="split-output-heading">{t("splitOutputFiles")}</h3>
        <ul className="split-result-list">
          {result.pages.map((page) => (
            <li className="split-result-item" key={page.pageNumber}>
              <span className="split-result-name">{page.filename}</span>
              <a
                className="button button-primary"
                href={page.downloadUrl}
                download={page.filename}
              >
                {t("downloadSplit", { page: page.pageNumber })}
              </a>
            </li>
          ))}
        </ul>
        <div className="result-actions split-result-actions">
          <button type="button" className="button button-secondary" onClick={onStartAnother}>
            {t("startAnotherSplit")}
          </button>
        </div>
      </div>
    </section>
  );
}

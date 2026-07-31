import { useEffect, useRef } from "react";
import type { Translate } from "../i18n";
import type { MergeResult as MergeResultType } from "../types/pdf";

interface MergeResultProps {
  result: MergeResultType;
  onStartAnother: () => void;
  t: Translate;
}

export function MergeResult({ result, onStartAnother, t }: MergeResultProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <section className="merge-result" aria-labelledby="success-title">
      <span className="success-icon" aria-hidden="true">✓</span>
      <div>
        <h2 id="success-title" ref={headingRef} tabIndex={-1}>{t("successTitle")}</h2>
        <p>
          {result.pageCount === undefined
            ? t("successSummaryNoPages", { count: result.fileCount })
            : t("successSummary", { count: result.fileCount, pages: result.pageCount })}
        </p>
        <p className="result-filename"><strong>{t("output")}</strong> {result.filename}</p>
        <div className="result-actions">
          <a className="button button-primary" href={result.downloadUrl} download={result.filename}>
            {t("download")}
          </a>
          <button type="button" className="button button-secondary" onClick={onStartAnother}>
            {t("startAnother")}
          </button>
        </div>
      </div>
    </section>
  );
}


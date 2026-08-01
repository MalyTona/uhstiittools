import { useEffect, useRef } from "react";
import type { Translate } from "../i18n";
import type { ConvertResult } from "../types/pdf";

interface ImageResultProps {
  result: ConvertResult;
  onStartAnother: () => void;
  t: Translate;
}

export function ImageResult({ result, onStartAnother, t }: ImageResultProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <section className="merge-result" aria-labelledby="convert-success-title">
      <span className="success-icon" aria-hidden="true">✓</span>
      <div className="split-result-content">
        <h2 id="convert-success-title" ref={headingRef} tabIndex={-1}>
          {t("convertSuccessTitle")}
        </h2>
        <p>{t("convertSuccessSummary", { pages: result.pages.length, format: result.format.toUpperCase() })}</p>
        <h3 className="split-output-heading">{t("convertedOutputFiles")}</h3>
        <ul className="split-result-list">
          {result.pages.map((page) => (
            <li className="split-result-item" key={page.pageNumber}>
              <span className="split-result-name">{page.filename}</span>
              <a className="button button-primary" href={page.downloadUrl} download={page.filename}>
                {t("downloadImage", { page: page.pageNumber })}
              </a>
            </li>
          ))}
        </ul>
        <div className="result-actions split-result-actions">
          <button type="button" className="button button-secondary" onClick={onStartAnother}>
            {t("startAnotherConversion")}
          </button>
        </div>
      </div>
    </section>
  );
}

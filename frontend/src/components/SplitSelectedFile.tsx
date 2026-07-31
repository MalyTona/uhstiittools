import type { Translate, TranslationKey } from "../i18n";
import type { SelectedPdfFile } from "../types/pdf";
import { formatFileSize } from "../utils/fileSize";

const errorKeys: Record<string, TranslationKey> = {
  INVALID_EXTENSION: "error_INVALID_EXTENSION",
  EMPTY_FILE: "error_EMPTY_FILE",
  FILE_TOO_LARGE: "error_FILE_TOO_LARGE",
  INVALID_PDF: "error_INVALID_PDF",
  CORRUPTED_PDF: "error_CORRUPTED_PDF",
  ENCRYPTED_PDF: "error_ENCRYPTED_PDF",
  NETWORK_ERROR: "error_NETWORK_ERROR",
  SERVER_ERROR: "error_SERVER_ERROR",
};

interface SplitSelectedFileProps {
  item: SelectedPdfFile;
  disabled: boolean;
  onRemove: () => void;
  t: Translate;
}

export function SplitSelectedFile({ item, disabled, onRemove, t }: SplitSelectedFileProps) {
  const detail =
    item.status === "validating"
      ? t("checkingPdf")
      : item.status === "invalid"
        ? t(errorKeys[item.errorCode ?? ""] ?? "error_INVALID_PDF", { name: `“${item.name}”` })
        : `${formatFileSize(item.size)} • ${item.pageCount ?? 0} ${item.pageCount === 1 ? t("page") : t("pages")}`;

  return (
    <section className="selected-files" aria-labelledby="split-selected-heading">
      <div className="section-heading-row">
        <h2 id="split-selected-heading">{t("splitSelectedTitle")}</h2>
      </div>
      <ul className="pdf-file-list">
        <li className={`pdf-file-item split-file-item is-${item.status}`}>
          <svg className="file-type-icon" aria-hidden="true" viewBox="0 0 22 24">
            <path d="M3 1h11l5 5v17H3V1Zm11 1v5h4" />
            <text x="5" y="17">PDF</text>
          </svg>
          <div className="file-details">
            <span className="file-name" title={item.name}>{item.name}</span>
            <span className="file-metadata">{detail}</span>
          </div>
          <div className="file-actions">
            <button
              type="button"
              className="icon-button remove-button"
              disabled={disabled}
              onClick={onRemove}
              aria-label={t("remove", { name: item.name })}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />
              </svg>
            </button>
          </div>
        </li>
      </ul>
    </section>
  );
}

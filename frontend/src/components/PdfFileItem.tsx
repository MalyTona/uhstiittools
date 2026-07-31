import type { DragEvent } from "react";
import type { Translate, TranslationKey } from "../i18n";
import type { SelectedPdfFile } from "../types/pdf";
import { formatFileSize } from "../utils/fileSize";

const errorKeys: Record<string, TranslationKey> = {
  INVALID_EXTENSION: "error_INVALID_EXTENSION",
  EMPTY_FILE: "error_EMPTY_FILE",
  FILE_TOO_LARGE: "error_FILE_TOO_LARGE",
  TOTAL_SIZE_TOO_LARGE: "error_TOTAL_SIZE_TOO_LARGE",
  INVALID_PDF: "error_INVALID_PDF",
  CORRUPTED_PDF: "error_CORRUPTED_PDF",
  ENCRYPTED_PDF: "error_ENCRYPTED_PDF",
  NETWORK_ERROR: "error_NETWORK_ERROR",
  SERVER_ERROR: "error_SERVER_ERROR",
};

interface PdfFileItemProps {
  item: SelectedPdfFile;
  index: number;
  total: number;
  disabled: boolean;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onDragStart: (id: string) => void;
  onDropOn: (id: string) => void;
  t: Translate;
}

export function PdfFileItem({
  item,
  index,
  total,
  disabled,
  onMove,
  onRemove,
  onDragStart,
  onDropOn,
  t,
}: PdfFileItemProps) {
  const detail =
    item.status === "validating"
      ? t("checkingPdf")
      : item.status === "invalid"
        ? t(errorKeys[item.errorCode ?? ""] ?? "error_INVALID_PDF", { name: `“${item.name}”` })
        : `${formatFileSize(item.size)} • ${item.pageCount ?? 0} ${item.pageCount === 1 ? t("page") : t("pages")}`;

  const startDrag = (event: DragEvent<HTMLLIElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    onDragStart(item.id);
  };

  return (
    <li
      className={`pdf-file-item is-${item.status}`}
      draggable={!disabled}
      onDragStart={startDrag}
      onDragOver={(event) => {
        if (!disabled) event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled) onDropOn(item.id);
      }}
    >
      <svg className="drag-handle" aria-hidden="true" viewBox="0 0 10 18">
        <circle cx="2" cy="3" r="1.5" /><circle cx="8" cy="3" r="1.5" />
        <circle cx="2" cy="9" r="1.5" /><circle cx="8" cy="9" r="1.5" />
        <circle cx="2" cy="15" r="1.5" /><circle cx="8" cy="15" r="1.5" />
      </svg>
      <span className="order-number visually-hidden">{index + 1}</span>
      <svg className="file-type-icon" aria-hidden="true" viewBox="0 0 22 24">
        <path d="M3 1h11l5 5v17H3V1Zm11 1v5h4" />
        <text x="5" y="17">PDF</text>
      </svg>
      <div className="file-details">
        <span className="file-name" title={item.name}>{item.name}</span>
        <span className="file-metadata">{detail}</span>
        <span className="visually-hidden">{t("orderDescription", { position: index + 1, total })}</span>
      </div>
      <div className="file-actions">
        <button
          type="button"
          className="icon-button"
          disabled={disabled || index === 0}
          onClick={() => onMove(item.id, -1)}
          aria-label={t("moveUp", { name: item.name })}
        >↑</button>
        <button
          type="button"
          className="icon-button"
          disabled={disabled || index === total - 1}
          onClick={() => onMove(item.id, 1)}
          aria-label={t("moveDown", { name: item.name })}
        >↓</button>
        <button
          type="button"
          className="icon-button remove-button"
          disabled={disabled}
          onClick={() => onRemove(item.id)}
          aria-label={t("remove", { name: item.name })}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />
          </svg>
        </button>
      </div>
    </li>
  );
}

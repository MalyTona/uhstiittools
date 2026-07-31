import { useState } from "react";
import type { Translate } from "../i18n";
import type { SelectedPdfFile } from "../types/pdf";
import { formatFileSize } from "../utils/fileSize";
import { PdfFileItem } from "./PdfFileItem";

interface SelectedFilesProps {
  files: SelectedPdfFile[];
  disabled: boolean;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onReorder: (sourceId: string, targetId: string) => void;
  t: Translate;
}

export function SelectedFiles({ files, disabled, onMove, onRemove, onReorder, t }: SelectedFilesProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const combinedSize = files.reduce((sum, item) => sum + item.size, 0);

  if (files.length === 0) return null;
  return (
    <section className="selected-files" aria-labelledby="selected-files-title">
      <div className="section-heading-row">
        <h2 id="selected-files-title">{t("selectedWithCount", { count: files.length })}</h2>
        <p className="reorder-hint">{t("dragToReorder")}</p>
        <span className="visually-hidden">
          {t("selectedSummary", { count: files.length, size: formatFileSize(combinedSize) })}
        </span>
      </div>
      <ol className="pdf-file-list">
        {files.map((item, index) => (
          <PdfFileItem
            key={item.id}
            item={item}
            index={index}
            total={files.length}
            disabled={disabled}
            onMove={onMove}
            onRemove={onRemove}
            onDragStart={setDraggedId}
            onDropOn={(targetId) => {
              if (draggedId) onReorder(draggedId, targetId);
              setDraggedId(null);
            }}
            t={t}
          />
        ))}
      </ol>
    </section>
  );
}

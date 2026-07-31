import { useRef, useState, type DragEvent } from "react";
import type { Translate } from "../i18n";

interface UploadDropzoneProps {
  disabled: boolean;
  onFiles: (files: File[]) => void;
  t: Translate;
  multiple?: boolean;
  title?: string;
  activeTitle?: string;
  secondary?: string;
  selectText?: string;
  inputLabel?: string;
  hint?: string;
}

export function UploadDropzone({
  disabled,
  onFiles,
  t,
  multiple = true,
  title = t("dropTitle"),
  activeTitle = t("dropActive"),
  secondary = t("dropSecondary"),
  selectText = t("selectFiles"),
  inputLabel = t("uploadLabel"),
  hint = t("uploadHint"),
}: UploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (!disabled) onFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <label
      className={`upload-dropzone${dragOver ? " is-drag-over" : ""}${disabled ? " is-disabled" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOver(false);
      }}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept=".pdf,application/pdf"
        multiple={multiple}
        disabled={disabled}
        aria-label={inputLabel}
        onChange={(event) => {
          onFiles(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = "";
        }}
      />
      <svg className="pdf-upload-icon" aria-hidden="true" viewBox="0 0 32 32">
        <path d="M8 4h13l5 5v17H8V4Zm13 1.8V10h4.2M5 8v21h17" />
        <text x="11" y="21">PDF</text>
      </svg>
      <span className="drop-title">{dragOver ? activeTitle : title}</span>
      <span className="drop-secondary">{secondary}</span>
      <span className="button button-primary select-files-button">
        <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
        {selectText}
      </span>
      <span id="upload-help" className="visually-hidden">{hint}</span>
    </label>
  );
}

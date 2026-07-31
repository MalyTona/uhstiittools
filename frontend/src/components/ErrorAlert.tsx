import { useEffect, useRef } from "react";
import type { Translate, TranslationKey } from "../i18n";
import type { ApiError } from "../types/pdf";

const errorKeys: Record<string, TranslationKey> = {
  NO_FILES: "error_NO_FILES",
  TOO_FEW_FILES: "error_TOO_FEW_FILES",
  TOO_MANY_FILES: "error_TOO_MANY_FILES",
  TOO_MANY_SPLIT_FILES: "error_TOO_MANY_SPLIT_FILES",
  INVALID_EXTENSION: "error_INVALID_EXTENSION",
  EMPTY_FILE: "error_EMPTY_FILE",
  FILE_TOO_LARGE: "error_FILE_TOO_LARGE",
  TOTAL_SIZE_TOO_LARGE: "error_TOTAL_SIZE_TOO_LARGE",
  INVALID_PDF: "error_INVALID_PDF",
  CORRUPTED_PDF: "error_CORRUPTED_PDF",
  ENCRYPTED_PDF: "error_ENCRYPTED_PDF",
  UNSAFE_FILENAME: "error_UNSAFE_FILENAME",
  MERGE_FAILED: "error_MERGE_FAILED",
  SPLIT_FAILED: "error_SPLIT_FAILED",
  NETWORK_ERROR: "error_NETWORK_ERROR",
  SERVER_ERROR: "error_SERVER_ERROR",
};

export function ErrorAlert({ error, t }: { error: ApiError | null; t: Translate }) {
  const alertRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) alertRef.current?.focus();
  }, [error]);
  if (!error) return null;
  return (
    <div className="error-alert" role="alert" tabIndex={-1} ref={alertRef}>
      <span className="error-icon" aria-hidden="true">!</span>
      <div>
        <h2>{t("errorTitle")}</h2>
        <p>{t(errorKeys[error.code] ?? "error_SERVER_ERROR")}</p>
      </div>
    </div>
  );
}

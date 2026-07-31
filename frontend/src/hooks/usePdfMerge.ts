import { useCallback, useEffect, useRef, useState } from "react";
import { mergePdfFiles, PdfApiError } from "../services/pdfApi";
import type { ApiError, MergeResult, MergeStatus, SelectedPdfFile } from "../types/pdf";

export function usePdfMerge() {
  const [status, setStatus] = useState<MergeStatus>("idle");
  const [result, setResult] = useState<MergeResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const resultUrl = useRef<string | null>(null);

  const revokeResult = useCallback(() => {
    if (resultUrl.current) URL.revokeObjectURL(resultUrl.current);
    resultUrl.current = null;
  }, []);

  useEffect(() => revokeResult, [revokeResult]);

  const merge = useCallback(
    async (files: SelectedPdfFile[], outputFilename: string) => {
      if (status === "uploading" || status === "merging") return;
      setError(null);
      setStatus("uploading");
      const request = mergePdfFiles(files, outputFilename);
      setStatus("merging");
      try {
        const download = await request;
        revokeResult();
        const downloadUrl = URL.createObjectURL(download.blob);
        resultUrl.current = downloadUrl;
        setResult({
          filename: download.filename,
          fileCount: download.fileCount,
          pageCount: download.pageCount,
          downloadUrl,
        });
        setStatus("completed");
      } catch (caught) {
        const apiError =
          caught instanceof PdfApiError
            ? caught
            : new PdfApiError("SERVER_ERROR", "Merge failed");
        setError({ code: apiError.code, message: apiError.message });
        setStatus("error");
      }
    },
    [revokeResult, status],
  );

  const resetMerge = useCallback(() => {
    revokeResult();
    setResult(null);
    setError(null);
    setStatus("idle");
  }, [revokeResult]);

  return { status, result, error, setError, merge, resetMerge };
}


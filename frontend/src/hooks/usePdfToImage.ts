import { useCallback, useEffect, useRef, useState } from "react";
import { convertPdfToImages, getPdfInfo, PdfApiError } from "../services/pdfApi";
import type {
  ApiError,
  ConvertResult,
  ConvertStatus,
  ImageOutputFormat,
  SelectedPdfFile,
} from "../types/pdf";
import { basicFileError } from "../utils/validation";

function uniqueId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function usePdfToImage() {
  const [selectedFile, setSelectedFile] = useState<SelectedPdfFile | null>(null);
  const [status, setStatus] = useState<ConvertStatus>("idle");
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const resultUrls = useRef<string[]>([]);
  const generation = useRef(0);

  const revokeResult = useCallback(() => {
    resultUrls.current.forEach((url) => URL.revokeObjectURL(url));
    resultUrls.current = [];
  }, []);

  useEffect(() => revokeResult, [revokeResult]);

  const selectFiles = useCallback(
    async (incoming: File[]) => {
      if (incoming.length === 0) return;
      const currentGeneration = ++generation.current;
      revokeResult();
      setResult(null);
      setError(null);

      if (incoming.length > 1) {
        setSelectedFile(null);
        setStatus("error");
        setError({ code: "TOO_MANY_CONVERT_FILES", message: "Select one PDF file" });
        return;
      }

      const file = incoming[0];
      if (!file) return;
      const errorCode = basicFileError(file);
      const item: SelectedPdfFile = {
        id: uniqueId(),
        file,
        name: file.name,
        size: file.size,
        status: errorCode ? "invalid" : "validating",
        errorCode,
      };
      setSelectedFile(item);

      if (errorCode) {
        setStatus("error");
        return;
      }

      setStatus("validating");
      try {
        const info = await getPdfInfo(file);
        if (generation.current !== currentGeneration) return;
        setSelectedFile({ ...item, status: "valid", pageCount: info.pages });
        setStatus("ready");
      } catch (caught) {
        if (generation.current !== currentGeneration) return;
        const apiError =
          caught instanceof PdfApiError
            ? caught
            : new PdfApiError("SERVER_ERROR", "Validation failed");
        setSelectedFile({ ...item, status: "invalid", errorCode: apiError.code });
        setStatus("error");
      }
    },
    [revokeResult],
  );

  const convert = useCallback(
    async (outputFilename: string, format: ImageOutputFormat) => {
      if (!selectedFile || selectedFile.status !== "valid" || status === "converting") return;
      setError(null);
      setStatus("converting");
      try {
        const download = await convertPdfToImages(selectedFile.file, outputFilename, format);
        revokeResult();
        const pages = download.pages.map((page) => ({
          filename: page.filename,
          pageNumber: page.pageNumber,
          downloadUrl: URL.createObjectURL(page.blob),
        }));
        resultUrls.current = pages.map((page) => page.downloadUrl);
        setResult({ pages, format });
        setStatus("completed");
      } catch (caught) {
        const apiError =
          caught instanceof PdfApiError
            ? caught
            : new PdfApiError("CONVERT_FAILED", "Conversion failed");
        setError({ code: apiError.code, message: apiError.message });
        setStatus("error");
      }
    },
    [revokeResult, selectedFile, status],
  );

  const resetConversion = useCallback(() => {
    generation.current += 1;
    revokeResult();
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setStatus("idle");
  }, [revokeResult]);

  return { selectedFile, status, result, error, selectFiles, convert, resetConversion };
}

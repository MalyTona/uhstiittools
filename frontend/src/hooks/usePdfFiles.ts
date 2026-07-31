import { useCallback, useRef, useState } from "react";
import { getPdfInfo, PdfApiError } from "../services/pdfApi";
import type { ApiError, SelectedPdfFile } from "../types/pdf";
import {
  basicFileError,
  MAX_FILE_COUNT,
  MAX_TOTAL_SIZE,
} from "../utils/validation";

function uniqueId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function usePdfFiles(onError: (error: ApiError | null) => void) {
  const [files, setFiles] = useState<SelectedPdfFile[]>([]);
  const filesRef = useRef<SelectedPdfFile[]>([]);
  const generation = useRef(0);

  const updateFiles = useCallback(
    (updater: (current: SelectedPdfFile[]) => SelectedPdfFile[]) => {
      const next = updater(filesRef.current);
      filesRef.current = next;
      setFiles(next);
    },
    [],
  );

  const addFiles = useCallback(
    async (incoming: File[]) => {
      onError(null);
      const currentGeneration = generation.current;
      const current = filesRef.current;
      const room = Math.max(0, MAX_FILE_COUNT - current.length);
      const accepted = incoming.slice(0, room);
      let totalAfter = current.reduce((sum, item) => sum + item.size, 0);
      const pending: SelectedPdfFile[] = accepted.map((file) => {
        totalAfter += file.size;
        const errorCode =
          basicFileError(file) ??
          (totalAfter > MAX_TOTAL_SIZE ? "TOTAL_SIZE_TOO_LARGE" : undefined);
        return {
          id: uniqueId(),
          file,
          name: file.name,
          size: file.size,
          status: errorCode ? "invalid" : "validating",
          errorCode,
        };
      });
      if (incoming.length > room) {
        onError({ code: "TOO_MANY_FILES", message: "Too many files" });
      }
      updateFiles((latest) => [...latest, ...pending]);

      await Promise.all(
        pending
          .filter((item) => item.status === "validating")
          .map(async (item) => {
            try {
              const info = await getPdfInfo(item.file);
              if (generation.current !== currentGeneration) return;
              updateFiles((current) =>
                current.map((existing) =>
                  existing.id === item.id
                    ? { ...existing, status: "valid", pageCount: info.pages }
                    : existing,
                ),
              );
            } catch (error) {
              if (generation.current !== currentGeneration) return;
              const apiError =
                error instanceof PdfApiError
                  ? error
                  : new PdfApiError("SERVER_ERROR", "Validation failed");
              updateFiles((current) =>
                current.map((existing) =>
                  existing.id === item.id
                    ? { ...existing, status: "invalid", errorCode: apiError.code }
                    : existing,
                ),
              );
            }
          }),
      );
    },
    [onError, updateFiles],
  );

  const removeFile = useCallback((id: string) => {
    updateFiles((current) => current.filter((item) => item.id !== id));
  }, [updateFiles]);

  const moveFile = useCallback((id: string, direction: -1 | 1) => {
    updateFiles((current) => {
      const from = current.findIndex((item) => item.id === id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      if (!moved) return current;
      next.splice(to, 0, moved);
      return next;
    });
  }, [updateFiles]);

  const reorderFile = useCallback((sourceId: string, targetId: string) => {
    updateFiles((current) => {
      const from = current.findIndex((item) => item.id === sourceId);
      const to = current.findIndex((item) => item.id === targetId);
      if (from < 0 || to < 0 || from === to) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      if (!moved) return current;
      next.splice(to, 0, moved);
      return next;
    });
  }, [updateFiles]);

  const clearFiles = useCallback(() => {
    generation.current += 1;
    filesRef.current = [];
    setFiles([]);
  }, []);

  return { files, addFiles, removeFile, moveFile, reorderFile, clearFiles };
}

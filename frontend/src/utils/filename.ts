import type { ImageOutputFormat } from "../types/pdf";

export const DEFAULT_OUTPUT_FILENAME = "merged-document.pdf";
export const DEFAULT_SPLIT_FILENAME = "split.pdf";
export const DEFAULT_IMAGE_FILENAME = "converted.png";

export function normalisePdfFilename(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[. -]+|[. -]+$/g, "");
  if (!cleaned) return DEFAULT_OUTPUT_FILENAME;
  const stem = cleaned.toLowerCase().endsWith(".pdf")
    ? cleaned.slice(0, -4).replace(/[. ]+$/g, "")
    : cleaned;
  return `${stem.slice(0, 116) || "merged-document"}.pdf`;
}

export function normaliseSplitFilename(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[. -]+|[. -]+$/g, "");
  if (!cleaned) return DEFAULT_SPLIT_FILENAME;
  const stem = cleaned.toLowerCase().endsWith(".pdf")
    ? cleaned.slice(0, -4).replace(/[. ]+$/g, "")
    : cleaned;
  return `${stem.slice(0, 116) || "split"}.pdf`;
}

export function normaliseImageFilename(
  value: string,
  format: ImageOutputFormat,
): string {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[. -]+|[. -]+$/g, "");
  const stem = cleaned.replace(/\.(?:png|jpe?g|webp)$/i, "").replace(/[. ]+$/g, "");
  const maximumStemLength = 119 - format.length;
  return `${stem.slice(0, maximumStemLength) || "converted"}.${format}`;
}

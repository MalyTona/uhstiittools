export const DEFAULT_OUTPUT_FILENAME = "merged-document.pdf";
export const DEFAULT_SPLIT_FILENAME = "split.pdf";

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

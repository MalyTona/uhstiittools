import type {
  ApiError,
  MergeDownload,
  PdfInfo,
  SelectedPdfFile,
  SplitDownload,
} from "../types/pdf";

export class PdfApiError extends Error implements ApiError {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PdfApiError";
    this.code = code;
  }
}

interface ErrorEnvelope {
  ok: false;
  error: ApiError;
}

function findBytes(haystack: Uint8Array, needle: Uint8Array, start: number): number {
  const lastStart = haystack.length - needle.length;
  for (let index = start; index <= lastStart; index += 1) {
    let matches = true;
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (haystack[index + offset] !== needle[offset]) {
        matches = false;
        break;
      }
    }
    if (matches) return index;
  }
  return -1;
}

function startsWithBytes(value: Uint8Array, expected: Uint8Array, start: number): boolean {
  if (start + expected.length > value.length) return false;
  return expected.every((byte, offset) => value[start + offset] === byte);
}

function multipartBoundary(contentType: string): string | null {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
  return match?.[1] ?? match?.[2] ?? null;
}

function partFilename(headers: string, fallback: string): string {
  const encoded = headers.match(/filename\*=UTF-8''([^;\r\n]+)/i)?.[1];
  const simple = headers.match(/filename="?([^";\r\n]+)"?/i)?.[1];
  try {
    return encoded ? decodeURIComponent(encoded) : simple ?? fallback;
  } catch {
    return fallback;
  }
}

async function parseSplitPages(response: Response, fallbackFilename: string): Promise<SplitDownload> {
  const boundary = multipartBoundary(response.headers.get("Content-Type") ?? "");
  if (!boundary) throw new PdfApiError("SPLIT_FAILED", "The split response was invalid.");

  const bytes = new Uint8Array(await response.arrayBuffer());
  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8");
  const opening = encoder.encode(`--${boundary}\r\n`);
  const delimiter = encoder.encode(`\r\n--${boundary}`);
  const headerEndMarker = encoder.encode("\r\n\r\n");
  const nextPartMarker = encoder.encode("\r\n");
  const closingMarker = encoder.encode("--");
  if (!startsWithBytes(bytes, opening, 0)) {
    throw new PdfApiError("SPLIT_FAILED", "The split response was invalid.");
  }

  const fallbackStem = fallbackFilename.toLowerCase().endsWith(".pdf")
    ? fallbackFilename.slice(0, -4)
    : fallbackFilename;
  const pages: SplitDownload["pages"] = [];
  let cursor = opening.length;

  while (cursor < bytes.length) {
    const headerEnd = findBytes(bytes, headerEndMarker, cursor);
    if (headerEnd < 0) throw new PdfApiError("SPLIT_FAILED", "A page response was incomplete.");
    const headers = decoder.decode(bytes.slice(cursor, headerEnd));
    const dataStart = headerEnd + headerEndMarker.length;
    const nextBoundary = findBytes(bytes, delimiter, dataStart);
    if (nextBoundary < 0) throw new PdfApiError("SPLIT_FAILED", "A page response was incomplete.");

    const pageNumber = Number(headers.match(/^X-Page-Number:\s*(\d+)\s*$/im)?.[1]) || pages.length + 1;
    const fallback = `${fallbackStem}-page-${String(pageNumber).padStart(3, "0")}.pdf`;
    pages.push({
      blob: new Blob([bytes.slice(dataStart, nextBoundary)], { type: "application/pdf" }),
      filename: partFilename(headers, fallback),
      pageNumber,
    });

    const boundaryEnd = nextBoundary + delimiter.length;
    if (startsWithBytes(bytes, closingMarker, boundaryEnd)) break;
    if (!startsWithBytes(bytes, nextPartMarker, boundaryEnd)) {
      throw new PdfApiError("SPLIT_FAILED", "The split response was invalid.");
    }
    cursor = boundaryEnd + nextPartMarker.length;
  }

  if (pages.length === 0) throw new PdfApiError("SPLIT_FAILED", "No split pages were returned.");
  return { pages };
}

async function parseError(response: Response, fallbackCode: string): Promise<PdfApiError> {
  try {
    const body = (await response.json()) as ErrorEnvelope;
    if (body.error?.code) return new PdfApiError(body.error.code, body.error.message);
  } catch {
    // A proxy or server may return a non-JSON error page; expose a safe message.
  }
  return new PdfApiError(
    response.status >= 500 ? "SERVER_ERROR" : fallbackCode,
    "The request could not be completed.",
  );
}

export async function getPdfInfo(file: File): Promise<PdfInfo> {
  const formData = new FormData();
  formData.append("file", file);
  let response: Response;
  try {
    response = await fetch("/api/pdf-info", { method: "POST", body: formData });
  } catch {
    throw new PdfApiError("NETWORK_ERROR", "The server could not be reached.");
  }
  if (!response.ok) throw await parseError(response, "INVALID_PDF");
  const body = (await response.json()) as { ok: true; file: PdfInfo };
  return body.file;
}

function responseFilename(response: Response, fallback: string): string {
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const simple = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  const encoded = utf8 ?? simple;
  if (!encoded) return fallback;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return fallback;
  }
}

export async function mergePdfFiles(
  orderedFiles: SelectedPdfFile[],
  outputFilename: string,
): Promise<MergeDownload> {
  const formData = new FormData();
  orderedFiles.forEach((item) => formData.append("files", item.file));
  formData.append("output_filename", outputFilename);

  let response: Response;
  try {
    response = await fetch("/api/merge", { method: "POST", body: formData });
  } catch {
    throw new PdfApiError("NETWORK_ERROR", "The server could not be reached.");
  }
  if (!response.ok) throw await parseError(response, "MERGE_FAILED");

  const pageHeader = response.headers.get("X-Merged-Page-Count");
  return {
    blob: await response.blob(),
    filename: responseFilename(response, outputFilename),
    fileCount: Number(response.headers.get("X-Merged-File-Count")) || orderedFiles.length,
    pageCount: pageHeader ? Number(pageHeader) : undefined,
  };
}

export async function splitPdfFile(file: File, outputFilename: string): Promise<SplitDownload> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("output_filename", outputFilename);

  let response: Response;
  try {
    response = await fetch("/api/split", { method: "POST", body: formData });
  } catch {
    throw new PdfApiError("NETWORK_ERROR", "The server could not be reached.");
  }
  if (!response.ok) throw await parseError(response, "SPLIT_FAILED");

  return parseSplitPages(response, outputFilename);
}

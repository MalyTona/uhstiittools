import { describe, expect, it, vi } from "vitest";
import { mergePdfFiles, splitPdfFile } from "../services/pdfApi";
import type { SelectedPdfFile } from "../types/pdf";

function selected(name: string): SelectedPdfFile {
  const file = new File([name], name, { type: "application/pdf" });
  return { id: name, file, name, size: file.size, status: "valid", pageCount: 1 };
}

function multipartResponse(filenames: string[]): Response {
  const boundary = "test-split-boundary";
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  filenames.forEach((filename, index) => {
    chunks.push(encoder.encode(
      `--${boundary}\r\nContent-Type: application/pdf\r\nContent-Disposition: attachment; filename*=UTF-8''${encodeURIComponent(filename)}\r\nX-Page-Number: ${index + 1}\r\n\r\n`,
    ));
    chunks.push(encoder.encode(`pdf-page-${index + 1}`));
    chunks.push(encoder.encode("\r\n"));
  });
  chunks.push(encoder.encode(`--${boundary}--\r\n`));
  const body = new Uint8Array(chunks.reduce((size, chunk) => size + chunk.length, 0));
  let offset = 0;
  chunks.forEach((chunk) => {
    body.set(chunk, offset);
    offset += chunk.length;
  });
  return {
    ok: true,
    status: 200,
    arrayBuffer: async () => body.buffer,
    headers: new Headers({
      "Content-Type": `multipart/mixed; boundary=${boundary}`,
      "X-Split-Page-Count": String(filenames.length),
    }),
  } as Response;
}

describe("pdfApi", () => {
  it("constructs repeated files fields in exact array order", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const form = init?.body as FormData;
      expect((form.getAll("files") as File[]).map((file) => file.name)).toEqual([
        "z-last-alphabetically.pdf",
        "a-first-alphabetically.pdf",
        "duplicate.pdf",
        "duplicate.pdf",
      ]);
      expect(form.get("output_filename")).toBe("result.pdf");
      return {
        ok: true,
        status: 200,
        blob: async () => new Blob(["merged"]),
        headers: new Headers({ "X-Merged-File-Count": "4" }),
      } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);
    const files = [
      selected("z-last-alphabetically.pdf"),
      selected("a-first-alphabetically.pdf"),
      selected("duplicate.pdf"),
      selected("duplicate.pdf"),
    ];
    const result = await mergePdfFiles(files, "result.pdf");
    expect(result.fileCount).toBe(4);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("constructs the split request and parses individual page PDFs", async () => {
    const source = new File(["source"], "lecture.pdf", { type: "application/pdf" });
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe("/api/split");
      const form = init?.body as FormData;
      expect((form.get("file") as File).name).toBe("lecture.pdf");
      expect(form.get("output_filename")).toBe("lecture-pages.pdf");
      return multipartResponse([
        "lecture-pages-page-001.pdf",
        "lecture-pages-page-002.pdf",
      ]);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await splitPdfFile(source, "lecture-pages.pdf");

    expect(result.pages.map((page) => page.filename)).toEqual([
      "lecture-pages-page-001.pdf",
      "lecture-pages-page-002.pdf",
    ]);
    expect(result.pages.map((page) => page.pageNumber)).toEqual([1, 2]);
    expect(result.pages.every((page) => page.blob.type === "application/pdf")).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

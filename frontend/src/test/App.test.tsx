import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

function pdf(name: string, content = "pdf bytes"): File {
  return new File([content], name, { type: "application/pdf" });
}

function jsonResponse(body: object, ok = true, status = ok ? 200 : 400): Response {
  return {
    ok,
    status,
    json: async () => body,
    headers: new Headers(),
  } as Response;
}

function mergeResponse(filename = "merged-document.pdf"): Response {
  return {
    ok: true,
    status: 200,
    blob: async () => new Blob(["merged"], { type: "application/pdf" }),
    headers: new Headers({
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Merged-File-Count": "2",
      "X-Merged-Page-Count": "4",
    }),
  } as Response;
}

function splitResponse(filenameBase = "split-page", pages = 3): Response {
  const boundary = "test-split-boundary";
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  for (let page = 1; page <= pages; page += 1) {
    const filename = `${filenameBase}-page-${String(page).padStart(3, "0")}.pdf`;
    chunks.push(encoder.encode(
      `--${boundary}\r\nContent-Type: application/pdf\r\nContent-Disposition: attachment; filename*=UTF-8''${encodeURIComponent(filename)}\r\nX-Page-Number: ${page}\r\n\r\n`,
    ));
    chunks.push(encoder.encode(`pdf-page-${page}`));
    chunks.push(encoder.encode("\r\n"));
  }
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
      "X-Split-Page-Count": String(pages),
    }),
  } as Response;
}

function successfulFetch() {
  return vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async (input) => {
    if (String(input) === "/api/pdf-info") {
      return jsonResponse({
        ok: true,
        file: { name: "file.pdf", size: 9, pages: 2, encrypted: false },
      });
    }
    return mergeResponse();
  });
}

async function uploadFiles(files: File[], fetchMock = successfulFetch()) {
  vi.stubGlobal("fetch", fetchMock);
  const user = userEvent.setup({ applyAccept: false });
  render(<App />);
  await user.upload(screen.getByLabelText("Choose PDF files to add"), files);
  return { user, fetchMock };
}

describe("PDF merge application", () => {
  beforeEach(() => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("renders the progressive empty state", () => {
    vi.stubGlobal("fetch", successfulFetch());
    render(<App />);
    expect(screen.getByRole("heading", { name: /^Merge PDF Documents/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Choose PDF files to add")).toBeInTheDocument();
    expect(screen.queryByText("Selected documents")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Merge PDFs" })).not.toBeInTheDocument();
  });

  it("selects multiple files and appends additional files", async () => {
    const { user } = await uploadFiles([pdf("first.pdf"), pdf("second.pdf")]);
    await screen.findByText("first.pdf");
    await user.upload(screen.getByLabelText("Choose PDF files to add"), pdf("third.pdf"));
    await screen.findByText("third.pdf");
    expect(screen.getByText(/3 files/)).toBeInTheDocument();
    expect(document.querySelectorAll(".pdf-file-item")).toHaveLength(3);
  });

  it("keeps a non-PDF visible with a localized validation reason", async () => {
    const { fetchMock } = await uploadFiles([
      new File(["doc"], "assignment.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
    ]);
    expect(await screen.findByText("assignment.docx")).toBeInTheDocument();
    expect(screen.getByText(/is not a PDF file/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("removes selected files", async () => {
    const { user } = await uploadFiles([pdf("remove-me.pdf"), pdf("keep-me.pdf")]);
    await screen.findByText("remove-me.pdf");
    await user.click(screen.getByRole("button", { name: "Remove remove-me.pdf" }));
    expect(screen.queryByText("remove-me.pdf")).not.toBeInTheDocument();
    expect(screen.getByText("keep-me.pdf")).toBeInTheDocument();
  });

  it("supports keyboard-accessible file reordering", async () => {
    const { user } = await uploadFiles([pdf("first.pdf"), pdf("second.pdf"), pdf("third.pdf")]);
    await screen.findByText("third.pdf");
    await user.click(screen.getByRole("button", { name: "Move third.pdf up" }));
    const names = Array.from(document.querySelectorAll(".file-name"), (node) => node.textContent);
    expect(names).toEqual(["first.pdf", "third.pdf", "second.pdf"]);
  });

  it("supports pointer drag reordering", async () => {
    await uploadFiles([pdf("first.pdf"), pdf("second.pdf")]);
    await screen.findByText("second.pdf");
    const rows = screen.getAllByRole("listitem");
    const transfer = { effectAllowed: "none", files: [] } as unknown as DataTransfer;
    fireEvent.dragStart(rows[0] as HTMLElement, { dataTransfer: transfer });
    fireEvent.dragOver(rows[1] as HTMLElement, { dataTransfer: transfer });
    fireEvent.drop(rows[1] as HTMLElement, { dataTransfer: transfer });
    const names = Array.from(document.querySelectorAll(".file-name"), (node) => node.textContent);
    expect(names).toEqual(["second.pdf", "first.pdf"]);
  });

  it("disables merging until two files finish validation", async () => {
    const { user } = await uploadFiles([pdf("only.pdf")]);
    await screen.findByText("only.pdf");
    expect(screen.getByRole("button", { name: "Merge PDFs" })).toBeDisabled();
    expect(screen.getByText(/Add at least one more valid PDF/)).toBeInTheDocument();
    await user.upload(screen.getByLabelText("Choose PDF files to add"), pdf("another.pdf"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Merge PDFs" })).toBeEnabled());
  });

  it("submits FormData in the exact displayed order", async () => {
    const { user, fetchMock } = await uploadFiles([pdf("first.pdf"), pdf("second.pdf"), pdf("third.pdf")]);
    await waitFor(() => expect(screen.getByRole("button", { name: "Merge PDFs" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Move third.pdf up" }));
    await user.click(screen.getByRole("button", { name: "Merge PDFs" }));
    await screen.findByRole("heading", { name: "Merge completed successfully" });
    const mergeCall = fetchMock.mock.calls.find(([url]) => String(url) === "/api/merge");
    const form = (mergeCall?.[1] as RequestInit).body as FormData;
    expect((form.getAll("files") as File[]).map((file) => file.name)).toEqual([
      "first.pdf",
      "third.pdf",
      "second.pdf",
    ]);
  });

  it("shows a real indeterminate processing state and prevents edits", async () => {
    let resolveMerge: ((response: Response) => void) | undefined;
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      if (String(input) === "/api/pdf-info") {
        return Promise.resolve(jsonResponse({ ok: true, file: { name: "x", size: 1, pages: 1, encrypted: false } }));
      }
      return new Promise<Response>((resolve) => { resolveMerge = resolve; });
    });
    const { user } = await uploadFiles([pdf("first.pdf"), pdf("second.pdf")], fetchMock);
    await waitFor(() => expect(screen.getByRole("button", { name: "Merge PDFs" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Merge PDFs" }));
    expect(screen.getByText(/Merging documents/)).toBeInTheDocument();
    expect(screen.getByLabelText("Choose PDF files to add")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Merge PDFs" })).toBeDisabled();
    resolveMerge?.(mergeResponse());
    await screen.findByRole("heading", { name: "Merge completed successfully" });
  });

  it("shows the Blob result and cleans its object URL on restart", async () => {
    const { user } = await uploadFiles([pdf("first.pdf"), pdf("second.pdf")]);
    await waitFor(() => expect(screen.getByRole("button", { name: "Merge PDFs" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Merge PDFs" }));
    const download = await screen.findByRole("link", { name: "Download Merged PDF" });
    expect(download).toHaveAttribute("href", "blob:test-download");
    expect(screen.getByText(/2 PDF files were combined into 4 pages/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Start Another Merge" }));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-download");
    expect(screen.queryByText("Selected documents")).not.toBeInTheDocument();
  });

  it("displays structured API errors without discarding selected files", async () => {
    const fetchMock = successfulFetch();
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/pdf-info") {
        return jsonResponse({ ok: true, file: { name: "x", size: 1, pages: 1, encrypted: false } });
      }
      return jsonResponse(
        { ok: false, error: { code: "MERGE_FAILED", message: "internal details" } },
        false,
        400,
      );
    });
    const { user } = await uploadFiles([pdf("first.pdf"), pdf("second.pdf")], fetchMock);
    await waitFor(() => expect(screen.getByRole("button", { name: "Merge PDFs" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Merge PDFs" }));
    expect(await screen.findByText(/could not be merged/)).toBeInTheDocument();
    expect(screen.getByText("first.pdf")).toBeInTheDocument();
    expect(screen.queryByText("internal details")).not.toBeInTheDocument();
  });

  it("switches between English and Khmer and persists the preference", async () => {
    vi.stubGlobal("fetch", successfulFetch());
    const user = userEvent.setup();
    const view = render(<App />);
    await user.click(screen.getByRole("button", { name: "ភាសាខ្មែរ" }));
    expect(screen.getByRole("heading", { name: /^បញ្ចូលឯកសារ PDF/ })).toBeInTheDocument();
    expect(localStorage.getItem("uhst-iit-language")).toBe("km");
    expect(document.documentElement.lang).toBe("km");
    view.unmount();
    render(<App />);
    expect(screen.getByRole("heading", { name: /^បញ្ចូលឯកសារ PDF/ })).toBeInTheDocument();
  });

  it("asks before resetting selected files and then clears state", async () => {
    const { user } = await uploadFiles([pdf("first.pdf"), pdf("second.pdf")]);
    await screen.findByText("second.pdf");
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("first.pdf")).toBeInTheDocument();
    vi.mocked(window.confirm).mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.queryByText("first.pdf")).not.toBeInTheDocument();
    expect(screen.queryByText("Selected documents")).not.toBeInTheDocument();
  });

  it("normalises an unsafe filename and appends .pdf", async () => {
    const { user, fetchMock } = await uploadFiles([pdf("first.pdf"), pdf("second.pdf")]);
    await waitFor(() => expect(screen.getByRole("button", { name: "Merge PDFs" })).toBeEnabled());
    const input = screen.getByLabelText("Output Filename (Optional)");
    await user.clear(input);
    await user.type(input, "../meeting:notes");
    await user.tab();
    expect(input).toHaveValue("meeting-notes");
    expect(screen.getByText(/filename was adjusted/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Merge PDFs" }));
    const mergeCall = fetchMock.mock.calls.find(([url]) => String(url) === "/api/merge");
    expect(((mergeCall?.[1] as RequestInit).body as FormData).get("output_filename")).toBe("meeting-notes.pdf");
  });

  it("keeps long filenames safely contained and fully available as a title", async () => {
    const longName = `${"long-document-name-".repeat(12)}.pdf`;
    await uploadFiles([pdf(longName)]);
    const name = await screen.findByTitle(longName);
    expect(name).toHaveClass("file-name");
    expect(within(name.closest("li") as HTMLElement).getByText(longName)).toBeInTheDocument();
  });

  it("switches to the single-file split workflow", async () => {
    vi.stubGlobal("fetch", successfulFetch());
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: "Split PDF" }));

    expect(screen.getByRole("heading", { name: /^Split PDF Documents/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Choose one PDF file to split")).not.toHaveAttribute("multiple");
    expect(screen.queryByLabelText("Choose PDF files to add")).not.toBeInTheDocument();
  });

  it("splits one PDF and exposes each page as an individual download", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      if (String(input) === "/api/pdf-info") {
        return jsonResponse({
          ok: true,
          file: { name: "lecture.pdf", size: 9, pages: 3, encrypted: false },
        });
      }
      return splitResponse("lecture-pages", 3);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup({ applyAccept: false });
    render(<App />);
    await user.click(screen.getByRole("tab", { name: "Split PDF" }));
    await user.upload(screen.getByLabelText("Choose one PDF file to split"), pdf("lecture.pdf"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Split PDF" })).toBeEnabled());

    const filename = screen.getByLabelText("Page Filename Base (Optional)");
    await user.clear(filename);
    await user.type(filename, "lecture-pages");
    await user.click(screen.getByRole("button", { name: "Split PDF" }));

    const splitCall = fetchMock.mock.calls.find(([url]) => String(url) === "/api/split");
    const form = (splitCall?.[1] as RequestInit).body as FormData;
    expect((form.get("file") as File).name).toBe("lecture.pdf");
    expect(form.get("output_filename")).toBe("lecture-pages.pdf");
    const downloads = await screen.findAllByRole("link", { name: /Download page/ });
    expect(downloads).toHaveLength(3);
    expect(downloads[0]).toHaveAttribute("href", "blob:test-download");
    expect(downloads[0]).toHaveAttribute("download", "lecture-pages-page-001.pdf");
    expect(downloads[2]).toHaveAttribute("download", "lecture-pages-page-003.pdf");
    expect(screen.getByText(/3 individual PDF files are ready to download/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Split Another PDF" }));
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(3);
    expect(screen.queryByText("lecture.pdf")).not.toBeInTheDocument();
  });

  it("keeps the source selected when splitting returns a structured error", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/pdf-info") {
        return jsonResponse({
          ok: true,
          file: { name: "source.pdf", size: 9, pages: 2, encrypted: false },
        });
      }
      return jsonResponse(
        { ok: false, error: { code: "SPLIT_FAILED", message: "private server detail" } },
        false,
        400,
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup({ applyAccept: false });
    render(<App />);
    await user.click(screen.getByRole("tab", { name: "Split PDF" }));
    await user.upload(screen.getByLabelText("Choose one PDF file to split"), pdf("source.pdf"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Split PDF" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Split PDF" }));

    expect(await screen.findByText(/could not be split/)).toBeInTheDocument();
    expect(screen.getByText("source.pdf")).toBeInTheDocument();
    expect(screen.queryByText("private server detail")).not.toBeInTheDocument();
  });

  it("localizes the split workflow in Khmer", async () => {
    vi.stubGlobal("fetch", successfulFetch());
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: "Split PDF" }));
    await user.click(screen.getByRole("button", { name: "ភាសាខ្មែរ" }));

    expect(screen.getByRole("heading", { name: /^បំបែកឯកសារ PDF/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "បំបែក PDF" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("ជ្រើសឯកសារ PDF មួយដើម្បីបំបែក")).toBeInTheDocument();
  });
});

export type Language = "en" | "km";
export type PdfTool = "merge" | "split";

export type PdfFileStatus = "validating" | "valid" | "invalid";

export type MergeStatus =
  | "idle"
  | "validating"
  | "ready"
  | "uploading"
  | "merging"
  | "completed"
  | "error";

export interface SelectedPdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  status: PdfFileStatus;
  errorCode?: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface MergeResult {
  filename: string;
  fileCount: number;
  pageCount?: number;
  downloadUrl: string;
}

export interface PdfInfo {
  name: string;
  size: number;
  pages: number;
  encrypted: boolean;
}

export interface MergeDownload {
  blob: Blob;
  filename: string;
  fileCount: number;
  pageCount?: number;
}

export type SplitStatus =
  | "idle"
  | "validating"
  | "ready"
  | "splitting"
  | "completed"
  | "error";

export interface SplitDownload {
  pages: SplitPageDownload[];
}

export interface SplitPageDownload {
  blob: Blob;
  filename: string;
  pageNumber: number;
}

export interface SplitResult {
  pages: SplitPageResult[];
}

export interface SplitPageResult {
  filename: string;
  pageNumber: number;
  downloadUrl: string;
}

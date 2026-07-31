export const MAX_FILE_COUNT = 20;
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_TOTAL_SIZE = 200 * 1024 * 1024;

export function basicFileError(file: File): string | undefined {
  if (!file.name.toLowerCase().endsWith(".pdf")) return "INVALID_EXTENSION";
  if (file.size === 0) return "EMPTY_FILE";
  if (file.size > MAX_FILE_SIZE) return "FILE_TOO_LARGE";
  return undefined;
}


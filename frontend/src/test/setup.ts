import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

const storageValues = new Map<string, string>();
const testStorage: Storage = {
  get length() { return storageValues.size; },
  clear: () => storageValues.clear(),
  getItem: (key) => storageValues.get(key) ?? null,
  key: (index) => Array.from(storageValues.keys())[index] ?? null,
  removeItem: (key) => { storageValues.delete(key); },
  setItem: (key, value) => { storageValues.set(key, String(value)); },
};

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  writable: true,
  value: testStorage,
});
Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: testStorage,
});

Object.defineProperty(URL, "createObjectURL", {
  configurable: true,
  writable: true,
  value: vi.fn(() => "blob:test-download"),
});

Object.defineProperty(URL, "revokeObjectURL", {
  configurable: true,
  writable: true,
  value: vi.fn(),
});

afterEach(() => {
  cleanup();
  try {
    window.localStorage?.clear();
  } catch {
    // Individual storage tests provide their own assertion context.
  }
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

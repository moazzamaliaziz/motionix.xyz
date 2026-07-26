"use client";

/**
 * Shared @imgly/background-removal engine for the 4 Photo Compliance tools.
 *
 * Why a singleton:
 *   - The library loads the same ISNet model from the same CDN URL.
 *   - Browser HTTP cache + the library's own @imgly/static cache keeps the
 *     second invocation effectively free (no re-download).
 *   - Module-level memoisation here just skips the dynamic-import cost on
 *     subsequent calls within the same tab.
 *
 * Cache strategy (per §4.2 of the audit spec):
 *   - Lazy import on first call.
 *   - Optional preload() from /tools index or hover intent.
 *   - WebGPU device preferred when `navigator.gpu` is available; falls back
 *     to WASM SIMD cleanly.
 */

type Remove = (input: Blob) => Promise<Blob>;
type ProgressCb = (key: string, current: number, total: number) => void;

let modulePromise: Promise<typeof import("@imgly/background-removal")> | null = null;
let removeFn: Remove | null = null;

function loadModule() {
  if (typeof window === "undefined") {
    // ponytail: SSR-safe no-op; the function bodies never run on the server.
    return Promise.reject(new Error("imgly is browser-only"));
  }
  if (!modulePromise) {
    modulePromise = import("@imgly/background-removal");
  }
  return modulePromise;
}

function pickDevice(): "gpu" | "cpu" {
  if (typeof navigator !== "undefined" && (navigator as Navigator & { gpu?: unknown }).gpu) {
    return "gpu";
  }
  return "cpu";
}

/**
 * Warm the model cache. Safe to call multiple times and from any page.
 * Does nothing in SSR.
 */
export function preloadBackgroundRemoval(): void {
  if (typeof window === "undefined") return;
  // ponytail: fire-and-forget; we don't await here so callers can call this
  // on hover/mount without blocking.
  loadModule().catch(() => {
    /* swallow — first real call will surface the error */
  });
}

export async function removeBackgroundOnce(
  input: Blob,
  onProgress?: ProgressCb,
): Promise<Blob> {
  if (!removeFn) {
    const mod = await loadModule();
    const device = pickDevice();
    removeFn = (blob) =>
      mod.removeBackground(blob, {
        device,
        progress: onProgress
          ? (key, current, total) => onProgress(key, current, total)
          : undefined,
      });
  }
  return removeFn(input);
}

/**
 * Reset the in-memory function reference. Only useful for tests / hot-reload
 * during development. Not normally needed.
 */
export function _resetBackgroundRemovalCache(): void {
  modulePromise = null;
  removeFn = null;
}

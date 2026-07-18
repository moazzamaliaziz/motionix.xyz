"use client";

import { useEffect } from "react";
import { preloadBackgroundRemoval } from "./lib/useBackgroundRemoval";

/**
 * Warms the @imgly model cache early. Renders nothing.
 *
 * - Mounted once at the root layout level.
 * - Runs once on first render via `useEffect`. Subsequent route changes
 *   don't re-trigger — `preloadBackgroundRemoval` is idempotent.
 * - ponytail: only loads if the user has indicated interest in tool pages
 *   (current heuristic: always-on; the model isn't fetched until the user
 *   actually visits a tool page anyway, so this is just a hint to the
 *   browser to start the WASM bytes download on the home page).
 *
 * If you're worried about eating data on the first landing, gate this behind
 * `navigator.connection?.saveData` etc. For now we lean on `requestIdleCallback`.
 */
export function BackgroundRemovalPreloader() {
  useEffect(() => {
    const idle =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? ((window as Window & { requestIdleCallback?: (cb: () => void) => void })
            .requestIdleCallback ?? ((cb) => setTimeout(cb, 1500)))
        : (cb: () => void) => setTimeout(cb, 1500);
    idle(() => preloadBackgroundRemoval());
  }, []);
  return null;
}

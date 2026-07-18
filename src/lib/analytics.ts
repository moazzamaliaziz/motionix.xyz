"use client";

/**

 * Browser-side analytics helpers.
 *
 * Three providers, each gated by env var, none critical-path:
 *   - GA4        → NEXT_PUBLIC_GA_MEASUREMENT_ID  (e.g. G-XXXXXXX)
 *   - Plausible  → NEXT_PUBLIC_PLAUSIBLE_DOMAIN   (e.g. motionix.xyz)
 *   - Clarity    → NEXT_PUBLIC_CLARITY_PROJECT_ID (e.g. abc123def4)
 *
 * Behavior:
 *   - If a provider is unset, its helper is a no-op.
 *   - track(name, props) fanned out across whichever providers are active.
 *   - pageview(path) — call after a route transition or on mount.
 *
 * Why a single `track()` facade and not direct gtag/clarity calls?
 *   - Tools should not know whether GA4 is on or Plausible is on.
 *     Centralizing keeps the call surface tiny.
 *   - Future: add PostHog / Fathom by extending enabled() without touching
 *     tool code.
 */

type Props = Record<string, unknown> | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export function gaEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
}
export function plausibleEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN);
}
export function clarityEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID);
}
export function anyAnalyticsEnabled(): boolean {
  return gaEnabled() || plausibleEnabled() || clarityEnabled();
}

/** Fire pageview across whichever providers are configured. */
export function pageview(path: string): void {
  if (typeof window === "undefined") return;

  if (gaEnabled() && typeof window.gtag === "function") {
    window.gtag("event", "page_view", { page_path: path });
  }
  if (plausibleEnabled() && typeof window.plausible === "function") {
    window.plausible("pageview", { u: path });
  }
  // Microsoft Clarity auto-tracks navigations; no manual call needed.
}

/**
 * Fire an event. Each provider interprets the same props structure.
 * Strings are coerced; numbers/booleans passed as-is.
 */
export function track(name: string, props?: Props): void {
  if (typeof window === "undefined") return;
  const cleanProps = props ? sanitize(props) : undefined;

  if (gaEnabled() && typeof window.gtag === "function") {
    window.gtag("event", name, cleanProps);
  }
  if (plausibleEnabled() && typeof window.plausible === "function") {
    window.plausible(name, { props: cleanProps });
  }
  if (clarityEnabled() && typeof window.clarity === "function") {
    // Clarity's API is `(eventName, payload?)`. We pass props as JSON.
    window.clarity("event", name);
  }
}

/** Strip functions / non-serialisables so analytics payloads don't blow up. */
function sanitize(o: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v == null) continue;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    } else if (typeof v === "object") {
      try {
        out[k] = JSON.parse(JSON.stringify(v));
      } catch {
        out[k] = String(v);
      }
    }
  }
  return out;
}

/* -------------------------------------------------------------------- */
/*  Common event names — keep these tight and reused.                   */
/* -------------------------------------------------------------------- */
export const EVENTS = {
  TOOL_START: "tool_start",
  TOOL_COMPLETE: "tool_complete",
  TOOL_ERROR: "tool_error",
  CLOUD_UPLOAD_START: "cloud_upload_start",
  CLOUD_UPLOAD_DONE: "cloud_upload_done",
  HISTORY_SAVE: "history_save",
  PAYMENT_CLICK: "payment_click",
  CONTACT_SUBMIT: "contact_submit",
} as const;

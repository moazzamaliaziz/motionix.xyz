/**

 * Sentry init helpers — gated on DSN presence.
 *
 * Pattern: when NEXT_PUBLIC_SENTRY_DSN (and SENTRY_DSN equivalents) is
 * unset, the platform skips init entirely. That keeps the dev/no-Sentry
 * path byte-identical to a normal Next.js app and avoids both bundle
 * bloat and DSN warnings in the console.
 *
 * Three init files exist (one per runtime) plus a top-level
 * instrumentation.ts hook for Next.js 16 instrumentation.
 */

import * as Sentry from "@sentry/nextjs";

export function getBrowserDSN(): string {
  return process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";
}

export function getServerDSN(): string {
  return process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";
}

/**
 * Common init options reused across runtimes. Keep this small — anything
 * tunnel-route-specific lives in next.config.ts.
 *
 * Returns a plain object so callers can spread it into Sentry.init.
 */
export function baseOptions() {
  const traces = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1");
  const replays = Number(process.env.SENTRY_REPLAYS_SESSION_RATE ?? "0.05");
  return {
    tracesSampleRate: traces,
    replaysSessionSampleRate: replays,
    replaysOnErrorSampleRate: Math.max(replays, 0.25),
    debug: false,
    _experiments: {
      enableInputSanitization: true,
    },
  };
}

/** Re-export for convenience. */
export { Sentry };

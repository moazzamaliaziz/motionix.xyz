import * as Sentry from "@sentry/nextjs";
import { baseOptions, getServerDSN } from "./sentry-config";

/**
 * Sentry server-side init. Only runs when SENTRY_DSN (or
 * NEXT_PUBLIC_SENTRY_DSN) is set; otherwise no-op.
 *
 * Why use this exact filename?
 *   - Sentry's Next.js SDK watches for `sentry.server.config.ts` at the
 *     project root (or src/) and auto-pulls it as the server init file.
 *   - The file must export a default `init` function — the Sentry SDK
 *     calls it before any server route renders.
 */
const dsn = getServerDSN();
if (dsn) {
  Sentry.init({
    ...baseOptions(),
    dsn,
  });
}

export {};

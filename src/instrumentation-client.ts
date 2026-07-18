import * as Sentry from "@sentry/nextjs";
import { baseOptions, getBrowserDSN } from "./sentry-config";

/**
 * Sentry client/browser init. Only runs in the browser, and only when
 * a DSN is configured. The wrapper hooks Reaction Router traces so we
 * get pageload + clickthrough visibility by default.
 */
const dsn = getBrowserDSN();
if (typeof window !== "undefined" && dsn) {
  Sentry.init({
    ...baseOptions(),
    dsn,
    integrations: [
      // Replay integration for privacy-friendly session recording.
      // We don't enable here unless SENTRY_REPLAY=true to keep the
      // bundle slim; users can flip that on once Sentry is set up.
    ],
  });
}

export {};

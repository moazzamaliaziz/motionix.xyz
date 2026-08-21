import * as Sentry from "@sentry/nextjs";
import { baseOptions, getServerDSN } from "./sentry-config";

/**
 * Sentry edge runtime init. Same gate as the server init — nothing
 * happens at runtime unless Sentry is configured.
 * Q-3 fix: use getServerDSN() not getBrowserDSN().
 */
const dsn = getServerDSN();
if (dsn) {
  Sentry.init({
    ...baseOptions(),
    dsn,
  });
}

export {};

import * as Sentry from "@sentry/nextjs";
import { baseOptions, getBrowserDSN } from "./sentry-config";

/**
 * Sentry edge runtime init. Same gate as the server init — nothing
 * happens at runtime unless Sentry is configured.
 */
const dsn = getBrowserDSN();
if (dsn) {
  Sentry.init({
    ...baseOptions(),
    dsn,
  });
}

export {};

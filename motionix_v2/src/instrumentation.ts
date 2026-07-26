/**

 * Next.js 16 instrumentation hook.
 *
 * Called once per server process, before any request runs. We delay-load
 * the Sentry init files so the user's build/runtime doesn't pay the cost
 * unless a DSN is set in env (which is the only way Sentry will actually
 * init anyway).
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register(): Promise<void> {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";
  if (!dsn) return;
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  } else {
    await import("./sentry.server.config");
  }
  // Mark that we've registered — used by /api/health to confirm wiring.
  process.env.__SENTRY_REGISTERED = "1";
}

import { NextResponse } from "next/server";
import { isR2Enabled } from "@/lib/r2-server";
import { isEmailEnabled } from "@/lib/email";

/**
 * Lightweight health/liveness endpoint for uptime monitoring.
 *
 * Deliberately does NOT open live connections to MongoDB or R2 — it reports
 * which integrations are *configured* (env-gated) plus whether Sentry's
 * instrumentation registered. This keeps the check fast and side-effect free
 * so it's safe to hit on a tight monitoring interval. The `__SENTRY_REGISTERED`
 * flag is set in `instrumentation.ts` when the Sentry SDK initializes.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const body = {
    ok: true,
    service: "motionix",
    time: new Date().toISOString(),
    integrations: {
      sentry: process.env.__SENTRY_REGISTERED === "1",
      r2: isR2Enabled(),
      email: isEmailEnabled(),
      mongo: Boolean(process.env.MONGODB_URI),
    },
  };

  return NextResponse.json(body, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

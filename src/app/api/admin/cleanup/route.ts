import { NextResponse } from "next/server";
import { runR2Cleanup } from "@/lib/r2-cleanup";
import { isR2Enabled } from "@/lib/r2-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/cleanup
 *   Headers: x-cron-secret: <CRON_SECRET>
 *   Body (optional JSON): { maxAgeHours?: number; dryRun?: boolean }
 *
 * Purpose:
 *   - Walk the R2 bucket and delete anything older than `maxAgeHours` (default 24).
 *   - This is the safety net we lean on if/when Cloudflare's R2 object-lifecycle
 *     rules are slow, delayed, or not configured at all.
 *
 * Cadence:
 *   - Hit this once an hour from Vercel Cron, GitHub Actions, etc.
 *   - Or replace it entirely with a Cloudflare R2 lifecycle rule that deletes
 *     objects older than 24h (suffix or prefix wildcard). The endpoint
 *     stays useful as a belt-and-braces audit.
 *
 * Auth:
 *   - The shared secret comes from CRON_SECRET (env var). We compare with
 *     a constant-time check so an attacker scraping logs can't extract it
 *     via response timing differences.
 */
export async function POST(req: Request) {
  if (!isR2Enabled()) {
    return NextResponse.json({ ok: false, reason: "r2_disabled" }, { status: 503 });
  }
  const auth = req.headers.get("x-cron-secret") ?? "";
  const expected = process.env.CRON_SECRET ?? "";
  if (!expected || !safeEqual(auth, expected)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  // Accept either JSON body or none.
  let payload: { maxAgeHours?: number; dryRun?: boolean } = {};
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      payload = (await req.json()) as typeof payload;
    }
  } catch {
    // ignore — body optional
  }

  // Numbers from query string win when present (cron callers usually prefer GET).
  const url = new URL(req.url);
  const qMax = url.searchParams.get("maxAgeHours");
  const qDry = url.searchParams.get("dryRun");
  const maxAgeHours = clampNum(payload.maxAgeHours ?? Number(qMax), 1, 24 * 30, 24);
  const dryRun = parseBool(payload.dryRun ?? (qDry ?? undefined));

  const result = await runR2Cleanup({ maxAgeHours, dryRun });
  return NextResponse.json({ ok: true, ...result });
}

/**
 * GET is supported to make curl-based diagnostics easier — still requires the
 * secret and accepts the same query params.
 */
export async function GET(req: Request) {
  return POST(req);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function safeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function clampNum(v: number, lo: number, hi: number, fallback: number): number {
  if (!Number.isFinite(v)) return fallback;
  return Math.max(lo, Math.min(hi, Math.floor(v)));
}

function parseBool(v: unknown): boolean {
  if (typeof v === "string") return v === "1" || v.toLowerCase() === "true";
  if (typeof v === "boolean") return v;
  return false;
}

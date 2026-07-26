import { NextResponse } from "next/server";
import { issueDownload, isR2Enabled } from "@/lib/r2-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/downloads/[key]
 *   → 302 redirect to a 24h signed R2 GET URL.
 *
 * The browser sends a signed URL — R2 has higher bandwidth and zero-extra
 * egress via Cloudflare's CDN tier. Routes are server-side only.
 */
type RouteParams = { key: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<RouteParams> },
) {
  if (!isR2Enabled()) return NextResponse.json({ error: "r2_disabled" }, { status: 404 });
  const { key } = await params;
  if (!key || key.includes("..") || key.startsWith("/")) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400 });
  }
  const plan = await issueDownload(key);
  if (!plan) return NextResponse.json({ error: "r2_unavailable" }, { status: 503 });
  return NextResponse.redirect(plan.url, 302);
}

import { NextResponse } from "next/server";
import { isR2Enabled, probeR2Host } from "@/lib/r2-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/uploads/probe
 *   → { enabled, maxBytes, allowed, hostOk, hostError }
 *
 * The client polls this (or calls on mount) to decide whether to render the
 * CloudflareUploadButton. The actual signed-PUT issuance happens in
 * POST /api/uploads — that's a separate call because issuing a signed URL
 * has cost implications we don't want on every page load.
 *
 * Allowed types must mirror the route at /api/uploads — if you change one,
 * change both.
 */
const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/heic",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
  "application/pdf",
];

export async function GET() {
  const enabled = isR2Enabled();
  if (!enabled) {
    // Don't reveal whether R2 is configured; just return disabled.
    return NextResponse.json({
      enabled: false,
      maxBytes: 0,
      allowed: [],
      hostOk: false,
    });
  }
  const probe = await probeR2Host();
  return NextResponse.json({
    enabled: probe.ok,
    maxBytes: MAX_BYTES,
    allowed: ALLOWED_TYPES,
    hostOk: probe.ok,
    hostError: probe.ok ? undefined : probe.error,
  });
}

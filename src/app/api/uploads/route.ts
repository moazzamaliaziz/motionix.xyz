import { NextResponse } from "next/server";
import { issueUpload, isR2Enabled, probeR2Host } from "@/lib/r2-server";
import { isAuthEnabledServer } from "@/lib/auth-server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/uploads
 *   body: { filename: string; contentType: string; contentLengthBytes: number; tool: string }
 *   → { key, uploadUrl, publicUrl, expiresInSec, endpoint, contentSecurity }
 *
 * Authenticated users get a scoped key prefix (`self/<userId>/...`); guest
 * sessions get an `anon/<random>/...` prefix. We don't bind the key to auth
 * status because we want the same UI flows for both, but the bleed-over
 * is small: clients can't read each other's keys without the GET path.
 */
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB cap — same cap shown in the upload UI
const ALLOWED_TYPES = new Set([
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
]);

export async function POST(req: Request) {
  if (!isR2Enabled()) {
    return NextResponse.json({ error: "r2_disabled" }, { status: 404 });
  }
  const probe = await probeR2Host();
  if (!probe.ok) {
    return NextResponse.json({ error: "r2_unreachable", detail: probe.error }, { status: 502 });
  }

  let body: { filename?: string; contentType?: string; contentLengthBytes?: number; tool?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const ct = body.contentType;
  const size = body.contentLengthBytes ?? 0;
  const filename = (body.filename ?? "upload").slice(0, 120);
  const tool = (body.tool ?? "tool").replace(/[^a-z0-9-]/g, "").slice(0, 60);

  if (!ct || !ALLOWED_TYPES.has(ct)) {
    return NextResponse.json({ error: "unsupported_type", allowed: [...ALLOWED_TYPES] }, { status: 415 });
  }
  if (!Number.isFinite(size) || size < 1 || size > MAX_BYTES) {
    return NextResponse.json({ error: "size_out_of_range", maxBytes: MAX_BYTES }, { status: 413 });
  }

  const ext = extFromName(filename, ct);
  const scopePrefix = await resolveScopePrefix();
  const safeName = filenameToKey(filename) + (ext ? `.${ext}` : "");
  const key = `${scopePrefix}/${tool}/${Date.now()}-${safeName}`;

  const plan = await issueUpload({ key, contentType: ct, contentLengthBytes: size });
  if (!plan) {
    return NextResponse.json({ error: "r2_unavailable" }, { status: 503 });
  }
  return NextResponse.json({
    key: plan.key,
    uploadUrl: plan.uploadUrl,
    publicUrl: plan.publicUrl,
    expiresInSec: plan.expiresInSec,
    endpoint: plan.endpoint,
    maxBytes: MAX_BYTES,
    // Surfaced in the upload UI: which CORS origin R2 expects.
    contentSecurity: { allowedOrigin: "*" },
  });
}

async function resolveScopePrefix(): Promise<string> {
  if (!isAuthEnabledServer()) return "anon";
  try {
    const { userId } = await auth();
    if (userId) return `self/${userId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  } catch {}
  return "anon";
}

function extFromName(filename: string, contentType: string): string {
  const m = /\.([a-z0-9]{1,6})$/i.exec(filename);
  if (m?.[1]) return m[1].toLowerCase();
  const fallback: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/heic": "heic",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "application/pdf": "pdf",
  };
  return fallback[contentType] ?? "";
}

function filenameToKey(filename: string): string {
  return (
    filename
      .toLowerCase()
      .replace(/\.[a-z0-9]{1,6}$/i, "")
      // Keep alphanumerics + dashes, drop everything else to dashes
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "file"
  );
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_BODY_LENGTH = 2000;
const ALLOWED_EVENT_TYPES = new Set([
  "tool_start",
  "tool_complete",
  "tool_error",
  "file_upload",
  "file_download",
]);
const ALLOWED_SLUG_PATTERN = /^[a-z0-9-]{1,60}$/;

export async function POST(req: Request) {
  // Rate limit: 60 events/min per IP (generous for normal use, blocks floods)
  const ip = getClientIp(req);
  const { limited } = checkRateLimit(`analytics:events:${ip}`, {
    windowMs: 60_000,
    max: 60,
  });
  if (limited)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  try {
    // Payload size guard
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }

    const body = await req.json();
    const {
      tool_slug,
      event_type,
      locale,
      browser,
      device,
      file_size,
      file_format,
      processing_time_ms,
      error_type,
    } = body;

    // Strict input validation
    if (
      !tool_slug ||
      typeof tool_slug !== "string" ||
      !ALLOWED_SLUG_PATTERN.test(tool_slug)
    ) {
      return NextResponse.json({ error: "invalid tool_slug" }, { status: 400 });
    }
    if (!event_type || !ALLOWED_EVENT_TYPES.has(event_type)) {
      return NextResponse.json(
        { error: "invalid event_type", allowed: [...ALLOWED_EVENT_TYPES] },
        { status: 400 },
      );
    }

    // Sanitize optional string fields
    const safeStr = (v: unknown, max: number) =>
      typeof v === "string" ? v.slice(0, max) : null;
    const safeNum = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) ? v : null;

    const supabase = createAdminClient();
    const { error } = await supabase.from("tool_usage_events").insert({
      tool_slug: tool_slug.slice(0, 60),
      event_type,
      locale: safeStr(locale, 10),
      browser: safeStr(browser, 100),
      device: safeStr(device, 50),
      file_size: safeNum(file_size),
      file_format: safeStr(file_format, 20),
      processing_time_ms: safeNum(processing_time_ms),
      error_type: safeStr(error_type, 100),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

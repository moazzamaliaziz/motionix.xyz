import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tool_slug, event_type, locale, browser, device, file_size, file_format, processing_time_ms, error_type } = body;

    if (!tool_slug || !event_type) {
      return NextResponse.json({ error: "tool_slug and event_type required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("tool_usage_events").insert({
      tool_slug,
      event_type,
      locale: locale || null,
      browser: browser || null,
      device: device || null,
      file_size: file_size || null,
      file_format: file_format || null,
      processing_time_ms: processing_time_ms || null,
      error_type: error_type || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

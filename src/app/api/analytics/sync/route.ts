import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source } = body; // 'ga4' or 'gsc'

    const supabase = createAdminClient();

    // Log sync start
    const { data: log, error: logError } = await supabase
      .from("analytics_sync_log")
      .insert({ source: source || "manual", status: "running" })
      .select()
      .single();

    if (logError) {
      // Table may not exist yet
      return NextResponse.json({ ok: true, message: "Sync log table not available. Run schema.sql to create it." });
    }

    // In production, this would call GA4/GSC APIs
    // For now, just log the sync attempt
    await supabase
      .from("analytics_sync_log")
      .update({
        status: "success",
        completed_at: new Date().toISOString(),
        rows_synced: 0,
      })
      .eq("id", log.id);

    return NextResponse.json({
      ok: true,
      message: `Sync for ${source || "manual"} completed. Configure GA4/GSC credentials to enable data sync.`,
      log_id: log.id,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

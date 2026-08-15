import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { isAuthEnabledServer } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const ALLOWED_SOURCES = new Set(["ga4", "gsc", "manual"]);

async function requireAdmin(): Promise<NextResponse | null> {
  if (!isAuthEnabledServer()) {
    return NextResponse.json({ error: "auth_required" }, { status: 403 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (adminIds.length > 0 && !adminIds.includes(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

export async function POST(req: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  // Rate limit: 5 syncs/min per IP
  const ip = getClientIp(req);
  const { limited } = checkRateLimit(`analytics:sync:${ip}`, {
    windowMs: 60_000,
    max: 5,
  });
  if (limited)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  try {
    const body = await req.json();
    const source = body.source;

    if (source && !ALLOWED_SOURCES.has(source)) {
      return NextResponse.json(
        { error: "invalid source", allowed: [...ALLOWED_SOURCES] },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: log, error: logError } = await supabase
      .from("analytics_sync_log")
      .insert({ source: source || "manual", status: "running" })
      .select()
      .single();

    if (logError) {
      return NextResponse.json({
        ok: true,
        message:
          "Sync log table not available. Run schema.sql to create it.",
      });
    }

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

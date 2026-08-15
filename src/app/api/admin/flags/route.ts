import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { isAuthEnabledServer } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Require a signed-in Clerk user whose ID is in ADMIN_USER_IDS.
 * Returns null if authorized, or a NextResponse error if not.
 */
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
  return null; // authorized
}

export async function POST(req: Request) {
  // Auth gate
  const deny = await requireAdmin();
  if (deny) return deny;

  // Rate limit: 30 req/min per IP
  const ip = getClientIp(req);
  const { limited } = checkRateLimit(`admin:flags:${ip}`, {
    windowMs: 60_000,
    max: 30,
  });
  if (limited)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  try {
    const body = await req.json();
    const { id, enabled } = body;

    if (!id || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "id and enabled required" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

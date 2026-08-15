import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";
import { isAuthEnabledServer } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const ALLOWED_ADMIN_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);
const MAX_ADMIN_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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

  // Rate limit: 10 uploads/min per IP
  const ip = getClientIp(req);
  const { limited } = checkRateLimit(`admin:media:${ip}`, {
    windowMs: 60_000,
    max: 10,
  });
  if (limited)
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  try {
    const supabase = createAdminClient();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type server-side (don't trust client)
    if (!ALLOWED_ADMIN_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "unsupported_type", allowed: [...ALLOWED_ADMIN_TYPES] },
        { status: 415 },
      );
    }

    // Validate file size
    if (file.size > MAX_ADMIN_FILE_SIZE) {
      return NextResponse.json(
        { error: "too_large", maxBytes: MAX_ADMIN_FILE_SIZE },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "bin";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `/uploads/${filename}`;

    // Get actual user ID for audit trail
    const { userId } = await auth();

    const { data, error } = await supabase
      .from("media")
      .insert({
        filename,
        original_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        storage_path: storagePath,
        uploaded_by: userId ?? "unknown",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, media: data });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

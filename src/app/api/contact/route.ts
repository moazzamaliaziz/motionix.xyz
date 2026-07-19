import { NextResponse } from "next/server";
import { sendContact } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/contact
 *   body: { name?, email, subject?, body, tool? }
 *
 * Forwards to Resend when RESEND_API_KEY is set. Otherwise returns 200
 * with `delivered: false` so the client gets a reliable success signal
 * for analytics but we don't burn through the test plan quota.
 *
 * Spam guard:
 *   - Honeypot field (`website`) — must be empty.
 *   - Body length sanity check (browser already does this, this is the
 *     server-side second line of defense).
 *   - Rate limit: 10 requests per minute per IP.
 */
const MAX_BODY_LENGTH = 5000;
const MIN_BODY_LENGTH = 8;

export async function POST(req: Request) {
  // Rate limit: 10 req/min per IP
  const ip = getClientIp(req);
  const { limited } = checkRateLimit(`contact:${ip}`, { windowMs: 60_000, max: 10 });
  if (limited) {
    return NextResponse.json({ ok: false, hint: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  let payload: {
    name?: string;
    email?: string;
    subject?: string;
    body?: string;
    tool?: string;
    website?: string; // honeypot
  };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return NextResponse.json({ ok: false, hint: "Couldn't parse that request." }, { status: 400 });
  }

  const email = (payload.email ?? "").trim();
  const body = (payload.body ?? "").trim();
  const subject = (payload.subject ?? "").slice(0, 200);
  const name = (payload.name ?? "").slice(0, 100);
  const tool = (payload.tool ?? "").slice(0, 60);

  // Honeypot must be empty.
  if (payload.website && payload.website.length > 0) {
    return NextResponse.json({ ok: true, delivered: false, reason: "filtered" });
  }
  if (!email.includes("@") || email.length > 254) {
    return NextResponse.json({ ok: false, hint: "Email looks malformed." }, { status: 400 });
  }
  if (body.length < MIN_BODY_LENGTH) {
    return NextResponse.json({ ok: false, hint: "Message is too short." }, { status: 400 });
  }
  if (body.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ ok: false, hint: `Message is over ${MAX_BODY_LENGTH} characters.` }, { status: 413 });
  }

  const result = await sendContact({
    from: name || email,
    subject: subject || (tool ? `Question about ${tool}` : "Message from motionix.xyz"),
    body: `${body}\n\n— from: ${email}${name ? ` (${name})` : ""}`,
    tool: tool || undefined,
  });

  if (result.ok) {
    return NextResponse.json({ ok: true, delivered: true, id: result.id });
  }

  // Even if Resend is disabled (dev/preview), we accept the form but log it.
  // UX: visitor still sees "message sent". The email sender logs to console.
  if (result.reason === "resend_disabled") {
    return NextResponse.json({
      ok: true,
      delivered: false,
      reason: "resend_disabled",
    });
  }

  return NextResponse.json(
    { ok: false, hint: "Couldn't send right now. Try emailing hello@motionix.xyz?" },
    { status: 502 },
  );
}

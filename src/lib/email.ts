/**

 * Email — Resend wrapper for transactional mail.
 *
 * Behaviors:
 *   - When RESEND_API_KEY is unset or invalid, all functions are no-ops and
 *     return `{ ok: false, reason: "resend_disabled" }`. The UI never crashes.
 *   - We use a "from" address derived from RESEND_FROM or the default
 *     `no-reply@motionix.xyz`. Make sure that domain is verified in Resend.
 *   - Tags are Resend-native; we tag every send so analytics can split by
 *     tool and funnel.
 *
 * What we send:
 *   - contact(subject, text)         — /api/contact submissions
 *   - receipt(to, link, tool)        — Stripe post-payment receipt follow-up
 *   - saved(to, tool, filename)      — "We've saved your work to cloud" notice
 *   - verification(to, token)        — generic email verification template
 *
 * Every function falls back to console.log when Resend is disabled — so
 * the developer experience in dev without an API key is preserved.
 */

import "server-only";

type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "resend_disabled" | "missing_to" | "missing_subject" | "send_failed"; error?: string };

function isEnabled(): boolean {
  const key = process.env.RESEND_API_KEY ?? "";
  return Boolean(key) && key.startsWith("re_");
}

function fromAddress(): string {
  return process.env.RESEND_FROM ?? "Motionix <no-reply@motionix.xyz>";
}

/**
 * Render a plain-text email version. Anything we send in `html` we also
 * defensively pair with `text` so Apple Mail and mutt don't break.
 */
function escapeHtml(s: string): string {
  const AMP = String.fromCharCode(38, 97, 109, 112, 59); // &
  const LT = String.fromCharCode(38, 108, 116, 59); // <
  const GT = String.fromCharCode(38, 103, 116, 59); // >
  const QUOT = String.fromCharCode(38, 113, 117, 111, 116, 59); // "
  const APOS = String.fromCharCode(38, 35, 51, 57, 59); // '
  return s
    .replace(/&/g, AMP)
    .replace(/</g, LT)
    .replace(/>/g, GT)
    .replace(/"/g, QUOT)
    .replace(/'/g, APOS);
}

function wrap(block: string): { html: string; text: string } {
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;"><div style="max-width:560px;margin:0 auto;padding:32px 24px;">${block}</div></body></html>`;
  const text = block.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return { html, text };
}

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  tags?: { name: string; value: string }[];
}): Promise<SendResult> {
  if (!isEnabled()) {
    console.log("[email:disabled]", { subject: opts.subject, to: opts.to });
    return { ok: false, reason: "resend_disabled" };
  }
  if (!opts.to) return { ok: false, reason: "missing_to" };
  if (!opts.subject) return { ok: false, reason: "missing_subject" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        tags: opts.tags ?? [],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn("[email] send failed", res.status, body);
      return { ok: false, reason: "send_failed", error: `${res.status}: ${body.slice(0, 200)}` };
    }
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id ?? "" };
  } catch (e) {
    return { ok: false, reason: "send_failed", error: e instanceof Error ? e.message : "unknown" };
  }
}

/* -------------------------------------------------------------------- */
/*  Public API                                                          */
/* -------------------------------------------------------------------- */

export async function sendContact(opts: {
  from: string;
  subject: string;
  body: string;
  tool?: string;
}): Promise<SendResult> {
  const safe = escapeHtml(opts.body);
  const subj = opts.subject || "Message from motionix.xyz";
  const wrapped = wrap(`
    <h2 style="font-size:18px;margin:0 0 12px;">${subj}</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.55;">${safe}</p>
    <p style="margin:24px 0 0;font-size:12px;color:#666;">Sent from the contact form by ${escapeHtml(opts.from)}.</p>
  `);
  return send({
    to: process.env.CONTACT_RECEIVER ?? "hi@motionix.xyz",
    subject: `[contact] ${subj}`,
    html: wrapped.html,
    text: wrapped.text,
    tags: [
      { name: "kind", value: "contact" },
      ...(opts.tool ? [{ name: "tool", value: opts.tool }] : []),
    ],
  });
}

export async function sendReceipt(opts: {
  to: string;
  tool: string;
  country?: string;
  downloadLink: string;
}): Promise<SendResult> {
  const W = wrap(`
    <h2 style="font-size:18px;margin:0 0 12px;">Your ${escapeHtml(opts.tool)} download</h2>
    <p style="font-size:14px;line-height:1.55;">Thanks for the support. Your paid bundle is bundled and ready:</p>
    <p style="margin:24px 0;">
      <a href="${escapeHtml(opts.downloadLink)}" style="display:inline-block;padding:12px 18px;background:#1a1a1a;color:#FAF7F2;text-decoration:none;border-radius:9999px;font-weight:600;">Download bundle</a>
    </p>
    <p style="font-size:12px;color:#666;">Links expire after 14 days. Save the file locally and re-download any time before then.</p>
  `);
  return send({
    to: opts.to,
    subject: `Your ${opts.tool} download`,
    html: W.html,
    text: W.text,
    tags: [
      { name: "kind", value: "receipt" },
      { name: "tool", value: opts.tool },
      ...(opts.country ? [{ name: "country", value: opts.country }] : []),
    ],
  });
}

export async function sendSavedNotice(opts: {
  to: string;
  tool: string;
  filename: string;
  cloudLink: string;
}): Promise<SendResult> {
  const fname = escapeHtml(opts.filename);
  const link = escapeHtml(opts.cloudLink);
  const W = wrap(`
    <h2 style="font-size:18px;margin:0 0 12px;">${fname} is in the cloud</h2>
    <p style="font-size:14px;line-height:1.55;">We saved your work to Cloudflare R2 so you can come back to it later. It's yours for the next 24 hours:</p>
    <p style="margin:24px 0;">
      <a href="${link}" style="display:inline-block;padding:12px 18px;background:#1a1a1a;color:#FAF7F2;text-decoration:none;border-radius:9999px;font-weight:600;">Open link</a>
    </p>
    <p style="font-size:12px;color:#666;">The link expires in 24 hours. We auto-delete the file when it does.</p>
  `);
  return send({
    to: opts.to,
    subject: `Saved ${opts.filename} — Motionix`,
    html: W.html,
    text: W.text,
    tags: [
      { name: "kind", value: "saved" },
      { name: "tool", value: opts.tool },
    ],
  });
}

export async function sendVerification(opts: {
  to: string;
  token: string;
  tool?: string;
}): Promise<SendResult> {
  const verifyUrl = `${process.env.SITE_URL ?? "https://motionix.xyz"}/verify?token=${encodeURIComponent(opts.token)}`;
  const url = escapeHtml(verifyUrl);
  const W = wrap(`
    <h2 style="font-size:18px;margin:0 0 12px;">Confirm your email</h2>
    <p style="font-size:14px;line-height:1.55;">Tap the button below to confirm. The link is single-use:</p>
    <p style="margin:24px 0;">
      <a href="${url}" style="display:inline-block;padding:12px 18px;background:#1a1a1a;color:#FAF7F2;text-decoration:none;border-radius:9999px;font-weight:600;">Confirm</a>
    </p>
    <p style="font-size:12px;color:#666;">If you didn't sign up, ignore this message — nothing changes on your account.</p>
  `);
  return send({
    to: opts.to,
    subject: "Confirm your email — Motionix",
    html: W.html,
    text: W.text,
    tags: [
      { name: "kind", value: "verification" },
      ...(opts.tool ? [{ name: "tool", value: opts.tool }] : []),
    ],
  });
}

/** Useful at boot time — verify env wiring is correct. */
export function isEmailEnabled(): boolean {
  return isEnabled();
}

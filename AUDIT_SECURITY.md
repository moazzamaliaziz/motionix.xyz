# Security Audit Report — Motionix.xyz

**Audit Date:** 2026-08-15
**Auditor:** Automated Security Audit (Codex)
**Scope:** Full codebase — API routes, auth, CSP, input validation, rate limiting, secrets, file handling
**Stack:** Next.js 16 + React 19 + Clerk + Supabase + MongoDB + Cloudflare R2

---

## Executive Summary

The Motionix.xyz codebase has **4 CRITICAL** authentication bypass vulnerabilities in admin and analytics API routes, several HIGH-severity issues around middleware coverage and CSP hardening, and multiple MEDIUM/LOW items. The most urgent finding is that `/api/admin/flags`, `/api/admin/media`, `/api/analytics/events`, and `/api/analytics/sync` have **zero authentication** — any anonymous user can modify feature flags, upload admin media, pollute analytics, or trigger sync jobs.

---

## CRITICAL — Immediate Fix Required

### C-1: Admin Flags Endpoint Has No Authentication

**File:** `src/app/api/admin/flags/route.ts`
**Impact:** Any anonymous user can toggle any feature flag on/off in production.

The route uses `createAdminClient()` (Supabase service role — bypasses RLS) but performs **no authentication or authorization check**. There is no Clerk `auth()` call, no secret header check, and no admin role verification.

```ts
// CURRENT — no auth at all
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, enabled } = body;
    const supabase = createAdminClient(); // service role!
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id);
```

**Fix:**

```ts
import { auth } from "@clerk/nextjs/server";
import { isAuthEnabledServer } from "@/lib/auth-server";

export async function POST(req: Request) {
  // Require auth; reject if Clerk is off in production
  if (!isAuthEnabledServer()) {
    return NextResponse.json({ error: "auth_required" }, { status: 403 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // TODO: replace with a real admin-role check (e.g. check a user_roles table)
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map(s => s.trim()).filter(Boolean);
  if (adminIds.length > 0 && !adminIds.includes(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  // ... rest of handler
}
```

---

### C-2: Admin Media Upload Endpoint Has No Authentication

**File:** `src/app/api/admin/media/route.ts`
**Impact:** Any anonymous user can upload arbitrary files to the admin Supabase storage bucket.

Same pattern as C-1: uses `createAdminClient()` with zero auth. An attacker can upload files with any MIME type, any size, and any filename extension. The `uploaded_by` field is hardcoded to `"admin"`.

```ts
// CURRENT — no auth, trusts client-supplied MIME type
export async function POST(req: Request) {
  const supabase = createAdminClient();
  const formData = await req.formData();
  const file = formData.get("file") as File;
  // ...
  const { data, error } = await supabase.from("media").insert({
    mime_type: file.type, // client-controlled!
    uploaded_by: "admin", // always "admin" regardless of actual caller
```

**Fix:**

```ts
import { auth } from "@clerk/nextjs/server";
import { isAuthEnabledServer } from "@/lib/auth-server";

const ALLOWED_ADMIN_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const MAX_ADMIN_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  if (!isAuthEnabledServer()) {
    return NextResponse.json({ error: "auth_required" }, { status: 403 });
  }
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Admin role check (same pattern as C-1)
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map(s => s.trim()).filter(Boolean);
  if (adminIds.length > 0 && !adminIds.includes(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED_ADMIN_TYPES.has(file.type)) return NextResponse.json({ error: "bad_type" }, { status: 415 });
  if (file.size > MAX_ADMIN_FILE_SIZE) return NextResponse.json({ error: "too_large" }, { status: 413 });

  // ... use userId as uploaded_by, not hardcoded "admin"
```

---

### C-3: Analytics Events Endpoint Has No Authentication or Rate Limiting

**File:** `src/app/api/analytics/events/route.ts`
**Impact:** Attackers can flood the `tool_usage_events` table with junk data, polluting analytics dashboards and potentially running up Supabase storage costs.

```ts
// CURRENT — no auth, no rate limit, no input validation
export async function POST(req: Request) {
  const body = await req.json();
  const { tool_slug, event_type, ... } = body;
  const supabase = createAdminClient(); // service role!
  await supabase.from("tool_usage_events").insert({ tool_slug, event_type, ... });
```

**Fix:**

```ts
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_STRING_LENGTH = 100;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { limited } = checkRateLimit(`analytics:${ip}`, { windowMs: 60_000, max: 30 });
  if (limited) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const body = await req.json();
  const { tool_slug, event_type, ...rest } = body;

  if (!tool_slug || !event_type) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  if (typeof tool_slug !== "string" || tool_slug.length > MAX_STRING_LENGTH) return NextResponse.json({ error: "bad_tool_slug" }, { status: 400 });
  if (typeof event_type !== "string" || event_type.length > MAX_STRING_LENGTH) return NextResponse.json({ error: "bad_event_type" }, { status: 400 });

  // Sanitize all string fields
  const sanitize = (v: unknown) => typeof v === "string" ? v.slice(0, MAX_STRING_LENGTH) : null;

  const supabase = createAdminClient();
  await supabase.from("tool_usage_events").insert({
    tool_slug: tool_slug.slice(0, MAX_STRING_LENGTH),
    event_type: event_type.slice(0, MAX_STRING_LENGTH),
    locale: sanitize(rest.locale),
    browser: sanitize(rest.browser),
    device: sanitize(rest.device),
    // ...
  });
}
```

---

### C-4: Analytics Sync Endpoint Has No Authentication

**File:** `src/app/api/analytics/sync/route.ts`
**Impact:** Any anonymous user can insert rows into `analytics_sync_log` and trigger (future) GA4/GSC API syncs. Even in the current stub state, it's an unauthenticated write to the database.

```ts
// CURRENT — no auth at all
export async function POST(req: Request) {
  const body = await req.json();
  const { source } = body;
  const supabase = createAdminClient();
  await supabase.from("analytics_sync_log").insert({ source: source || "manual", status: "running" });
```

**Fix:**

```ts
import { auth } from "@clerk/nextjs/server";
import { isAuthEnabledServer } from "@/lib/auth-server";

export async function POST(req: Request) {
  if (!isAuthEnabledServer()) return NextResponse.json({ error: "auth_required" }, { status: 403 });
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // Admin role check
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map(s => s.trim()).filter(Boolean);
  if (adminIds.length > 0 && !adminIds.includes(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  // ... rest of handler
}
```

---

## HIGH — Fix Within 1 Week

### H-1: Middleware Excludes All API Routes from Clerk Protection

**File:** `middleware.ts`
**Impact:** The Next.js middleware matcher explicitly excludes every `/api/*` path. Clerk's middleware never runs for API routes. Each API route must handle its own auth — and as C-1 through C-4 show, several don't.

```ts
export const config = {
  matcher: [
    "/((?!api|_next|_vercel|og|favicon|admin|.*\\..*).*)",
    //  ^^^^ excludes all /api routes
  ],
};
```

**Fix — Option A (recommended):** Add a separate middleware matcher for protected API routes, or use a shared auth helper:

```ts
// middleware.ts — add API route protection
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/api/health",
  "/api/contact",
  "/api/uploads/probe",
  "/api/analytics/events", // public-facing analytics ingestion
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|_vercel|og|favicon|.*\\..*).*)",
  ],
};
```

**Fix — Option B (minimal):** Keep current middleware but add a shared `requireAdmin()` helper that every admin route calls:

```ts
// src/lib/auth-guard.ts
import { auth } from "@clerk/nextjs/server";
import { isAuthEnabledServer } from "./auth-server";

export async function requireAdmin(): Promise<string | null> {
  if (!isAuthEnabledServer()) return null;
  const { userId } = await auth();
  if (!userId) return null;
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map(s => s.trim()).filter(Boolean);
  if (adminIds.length > 0 && !adminIds.includes(userId)) return null;
  return userId;
}
```

---

### H-2: In-Memory Rate Limiting Is Ineffective on Vercel

**File:** `src/lib/rate-limit.ts`
**Impact:** Vercel runs each serverless function instance with its own in-memory store. An attacker hitting different instances gets separate rate limit counters. The rate limiter is effectively per-instance, not per-IP.

```ts
const store = new Map<string, Entry>(); // per-instance, not shared
```

**Fix:** Switch to a shared store. Vercel KV (Redis) is the simplest option:

```ts
// Option A: Vercel KV
import { kv } from "@vercel/kv";

export async function checkRateLimit(key: string, config: RateLimitConfig = {}) {
  const { windowMs = 60_000, max = 60 } = config;
  const now = Date.now();
  const current = await kv.get<number>(key) ?? 0;
  if (current >= max) return { limited: true, remaining: 0, resetAt: now + windowMs };
  await kv.incr(key);
  await kv.expire(key, Math.ceil(windowMs / 1000));
  return { limited: false, remaining: max - current - 1, resetAt: now + windowMs };
}

// Option B: Upstash Redis (works in edge runtime too)
// Option C: Use a middleware-level rate limit with a shared store
```

---

### H-3: IP-Based Rate Limiting Is Spoofable

**File:** `src/lib/rate-limit.ts`
**Impact:** `x-forwarded-for` is client-controllable. An attacker can rotate the first IP in the header to bypass all per-IP rate limits.

```ts
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
```

**Fix:** On Vercel, use the **last** IP in `x-forwarded-for` (the one Vercel appended), or use Vercel's `x-vercel-forwarded-for` header which strips client-spoofed values:

```ts
export function getClientIp(req: Request): string {
  // On Vercel, the LAST x-forwarded-for entry is the trusted one (Vercel's edge)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map(s => s.trim());
    return parts[parts.length - 1]; // last = Vercel edge IP
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}
```

---

### H-4: Download Route Has Weak Path Traversal Protection

**File:** `src/app/api/downloads/[key]/route.ts`
**Impact:** Only checks for `..` and leading `/`. Doesn't block URL-encoded variants (`%2e%2e`, `%252e`), null bytes, or other encoding tricks. A crafted key could potentially read objects outside the intended scope.

```ts
if (!key || key.includes("..") || key.startsWith("/")) {
  return NextResponse.json({ error: "invalid_key" }, { status: 400 });
}
```

**Fix — strict allowlist validation:**

```ts
export async function GET(_req: Request, { params }: { params: Promise<RouteParams> }) {
  if (!isR2Enabled()) return NextResponse.json({ error: "r2_disabled" }, { status: 404 });
  const { key } = await params;

  // Strict allowlist: only alphanumeric, dashes, underscores, slashes, dots
  // No path traversal, no encoding tricks
  const SAFE_KEY_RE = /^[a-zA-Z0-9_\-/.]{1,256}$/;
  if (!key || !SAFE_KEY_RE.test(key) || key.includes("..") || key.includes("//")) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400 });
  }

  const plan = await issueDownload(key);
  if (!plan) return NextResponse.json({ error: "r2_unavailable" }, { status: 503 });
  return NextResponse.redirect(plan.url, 302);
}
```

---

### H-5: CSP Uses `unsafe-inline` and `unsafe-eval` Globally

**File:** `next.config.ts`
**Impact:** The default CSP (applied to all routes via `/:path*`) allows `'unsafe-inline'` and `'unsafe-eval'` for `script-src`. These significantly weaken XSS protection. They are only truly needed for ONNX tool routes, not the entire site.

```ts
// DEFAULT CSP — applies to ALL routes
"script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.img.ly ...",
```

**Fix:** Use nonces or hashes for inline scripts, and restrict `unsafe-eval` to ONNX routes only:

```ts
// In next.config.ts headers():
{
  source: "/:path*",
  headers: [
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        // Remove unsafe-inline and unsafe-eval from the global CSP
        "script-src 'self' blob: https://cdn.img.ly https://staticimgly.com https://analytics.ahrefs.com https://www.googletagmanager.com",
        // ... rest
      ].join("; "),
    },
  ],
},
```

If inline scripts are needed for analytics snippets, use a CSP nonce (Next.js supports this via `@next/script` with `strategy="afterInteractive"`).

---

### H-6: No Rate Limiting on Admin, Analytics, Health, and Download Routes

**Files:**
- `src/app/api/admin/flags/route.ts` — no rate limit
- `src/app/api/admin/media/route.ts` — no rate limit
- `src/app/api/analytics/events/route.ts` — no rate limit
- `src/app/api/analytics/sync/route.ts` — no rate limit
- `src/app/api/health/route.ts` — no rate limit
- `src/app/api/downloads/[key]/route.ts` — no rate limit

**Impact:** Unprotected endpoints can be hit at arbitrary frequency. The health endpoint can be used for reconnaissance. The download endpoint can be used to enumerate R2 object keys by brute-forcing keys.

**Fix:** Add rate limiting to all endpoints. For the download endpoint, use a tighter limit:

```ts
// In each route handler:
const ip = getClientIp(req);
const { limited } = checkRateLimit(`route-name:${ip}`, { windowMs: 60_000, max: 30 });
if (limited) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
```

---

## MEDIUM — Fix Within 1 Month

### M-1: CSP Allows `blob:` for Script Sources

**File:** `next.config.ts`
**Impact:** `blob:` in `script-src` allows scripts created via `URL.createObjectURL()` to execute. Combined with a DOM-based XSS, this could bypass CSP. Only needed for ONNX Web Workers.

**Fix:** Remove `blob:` from the global `script-src`. Keep it only in the ONNX-specific CSP. Add `blob:` to `worker-src` globally (already present).

---

### M-2: Health Endpoint Leaks Integration Status

**File:** `src/app/api/health/route.ts`
**Impact:** Reveals whether Sentry, R2, email, and MongoDB are configured. Useful for attackers to know which attack surfaces exist.

```ts
integrations: {
  sentry: process.env.__SENTRY_REGISTERED === "1",
  r2: isR2Enabled(),
  email: isEmailEnabled(),
  mongo: Boolean(process.env.MONGODB_URI),
},
```

**Fix:** Return a simple `{ ok: true }` for public health checks. Move integration details to an authenticated admin-only endpoint:

```ts
export function GET(req: Request) {
  // Public: minimal
  return NextResponse.json({ ok: true, time: new Date().toISOString() }, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

// Add a separate /api/admin/health for detailed status (with auth)
```

---

### M-3: Contact Form Email Validation Is Minimal

**File:** `src/app/api/contact/route.ts`
**Impact:** Only checks for `@` and length ≤ 254. Doesn't validate format, allowing malformed or disposable email addresses.

```ts
if (!email.includes("@") || email.length > 254) { ... }
```

**Fix:** Use a basic regex or the `zod` library (already installed):

```ts
import { z } from "zod/v4";

const emailSchema = z.string().email().max(254);
const result = emailSchema.safeParse(email);
if (!result.success) {
  return NextResponse.json({ ok: false, hint: "Email looks malformed." }, { status: 400 });
}
```

---

### M-4: Admin Media Endpoint Trusts Client-Supplied MIME Type

**File:** `src/app/api/admin/media/route.ts`
**Impact:** `file.type` comes from the client and is not server-validated. An attacker could claim an executable is `image/png`.

**Fix:** Validate the file's magic bytes or use a library like `file-type`:

```ts
import { fileTypeFromBuffer } from "file-type";

const bytes = await file.arrayBuffer();
const detected = await fileTypeFromBuffer(Buffer.from(bytes));
if (!detected || !ALLOWED_ADMIN_TYPES.has(detected.mime)) {
  return NextResponse.json({ error: "bad_type" }, { status: 415 });
}
```

---

### M-5: Rate Limiter Off-By-One Allows max+1 Requests

**File:** `src/lib/rate-limit.ts`
**Impact:** The check `entry.count > max` allows `max` requests through (count 1 through max), then blocks at `max + 1`. If the intent is to allow exactly `max` requests, this is correct. But the test confirms `count == max` is still allowed, which means the effective limit is `max`, not `max - 1`.

```ts
entry.count++;
return {
  limited: entry.count > max, // allows count == max
};
```

**Note:** This is likely intentional (max = 5 means 5 requests allowed). Document this clearly to prevent future confusion. Not a bug, but the boundary behavior should be explicit in comments.

---

### M-6: `dangerouslySetInnerHTML` Usage

**Files:** Multiple schema/JSON-LD components
**Impact:** `dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }}` is used for JSON-LD. `JSON.stringify` escapes `<`, `>`, and `"` which prevents XSS in this specific case. However, if tool data ever contains user-controlled strings, this is a potential vector.

**Fix:** Continue using `JSON.stringify` (safe), but add a comment documenting why this is safe. Consider using `serialize-javascript` for defense-in-depth if the schema data becomes user-controllable.

---

### M-7: Download Endpoint Has No Key Scope Validation

**File:** `src/app/api/downloads/[key]/route.ts`
**Impact:** Any user who knows (or guesses) an R2 object key can download it. There's no check that the requesting user owns the object. This is mitigated by the 24h TTL on signed URLs, but during that window, any key is accessible.

**Fix:** If objects are scoped by user prefix (`self/<userId>/...`), validate that the requesting user owns the prefix:

```ts
const { key } = await params;
// If key starts with self/, verify the user owns it
if (key.startsWith("self/")) {
  const ownerPrefix = key.split("/").slice(0, 2).join("/");
  const { userId } = await auth();
  if (!userId || `self/${userId}` !== ownerPrefix) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
}
```

---

## LOW — Nice to Have

### L-1: MongoDB Index Creation on Every Connection

**File:** `src/lib/mongo-server.ts`
**Impact:** `createIndex` runs every time `getHistoryCollection()` is called after a cold start. MongoDB handles duplicate index creation gracefully (no-op), but it adds latency to the first request.

```ts
await client.db(DB_NAME).collection(COLLECTION).createIndex({ userId: 1, createdAt: -1 });
```

**Fix:** Create the index once during deployment or migration, not at runtime. Or wrap in a "hasRun" flag:

```ts
let indexCreated = false;
if (!indexCreated) {
  await client.db(DB_NAME).collection(COLLECTION).createIndex({ userId: 1, createdAt: -1 }, { background: true });
  indexCreated = true;
}
```

---

### L-2: Missing `video/x-matroska` Extension Fallback

**File:** `src/app/api/uploads/route.ts`
**Impact:** The `extFromName` fallback map doesn't include `video/x-matroska` (`.mkv`). Files with this MIME type that lack an extension in the filename will get no extension, which may confuse downloaders.

```ts
const fallback: Record<string, string> = {
  // ...
  // video/x-matroska is missing!
};
```

**Fix:**

```ts
"video/x-matroska": "mkv",
```

---

### L-3: Rate Limiter `setInterval` Prevents Clean Shutdown

**File:** `src/lib/rate-limit.ts`
**Impact:** The `setInterval` for eviction keeps the Node.js process alive and may prevent graceful shutdown in serverless environments.

```ts
setInterval(() => {
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);
```

**Fix:** Use `unref()` so the interval doesn't keep the process alive:

```ts
const interval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);
interval.unref();
```

---

### L-4: No `X-Frame-Options` Header

**File:** `next.config.ts`
**Impact:** The CSP `frame-ancestors 'self'` directive covers this, but adding an explicit `X-Frame-Options: SAMEORIGIN` header provides defense-in-depth for older browsers.

**Fix:**

```ts
{ key: "X-Frame-Options", value: "SAMEORIGIN" },
```

---

### L-5: `history` POST Allows User-Controlled `tool` Field Without Validation

**File:** `src/app/api/history/route.ts`
**Impact:** The `tool` field is accepted as-is from the client body. While it's stored in MongoDB (not rendered as HTML), it could be used for NoSQL injection if MongoDB operators are passed.

```ts
tool: body.tool ?? "unspecified",
```

**Fix:** Sanitize the tool field:

```ts
tool: (body.tool ?? "unspecified").toString().slice(0, 60).replace(/[^a-z0-9-]/g, ""),
```

---

### L-6: Sentry Auth Token in Environment

**File:** `next.config.ts`
**Impact:** `SENTRY_AUTH_TOKEN` is read at build time for source map upload. Ensure this token is scoped to the minimum required permissions (org:read, project:releases) and rotated regularly. It should never be exposed to the client.

**Fix:** Already correctly handled (server-only env var). Just document the rotation policy.

---

## Summary Table

| ID | Severity | Title | File |
|----|----------|-------|------|
| C-1 | CRITICAL | Admin flags endpoint has no auth | `api/admin/flags/route.ts` |
| C-2 | CRITICAL | Admin media upload has no auth | `api/admin/media/route.ts` |
| C-3 | CRITICAL | Analytics events has no auth or rate limit | `api/analytics/events/route.ts` |
| C-4 | CRITICAL | Analytics sync has no auth | `api/analytics/sync/route.ts` |
| H-1 | HIGH | Middleware excludes all API routes from Clerk | `middleware.ts` |
| H-2 | HIGH | In-memory rate limiting ineffective on Vercel | `lib/rate-limit.ts` |
| H-3 | HIGH | IP rate limiting is spoofable | `lib/rate-limit.ts` |
| H-4 | HIGH | Download route has weak path traversal protection | `api/downloads/[key]/route.ts` |
| H-5 | HIGH | CSP uses unsafe-inline/eval globally | `next.config.ts` |
| H-6 | HIGH | No rate limiting on 6 API routes | multiple |
| M-1 | MEDIUM | CSP allows blob: for scripts globally | `next.config.ts` |
| M-2 | MEDIUM | Health endpoint leaks integration status | `api/health/route.ts` |
| M-3 | MEDIUM | Contact form email validation is minimal | `api/contact/route.ts` |
| M-4 | MEDIUM | Admin media trusts client MIME type | `api/admin/media/route.ts` |
| M-5 | MEDIUM | Rate limiter off-by-one (document, not fix) | `lib/rate-limit.ts` |
| M-6 | MEDIUM | dangerouslySetInnerHTML in JSON-LD (safe) | schema components |
| M-7 | MEDIUM | Download endpoint has no key scope validation | `api/downloads/[key]/route.ts` |
| L-1 | LOW | MongoDB index creation on every connection | `lib/mongo-server.ts` |
| L-2 | LOW | Missing mkv extension fallback | `api/uploads/route.ts` |
| L-3 | LOW | setInterval prevents clean shutdown | `lib/rate-limit.ts` |
| L-4 | LOW | No X-Frame-Options header | `next.config.ts` |
| L-5 | LOW | History POST allows unvalidated tool field | `api/history/route.ts` |
| L-6 | LOW | Sentry auth token rotation policy | `next.config.ts` |

---

## Positive Findings

The codebase demonstrates several good security practices:

- **Cleanup route** (`api/admin/cleanup`) properly uses `CRON_SECRET` with constant-time comparison
- **Contact form** has honeypot field and body length validation
- **Upload route** has proper content-type allowlist, size limits, and filename sanitization
- **R2 presigned URLs** have short TTLs (5 min upload, 24h download)
- **History route** properly ignores client-provided `userId` in guest mode
- **Auth gracefully degrades** — guest mode works cleanly when Clerk is unconfigured
- **`.gitignore`** properly excludes `.env*` files
- **`server-only`** imports prevent server code from leaking to client bundles
- **Email escaping** uses character-code substitution (XSS-safe)
- **Zod** is available for input validation (underutilized)

---

## Recommended Priority Order

1. **Immediate (today):** Fix C-1 through C-4 — add auth to all admin and analytics routes
2. **This week:** Fix H-1, H-4, H-5 — middleware, path traversal, CSP hardening
3. **This week:** Fix H-2, H-3, H-6 — rate limiting improvements
4. **This month:** Address M-1 through M-7
5. **Backlog:** L-1 through L-6

---

*Report generated by automated security audit. All findings should be validated by a human reviewer before applying fixes.*
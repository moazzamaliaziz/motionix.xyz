/**

 * Client-side helpers for Cloudflare R2 uploads.
 *
 * Pattern:
 *   1. Probe the server to see if R2 is configured at all.
 *   2. Request a signed PUT URL from /api/uploads for our blob.
 *   3. PUT the file directly from the browser to R2 (no server proxy).
 *   4. Resolve a 24-hour signed GET URL via /api/downloads/[key].
 *
 * Why a public probe route?
 *   We want the UI to completely self-hide when R2 isn't configured,
 *   without doing anything heavy. A cheap GET roundtrip is fine cost-wise
 *   and stays under any reasonable free-tier rate limit.
 */

export type R2Probe = {
  enabled: boolean;
  maxBytes: number;
  allowed: string[];
  hostOk: boolean;
  hostError?: string;
};

export type R2UploadPlan = {
  key: string;
  uploadUrl: string;
  publicUrl: string | null;
  expiresInSec: number;
  endpoint: string;
  maxBytes: number;
};

export type R2UploadResult = {
  key: string;
  publicUrl: string | null;
  /** Permanent-ish download path (24h signed) */
  downloadUrl: string;
};

/**
 * Probe R2 status from the server. Caches the result for `cacheMs`
 * to avoid re-doing this on every interaction.
 */
let probeCache: { at: number; data: R2Probe } | null = null;
export async function probeR2(cacheMs = 30_000): Promise<R2Probe> {
  if (probeCache && Date.now() - probeCache.at < cacheMs) return probeCache.data;
  try {
    const res = await fetch("/api/uploads/probe", { method: "GET" });
    if (!res.ok) throw new Error(`probe_${res.status}`);
    const data = (await res.json()) as R2Probe;
    probeCache = { at: Date.now(), data };
    return data;
  } catch (e) {
    // On any failure assume disabled — safest default.
    return {
      enabled: false,
      maxBytes: 0,
      allowed: [],
      hostOk: false,
      hostError: e instanceof Error ? e.message : "probe_failed",
    };
  }
}

/**
 * Reset the probe cache (e.g. after the user toggles a setting or after a failed upload).
 */
export function resetR2Probe(): void {
  probeCache = null;
}

/**
 * Request a signed PUT URL for a specific blob. Validates content type / size
 * client-side before hitting the network so we get faster feedback.
 */
export async function requestUploadPlan(opts: {
  filename: string;
  contentType: string;
  contentLengthBytes: number;
  tool: string;
}): Promise<R2UploadPlan> {
  const probe = await probeR2();
  if (!probe.enabled) throw new Error("r2_disabled");
  if (!probe.allowed.includes(opts.contentType)) {
    throw new Error(`unsupported_type:${opts.contentType}`);
  }
  if (opts.contentLengthBytes <= 0) throw new Error("size_zero");
  if (opts.contentLengthBytes > probe.maxBytes) {
    throw new Error(`size_too_large:${probe.maxBytes}`);
  }
  const res = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: opts.filename,
      contentType: opts.contentType,
      contentLengthBytes: opts.contentLengthBytes,
      tool: opts.tool,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "request_failed" }));
    throw new Error(`plan_failed:${err.error ?? res.status}`);
  }
  return (await res.json()) as R2UploadPlan;
}

/**
 * PUT the blob to the signed URL. Throws on non-2xx responses.
 *
 * The browser PUT doesn't include credentials or cookies — R2's signed URL
 * carries the auth — but CORS origin and Content-Type must match exactly.
 */
export async function executeUpload(plan: R2UploadPlan, blob: Blob): Promise<void> {
  const res = await fetch(plan.uploadUrl, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
    },
  });
  if (!res.ok) {
    throw new Error(`put_failed:${res.status}`);
  }
}

/**
 * Resolve a 24-hour signed download URL via /api/downloads/[key].
 * Server issues the actual signed URL; browser doesn't see AWS creds.
 */
export async function resolveDownloadUrl(key: string): Promise<string> {
  const res = await fetch(`/api/downloads/${encodeURIComponent(key)}`, {
    method: "GET",
    redirect: "manual", // we'll follow manually so we can report errors
  });
  // Status 0/3xx are opaque cross-origin redirects; fetch follows them.
  // If we got 4xx/5xx, surface it.
  if (res.status >= 400) {
    const err = await res.json().catch(() => ({ error: "download_failed" }));
    throw new Error(`download_failed:${err.error ?? res.status}`);
  }
  // Server returns 302 to a signed URL. Either we got the body back or the
  // browser will follow the redirect transparently. Walk redirects if needed.
  if (res.redirected && res.url) return res.url;
  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get("location");
    if (loc) return loc;
  }
  // If somehow we got 200 OK, the body itself should be the asset.
  return res.url;
}

/**
 * End-to-end helper for the most common path: blob → signed URL.
 */
export async function uploadBlobToR2(opts: {
  blob: Blob;
  filename: string;
  tool: string;
}): Promise<R2UploadResult> {
  const plan = await requestUploadPlan({
    filename: opts.filename,
    contentType: opts.blob.type || "application/octet-stream",
    contentLengthBytes: opts.blob.size,
    tool: opts.tool,
  });
  await executeUpload(plan, opts.blob);
  const downloadUrl = await resolveDownloadUrl(plan.key);
  return {
    key: plan.key,
    publicUrl: plan.publicUrl,
    downloadUrl,
  };
}

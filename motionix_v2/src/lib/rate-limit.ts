/**
 * In-memory sliding-window rate limiter.
 * No Redis, no external deps — good enough for a solo-founder Vercel deployment.
 * Fails open: if the limiter breaks, requests pass through.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Evict stale entries every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export type RateLimitConfig = {
  /** Window size in milliseconds. Default: 60_000 (1 minute) */
  windowMs?: number;
  /** Max requests per window. Default: 60 */
  max?: number;
};

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Check rate limit for a given key (usually IP + route).
 * Returns { limited: true } if the limit is exceeded.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = {},
): RateLimitResult {
  const { windowMs = 60_000, max = 60 } = config;
  const now = Date.now();
  const resetAt = now + windowMs;

  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt });
    return { limited: false, remaining: max - 1, resetAt };
  }

  entry.count++;
  const remaining = Math.max(0, max - entry.count);
  return {
    limited: entry.count > max,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Helper: extract client IP from request headers.
 * Vercel sets x-forwarded-for; fall back to "unknown".
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

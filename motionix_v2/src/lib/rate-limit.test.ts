import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkRateLimit, getClientIp } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request and reports remaining", () => {
    const r = checkRateLimit("test:first", { windowMs: 60_000, max: 5 });
    expect(r.limited).toBe(false);
    expect(r.remaining).toBe(4);
    expect(r.resetAt).toBe(Date.now() + 60_000);
  });

  it("counts down remaining across requests in the same window", () => {
    const key = "test:countdown";
    const cfg = { windowMs: 60_000, max: 3 };
    expect(checkRateLimit(key, cfg).remaining).toBe(2);
    expect(checkRateLimit(key, cfg).remaining).toBe(1);
    expect(checkRateLimit(key, cfg).remaining).toBe(0);
  });

  it("does not mark limited until count exceeds max", () => {
    const key = "test:boundary";
    const cfg = { windowMs: 60_000, max: 2 };
    expect(checkRateLimit(key, cfg).limited).toBe(false); // 1
    expect(checkRateLimit(key, cfg).limited).toBe(false); // 2 == max, still allowed
    expect(checkRateLimit(key, cfg).limited).toBe(true); // 3 > max
    expect(checkRateLimit(key, cfg).remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    const key = "test:reset";
    const cfg = { windowMs: 60_000, max: 1 };
    expect(checkRateLimit(key, cfg).limited).toBe(false);
    expect(checkRateLimit(key, cfg).limited).toBe(true);

    vi.advanceTimersByTime(60_001);

    const r = checkRateLimit(key, cfg);
    expect(r.limited).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("uses independent counters per key", () => {
    const cfg = { windowMs: 60_000, max: 1 };
    expect(checkRateLimit("test:a", cfg).limited).toBe(false);
    expect(checkRateLimit("test:b", cfg).limited).toBe(false);
  });

  it("applies default window and max when config omitted", () => {
    const r = checkRateLimit("test:defaults");
    expect(r.remaining).toBe(59); // default max 60
    expect(r.resetAt).toBe(Date.now() + 60_000);
  });
});

describe("getClientIp", () => {
  it("prefers the first x-forwarded-for entry and trims it", () => {
    const req = new Request("https://x.test", {
      headers: { "x-forwarded-for": " 203.0.113.1 , 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip when no forwarded header", () => {
    const req = new Request("https://x.test", {
      headers: { "x-real-ip": "198.51.100.2" },
    });
    expect(getClientIp(req)).toBe("198.51.100.2");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    const req = new Request("https://x.test");
    expect(getClientIp(req)).toBe("unknown");
  });
});

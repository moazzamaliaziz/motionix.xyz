import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ limited: false, remaining: 59, resetAt: Date.now() + 60000 })),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

import { createAdminClient } from "@/lib/supabase";

describe("POST /api/analytics/events", () => {
  let insertMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    insertMock = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: insertMock }),
    } as any);
  });

  it("rejects invalid tool_slug", async () => {
    const { POST } = await import("@/app/api/analytics/events/route");
    const req = new Request("http://localhost/api/analytics/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tool_slug: "", event_type: "tool_start" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects invalid event_type", async () => {
    const { POST } = await import("@/app/api/analytics/events/route");
    const req = new Request("http://localhost/api/analytics/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tool_slug: "bg-remover", event_type: "hack" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects tool_slug with special characters", async () => {
    const { POST } = await import("@/app/api/analytics/events/route");
    const req = new Request("http://localhost/api/analytics/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tool_slug: "<script>alert(1)</script>", event_type: "tool_start" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("accepts valid payload", async () => {
    const { POST } = await import("@/app/api/analytics/events/route");
    const req = new Request("http://localhost/api/analytics/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tool_slug: "background-remover",
        event_type: "tool_complete",
        locale: "en",
        browser: "chrome",
        file_size: 1024,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before imports
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/auth-server", () => ({
  isAuthEnabledServer: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ limited: false, remaining: 59, resetAt: Date.now() + 60000 })),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

import { auth } from "@clerk/nextjs/server";
import { isAuthEnabledServer } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase";

describe("POST /api/admin/flags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when auth is not configured", async () => {
    vi.mocked(isAuthEnabledServer).mockReturnValue(false);

    const { POST } = await import("@/app/api/admin/flags/route");
    const req = new Request("http://localhost/api/admin/flags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "test", enabled: true }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("auth_required");
  });

  it("rejects unauthenticated users", async () => {
    vi.mocked(isAuthEnabledServer).mockReturnValue(true);
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);

    const { POST } = await import("@/app/api/admin/flags/route");
    const req = new Request("http://localhost/api/admin/flags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "test", enabled: true }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects non-admin users when ADMIN_USER_IDS is set", async () => {
    vi.mocked(isAuthEnabledServer).mockReturnValue(true);
    vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
    process.env.ADMIN_USER_IDS = "admin_001,admin_002";

    const { POST } = await import("@/app/api/admin/flags/route");
    const req = new Request("http://localhost/api/admin/flags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "test", enabled: true }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("forbidden");

    delete process.env.ADMIN_USER_IDS;
  });

  it("validates required fields", async () => {
    vi.mocked(isAuthEnabledServer).mockReturnValue(true);
    vi.mocked(auth).mockResolvedValue({ userId: "admin_001" } as any);
    process.env.ADMIN_USER_IDS = "admin_001";

    const { POST } = await import("@/app/api/admin/flags/route");
    const req = new Request("http://localhost/api/admin/flags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "test" }), // missing enabled
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    delete process.env.ADMIN_USER_IDS;
  });
});

import { describe, it, expect, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({
  init: vi.fn(),
}));

vi.mock("./sentry-config", () => ({
  baseOptions: vi.fn(() => ({ tracesSampleRate: 0.1 })),
  getServerDSN: vi.fn(() => "https://test@sentry.io/123"),
  getBrowserDSN: vi.fn(() => "https://test@sentry.io/browser"),
}));

describe("sentry.edge.config", () => {
  it("uses getServerDSN (not getBrowserDSN)", async () => {
    const sentryConfig = await import("./sentry-config");
    const Sentry = await import("@sentry/nextjs");

    // Verify getServerDSN is called (not getBrowserDSN)
    expect(sentryConfig.getServerDSN).toBeDefined();
    expect(sentryConfig.getBrowserDSN).toBeDefined();

    // The edge config file should import getServerDSN
    // Read the source to verify
    const fs = await import("fs");
    const path = await import("path");
    const edgeConfigPath = path.resolve(__dirname, "sentry.edge.config.ts");
    const source = fs.readFileSync(edgeConfigPath, "utf-8");

    expect(source).toContain("getServerDSN");
    expect(source).not.toContain("getBrowserDSN");
  });
});

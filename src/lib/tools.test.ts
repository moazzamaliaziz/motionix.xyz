import { describe, it, expect } from "vitest";
import { tools, bySlug, TOOL_COUNT, toolsByPhase } from "./tools";

const BLOCKED_SLUGS = ["watermark-remover", "youtube-downloader"];
const VALID_ENGINES = new Set([
  "image-onnx",
  "photo-compliance",
  "image-canvas",
  "image-resize",
  "image-compress",
  "image-signature",
  "video-wasm",
]);
const VALID_TONES = new Set(["peach", "sky", "mint", "blush", "ember", "paper"]);
const VALID_COST = new Set(["free-zero", "free-low", "free-sample"]);

describe("tools catalog invariants", () => {
  it("has at least the 8 launch tools", () => {
    expect(tools.length).toBeGreaterThanOrEqual(8);
    expect(TOOL_COUNT).toBe(tools.length);
  });

  it("has unique slugs", () => {
    const slugs = tools.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("never uses a legally risky / blocked slug", () => {
    for (const t of tools) {
      expect(BLOCKED_SLUGS).not.toContain(t.slug);
    }
  });

  it("uses only valid enum values for engine, tone, and cost", () => {
    for (const t of tools) {
      expect(VALID_ENGINES.has(t.engine), `${t.slug} engine`).toBe(true);
      expect(VALID_TONES.has(t.tone), `${t.slug} tone`).toBe(true);
      expect(VALID_COST.has(t.cost), `${t.slug} cost`).toBe(true);
    }
  });

  it("gives every tool 5-6 FAQs", () => {
    for (const t of tools) {
      expect(t.faqs.length, `${t.slug} faqs`).toBeGreaterThanOrEqual(5);
      expect(t.faqs.length, `${t.slug} faqs`).toBeLessThanOrEqual(6);
    }
  });

  it("has non-empty required content fields", () => {
    for (const t of tools) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.tagline.length).toBeGreaterThan(0);
      expect(t.metaTitle.length).toBeGreaterThan(0);
      expect(t.metaDescription.length).toBeGreaterThan(0);
      expect(t.steps.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("only references existing slugs in `next`", () => {
    const slugs = new Set(tools.map((t) => t.slug));
    for (const t of tools) {
      for (const n of t.next) {
        expect(slugs.has(n), `${t.slug} → ${n}`).toBe(true);
      }
    }
  });
});

describe("bySlug", () => {
  it("finds an existing tool", () => {
    expect(bySlug("background-remover")?.slug).toBe("background-remover");
  });

  it("returns undefined for an unknown slug", () => {
    expect(bySlug("does-not-exist")).toBeUndefined();
  });
});

describe("toolsByPhase", () => {
  it("only lists functional tools in the functional group", () => {
    for (const t of toolsByPhase.functional) {
      expect(t.phase).toBe("functional");
    }
  });
});

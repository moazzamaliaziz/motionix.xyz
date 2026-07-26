import { describe, it, expect } from "vitest";
import { localizedUrl, alternatesFor } from "./hreflang";
import { locales, defaultLocale } from "@/i18n/config";
import { TOOLS_SITE_URL } from "@/lib/cn";

describe("localizedUrl", () => {
  it("serves the default locale without a prefix", () => {
    expect(localizedUrl(defaultLocale, "/about")).toBe(`${TOOLS_SITE_URL}/about`);
  });

  it("prefixes non-default locales", () => {
    expect(localizedUrl("fr", "/about")).toBe(`${TOOLS_SITE_URL}/fr/about`);
  });

  it("normalizes leading/trailing slashes in the path", () => {
    expect(localizedUrl("fr", "tools/background-remover/")).toBe(
      `${TOOLS_SITE_URL}/fr/tools/background-remover`,
    );
  });

  it("handles the root path for the default locale", () => {
    expect(localizedUrl(defaultLocale, "/")).toBe(`${TOOLS_SITE_URL}/`);
  });

  it("handles the root path for a prefixed locale", () => {
    expect(localizedUrl("de", "/")).toBe(`${TOOLS_SITE_URL}/de`);
  });
});

describe("alternatesFor", () => {
  it("sets the canonical to the current locale's URL", () => {
    const alt = alternatesFor("/about", "fr");
    expect(alt.canonical).toBe(`${TOOLS_SITE_URL}/fr/about`);
  });

  it("emits one language entry per configured locale plus x-default", () => {
    const alt = alternatesFor("/about", defaultLocale);
    // one hreflang per locale + x-default
    expect(Object.keys(alt.languages).length).toBe(locales.length + 1);
    expect(alt.languages["x-default"]).toBe(localizedUrl(defaultLocale, "/about"));
  });

  it("uppercases the region subtag in hreflang codes", () => {
    const alt = alternatesFor("/", "zh-cn");
    expect(alt.languages["zh-CN"]).toBeDefined();
  });
});

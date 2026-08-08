import { getPageIndexability } from "./page-indexability";
import { localizedUrl } from "./hreflang";
import { getTranslations } from "next-intl/server";
import type { Tool } from "./tools";

export interface PageSEO {
  title: string;
  description: string;
  canonical: string;
  noindex: boolean;
  nofollow: boolean;
}

export async function getPageSEO(
  locale: string,
  path: string
): Promise<PageSEO> {
  const t = await getTranslations({ locale, namespace: "SEO" });
  const { indexable } = await getPageIndexability(locale, path);

  const pathKey = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, ".");

  const title = safeTranslate(t, `${pathKey}.title`) || safeTranslate(t, "default.title");
  const description = safeTranslate(t, `${pathKey}.description`) || safeTranslate(t, "default.description");

  return {
    title,
    description,
    canonical: localizedUrl(locale, path),
    noindex: !indexable,
    nofollow: false,
  };
}

function safeTranslate(t: any, key: string): string {
  try {
    const value = t(key);
    if (value === key) return "";
    return value || "";
  } catch {
    return "";
  }
}

export async function getPageSchema(
  locale: string,
  path: string,
  tool?: Tool
): Promise<Record<string, any> | null> {
  if (!tool || !path.startsWith("/tools/")) return null;

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
  };

  return schema;
}

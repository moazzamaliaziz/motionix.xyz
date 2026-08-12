import { getPageIndexability } from "./page-indexability";
import { localizedUrl } from "./hreflang";
import { getTranslations } from "next-intl/server";
import { tools, bySlug } from "./tools";
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

  const normalizedPath = path === "" ? "/" : path;
  const pathKey = normalizedPath === "/" ? "home" : normalizedPath.replace(/^\//, "").replace(/\//g, ".");

  let title = safeTranslate(t, `${pathKey}.title`);
  let description = safeTranslate(t, `${pathKey}.description`);

  // Fallback for tool pages: use tool's existing metaTitle/metaDescription
  if ((!title || !description) && path.startsWith("/tools/")) {
    const slug = path.split("/")[2];
    const tool = bySlug(slug);
    if (tool) {
      const toolT = await getTranslations({ locale, namespace: `Tools.${slug}` });
      title = title || safeTranslate(toolT, "metaTitle") || tool.metaTitle;
      description = description || safeTranslate(toolT, "metaDescription") || tool.metaDescription;
    }
  }

  // Final fallback to SEO defaults
  title = title || safeTranslate(t, "default.title");
  description = description || safeTranslate(t, "default.description");

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

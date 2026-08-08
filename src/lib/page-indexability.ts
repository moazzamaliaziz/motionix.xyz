import { tools } from "@/lib/tools";
import { listBlogPosts } from "@/lib/blog";
import { locales, defaultLocale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";

export interface IndexabilityResult {
  indexable: boolean;
  reason?: string;
}

const NON_INDEXABLE_PATTERNS = [/^\/api\//, /^\/admin\//, /^\/test/];

export async function getPageIndexability(
  locale: string,
  path: string
): Promise<IndexabilityResult> {
  for (const pattern of NON_INDEXABLE_PATTERNS) {
    if (pattern.test(path)) {
      return { indexable: false, reason: "Non-indexable path pattern" };
    }
  }

  const tool = tools.find((t) => `/tools/${t.slug}` === path);
  if (tool && tool.phase === "stub" && !tool.stubHint) {
    return { indexable: false, reason: "Stub tool without content" };
  }

  if (locale !== defaultLocale) {
    const eligible = await isTranslationComplete(path, locale);
    if (!eligible) {
      return { indexable: false, reason: "Translation incomplete or missing" };
    }
  }

  return { indexable: true };
}

async function isTranslationComplete(
  path: string,
  locale: string
): Promise<boolean> {
  try {
    const t = await getTranslations({ locale, namespace: "SEO" });

    const titleKey = `${path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, ".")}.title`;
    const descKey = `${path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, ".")}.description`;

    const title = safeTranslate(t, titleKey);
    const desc = safeTranslate(t, descKey);

    if (!title || title.length < 10) return false;
    if (!desc || desc.length < 20) return false;

    if (path.startsWith("/tools/")) {
      const slug = path.split("/")[2];
      const toolT = await getTranslations({ locale, namespace: `Tools.${slug}` });
      const tagline = safeTranslate(toolT, "tagline");
      if (!tagline || tagline.length < 10) return false;
    }

    if (path.startsWith("/blog/")) {
      const slug = path.split("/")[2];
      const blogT = await getTranslations({ locale, namespace: "Blog" });
      const noPosts = safeTranslate(blogT, "noPosts");
      if (!noPosts) return false;
    }

    return true;
  } catch {
    return false;
  }
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

import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { TOOLS_SITE_URL } from "@/lib/cn";
import { listBlogPosts } from "@/lib/blog";
import { locales } from "@/i18n/config";

export const dynamic = "force-static";

const staticPages = [
  { path: "", priority: 1, changefreq: "weekly" as const },
  { path: "/tools", priority: 0.9, changefreq: "weekly" as const },
  { path: "/about", priority: 0.5, changefreq: "monthly" as const },
  { path: "/contact", priority: 0.4, changefreq: "monthly" as const },
  { path: "/privacy", priority: 0.3, changefreq: "monthly" as const },
  { path: "/terms", priority: 0.3, changefreq: "monthly" as const },
  { path: "/cookies", priority: 0.3, changefreq: "monthly" as const },
  { path: "/blog", priority: 0.7, changefreq: "weekly" as const },
];

function localeAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] =
      locale === "en"
        ? `${TOOLS_SITE_URL}${path}`
        : `${TOOLS_SITE_URL}/${locale}${path}`;
  }
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages — default locale (en) root + each locale prefix
  for (const page of staticPages) {
    // English at root
    entries.push({
      url: `${TOOLS_SITE_URL}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changefreq,
      priority: page.priority,
      alternates: localeAlternates(page.path),
    });
    // Other locales under /[locale]/
    for (const locale of locales) {
      if (locale === "en") continue;
      entries.push({
        url: `${TOOLS_SITE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changefreq,
        priority: page.priority,
        alternates: localeAlternates(`/${locale}${page.path}`),
      });
    }
  }

  // Tool pages — each tool at each locale
  for (const t of tools) {
    const toolPath = `/tools/${t.slug}`;
    entries.push({
      url: `${TOOLS_SITE_URL}${toolPath}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: t.phase === "functional" ? 0.9 : 0.6,
      alternates: localeAlternates(toolPath),
    });
    for (const locale of locales) {
      if (locale === "en") continue;
      entries.push({
        url: `${TOOLS_SITE_URL}/${locale}${toolPath}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: t.phase === "functional" ? 0.9 : 0.6,
        alternates: localeAlternates(`/${locale}${toolPath}`),
      });
    }
  }

  // Blog posts — default locale only (blog content is English)
  try {
    for (const p of listBlogPosts()) {
      entries.push({
        url: `${TOOLS_SITE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.frontmatter.date),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // No blog directory — skip silently
  }

  return entries;
}
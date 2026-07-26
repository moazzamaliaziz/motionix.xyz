import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { listBlogPosts } from "@/lib/blog";
import { locales, defaultLocale } from "@/i18n/config";
import { localizedUrl } from "@/lib/hreflang";

export const dynamic = "force-static";

/** hreflang `languages` map (with x-default) for a locale-agnostic path. */
function languagesFor(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    const [lang, region] = l.split("-");
    const code = region ? `${lang}-${region.toUpperCase()}` : lang;
    languages[code] = localizedUrl(l, path);
  }
  languages["x-default"] = localizedUrl(defaultLocale, path);
  return languages;
}

type Entry = Omit<MetadataRoute.Sitemap[number], "url" | "alternates"> & {
  path: string;
};

function toSitemap(entries: Entry[]): MetadataRoute.Sitemap {
  return entries.map(({ path, ...rest }) => ({
    url: localizedUrl(defaultLocale, path),
    alternates: { languages: languagesFor(path) },
    ...rest,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const root = toSitemap([
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/tools", changeFrequency: "weekly", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
    { path: "/terms", changeFrequency: "monthly", priority: 0.3 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
    { path: "/cookies", changeFrequency: "monthly", priority: 0.3 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  ]);

  const toolRoutes = toSitemap(
    tools.map((t) => ({
      path: `/tools/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: t.phase === "functional" ? 0.9 : 0.6,
    })),
  );

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    blogRoutes = toSitemap(
      listBlogPosts().map((p) => ({
        path: `/blog/${p.slug}`,
        lastModified: new Date(p.frontmatter.date),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    );
  } catch {
    blogRoutes = [];
  }

  return [...root, ...toolRoutes, ...blogRoutes];
}

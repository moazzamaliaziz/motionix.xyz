import { tools } from "@/lib/tools";
import { listBlogPosts } from "@/lib/blog";
import { locales } from "@/i18n/config";
import { TOOLS_SITE_URL } from "@/lib/cn";
import { getPageIndexability } from "./page-indexability";
import type { MetadataRoute } from "next";

const STATIC_PAGES = [
  "",
  "/tools",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/blog",
];

export async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap[] = [];

  for (const locale of locales) {
    for (const page of STATIC_PAGES) {
      const { indexable } = await getPageIndexability(locale, page);
      if (!indexable) continue;

      const url = `${TOOLS_SITE_URL}/${locale}${page || "/"}`;
      const entry: MetadataRoute.Sitemap = { url };
      entries.push(entry);
    }

    for (const tool of tools) {
      const path = `/tools/${tool.slug}`;
      const { indexable } = await getPageIndexability(locale, path);
      if (!indexable) continue;

      const url = `${TOOLS_SITE_URL}/${locale}${path}`;
      const entry: MetadataRoute.Sitemap = { url };
      entries.push(entry);
    }

    for (const post of listBlogPosts()) {
      const path = `/blog/${post.slug}`;
      const { indexable } = await getPageIndexability(locale, path);
      if (!indexable) continue;

      const url = `${TOOLS_SITE_URL}/${locale}${path}`;
      const entry: MetadataRoute.Sitemap = {
        url,
        lastModified: new Date(post.frontmatter.date),
      };
      entries.push(entry);
    }
  }

  return entries;
}

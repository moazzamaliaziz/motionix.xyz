import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { TOOLS_SITE_URL } from "@/lib/cn";
import { listBlogPosts } from "@/lib/blog";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    entries.push({
      url: `${TOOLS_SITE_URL}${page.path}`,
      lastModified: now,
      changeFrequency: page.changefreq,
      priority: page.priority,
    });
  }

  for (const t of tools) {
    entries.push({
      url: `${TOOLS_SITE_URL}/tools/${t.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: t.phase === "functional" ? 0.9 : 0.6,
    });
  }

  try {
    for (const p of listBlogPosts()) {
      entries.push({
        url: `${TOOLS_SITE_URL}/blog/${p.slug}`,
        lastModified: p.frontmatter.date,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // No blog directory — skip silently
  }

  return entries;
}
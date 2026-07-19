import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { TOOLS_SITE_URL } from "@/lib/cn";
import { listBlogPosts } from "@/lib/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const root: MetadataRoute.Sitemap = [
    { url: TOOLS_SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${TOOLS_SITE_URL}/tools`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${TOOLS_SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${TOOLS_SITE_URL}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${TOOLS_SITE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${TOOLS_SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${TOOLS_SITE_URL}/cookies`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${TOOLS_SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${TOOLS_SITE_URL}/tools/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: t.phase === "functional" ? 0.9 : 0.6,
  }));

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    blogRoutes = listBlogPosts().map((p) => ({
      url: `${TOOLS_SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.frontmatter.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    blogRoutes = [];
  }

  return [...root, ...toolRoutes, ...blogRoutes];
}

import type { MetadataRoute } from "next";
import { TOOLS_SITE_URL } from "@/lib/cn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/admin/", "/_next/"],
      },
    ],
    sitemap: `${TOOLS_SITE_URL}/sitemap.xml`,
  };
}
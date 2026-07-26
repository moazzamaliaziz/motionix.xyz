import type { MetadataRoute } from "next";
import { TOOLS_SITE_URL } from "@/lib/cn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${TOOLS_SITE_URL}/sitemap.xml`,
    host: TOOLS_SITE_URL,
  };
}

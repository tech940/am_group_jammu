import { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // No trailing slash: "/admin/" would leave "/admin" itself crawlable.
      disallow: ["/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}

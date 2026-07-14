import type { MetadataRoute } from "next";

// TODO(phase 2): use the real production domain here.
const SITE_URL = "https://ringrelay.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin", // internal ops console — keep it out of the index
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

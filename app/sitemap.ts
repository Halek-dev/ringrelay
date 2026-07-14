import type { MetadataRoute } from "next";

// TODO(phase 2): use the real production domain here.
const SITE_URL = "https://ringrelay.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/how-it-works", "/pricing", "/onboarding", "/contact"];
  const now = new Date();
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}

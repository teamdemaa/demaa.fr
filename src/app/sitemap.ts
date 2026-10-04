import type { MetadataRoute } from "next";
import { getCanonicalBaseUrl } from "@/lib/site-url";

import { DEMAA_DIRECTORY_NAVIGATION } from "@/lib/demaa-public-routes";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getCanonicalBaseUrl();
  // Keep sitemap modification dates stable. Using the request time would tell
  // crawlers that the entire catalog changed on every request.
  const siteUpdatedAt = new Date("2026-09-03T00:00:00.000Z");
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/mentions-legales`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/conditions-d-utilisation`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-confidentialite`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-cookies`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cgv`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
  ];


  return [
    { url: `${base}/studio`, lastModified: new Date("2026-10-03T00:00:00.000Z"), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/projets`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/studio/opportunites`, changeFrequency: "monthly", priority: 0.7 },
    ...DEMAA_DIRECTORY_NAVIGATION.map(({ href }) => ({ url: `${base}${href}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...staticRoutes,
  ];
}

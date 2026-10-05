import { PUBLISHED_LEARNING_EPISODES } from "@/lib/learning-episodes";
import { LEARNING_PROJECT_SERIES } from "@/lib/academy-project-series";
import type { MetadataRoute } from "next";
import { getCanonicalBaseUrl } from "@/lib/site-url";


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
    { url: `${base}/studio`, lastModified: new Date("2026-10-04T00:00:00.000Z"), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/equipe`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/projets`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/studio/opportunites`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/tutoriels`, changeFrequency: "monthly", priority: 0.8 },
    ...LEARNING_PROJECT_SERIES.map(project => ({ url: `${base}/tutoriels/${project.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...PUBLISHED_LEARNING_EPISODES.map(article => ({ url: `${base}/tutoriels/${article.project}/${article.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...staticRoutes,
  ];
}

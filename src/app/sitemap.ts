import type { MetadataRoute } from "next";
import { getCanonicalBaseUrl } from "@/lib/site-url";
import { getPublishedPracticeTutorials } from "@/lib/tutorial-catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getCanonicalBaseUrl();
  // Keep sitemap modification dates stable. Using the request time would tell
  // crawlers that every one of the 800+ URLs changed on every request.
  const siteUpdatedAt = new Date("2026-09-03T00:00:00.000Z");
  const toolsAndTutorialsUpdatedAt = new Date("2026-09-14T00:00:00.000Z");
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/accompagnement`, lastModified: siteUpdatedAt, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/solutions`, lastModified: siteUpdatedAt, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/tutoriels`, lastModified: toolsAndTutorialsUpdatedAt, changeFrequency: "weekly", priority: 0.93 },
    { url: `${base}/mentions-legales`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/conditions-d-utilisation`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-confidentialite`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-cookies`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cgv`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
  ];

  const tutorialEntries: MetadataRoute.Sitemap = getPublishedPracticeTutorials().map(
    (tutorial) => ({
      url: `${base}/tutoriels/${tutorial.slug}`,
      lastModified: new Date(tutorial.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.82,
      ...(tutorial.format === "practice"
        ? { images: [`${base}${tutorial.thumbnail.split("?")[0]}`] }
        : {}),
    }),
  );

  return [
    ...staticRoutes,
    ...tutorialEntries,
  ];
}

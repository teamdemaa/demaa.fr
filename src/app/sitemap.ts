import { ACADEMY_COURSES } from "@/lib/academy-courses";
import type { MetadataRoute } from "next";
import { getCanonicalBaseUrl } from "@/lib/site-url";
import { getPublishedPracticeTutorials } from "@/lib/tutorial-catalog";

import { DEMAA_PUBLISHED_STUDIO_PROJECTS } from "@/lib/demaa-studio-projects";
import { DEMAA_DIRECTORY_NAVIGATION } from "@/lib/demaa-public-routes";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getCanonicalBaseUrl();
  // Keep sitemap modification dates stable. Using the request time would tell
  // crawlers that the entire catalog changed on every request.
  const siteUpdatedAt = new Date("2026-09-03T00:00:00.000Z");
  const toolsAndTutorialsUpdatedAt = new Date("2026-09-14T00:00:00.000Z");
  const staticRoutes: MetadataRoute.Sitemap = [
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
    { url: `${base}/studio`, lastModified: new Date("2026-10-03T00:00:00.000Z"), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/projets`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/studio/opportunites`, changeFrequency: "monthly", priority: 0.7 },
    ...DEMAA_PUBLISHED_STUDIO_PROJECTS.map((project) => ({ url: `${base}/projets/${project.slug}`, changeFrequency: "monthly" as const, priority: 0.75 })),
    ...DEMAA_DIRECTORY_NAVIGATION.map(({ href }) => ({ url: `${base}${href}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...staticRoutes,
    ...tutorialEntries,
    ...ACADEMY_COURSES.map(course => ({ url: `${base}/tutoriels/${course.slug}`, lastModified: new Date("2026-10-03T00:00:00.000Z"), changeFrequency: "monthly" as const, priority: 0.82, images: [`${base}${course.image}`] })),
  ];
}

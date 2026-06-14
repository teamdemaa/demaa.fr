import type { MetadataRoute } from "next";
import { getAllCourseEntries } from "@/lib/course-content";
import { getAllEditorialEntries } from "@/lib/editorial-content";
import { demaaServices } from "@/lib/service-catalog";
import { getToolDirectorySlug, hasStandaloneToolPage } from "@/lib/tool-directory";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";

export const dynamic = "force-dynamic";

function getBaseUrl(): string {
  // Priorité absolue au domaine principal
  const productionDomain = "https://demaa.fr";

  // En production, toujours utiliser le domaine principal
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_URL) {
    return productionDomain;
  }
  
  // Forcer le domaine principal si NEXT_PUBLIC_SITE_URL est défini
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv && !fromEnv.includes('vercel.app')) {
    return fromEnv;
  }
  
  // Fallback développement
  return fromEnv || "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();
  const now = new Date();
  const tools = await getUnifiedToolDirectory();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/annuaire-outils`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/annuaire-services`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-fournisseurs`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/ressources`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/organisation-automatisation`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/cours`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/newsletter`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const editorialEntries = getAllEditorialEntries();
  const editorialContentEntries: MetadataRoute.Sitemap = editorialEntries.map((entry) => ({
    url: `${base}/ressources/${entry.slug}`,
    lastModified: new Date(entry.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const courseEntries = getAllCourseEntries();
  const courseContentEntries: MetadataRoute.Sitemap = courseEntries.map((entry) => ({
    url: `${base}/cours/${entry.slug}`,
    lastModified: new Date(entry.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const toolEntries: MetadataRoute.Sitemap = tools
    .filter((tool) => !hasStandaloneToolPage(tool))
    .map((tool) => ({
      url: `${base}/annuaire-outils/${getToolDirectorySlug(tool)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const freeToolRoutes = [
    "generation-de-qr-code",
    "carte-de-visite-qr-code-whatsapp",
    "qr-code-pour-avis-client",
    "qr-code-commande-rapide",
    "generation-de-menu-qr-code",
    "creation-de-fiche-google-optimisee",
    "generation-de-document",
    "generation-de-tampon",
    "signature-pro",
    "signez-un-document-electroniquement",
  ];

  const freeToolEntries: MetadataRoute.Sitemap = freeToolRoutes.map((slug) => ({
    url: `${base}/outils/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const serviceEntries: MetadataRoute.Sitemap = demaaServices.map((service) => ({
    url: `${base}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...editorialContentEntries,
    ...courseContentEntries,
    ...toolEntries,
    ...freeToolEntries,
    ...serviceEntries,
  ];
}

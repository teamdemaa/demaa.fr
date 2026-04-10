import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getToolDirectorySlug, toolDirectory } from "@/lib/tool-directory";

function getBaseUrl(): string {
  // Priorité absolue au domaine principal
  const productionDomain = "https://demaa.fr";
  
  // Forcer le domaine principal si NEXT_PUBLIC_SITE_URL est défini
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv && !fromEnv.includes('vercel.app')) {
    return fromEnv;
  }
  
  // En production, toujours utiliser le domaine principal
  if (process.env.VERCEL_URL) {
    return productionDomain;
  }
  
  // Fallback développement
  return fromEnv || "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/outils-gratuits`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/automatiser-mes-taches`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/newsletter`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const posts = getAllPosts();
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const logicielsEntries: MetadataRoute.Sitemap = toolDirectory.map((tool) => ({
    url: `${base}/annuaire-logiciels/${getToolDirectorySlug(tool)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogEntries, ...logicielsEntries];
}

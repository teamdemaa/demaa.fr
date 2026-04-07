import type { MetadataRoute } from "next";
import { getTools } from "@/lib/api";
import { getAllPosts } from "@/lib/blog";

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

/** Pages sous `/outils/*` présentes en fichiers mais à exclure du sitemap */
const OUTILS_EXCLUDED_SLUGS = ["generation-de-document", "modeles-de-document"] as const;

/** Pages sous `/outils/*` présentes en fichiers mais absentes de `toolsData`. */
const OUTILS_EXTRA_SLUGS = ["kit-du-dirigeant-organise"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();
  const now = new Date();
  const excludedOutilSlugs = new Set<string>(OUTILS_EXCLUDED_SLUGS);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/outils-gratuits`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const tools = await getTools();
  const outilSlugs = new Set<string>([
    ...tools.map((t) => t.slug),
    ...OUTILS_EXTRA_SLUGS,
  ]);
  
  // Filtrer les slugs exclus
  const filteredOutilSlugs = [...outilSlugs].filter((slug) => !excludedOutilSlugs.has(slug));
  
  const outilEntries: MetadataRoute.Sitemap = filteredOutilSlugs.map((slug) => ({
    url: `${base}/outils/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const posts = getAllPosts();
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...outilEntries, ...blogEntries];
}

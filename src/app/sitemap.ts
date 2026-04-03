import type { MetadataRoute } from "next";
import { getServices, toolsData } from "@/lib/data";
import { getAllPosts } from "@/lib/blog";

function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://demaa.fr";
}

/** Pages sous `/outils/*` présentes en fichiers mais absentes de `toolsData`. */
const OUTILS_EXTRA_SLUGS = ["generation-de-document", "modeles-de-document"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/nos-services`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
  ];

  const services = await getServices();
  const serviceEntries: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const outilSlugs = new Set<string>([
    ...toolsData.map((t) => t.slug),
    ...OUTILS_EXTRA_SLUGS,
  ]);
  const outilEntries: MetadataRoute.Sitemap = [...outilSlugs].map((slug) => ({
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

  return [...staticRoutes, ...serviceEntries, ...outilEntries, ...blogEntries];
}

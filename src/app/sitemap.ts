import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getToolDirectorySlug } from "@/lib/tool-directory";
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
    { url: `${base}/outils`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/annuaire-logiciel`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/annuaire-outils`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/assistants`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/assistant`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/plan-action-automatisation`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
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

  const logicielsEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${base}/annuaire-logiciel/${getToolDirectorySlug(tool)}`,
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
    "generation-de-tampon",
    "signature-pro",
    "signez-un-document-electroniquement",
    "kit-du-dirigeant-organise",
  ];

  const freeToolEntries: MetadataRoute.Sitemap = freeToolRoutes.map((slug) => ({
    url: `${base}/outils/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogEntries, ...logicielsEntries, ...freeToolEntries];
}

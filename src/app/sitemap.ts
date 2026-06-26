import type { MetadataRoute } from "next";
import { getAllCourseEntries } from "@/lib/course-content";
import { getAllDocumentModels } from "@/lib/document-models";
import { getAllNewsletters } from "@/lib/newsletter-content";
import { aidFamilies, demaaAidItems } from "@/lib/aid-catalog";
import {
  accountingDirectorySeoPages,
} from "@/lib/accounting-directory-seo";
import { getAccountingFirms } from "@/lib/accounting-directory";
import { getEnterpriseCatalog } from "@/lib/enterprise-annuaire-server";
import { demaaFinanceItems } from "@/lib/finance-catalog";
import { demaaProNetworks } from "@/lib/pro-network-catalog";
import { sectorPageDefinitions } from "@/lib/sector-pages";
import { sectorTaxonomy } from "@/lib/sector-taxonomy";
import { demaaServices } from "@/lib/service-catalog";
import { demaaSuppliers } from "@/lib/supplier-catalog";
import { getDemaaRecruitmentItems } from "@/lib/recruitment-catalog";
import { getDemaaTrainings } from "@/lib/training-catalog";
import { getToolDirectorySlug, hasStandaloneToolPage } from "@/lib/tool-directory";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";

const HIDDEN_SERVICE_SLUGS = new Set([
  "recrutement-assistant-polyvalent",
  "organisation-automatisation",
]);

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
  const [tools, enterprises] = await Promise.all([
    getUnifiedToolDirectory(),
    getEnterpriseCatalog(),
  ]);
  const accountingFirms = await getAccountingFirms();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/systemes`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/annuaire-outils`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/annuaire-fournisseurs`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-financement`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/aides-et-subventions`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-reseaux-pro`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-experts-comptables`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/annuaire-formations`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-recrutement`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-newsletters`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/modeles-de-documents`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/organisation`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/cours`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/conditions-d-utilisation`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const documentModelEntries = getAllDocumentModels();
  const documentModelSitemapEntries: MetadataRoute.Sitemap = documentModelEntries.map((entry) => ({
    url: `${base}/modeles-de-documents/${entry.slug}`,
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

  const newsletterEntries = getAllNewsletters();
  const newsletterSitemapEntries: MetadataRoute.Sitemap = newsletterEntries.map((entry) => ({
    url: `${base}/annuaire-newsletters/${entry.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.72,
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

  const serviceEntries: MetadataRoute.Sitemap = demaaServices
    .filter((service) => !HIDDEN_SERVICE_SLUGS.has(service.slug))
    .map((service) => ({
      url: `${base}/annuaire-services/${service.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const supplierEntries: MetadataRoute.Sitemap = demaaSuppliers.map((supplier) => ({
    url: `${base}/annuaire-fournisseurs/${supplier.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const financeEntries: MetadataRoute.Sitemap = demaaFinanceItems.map((item) => ({
    url: `${base}/annuaire-financement/${item.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const aidFamilyEntries: MetadataRoute.Sitemap = aidFamilies.map((family) => ({
    url: `${base}/aides-et-subventions/${family.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  const aidEntries: MetadataRoute.Sitemap = demaaAidItems.map((item) => ({
    url: `${base}/aides-et-subventions/${item.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  const proNetworkEntries: MetadataRoute.Sitemap = demaaProNetworks.map((network) => ({
    url: `${base}/annuaire-reseaux-pro/${network.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const trainingEntries: MetadataRoute.Sitemap = getDemaaTrainings().map((training) => ({
    url: `${base}/annuaire-formations/${training.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const recruitmentEntries: MetadataRoute.Sitemap = getDemaaRecruitmentItems().map((item) => ({
    url: `${base}/annuaire-recrutement/${item.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const accountingFirmEntries: MetadataRoute.Sitemap = accountingFirms.map((firm) => ({
    url: `${base}/annuaire-experts-comptables/cabinets/${firm.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const accountingDirectorySeoEntries: MetadataRoute.Sitemap = accountingDirectorySeoPages.map((page) => ({
    url: `${base}/annuaire-experts-comptables/${page.kind}/${page.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.78,
  }));

  const sectorEntries: MetadataRoute.Sitemap = sectorPageDefinitions.map((sector) => ({
    url: `${base}/secteurs/${sector.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const toolSectorEntries: MetadataRoute.Sitemap = sectorTaxonomy.map((sector) => ({
    url: `${base}/annuaire-outils/secteur/${sector.seoSlug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.76,
  }));

  const systemEntries: MetadataRoute.Sitemap = enterprises.map((enterprise) => ({
    url: `${base}/systemes/${enterprise.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...documentModelSitemapEntries,
    ...courseContentEntries,
    ...newsletterSitemapEntries,
    ...toolEntries,
    ...freeToolEntries,
    ...serviceEntries,
    ...supplierEntries,
    ...financeEntries,
    ...aidFamilyEntries,
    ...aidEntries,
    ...proNetworkEntries,
    ...trainingEntries,
    ...recruitmentEntries,
    ...accountingFirmEntries,
    ...accountingDirectorySeoEntries,
    ...sectorEntries,
    ...toolSectorEntries,
    ...systemEntries,
  ];
}

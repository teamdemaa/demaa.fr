import type { MetadataRoute } from "next";
import { getCanonicalBaseUrl } from "@/lib/site-url";
import { getCanonicalServices } from "@/lib/canonical-service-catalog";
import { getAllPublishedContent } from "@/lib/content-catalog";
import { getPublicOrganiserContent } from "@/lib/academy-course-content";
import { getAllNewsletters } from "@/lib/newsletter-content";
import { aidFamilies, demaaAidItems } from "@/lib/aid-catalog";
import { getAccountingFirms } from "@/lib/accounting-directory";
import { getEnterpriseCatalog } from "@/lib/enterprise-annuaire-server";
import { demaaFinanceItems } from "@/lib/finance-catalog";
import { demaaProNetworks } from "@/lib/pro-network-catalog";
import { sectorPageDefinitions } from "@/lib/sector-pages";
import { sectorTaxonomy } from "@/lib/sector-taxonomy";
import { demaaSuppliers } from "@/lib/supplier-catalog";
import { getDemaaRecruitmentItems } from "@/lib/recruitment-catalog";
import { getDemaaTrainings } from "@/lib/training-catalog";
import { getToolDirectorySlug, hasStandaloneToolPage } from "@/lib/tool-directory";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getCanonicalBaseUrl();
  // Keep sitemap modification dates stable. Using the request time would tell
  // crawlers that every one of the 800+ URLs changed on every request.
  const siteUpdatedAt = new Date("2026-08-10T00:00:00.000Z");
  const [tools, enterprises, accountingFirms] = await Promise.all([
    getUnifiedToolDirectory(),
    getEnterpriseCatalog(),
    getAccountingFirms(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/systemes`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/application-metier`, lastModified: siteUpdatedAt, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/annuaire-outils`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/annuaire-fournisseurs`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-financement`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/aides-et-subventions`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-reseaux-pro`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-formations`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-recrutement`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-newsletters`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/annuaire-experts-comptables`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/organiser`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/contenus`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/opportunites`, lastModified: siteUpdatedAt, changeFrequency: "weekly", priority: 0.65 },
    { url: `${base}/rejoindre-team-demaa`, lastModified: siteUpdatedAt, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/mentions-legales`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/conditions-d-utilisation`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-confidentialite`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-cookies`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cgv`, lastModified: siteUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
  ];

  const academyEntries: MetadataRoute.Sitemap = getPublicOrganiserContent().map(
    (content) => ({
      url: `${base}/organiser/${content.identity.slug}`,
      lastModified: siteUpdatedAt,
      changeFrequency: "monthly" as const,
      priority: content.kind === "case-study" ? 0.72 : 0.78,
    }),
  );

  const contentEntries: MetadataRoute.Sitemap = getAllPublishedContent().map(
    (entry) => ({
      url: `${base}/contenus/${entry.slug}`,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.78,
      ...(entry.media.slides?.[0]
        ? { images: [`${base}${entry.media.slides[0]}`] }
        : {}),
    }),
  );

  const newsletterEntries = getAllNewsletters();
  const newsletterSitemapEntries: MetadataRoute.Sitemap = newsletterEntries.map((entry) => ({
    url: `${base}/annuaire-newsletters/${entry.slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  const toolEntries: MetadataRoute.Sitemap = tools
    .filter((tool) => !hasStandaloneToolPage(tool))
    .map((tool) => ({
      url: `${base}/annuaire-outils/${getToolDirectorySlug(tool)}`,
      lastModified: siteUpdatedAt,
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
  ];

  const freeToolEntries: MetadataRoute.Sitemap = freeToolRoutes.map((slug) => ({
    url: `${base}/outils/${slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const serviceEntries: MetadataRoute.Sitemap = getCanonicalServices()
    .filter((service) => service.detailHref.startsWith("/services/"))
    .map((service) => ({
      url: `${base}${service.detailHref}`,
      lastModified: siteUpdatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const supplierEntries: MetadataRoute.Sitemap = demaaSuppliers.map((supplier) => ({
    url: `${base}/annuaire-fournisseurs/${supplier.slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const financeEntries: MetadataRoute.Sitemap = demaaFinanceItems.map((item) => ({
    url: `${base}/annuaire-financement/${item.slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const aidFamilyEntries: MetadataRoute.Sitemap = aidFamilies.map((family) => ({
    url: `${base}/aides-et-subventions/${family.slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  const aidEntries: MetadataRoute.Sitemap = demaaAidItems.map((item) => ({
    url: `${base}/aides-et-subventions/${item.slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  const proNetworkEntries: MetadataRoute.Sitemap = demaaProNetworks.map((network) => ({
    url: `${base}/annuaire-reseaux-pro/${network.slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const trainingEntries: MetadataRoute.Sitemap = getDemaaTrainings().map((training) => ({
    url: `${base}/annuaire-formations/${training.slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const recruitmentEntries: MetadataRoute.Sitemap = getDemaaRecruitmentItems().map((item) => ({
    url: `${base}/annuaire-recrutement/${item.slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const accountingFirmEntries: MetadataRoute.Sitemap = accountingFirms.map((firm) => ({
    url: `${base}/annuaire-experts-comptables/cabinets/${firm.slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const sectorEntries: MetadataRoute.Sitemap = sectorPageDefinitions.map((sector) => ({
    url: `${base}/secteurs/${sector.slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const toolSectorEntries: MetadataRoute.Sitemap = sectorTaxonomy.map((sector) => ({
    url: `${base}/annuaire-outils/secteur/${sector.seoSlug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.76,
  }));

  const systemEntries: MetadataRoute.Sitemap = enterprises.map((enterprise) => ({
    url: `${base}/systemes/${enterprise.slug}`,
    lastModified: siteUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...contentEntries,
    ...academyEntries,
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
    ...sectorEntries,
    ...toolSectorEntries,
    ...systemEntries,
  ];
}

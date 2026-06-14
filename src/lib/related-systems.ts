import { enterpriseCatalog, enterpriseCatalogBySlug, enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { getRecommendedServicesForSystem } from "@/lib/service-recommendations";
import { systemResources } from "@/lib/system-resources";
import type { System } from "@/lib/types";

const RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG: Record<string, string[]> = {
  "obligations-tpe": [
    "cabinet-comptable",
    "daf-externalise",
    "assistant-administratif-externalise",
    "gestionnaire-paie-independant",
    "commerce-de-detail",
    "restaurant",
  ],
  "previsionnel-financier": [
    "daf-externalise",
    "cabinet-comptable",
    "investissement-locatif",
    "marchand-de-biens",
    "saas",
    "restaurant",
  ],
  "systeme-operationnel-airtable": [
    "cabinet-de-conseil",
    "consultant-independant",
    "freelance",
    "agence-marketing",
    "agence-web",
    "daf-externalise",
  ],
  "obligations-tpe-template": [
    "cabinet-comptable",
    "daf-externalise",
    "assistant-administratif-externalise",
    "gestionnaire-paie-independant",
    "commerce-de-detail",
    "restaurant",
  ],
  "suivi-previsionnel-financier-template": [
    "daf-externalise",
    "cabinet-comptable",
    "investissement-locatif",
    "marchand-de-biens",
    "saas",
    "restaurant",
  ],
  "systeme-operationnel-template": [
    "cabinet-de-conseil",
    "consultant-independant",
    "freelance",
    "agence-marketing",
    "agence-web",
    "daf-externalise",
  ],
  "facture-electronique": [
    "cabinet-comptable",
    "daf-externalise",
    "assistant-administratif-externalise",
    "commerce-de-detail",
    "restaurant",
    "e-commerce",
  ],
};

function uniqueSystemsFromSlugs(slugs: string[], limit = 6): System[] {
  const unique = Array.from(new Set(slugs));

  return unique
    .map((slug) => enterpriseCatalogBySlug[slug])
    .filter((enterprise): enterprise is NonNullable<typeof enterprise> => Boolean(enterprise))
    .slice(0, limit)
    .map(enterpriseToSystem);
}

export function getRelatedSystemsForContentSlug(slug: string, limit = 6): System[] {
  const resource = systemResources.find((entry) => entry.id === slug);

  if (resource?.systemSlugs?.length) {
    return uniqueSystemsFromSlugs(resource.systemSlugs, limit);
  }

  return uniqueSystemsFromSlugs(RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG[slug] ?? [], limit);
}

export function getRelatedSystemsForServiceSlug(serviceSlug: string, limit = 6): System[] {
  const matches = enterpriseCatalog
    .map((enterprise) => {
      const recommendations = getRecommendedServicesForSystem(enterprise.slug);
      const index = recommendations.findIndex((service) => service.slug === serviceSlug);

      if (index === -1) {
        return null;
      }

      return {
        enterprise,
        index,
      };
    })
    .filter((match): match is { enterprise: (typeof enterpriseCatalog)[number]; index: number } => Boolean(match))
    .sort((a, b) => a.index - b.index || a.enterprise.name.localeCompare(b.enterprise.name, "fr"))
    .slice(0, limit);

  return matches.map(({ enterprise }) => enterpriseToSystem(enterprise));
}

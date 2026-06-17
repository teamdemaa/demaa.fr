import { enterpriseCatalog, enterpriseCatalogBySlug, enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG } from "@/lib/content-relationships";
import { getRecommendedFinanceForSystem } from "@/lib/finance-recommendations";
import { getRecommendedProNetworksForSystem } from "@/lib/pro-network-recommendations";
import { getRecommendedServicesForSystem } from "@/lib/service-recommendations";
import { getRecommendedSuppliersForSystem } from "@/lib/supplier-recommendations";
import { systemResources } from "@/lib/system-resources";
import type { System } from "@/lib/types";

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

export function getRelatedSystemsForSupplierSlug(supplierSlug: string, limit = 6): System[] {
  const matches = enterpriseCatalog
    .map((enterprise) => {
      const recommendations = getRecommendedSuppliersForSystem(enterprise.slug);
      const index = recommendations.findIndex((supplier) => supplier.slug === supplierSlug);

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

export function getRelatedSystemsForProNetworkSlug(networkSlug: string, limit = 6): System[] {
  const matches = enterpriseCatalog
    .map((enterprise) => {
      const recommendations = getRecommendedProNetworksForSystem(enterprise.slug);
      const index = recommendations.findIndex((network) => network.slug === networkSlug);

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

export function getRelatedSystemsForFinanceSlug(financeSlug: string, limit = 6): System[] {
  const matches = enterpriseCatalog
    .map((enterprise) => {
      const recommendations = getRecommendedFinanceForSystem(enterprise.slug);
      const index = recommendations.findIndex((item) => item.slug === financeSlug);

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

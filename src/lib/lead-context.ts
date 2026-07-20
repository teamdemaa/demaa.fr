import "server-only";

import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { resolveSectorTaxonomyByLabel } from "@/lib/sector-taxonomy";

export type LeadContext = {
  systemSlug: string | null;
  systemName: string | null;
  sectorSlug: string | null;
  sectorLabel: string | null;
  source: string;
  sourceUrl: string | null;
};

export async function resolveLeadContext(input: {
  systemSlug?: string | null;
  source: string;
  sourceUrl?: string | null;
}): Promise<LeadContext | null> {
  const systemSlug = input.systemSlug?.trim() || null;

  if (!systemSlug) {
    return {
      systemSlug: null,
      systemName: null,
      sectorSlug: null,
      sectorLabel: null,
      source: input.source.trim(),
      sourceUrl: input.sourceUrl?.trim() || null,
    };
  }

  const enterprise = await getEnterpriseBySlug(systemSlug);

  if (!enterprise) {
    return null;
  }

  const sector = resolveSectorTaxonomyByLabel(enterprise.sectorLabel);

  return {
    systemSlug: enterprise.slug,
    systemName: enterprise.name,
    sectorSlug: sector?.publicSlug ?? sector?.seoSlug ?? null,
    sectorLabel: enterprise.sectorLabel,
    source: input.source.trim(),
    sourceUrl: input.sourceUrl?.trim() || null,
  };
}

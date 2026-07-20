import rawSectorTaxonomy from "@/lib/sector-taxonomy.json";

type SectorFallbackMode = "exact" | "generic";

export type SectorTaxonomyEntry = {
  publicLabel: string;
  publicSlug: string;
  toolSectorLabel?: string;
  seoSlug: string;
  fallbackMode: SectorFallbackMode;
};

const sectorTaxonomyPayload = rawSectorTaxonomy as {
  sectors: SectorTaxonomyEntry[];
};

export const sectorTaxonomy = sectorTaxonomyPayload.sectors;

export const publicSectorLabels = sectorTaxonomy.map((sector) => sector.publicLabel) as readonly string[];

export type PublicSectorLabel = (typeof publicSectorLabels)[number];

const sectorTaxonomyByPublicLabel = Object.fromEntries(
  sectorTaxonomy.map((sector) => [sector.publicLabel, sector]),
) as Record<string, SectorTaxonomyEntry>;

const sectorTaxonomyByToolSectorLabel = Object.fromEntries(
  sectorTaxonomy
    .filter((sector) => Boolean(sector.toolSectorLabel))
    .map((sector) => [sector.toolSectorLabel as string, sector]),
) as Record<string, SectorTaxonomyEntry>;

const sectorTaxonomyBySeoSlug = Object.fromEntries(
  sectorTaxonomy.map((sector) => [sector.seoSlug, sector]),
) as Record<string, SectorTaxonomyEntry>;

export function getSectorTaxonomyByPublicLabel(label: string): SectorTaxonomyEntry | null {
  return sectorTaxonomyByPublicLabel[label] ?? null;
}

export function getSectorTaxonomyBySeoSlug(slug: string): SectorTaxonomyEntry | null {
  return sectorTaxonomyBySeoSlug[slug] ?? null;
}

export function resolveSectorTaxonomyByLabel(label: string): SectorTaxonomyEntry | null {
  return sectorTaxonomyByPublicLabel[label] ?? sectorTaxonomyByToolSectorLabel[label] ?? null;
}

export function getToolDirectorySectorLabel(sectorLabel: string): string {
  return resolveSectorTaxonomyByLabel(sectorLabel)?.toolSectorLabel ?? sectorLabel;
}

export function getToolDirectorySectorSeoPath(sectorLabel: string): string | null {
  const entry = resolveSectorTaxonomyByLabel(sectorLabel);

  if (!entry) {
    return null;
  }

  return `/annuaire-outils/secteur/${entry.seoSlug}`;
}

export function getSectorHubPath(sectorLabel: string): string | null {
  const entry = resolveSectorTaxonomyByLabel(sectorLabel);

  if (!entry) {
    return null;
  }

  return `/secteurs/${entry.publicSlug}`;
}

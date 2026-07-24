import { cache } from "react";
import { generatedAccountingDirectoryFirms } from "@/lib/generated-accounting-directory-firms";

type CreationOfferStatus = "yes" | "likely" | "unknown";
type NewClientsStatus = "likely" | "unknown";
type DataQuality = "Donnees solides" | "A completer" | "A verifier";

export type AccountingFirm = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  description: string;
  city: string;
  regions: string[];
  isOecVerified: boolean;
  website?: string;
  contactPage?: string;
  phone?: string;
  email?: string;
  siren?: string;
  siret?: string;
  tools: string[];
  services: string[];
  industries: string[];
  clientTypes: string[];
  languages: string[];
  hasCreationOffer: CreationOfferStatus;
  creationOfferUrl?: string;
  acceptsNewClients: NewClientsStatus;
  teamSize: string;
  officeCount: number;
  dataQuality: DataQuality;
  featuredRank?: number;
};

export type AccountingDirectoryFilters = {
  query?: string;
  city?: string;
  region?: string;
  service?: string;
  industry?: string;
  clientType?: string;
  tool?: string;
  creationOfferOnly?: boolean;
  newClientsOnly?: boolean;
  verifiedOnly?: boolean;
};

export type AccountingDirectoryFacet = {
  label: string;
  value: string;
  count: number;
};

export type AccountingDirectoryFacets = {
  cities: AccountingDirectoryFacet[];
  regions: AccountingDirectoryFacet[];
  services: AccountingDirectoryFacet[];
  industries: AccountingDirectoryFacet[];
  clientTypes: AccountingDirectoryFacet[];
  tools: AccountingDirectoryFacet[];
};

type AccountingDirectoryApiFirm = Partial<AccountingFirm> & {
  publicationStatus?: string;
};

const DIRECTORY_FIRMS_ENDPOINT =
  process.env.DEMAA_ACCOUNTING_DIRECTORY_FIRMS_ENDPOINT?.trim() || "";
const DIRECTORY_FIRMS_FETCH_TIMEOUT_MS = 2500;

export const getAccountingFirms = cache(async () => {
  if (!DIRECTORY_FIRMS_ENDPOINT) {
    return mergePriorityAccountingFirms(localFallbackFirms);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, DIRECTORY_FIRMS_FETCH_TIMEOUT_MS);

  const response = await fetch(DIRECTORY_FIRMS_ENDPOINT, {
    next: { revalidate: 300 },
    signal: controller.signal,
  }).catch(() => null);

  clearTimeout(timeoutId);

  if (!response?.ok) {
    return mergePriorityAccountingFirms(localFallbackFirms);
  }

  const payload = (await response.json().catch(() => null)) as
    | { firms?: AccountingDirectoryApiFirm[] }
    | null;

  const firms = Array.isArray(payload?.firms)
    ? payload.firms
        .map(mapAccountingDirectoryApiFirm)
        .filter((firm): firm is AccountingFirm => Boolean(firm))
    : [];

  return firms.length > 0
    ? mergePriorityAccountingFirms(firms)
    : mergePriorityAccountingFirms(localFallbackFirms);
});

export async function getAccountingFirmBySlug(slug: string) {
  const firms = await getAccountingFirms();
  return firms.find((firm) => firm.slug === slug) ?? null;
}

export async function getAccountingDirectoryFacets() {
  return getDirectoryFacets(await getAccountingFirms());
}

export async function getSimilarAccountingFirms(
  firm: AccountingFirm,
  limit = 3
) {
  const firms = await getAccountingFirms();
  return sortAccountingFirms(
    firms.filter((candidate) => candidate.id !== firm.id),
    {
      city: firm.city,
      region: firm.regions[0],
      service: firm.services[0],
      industry: firm.industries[0],
      clientType: firm.clientTypes[0],
      tool: firm.tools[0],
    }
  ).slice(0, limit);
}

export function getAccountingFirmScore(
  firm: AccountingFirm,
  filters: AccountingDirectoryFilters = {}
) {
  let score = 0;

  if (firm.isOecVerified) score += 20;
  if (firm.acceptsNewClients === "likely") score += 14;
  if (firm.dataQuality === "Donnees solides") score += 10;
  if (firm.hasCreationOffer === "yes") score += 6;

  if (filters.city && firm.city === filters.city) score += 20;
  if (filters.region && firm.regions.includes(filters.region)) score += 18;
  if (filters.service && firm.services.includes(filters.service)) score += 16;
  if (filters.industry && firm.industries.includes(filters.industry)) score += 14;
  if (filters.clientType && firm.clientTypes.includes(filters.clientType)) score += 12;
  if (filters.tool && firm.tools.includes(filters.tool)) score += 8;

  score += Math.min(firm.officeCount, 10);

  return score;
}

export function filterAccountingFirms(
  firms: AccountingFirm[],
  filters: AccountingDirectoryFilters
) {
  const query = filters.query?.trim().toLowerCase();

  return firms.filter((firm) => {
    if (query) {
      const haystack = [
        firm.name,
        firm.description,
        firm.city,
        ...firm.regions,
        ...firm.services,
        ...firm.industries,
        ...firm.clientTypes,
        ...firm.tools,
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) return false;
    }

    if (filters.city && firm.city !== filters.city) return false;
    if (filters.region && !firm.regions.includes(filters.region)) return false;
    if (filters.service && !firm.services.includes(filters.service)) return false;
    if (filters.industry && !firm.industries.includes(filters.industry)) return false;
    if (filters.clientType && !firm.clientTypes.includes(filters.clientType)) return false;
    if (filters.tool && !firm.tools.includes(filters.tool)) return false;
    if (filters.creationOfferOnly && firm.hasCreationOffer === "unknown") return false;
    if (filters.newClientsOnly && firm.acceptsNewClients !== "likely") return false;
    if (filters.verifiedOnly && !firm.isOecVerified) return false;

    return true;
  });
}

export function sortAccountingFirms(
  firms: AccountingFirm[],
  filters: AccountingDirectoryFilters = {}
) {
  return [...firms].sort((a, b) => {
    const featuredDifference =
      (a.featuredRank ?? Number.MAX_SAFE_INTEGER) -
      (b.featuredRank ?? Number.MAX_SAFE_INTEGER);
    if (featuredDifference !== 0) return featuredDifference;

    const scoreDifference =
      getAccountingFirmScore(b, filters) - getAccountingFirmScore(a, filters);
    if (scoreDifference !== 0) return scoreDifference;

    return a.name.localeCompare(b.name, "fr");
  });
}

export function getFilteredAccountingFirms(
  firms: AccountingFirm[],
  filters: AccountingDirectoryFilters = {}
) {
  return sortAccountingFirms(filterAccountingFirms(firms, filters), filters);
}

export function getDirectoryFacets(
  firms: AccountingFirm[]
): AccountingDirectoryFacets {
  return {
    cities: buildFacet(firms.map((firm) => firm.city)),
    regions: buildFacet(firms.flatMap((firm) => firm.regions)),
    services: buildFacet(firms.flatMap((firm) => firm.services)),
    industries: buildFacet(firms.flatMap((firm) => firm.industries)),
    clientTypes: buildFacet(firms.flatMap((firm) => firm.clientTypes)),
    tools: buildFacet(firms.flatMap((firm) => firm.tools)),
  };
}

function buildFacet(values: string[]): AccountingDirectoryFacet[] {
  const counts = new Map<string, number>();

  values.filter(Boolean).forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, value: label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fr"));
}

function mapAccountingDirectoryApiFirm(
  firm: AccountingDirectoryApiFirm
): AccountingFirm | null {
  const slug = cleanText(firm.slug);
  const name = cleanText(firm.name);

  if (!slug || !name) {
    return null;
  }

  return {
    id: cleanText(firm.id) || slug,
    slug,
    name,
    logoUrl: cleanOptional(firm.logoUrl),
    description:
      cleanText(firm.description) ||
      "Cabinet d'expertise comptable référencé dans l'annuaire Demaa.",
    city: cleanText(firm.city),
    regions: cleanList(firm.regions),
    isOecVerified: true,
    website: cleanOptional(firm.website),
    contactPage: cleanOptional(firm.contactPage),
    phone: cleanOptional(firm.phone),
    email: cleanOptional(firm.email),
    siren: cleanOptional(firm.siren),
    siret: cleanOptional(firm.siret),
    tools: cleanList(firm.tools),
    services: cleanList(firm.services),
    industries: cleanList(firm.industries),
    clientTypes: cleanList(firm.clientTypes),
    languages: cleanList(firm.languages),
    hasCreationOffer:
      firm.hasCreationOffer === "yes" || firm.hasCreationOffer === "likely"
        ? firm.hasCreationOffer
        : "unknown",
    acceptsNewClients:
      firm.acceptsNewClients === "likely" ? "likely" : "unknown",
    creationOfferUrl: cleanOptional(firm.creationOfferUrl),
    teamSize: cleanText(firm.teamSize),
    officeCount:
      typeof firm.officeCount === "number" && firm.officeCount > 0
        ? firm.officeCount
        : 1,
    dataQuality:
      firm.dataQuality === "Donnees solides" ||
      firm.dataQuality === "A completer" ||
      firm.dataQuality === "A verifier"
        ? firm.dataQuality
        : "A completer",
    featuredRank:
      typeof firm.featuredRank === "number" ? firm.featuredRank : undefined,
  };
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanOptional(value: unknown) {
  const cleaned = cleanText(value);
  return cleaned || undefined;
}

function cleanList(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

const localFallbackFirms: AccountingFirm[] = generatedAccountingDirectoryFirms.map((firm) => ({
  ...firm,
  isOecVerified: true,
}));
const priorityFallbackFirms = localFallbackFirms.filter(
  (firm) => typeof firm.featuredRank === "number"
);

function mergePriorityAccountingFirms(firms: AccountingFirm[]) {
  const firmsBySlug = new Map(firms.map((firm) => [firm.slug, firm]));

  for (const priorityFirm of priorityFallbackFirms) {
    firmsBySlug.set(priorityFirm.slug, {
      ...firmsBySlug.get(priorityFirm.slug),
      ...priorityFirm,
    });
  }

  return [...firmsBySlug.values()];
}

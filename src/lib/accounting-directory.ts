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

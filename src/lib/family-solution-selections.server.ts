import "server-only";

import familySolutionSelections from "@/lib/family-solution-selections.generated.json";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getDemaaProNetworkBySlug } from "@/lib/pro-network-catalog";
import { isSafeInteractionHref } from "@/lib/solution-registry-contract";
import type { SolutionResourceType, SolutionSection } from "@/lib/solution-registry-dto";
import { getDemaaSupplierBySlug } from "@/lib/supplier-catalog";
import { getToolDirectoryItemBySlug } from "@/lib/tool-directory";

export const FAMILY_SOLUTION_SENTINEL_SLUGS = [
  "plomberie-chauffage",
  "restaurant",
  "commerce-de-detail",
  "agence-immobiliere",
  "cabinet-medical",
] as const;

export const FAMILY_SOLUTION_SOURCE_HASHES = Object.freeze({
  operations: "d47ae9197882ba4267e2fc5121c920faf3093cd2ca8ccb2c2602137071b1da09",
  people: "ec80e39c7b615f5910472c1a93e7da82971d4b827653ab63c210f4b369554131",
  peopleSupplement: "847aa441baef38b135adae13359be42357a88858514058f052f1a399a745e2df",
  knowledge: "e0e5b1806fe94a8f17ae01f373d347e833c67c277b7a6422eaf5d3a3a49eab18",
});

const PILOT_SLUGS = new Set(["batiment", "cabinet-comptable", "agence-marketing"]);
const SENTINEL_SLUGS = new Set<string>(FAMILY_SOLUTION_SENTINEL_SLUGS);
const KNOWN_SYSTEM_SLUGS = new Set(enterpriseCatalog.map(({ slug }) => slug));

export type FamilySolutionSelection = Readonly<{
  resourceSlug: string;
  resourceType: SolutionResourceType;
  section: SolutionSection;
  rank: number;
  displayCategory?: string;
  description: string;
  pricingSummary?: string;
  pricingCapturedAt?: string;
  pricingExpiresAt?: string;
  ownerBenefit: string;
  fitRationale: string;
  checksBeforeChoosing: readonly string[];
  reviewedAt: string;
  evidenceUrls: readonly string[];
  catalogDestination?: string;
  commercialRelationship: "owned" | "unknown";
  status: "published" | "draft";
  publicationBlockers: readonly string[];
  interactionMode: "system_delivery" | "external_link";
}>;

export type FamilySystemSolutionSelection = Readonly<{
  source: string;
  family?: string;
  systemSlug: string;
  systemName: string;
  reviewedAt: string;
  excludedResourceSlugs: readonly string[];
  placements: readonly FamilySolutionSelection[];
}>;

type FamilySolutionGap = Readonly<{
  source: string;
  family?: string;
  systemSlug: string;
  section: SolutionSection;
  rank: number;
  resourceSlug: string;
  reason: string;
  auditedOfficialUrl?: string;
}>;

type ResolvedCatalogSelection = Readonly<{
  resourceSlug: string;
  resourceType: SolutionResourceType;
  name: string;
  description: string;
  href: string;
}>;

const manifest = familySolutionSelections as unknown as Readonly<{
  schemaVersion: number;
  manifestVersion: string;
  sourceArtifacts: readonly Readonly<{ source: string; sha256: string }>[];
  systems: readonly FamilySystemSolutionSelection[];
  gaps: readonly FamilySolutionGap[];
}>;

function assertFamilySolutionManifest() {
  if (manifest.schemaVersion !== 1 || manifest.manifestVersion !== "family-solution-selections.v1") {
    throw new Error("Invalid family solution selection manifest version.");
  }
  const sourceHashes = Object.fromEntries(
    manifest.sourceArtifacts.map(({ source, sha256 }) => [source, sha256]),
  );
  for (const [source, expectedHash] of Object.entries(FAMILY_SOLUTION_SOURCE_HASHES)) {
    if (sourceHashes[source] !== expectedHash) {
      throw new Error(`Unexpected family solution source hash: ${source}.`);
    }
  }
  if (manifest.systems.length !== 112) {
    throw new Error("Family solution selection manifest must contain 112 non-pilot systems.");
  }
  const slugs = new Set<string>();
  for (const system of manifest.systems) {
    if (
      slugs.has(system.systemSlug) ||
      !KNOWN_SYSTEM_SLUGS.has(system.systemSlug) ||
      PILOT_SLUGS.has(system.systemSlug)
    ) {
      throw new Error(`Invalid family solution system ownership: ${system.systemSlug}.`);
    }
    slugs.add(system.systemSlug);
    for (const section of ["software", "providers", "networks"] as const) {
      const placements = system.placements.filter(
        (placement) => placement.resourceSlug !== "levier" && placement.section === section,
      );
      if (placements.length > 5) {
        throw new Error(`Too many family solutions: ${system.systemSlug}:${section}.`);
      }
      const ranks = placements.map(({ rank }) => rank);
      if (ranks.some((rank, index) => rank !== index + 1)) {
        throw new Error(`Non-contiguous family solution ranks: ${system.systemSlug}:${section}.`);
      }
    }
    for (const placement of system.placements) {
      const isLevier = placement.resourceSlug === "levier";
      if (isLevier) {
        if (
          placement.status !== "published" ||
          placement.commercialRelationship !== "owned" ||
          placement.publicationBlockers.length !== 0 ||
          placement.interactionMode !== "system_delivery"
        ) {
          throw new Error(`Invalid Levier family placement: ${system.systemSlug}.`);
        }
      } else if (
        placement.status !== "draft" ||
        placement.commercialRelationship !== "unknown" ||
        placement.publicationBlockers.length !== 1 ||
        placement.publicationBlockers[0] !== "commercial-relationship-unconfirmed" ||
        placement.interactionMode !== "external_link"
      ) {
        throw new Error(`Unsafe third-party family placement: ${system.systemSlug}:${placement.resourceSlug}.`);
      }
    }
  }
}

assertFamilySolutionManifest();

export function getFreshFamilyPricingSummary(
  selection: Pick<FamilySolutionSelection, "pricingSummary" | "pricingCapturedAt" | "pricingExpiresAt">,
  now = new Date(),
): string | undefined {
  if (!selection.pricingSummary || !selection.pricingCapturedAt || !selection.pricingExpiresAt) {
    return undefined;
  }
  const nowTimestamp = now.getTime();
  const capturedAt = Date.parse(selection.pricingCapturedAt);
  const expiresAt = Date.parse(selection.pricingExpiresAt);
  if (
    !Number.isFinite(nowTimestamp) ||
    !Number.isFinite(capturedAt) ||
    !Number.isFinite(expiresAt) ||
    capturedAt > nowTimestamp ||
    capturedAt >= expiresAt ||
    expiresAt <= nowTimestamp
  ) return undefined;
  return selection.pricingSummary;
}

const selectionsBySystemSlug = new Map(
  manifest.systems.map((system) => [system.systemSlug, system]),
);

export function isFamilySolutionSentinel(systemSlug: unknown): systemSlug is string {
  return typeof systemSlug === "string" && SENTINEL_SLUGS.has(systemSlug);
}

export function getFamilySystemSolutionSelection(
  systemSlug: unknown,
): FamilySystemSolutionSelection | null {
  return typeof systemSlug === "string"
    ? selectionsBySystemSlug.get(systemSlug) ?? null
    : null;
}

export function getFamilySolutionGaps(): readonly FamilySolutionGap[] {
  return manifest.gaps;
}

export function resolveFamilySolutionCatalogSelection(
  selection: FamilySolutionSelection,
): ResolvedCatalogSelection | null {
  if (selection.resourceSlug === "levier" || !selection.catalogDestination) return null;

  const tool = selection.section === "software"
    ? getToolDirectoryItemBySlug(selection.resourceSlug)
    : null;
  const supplier = selection.section === "providers"
    ? getDemaaSupplierBySlug(selection.resourceSlug)
    : null;
  const organization =
    (selection.section === "providers" || selection.section === "networks") && !supplier
    ? getDemaaProNetworkBySlug(selection.resourceSlug)
    : null;
  const href = tool?.url ?? supplier?.href ?? organization?.href;
  const destination = selection.catalogDestination;
  const isCatalogDestination = href === destination;
  const isProvenDestination = selection.evidenceUrls.includes(destination);
  if (
    (!isCatalogDestination && !isProvenDestination) ||
    !isSafeInteractionHref(destination, "external_link")
  ) return null;

  return {
    resourceSlug: selection.resourceSlug,
    resourceType: tool ? "software" : supplier ? "provider" : "directory",
    name: tool?.name ?? supplier?.name ?? organization?.name ?? selection.resourceSlug,
    description: selection.description,
    href: destination,
  };
}

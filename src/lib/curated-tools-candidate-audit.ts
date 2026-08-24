import type { FirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";
import {
  buildStableSolutionPlacementId,
  isSafeInteractionHref,
} from "@/lib/solution-registry-contract";

export const D091_PILOT_SYSTEM_SLUGS = [
  "agence-de-recrutement",
  "saas",
  "agence-web",
  "cabinet-comptable",
  "batiment",
] as const;

export const D091_RESTAURATION_SYSTEM_SLUGS = [
  "restaurant",
  "fast-food",
  "traiteur",
  "dark-kitchen",
  "boulangerie",
  "bar-cafe",
  "food-truck",
] as const;

const OFFICIAL_EVIDENCE_TYPES = new Set([
  "official_product_page",
  "technical_documentation",
]);

type CandidateAuditOptions = Readonly<{
  activeRevision?: FirebaseSolutionRegistryRevision;
  activeToolSlugs?: ReadonlySet<string>;
  auditSystemSlugs?: readonly string[];
  expectedCatalogSystemSlugs?: readonly string[];
}>;

function softwarePlacementKey(placement: {
  resourceSlug: string;
  systemSlug: string;
}) {
  return `${placement.systemSlug}:${placement.resourceSlug}:software`;
}

/**
 * New D-091 placements use an identity independent from their editorial rank.
 * Existing placements keep their historical IDs for workspace compatibility.
 */
export function buildStableSoftwarePlacementId(input: {
  resourceSlug: string;
  systemSlug: string;
}) {
  return buildStableSolutionPlacementId({
    ...input,
    section: "software",
  });
}

function hasOfficialEvidence(
  evidence: FirebaseSolutionRegistryRevision["resources"][number]["resource"]["evidence"],
) {
  return evidence.some((entry) =>
    OFFICIAL_EVIDENCE_TYPES.has(entry.evidenceType) &&
    isSafeInteractionHref(entry.sourceRef, "external_link")
  );
}

function entriesBySoftwareKey(revision: FirebaseSolutionRegistryRevision) {
  return new Map(
    revision.placements
      .filter(({ placement }) => placement.section === "software")
      .map(({ placement }) => [softwarePlacementKey(placement), placement]),
  );
}

const CURATED_ECOSYSTEM_SECTIONS = ["providers", "networks"] as const;
const CURATED_ECOSYSTEM_RESOURCE_TYPES = new Set([
  "provider",
  "directory",
  "expertise",
]);

function hasSafePublishedInteraction(
  resource: FirebaseSolutionRegistryRevision["resources"][number]["resource"],
) {
  if (resource.interactionMode === "referral_form") return true;
  if (resource.interactionMode === "system_delivery") return false;
  return isSafeInteractionHref(resource.href, resource.interactionMode);
}

/**
 * Providers and networks may legitimately be empty. When present in a final
 * candidate revision, every entry must be explicitly selected and publishable.
 */
export function validateCuratedEcosystemCandidateRevision(
  candidate: FirebaseSolutionRegistryRevision,
  options: Pick<CandidateAuditOptions, "auditSystemSlugs"> = {},
): string[] {
  const errors: string[] = [];
  const resources = new Map(
    candidate.resources.map(({ resource }) => [resource.resourceSlug, resource]),
  );
  const auditSystemSlugs = options.auditSystemSlugs ?? candidate.knownSystemSlugs;

  for (const systemSlug of auditSystemSlugs) {
    for (const section of CURATED_ECOSYSTEM_SECTIONS) {
      const entries = candidate.placements
        .filter(({ placement }) =>
          placement.systemSlug === systemSlug && placement.section === section
        )
        .sort((left, right) => left.placement.rank - right.placement.rank);
      if (entries.length === 0) continue;
      if (entries.some(({ placement }) => placement.editorialStatus !== "selected")) {
        errors.push(`${systemSlug}:${section}: final selection contains hidden entries`);
      }
      if (entries.some(({ placement }, index) => placement.rank !== index + 1)) {
        errors.push(`${systemSlug}:${section}: ranks must be contiguous from 1 to N`);
      }
      const resourceSlugs = entries.map(({ placement }) => placement.resourceSlug);
      if (new Set(resourceSlugs).size !== resourceSlugs.length) {
        errors.push(`${systemSlug}:${section}: resources must be unique`);
      }

      for (const { placement } of entries) {
        if (placement.status !== "published" || placement.publicationBlockers.length > 0) {
          errors.push(`${placement.placementId}: placement is not publication-ready`);
        }
        if (!hasOfficialEvidence(placement.evidence)) {
          errors.push(`${placement.placementId}: placement requires official evidence`);
        }
        if (placement.fitConstraints.length === 0) {
          errors.push(`${placement.placementId}: placement requires a factual constraint`);
        }
        if (placement.usage.trim().length < 20 || placement.fitRationale.trim().length < 30) {
          errors.push(`${placement.placementId}: usage or rationale is not contextual enough`);
        }

        const resource = resources.get(placement.resourceSlug);
        if (!resource) {
          errors.push(`${placement.placementId}: resource is missing`);
          continue;
        }
        if (!CURATED_ECOSYSTEM_RESOURCE_TYPES.has(resource.resourceType)) {
          errors.push(`${placement.placementId}: resource type is incompatible with ${section}`);
        }
        if (resource.status !== "published" || resource.publicationBlockers.length > 0) {
          errors.push(`${placement.placementId}: resource is not publication-ready`);
        }
        if (!hasOfficialEvidence(resource.evidence)) {
          errors.push(`${placement.placementId}: resource requires official evidence`);
        }
        if (!hasSafePublishedInteraction(resource)) {
          errors.push(`${placement.placementId}: resource interaction is not publishable`);
        }
      }
    }
  }

  return errors;
}

/**
 * Validates the final, activable D-091 read-model. It deliberately does not
 * mutate or activate a Firebase revision.
 */
export function validateCuratedToolsCandidateRevision(
  candidate: FirebaseSolutionRegistryRevision,
  options: CandidateAuditOptions = {},
): string[] {
  const errors: string[] = [];
  const resources = new Map(
    candidate.resources.map(({ resource }) => [resource.resourceSlug, resource]),
  );
  const activeSoftwareByKey = options.activeRevision
    ? entriesBySoftwareKey(options.activeRevision)
    : new Map<string, FirebaseSolutionRegistryRevision["placements"][number]["placement"]>();
  const expectedCatalogSystemSlugs =
    options.expectedCatalogSystemSlugs ?? candidate.knownSystemSlugs;
  const auditSystemSlugs = options.auditSystemSlugs ?? expectedCatalogSystemSlugs;

  if (new Set(candidate.knownSystemSlugs).size !== candidate.knownSystemSlugs.length) {
    errors.push("candidate known system slugs must be unique");
  }
  if (
    expectedCatalogSystemSlugs.length !== candidate.knownSystemSlugs.length ||
    expectedCatalogSystemSlugs.some((slug) => !candidate.knownSystemSlugs.includes(slug))
  ) {
    errors.push("candidate system coverage differs from the expected catalogue");
  }
  if (auditSystemSlugs.some((slug) => !candidate.knownSystemSlugs.includes(slug))) {
    errors.push("audit scope contains an unknown system");
  }

  for (const systemSlug of auditSystemSlugs) {
    const allSoftware = candidate.placements
      .filter(({ placement }) =>
        placement.systemSlug === systemSlug && placement.section === "software"
      )
      .sort((left, right) => left.placement.rank - right.placement.rank);
    const selectedSoftware = allSoftware.filter(
      ({ placement }) => placement.editorialStatus === "selected",
    );

    if (allSoftware.length === 0 || selectedSoftware.length !== allSoftware.length) {
      errors.push(
        `${systemSlug}: expected a non-empty final software selection with no hidden pool entries; found ${selectedSoftware.length} selected and ${allSoftware.length} total`,
      );
    }
    if (allSoftware.some(({ placement }, index) => placement.rank !== index + 1)) {
      errors.push(`${systemSlug}: software ranks must be contiguous from 1 to N`);
    }
    const resourceSlugs = selectedSoftware.map(({ placement }) => placement.resourceSlug);
    if (new Set(resourceSlugs).size !== resourceSlugs.length) {
      errors.push(`${systemSlug}: software resources must be unique`);
    }

    for (const { placement } of allSoftware) {
      const key = softwarePlacementKey(placement);
      const previous = activeSoftwareByKey.get(key);
      if (previous && previous.placementId !== placement.placementId) {
        errors.push(`${key}: retained placement ID changed`);
      }
      if (!previous && placement.placementId !== buildStableSoftwarePlacementId(placement)) {
        errors.push(`${key}: new placement ID must be independent from rank`);
      }
      if (placement.status !== "published" || placement.publicationBlockers.length > 0) {
        errors.push(`${placement.placementId}: placement is not publication-ready`);
      }
      if (!hasOfficialEvidence(placement.evidence)) {
        errors.push(`${placement.placementId}: placement requires official evidence`);
      }
      if (placement.fitConstraints.length === 0) {
        errors.push(`${placement.placementId}: placement requires a factual constraint`);
      }
      if (placement.usage.trim().length < 20 || placement.fitRationale.trim().length < 30) {
        errors.push(`${placement.placementId}: usage or rationale is not contextual enough`);
      }

      const resource = resources.get(placement.resourceSlug);
      if (!resource) {
        errors.push(`${placement.placementId}: resource is missing`);
        continue;
      }
      if (resource.resourceType !== "software" && resource.resourceType !== "tool") {
        errors.push(`${placement.placementId}: resource is not a tool`);
      }
      if (resource.status !== "published" || resource.publicationBlockers.length > 0) {
        errors.push(`${placement.placementId}: resource is not publication-ready`);
      }
      if (!hasOfficialEvidence(resource.evidence)) {
        errors.push(`${placement.placementId}: resource requires official evidence`);
      }
      if (
        resource.interactionMode !== "external_link" ||
        !isSafeInteractionHref(resource.href, "external_link")
      ) {
        errors.push(`${placement.placementId}: resource requires a safe official destination`);
      }
      if (options.activeToolSlugs && !options.activeToolSlugs.has(resource.resourceSlug)) {
        errors.push(`${placement.placementId}: tool is not active in the canonical directory`);
      }
    }
  }

  return errors;
}

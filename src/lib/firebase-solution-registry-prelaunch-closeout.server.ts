import "server-only";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  fingerprintFirebaseSolutionRegistryRevision,
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
  type FirebaseSolutionPlacementEntry,
  type FirebaseSolutionRegistryRevision,
  type FirebaseSolutionResourceEntry,
} from "@/lib/firebase-solution-registry-contract";
import activeSnapshot from "@/lib/firebase-solution-registry.snapshot.generated.json";
import { getToolDirectoryItemBySlug } from "@/lib/tool-directory";

export const PRELAUNCH_CLOSEOUT_TIMESTAMP = "2026-08-10T08:00:00.000Z" as const;
export const PRELAUNCH_CLOSEOUT_EXPIRY = "2027-02-10T08:00:00.000Z" as const;
export const PRELAUNCH_CLOSEOUT_REVISION_ID =
  "solutions-2026-08-10-prelaunch-closeout-published-v1" as const;

const EMPTY_FINGERPRINT = "0".repeat(64);
const PUBLICATION_BLOCKERS = ["commercial-relationship-unconfirmed"] as const;
const TARGET_SYSTEM_SLUG = "investissement-entreprise" as const;
const RESOURCE_SLUG = "edda" as const;
const SECTION_ORDER = new Map(
  ["software", "services", "providers", "models", "networks"].map(
    (section, index) => [section, index],
  ),
);

function buildReviewMetadata(scope: "resource" | "placement") {
  return {
    evidence: [{
      evidenceId: `prelaunch-closeout-${scope}-${TARGET_SYSTEM_SLUG}-${RESOURCE_SLUG}`,
      sourceRef: "https://edda.co/",
      claim: scope === "resource"
        ? "Edda présente officiellement une plateforme de gestion du dealflow et du portefeuille destinée aux équipes d’investissement."
        : "Edda réunit le suivi du dealflow, la due diligence, le portefeuille et le reporting nécessaires au pilotage d’une activité d’investissement.",
      evidenceType: "official_product_page" as const,
      capturedAt: PRELAUNCH_CLOSEOUT_TIMESTAMP,
    }],
    reviewer: "Solutions France - audit officiel",
    reviewedAt: PRELAUNCH_CLOSEOUT_TIMESTAMP,
    expiresAt: PRELAUNCH_CLOSEOUT_EXPIRY,
  };
}

function buildEddaResource(): FirebaseSolutionResourceEntry {
  const tool = getToolDirectoryItemBySlug(RESOURCE_SLUG);
  if (!tool) throw new Error("Edda is missing from the tool directory.");

  return {
    resource: {
      ...buildReviewMetadata("resource"),
      interactionMode: "external_link",
      href: tool.url,
      resourceSlug: RESOURCE_SLUG,
      resourceType: "software",
      name: tool.name,
      description: tool.description,
      commercialRelationship: "unknown",
      status: "draft",
      resourceVersion: "prelaunch-closeout.v1",
      publicationBlockers: PUBLICATION_BLOCKERS,
    },
  };
}

function buildEddaPlacement(): FirebaseSolutionPlacementEntry {
  const tool = getToolDirectoryItemBySlug(RESOURCE_SLUG);
  if (!tool) throw new Error("Edda is missing from the tool directory.");

  return {
    placement: {
      ...buildReviewMetadata("placement"),
      placementId: `${TARGET_SYSTEM_SLUG}:${RESOURCE_SLUG}:software:1`,
      systemSlug: TARGET_SYSTEM_SLUG,
      resourceSlug: RESOURCE_SLUG,
      rank: 1,
      section: "software",
      usage: "Centraliser le dealflow, la due diligence, le portefeuille et le reporting d’investissement.",
      fitRationale:
        "La plateforme couvre le cycle d’investissement et donne une vue cohérente des opportunités, participations, performances et décisions.",
      fitConstraints: [
        "Vérifier l’adéquation avec la taille du portefeuille, les besoins de reporting et les intégrations existantes.",
      ],
      editorialStatus: "selected",
      commercialRelationship: "unknown",
      status: "draft",
      placementVersion: "prelaunch-closeout.v1",
      publicationBlockers: PUBLICATION_BLOCKERS,
    },
    presentation: {
      displayCategory: "Gestion d’investissement",
      nameOverride: tool.name,
      hrefOverride: tool.url,
      ctaLabel: "Voir l’outil",
      descriptionOverride: tool.description,
    },
  };
}

export function buildPublishedPrelaunchCloseoutRevision(): FirebaseSolutionRegistryRevision {
  const activeRevision = parseFirebaseSolutionRegistryRevision(activeSnapshot);
  const eddaResource = buildEddaResource();
  const eddaPlacement = buildEddaPlacement();
  const resources = [
    ...activeRevision.resources.filter(
      ({ resource }) => resource.resourceSlug !== RESOURCE_SLUG,
    ),
    eddaResource,
  ].toSorted((left, right) =>
    left.resource.resourceSlug.localeCompare(right.resource.resourceSlug)
  );
  const systemOrder = new Map(
    activeRevision.knownSystemSlugs.map((systemSlug, index) => [systemSlug, index]),
  );
  const placements = [
    ...activeRevision.placements.filter(
      ({ placement }) =>
        !(
          placement.systemSlug === TARGET_SYSTEM_SLUG &&
          placement.resourceSlug === RESOURCE_SLUG
        ),
    ),
    eddaPlacement,
  ].toSorted((left, right) => {
    const systemDifference =
      (systemOrder.get(left.placement.systemSlug) ?? Number.MAX_SAFE_INTEGER) -
      (systemOrder.get(right.placement.systemSlug) ?? Number.MAX_SAFE_INTEGER);
    if (systemDifference !== 0) return systemDifference;
    const sectionDifference =
      (SECTION_ORDER.get(left.placement.section) ?? Number.MAX_SAFE_INTEGER) -
      (SECTION_ORDER.get(right.placement.section) ?? Number.MAX_SAFE_INTEGER);
    if (sectionDifference !== 0) return sectionDifference;
    return left.placement.rank - right.placement.rank ||
      left.placement.placementId.localeCompare(right.placement.placementId);
  });
  const baseRevision = {
    ...activeRevision,
    revisionId: PRELAUNCH_CLOSEOUT_REVISION_ID,
    revisionStatus: "published" as const,
    createdAt: PRELAUNCH_CLOSEOUT_TIMESTAMP,
    createdBy: "release://prelaunch-closeout-france-2026-08-10",
    sourceFingerprint: EMPTY_FINGERPRINT,
    resources,
    placements,
  };
  const candidate = parseFirebaseSolutionRegistryRevision({
    ...baseRevision,
    sourceFingerprint: fingerprintFirebaseSolutionRegistryRevision(baseRevision),
  });
  const errors = validateFirebaseSolutionRegistryRevision(candidate, {
    expectedSystemSlugs: enterpriseCatalog.map(({ slug }) => slug),
    now: new Date(PRELAUNCH_CLOSEOUT_TIMESTAMP),
    requirePublishedRevision: true,
  });
  if (errors.length > 0) {
    throw new Error(`Invalid prelaunch closeout revision:\n${errors.join("\n")}`);
  }
  return candidate;
}

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

export const FRANCE_SOLUTIONS_CLEANUP_TIMESTAMP =
  "2026-08-08T18:00:00.000Z" as const;
export const FRANCE_SOLUTIONS_CLEANUP_EXPIRY =
  "2027-02-08T18:00:00.000Z" as const;
export const FRANCE_SOLUTIONS_CLEANUP_REVISION_ID =
  "solutions-2026-08-08-france-clean-v1" as const;
export const FRANCE_SOLUTIONS_PUBLISHED_TIMESTAMP =
  "2026-08-09T14:00:00.000Z" as const;
export const FRANCE_SOLUTIONS_PUBLISHED_REVISION_ID =
  "solutions-2026-08-09-france-clean-published-v3" as const;

const EMPTY_FINGERPRINT = "0".repeat(64);

export const FRANCE_SOLUTIONS_OFFICIAL_DESTINATIONS = {
  "diag-pilote": "https://www.diag-pilote.com/",
  "google-ads": "https://business.google.com/fr/google-ads/",
  liciel: "https://www.liciel.fr/logiciels-details-pack-liciel-diagnostics.html",
  onaya: "https://www.orisha.com/fr/construction/logiciel/onaya-btp/",
  riverside: "https://riverside.com/",
  secib: "https://www.secib.septeo.com/",
  tiimora: "https://www.tiimora.com/",
  zoom: "https://www.zoom.com/",
} as const;

export const FRANCE_SOLUTIONS_REMOVED_RESOURCES = ["regate"] as const;

type MutableResourceEntry = {
  resource: FirebaseSolutionResourceEntry["resource"];
};
type MutablePlacementEntry = {
  placement: FirebaseSolutionPlacementEntry["placement"];
  presentation: FirebaseSolutionPlacementEntry["presentation"];
};

function refreshedEvidence(
  evidence: FirebaseSolutionResourceEntry["resource"]["evidence"],
  officialSource: string,
) {
  return evidence.map((entry) => ({
    ...entry,
    sourceRef: officialSource,
    evidenceType: "official_product_page" as const,
    capturedAt: FRANCE_SOLUTIONS_CLEANUP_TIMESTAMP,
  }));
}

function updateResource(
  entry: FirebaseSolutionResourceEntry,
): MutableResourceEntry {
  const resource = entry.resource;
  const officialSource = FRANCE_SOLUTIONS_OFFICIAL_DESTINATIONS[
    resource.resourceSlug as keyof typeof FRANCE_SOLUTIONS_OFFICIAL_DESTINATIONS
  ];
  if (!officialSource) return structuredClone(entry);

  const tiimoraDescription =
    "Logiciel de relation client pour cabinets comptables : demandes, documents, signatures, relances et portail client.";

  return {
    resource: {
      ...resource,
      href: officialSource,
      ...(resource.resourceSlug === "tiimora"
        ? { description: tiimoraDescription }
        : {}),
      evidence: refreshedEvidence(resource.evidence, officialSource),
      reviewer: "Solutions France audit",
      reviewedAt: FRANCE_SOLUTIONS_CLEANUP_TIMESTAMP,
      expiresAt: FRANCE_SOLUTIONS_CLEANUP_EXPIRY,
    },
  } as MutableResourceEntry;
}

function withoutRegateReference(value: string) {
  return value
    .replace(
      " ; Regate complète les validations fournisseurs et Power BI la restitution décisionnelle.",
      " ; Power BI complète la restitution décisionnelle.",
    )
    .replace(
      " ; il ne remplace ni la source comptable Pennylane ni les workflows de paiement Regate.",
      " ; il ne remplace pas la source comptable Pennylane.",
    );
}

function updatePlacement(
  entry: FirebaseSolutionPlacementEntry,
): MutablePlacementEntry {
  const { placement, presentation } = entry;
  const officialSource = FRANCE_SOLUTIONS_OFFICIAL_DESTINATIONS[
    placement.resourceSlug as keyof typeof FRANCE_SOLUTIONS_OFFICIAL_DESTINATIONS
  ];
  const isDafPowerBi =
    placement.systemSlug === "daf-externalise" &&
    placement.resourceSlug === "power-bi";
  const isDafPennylane =
    placement.systemSlug === "daf-externalise" &&
    placement.resourceSlug === "pennylane";

  const nextRank = isDafPowerBi ? 2 : placement.rank;
  const nextPlacement = {
    ...placement,
    placementId: `${placement.systemSlug}:${placement.resourceSlug}:${placement.section}:${nextRank}`,
    rank: nextRank,
    ...(officialSource || isDafPowerBi || isDafPennylane
      ? {
          evidence: placement.evidence.map((evidence) => ({
            ...evidence,
            ...(officialSource
              ? {
                  sourceRef: officialSource,
                  evidenceType: "official_product_page" as const,
                }
              : {}),
            ...(isDafPowerBi || isDafPennylane
              ? { claim: withoutRegateReference(evidence.claim) }
              : {}),
            capturedAt: FRANCE_SOLUTIONS_CLEANUP_TIMESTAMP,
          })),
          reviewer: "Solutions France audit",
          reviewedAt: FRANCE_SOLUTIONS_CLEANUP_TIMESTAMP,
          expiresAt: FRANCE_SOLUTIONS_CLEANUP_EXPIRY,
        }
      : {}),
    ...(isDafPowerBi || isDafPennylane
      ? { fitRationale: withoutRegateReference(placement.fitRationale) }
      : {}),
  };

  const tiimoraDescription =
    "Logiciel de relation client pour cabinets comptables : demandes, documents, signatures, relances et portail client.";

  return {
    placement: nextPlacement,
    presentation: {
      ...presentation,
      ...(officialSource ? { hrefOverride: officialSource } : {}),
      ...(placement.resourceSlug === "tiimora"
        ? { descriptionOverride: tiimoraDescription }
        : {}),
    },
  } as MutablePlacementEntry;
}

function buildFranceSolutionsRevision({
  createdAt,
  createdBy,
  revisionId,
  revisionStatus,
}: {
  createdAt: string;
  createdBy: string;
  revisionId: string;
  revisionStatus: "draft" | "published";
}): FirebaseSolutionRegistryRevision {
  const activeRevision = parseFirebaseSolutionRegistryRevision(activeSnapshot);
  const resources = activeRevision.resources
    .filter(
      ({ resource }) =>
        resource.resourceSlug !== "regate" &&
        resource.resourceVersion !== "professional-suppliers.v1" &&
        resource.resourceVersion !== "prelaunch-closeout.v1",
    )
    .map(updateResource);
  const placements = activeRevision.placements
    .filter(
      ({ placement }) =>
        placement.resourceSlug !== "regate" &&
        placement.placementVersion !== "professional-suppliers.v1" &&
        placement.placementVersion !== "prelaunch-closeout.v1",
    )
    .map(updatePlacement);

  const baseRevision = {
    ...activeRevision,
    revisionId,
    revisionStatus,
    createdAt,
    createdBy,
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
    now: new Date(createdAt),
  });
  if (errors.length > 0) {
    throw new Error(`Invalid France Solutions cleanup revision:\n${errors.join("\n")}`);
  }
  return candidate;
}

export function buildFranceSolutionsCleanupRevision(): FirebaseSolutionRegistryRevision {
  return buildFranceSolutionsRevision({
    revisionId: FRANCE_SOLUTIONS_CLEANUP_REVISION_ID,
    revisionStatus: "draft",
    createdAt: FRANCE_SOLUTIONS_CLEANUP_TIMESTAMP,
    createdBy: "audit://solutions-france-2026-08-08",
  });
}

export function buildPublishedFranceSolutionsCleanupRevision(): FirebaseSolutionRegistryRevision {
  return buildFranceSolutionsRevision({
    revisionId: FRANCE_SOLUTIONS_PUBLISHED_REVISION_ID,
    revisionStatus: "published",
    createdAt: FRANCE_SOLUTIONS_PUBLISHED_TIMESTAMP,
    createdBy: "release://solutions-france-2026-08-09",
  });
}

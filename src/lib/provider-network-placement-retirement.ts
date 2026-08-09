import { createHash } from "node:crypto";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  parseExpertisePlacement,
  type ExpertisePlacement,
} from "@/lib/expertise-placement-contract";
import { RETIRED_UNIVERSAL_EXPERTISE_ID } from "@/lib/expertise-placement-seeds";

export const EXPERTISE_PLACEMENTS_COLLECTION = "expertise_placements" as const;
export const RETIRED_UNIVERSAL_PLACEMENT_COUNT = 114 as const;

export type RetiredPlacementSnapshot = Readonly<{
  schemaVersion: 1;
  projectId: string;
  collection: typeof EXPERTISE_PLACEMENTS_COLLECTION;
  capturedAt: string;
  documents: readonly Readonly<{
    path: string;
    data: ExpertisePlacement;
  }>[];
  snapshotFingerprint: string;
}>;

function fingerprintSnapshot(input: {
  projectId: string;
  capturedAt: string;
  documents: RetiredPlacementSnapshot["documents"];
}) {
  return createHash("sha256")
    .update(JSON.stringify({
      schemaVersion: 1,
      projectId: input.projectId,
      collection: EXPERTISE_PLACEMENTS_COLLECTION,
      capturedAt: input.capturedAt,
      documents: input.documents,
    }))
    .digest("hex");
}

export function expectedRetiredUniversalPlacementIds() {
  return enterpriseCatalog
    .filter(({ slug }) => slug !== "cabinet-comptable")
    .map(({ slug }) => `${slug}:${RETIRED_UNIVERSAL_EXPERTISE_ID}`)
    .sort();
}

export function buildRetiredPlacementSnapshot(input: {
  projectId: string;
  capturedAt: string;
  placements: readonly unknown[];
}): RetiredPlacementSnapshot {
  if (!input.projectId.trim()) throw new TypeError("snapshot projectId is required");
  if (new Date(input.capturedAt).toISOString() !== input.capturedAt) {
    throw new TypeError("snapshot capturedAt must be an ISO timestamp");
  }
  const placements = input.placements
    .map((placement, index) =>
      parseExpertisePlacement(placement, `retiredPlacement[${index}]`)
    )
    .sort((left, right) =>
      left.expertisePlacementId.localeCompare(right.expertisePlacementId)
    );
  const ids = placements.map(({ expertisePlacementId }) => expertisePlacementId);
  const expectedIds = expectedRetiredUniversalPlacementIds();
  if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) {
    throw new Error(
      `Le snapshot doit couvrir exactement les ${RETIRED_UNIVERSAL_PLACEMENT_COUNT} placements universels attendus.`,
    );
  }
  if (placements.some(({ expertiseId }) =>
    expertiseId !== RETIRED_UNIVERSAL_EXPERTISE_ID
  )) {
    throw new Error("Le snapshot contient une expertise hors périmètre.");
  }
  const documents = placements.map((data) => ({
    path: `${EXPERTISE_PLACEMENTS_COLLECTION}/${data.expertisePlacementId}`,
    data,
  }));
  return {
    schemaVersion: 1,
    projectId: input.projectId,
    collection: EXPERTISE_PLACEMENTS_COLLECTION,
    capturedAt: input.capturedAt,
    documents,
    snapshotFingerprint: fingerprintSnapshot({
      projectId: input.projectId,
      capturedAt: input.capturedAt,
      documents,
    }),
  };
}

export function parseRetiredPlacementSnapshot(
  input: unknown,
): RetiredPlacementSnapshot {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Invalid retired placement snapshot");
  }
  const record = input as Record<string, unknown>;
  if (
    record.schemaVersion !== 1 ||
    record.collection !== EXPERTISE_PLACEMENTS_COLLECTION ||
    typeof record.projectId !== "string" ||
    typeof record.capturedAt !== "string" ||
    typeof record.snapshotFingerprint !== "string" ||
    !Array.isArray(record.documents)
  ) {
    throw new TypeError("Invalid retired placement snapshot metadata");
  }
  const placements = record.documents.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new TypeError(`snapshot.documents[${index}] is invalid`);
    }
    return (entry as Record<string, unknown>).data;
  });
  const snapshot = buildRetiredPlacementSnapshot({
    projectId: record.projectId,
    capturedAt: record.capturedAt,
    placements,
  });
  if (snapshot.snapshotFingerprint !== record.snapshotFingerprint) {
    throw new Error("Le fingerprint du snapshot de rollback est invalide.");
  }
  return snapshot;
}

export function buildRetiredPlacementMigrationPlan(
  snapshot: RetiredPlacementSnapshot,
) {
  const parsed = parseRetiredPlacementSnapshot(snapshot);
  return {
    snapshotFingerprint: parsed.snapshotFingerprint,
    deletes: parsed.documents.map(({ path }) => ({ path })),
    rollbackWrites: parsed.documents,
  } as const;
}

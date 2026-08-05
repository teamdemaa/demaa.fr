import "server-only";

import { createHash } from "node:crypto";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER,
  FIREBASE_SOLUTION_REGISTRY_REVISIONS_COLLECTION,
  validateFirebaseSolutionRegistryRevision,
  type FirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";

export type FirestoreSolutionRegistryWrite = Readonly<{
  path: string;
  data: Readonly<Record<string, unknown>>;
}>;

export type FirestoreSolutionRegistryImportPlan = Readonly<{
  schemaVersion: 1;
  revisionId: string;
  sourceFingerprint: string;
  revisionStatus: FirebaseSolutionRegistryRevision["revisionStatus"];
  writes: readonly FirestoreSolutionRegistryWrite[];
  writeBatches: readonly (readonly FirestoreSolutionRegistryWrite[])[];
  activation: FirestoreSolutionRegistryWrite | null;
  planFingerprint: string;
}>;

function operationPath(...parts: string[]) {
  if (parts.some((part) => !part || part.includes("/"))) {
    throw new TypeError("Firestore Solutions document IDs must not contain slashes");
  }
  return parts.join("/");
}

function chunkWrites(
  writes: readonly FirestoreSolutionRegistryWrite[],
  chunkSize = 400,
) {
  return Array.from(
    { length: Math.ceil(writes.length / chunkSize) },
    (_, index) => writes.slice(index * chunkSize, (index + 1) * chunkSize),
  );
}

export function buildFirestoreSolutionRegistryImportPlan(
  revision: FirebaseSolutionRegistryRevision,
): FirestoreSolutionRegistryImportPlan {
  const errors = validateFirebaseSolutionRegistryRevision(revision, {
    expectedSystemSlugs: enterpriseCatalog.map(({ slug }) => slug),
    now: new Date(revision.createdAt),
  });
  if (errors.length > 0) {
    throw new Error(`Cannot plan invalid Solutions revision:\n${errors.join("\n")}`);
  }
  const revisionPath = operationPath(
    FIREBASE_SOLUTION_REGISTRY_REVISIONS_COLLECTION,
    revision.revisionId,
  );
  const metadata = {
    schemaVersion: revision.schemaVersion,
    revisionId: revision.revisionId,
    revisionStatus: revision.revisionStatus,
    createdAt: revision.createdAt,
    createdBy: revision.createdBy,
    sourceFingerprint: revision.sourceFingerprint,
    knownSystemSlugs: revision.knownSystemSlugs,
  };
  const writes: FirestoreSolutionRegistryWrite[] = [
    { path: revisionPath, data: metadata },
    ...revision.resources.map((entry) => ({
      path: operationPath(
        FIREBASE_SOLUTION_REGISTRY_REVISIONS_COLLECTION,
        revision.revisionId,
        "resources",
        entry.resource.resourceSlug,
      ),
      data: entry,
    })),
    ...revision.placements.map((entry) => ({
      path: operationPath(
        FIREBASE_SOLUTION_REGISTRY_REVISIONS_COLLECTION,
        revision.revisionId,
        "placements",
        entry.placement.placementId,
      ),
      data: entry,
    })),
  ];
  const activation = revision.revisionStatus === "published"
    ? {
        path: FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER,
        data: {
          revisionId: revision.revisionId,
          sourceFingerprint: revision.sourceFingerprint,
        },
      }
    : null;
  const fingerprintPayload = JSON.stringify({ writes, activation });
  return {
    schemaVersion: 1,
    revisionId: revision.revisionId,
    sourceFingerprint: revision.sourceFingerprint,
    revisionStatus: revision.revisionStatus,
    writes,
    writeBatches: chunkWrites(writes),
    activation,
    planFingerprint: createHash("sha256")
      .update(fingerprintPayload)
      .digest("hex"),
  };
}

export function buildFirestoreSolutionRegistryRollbackPointer(
  target: Pick<FirebaseSolutionRegistryRevision, "revisionId" | "revisionStatus" | "sourceFingerprint">,
) {
  if (target.revisionStatus !== "published") {
    throw new Error("A rollback target must be a published revision");
  }
  return {
    path: FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER,
    data: {
      revisionId: target.revisionId,
      sourceFingerprint: target.sourceFingerprint,
    },
  } satisfies FirestoreSolutionRegistryWrite;
}

import "server-only";

import { unstable_cache } from "next/cache";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { hasFirebaseVercelWorkloadIdentityConfiguration } from "@/lib/firebase-vercel-oidc-credential.server";
import snapshot from "@/lib/firebase-solution-registry.snapshot.generated.json";
import {
  SOLUTION_SECTIONS,
} from "@/lib/solution-registry-contract";
import {
  FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER,
  FIREBASE_SOLUTION_REGISTRY_REVISIONS_COLLECTION,
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
  type FirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";

const EXPECTED_SYSTEM_SLUGS = enterpriseCatalog.map(({ slug }) => slug);
const PARSED_GENERATED_SNAPSHOT = parseFirebaseSolutionRegistryRevision(snapshot);
const SOLUTION_SECTION_ORDER = new Map(
  SOLUTION_SECTIONS.map((section, index) => [section, index]),
);

type RegistryLoadDependencies = Readonly<{
  forceLocal?: boolean;
  now?: Date;
  fetchRemote?: () => Promise<unknown>;
  warn?: (message: string) => void;
}>;

function hasFirebaseConfiguration() {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    hasFirebaseVercelWorkloadIdentityConfiguration() ||
    (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) ||
    process.env.FIREBASE_USE_APPLICATION_DEFAULT === "true"
  );
}

function validatedSnapshot(now: Date) {
  const errors = validateFirebaseSolutionRegistryRevision(PARSED_GENERATED_SNAPSHOT, {
    expectedSystemSlugs: EXPECTED_SYSTEM_SLUGS,
    now,
  });
  if (errors.length > 0) {
    throw new Error(`Invalid generated Solutions fallback:\n${errors.join("\n")}`);
  }
  return PARSED_GENERATED_SNAPSHOT;
}

function normalizeRevisionEntryOrder(input: unknown) {
  const revision = parseFirebaseSolutionRegistryRevision(input);
  const systemOrder = new Map(
    revision.knownSystemSlugs.map((systemSlug, index) => [systemSlug, index]),
  );
  return parseFirebaseSolutionRegistryRevision({
    ...revision,
    resources: [...revision.resources].sort((left, right) =>
      left.resource.resourceSlug.localeCompare(right.resource.resourceSlug)
    ),
    placements: [...revision.placements].sort((left, right) => {
      const systemDifference =
        (systemOrder.get(left.placement.systemSlug) ?? Number.MAX_SAFE_INTEGER) -
        (systemOrder.get(right.placement.systemSlug) ?? Number.MAX_SAFE_INTEGER);
      if (systemDifference !== 0) return systemDifference;
      const sectionDifference =
        (SOLUTION_SECTION_ORDER.get(left.placement.section) ?? Number.MAX_SAFE_INTEGER) -
        (SOLUTION_SECTION_ORDER.get(right.placement.section) ?? Number.MAX_SAFE_INTEGER);
      if (sectionDifference !== 0) return sectionDifference;
      const rankDifference = left.placement.rank - right.placement.rank;
      return rankDifference || left.placement.placementId.localeCompare(
        right.placement.placementId,
      );
    }),
  });
}

function parseActivePointer(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Firebase Solutions active pointer must be an object");
  }
  const pointer = input as Record<string, unknown>;
  if (
    typeof pointer.revisionId !== "string" ||
    !pointer.revisionId ||
    typeof pointer.sourceFingerprint !== "string" ||
    !/^[a-f0-9]{64}$/.test(pointer.sourceFingerprint)
  ) {
    throw new TypeError("Firebase Solutions active pointer is incomplete");
  }
  return {
    revisionId: pointer.revisionId,
    sourceFingerprint: pointer.sourceFingerprint,
  };
}

export async function fetchActiveFirebaseSolutionRegistryRevisionFromFirestore() {
  const database = getAdminFirestore();
  const [pointerCollection, pointerDocument] =
    FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER.split("/");
  const pointerSnapshot = await database
    .collection(pointerCollection)
    .doc(pointerDocument)
    .get();
  if (!pointerSnapshot.exists) {
    throw new Error("Firebase Solutions active pointer is missing");
  }
  const pointer = parseActivePointer(pointerSnapshot.data());
  const revisionReference = database
    .collection(FIREBASE_SOLUTION_REGISTRY_REVISIONS_COLLECTION)
    .doc(pointer.revisionId);
  const [revisionSnapshot, resourcesSnapshot, placementsSnapshot] =
    await Promise.all([
      revisionReference.get(),
      revisionReference.collection("resources").get(),
      revisionReference.collection("placements").get(),
    ]);
  if (!revisionSnapshot.exists) {
    throw new Error("Firebase Solutions active revision is missing");
  }
  const revision = {
    ...revisionSnapshot.data(),
    resources: resourcesSnapshot.docs.map((document) => document.data()),
    placements: placementsSnapshot.docs.map((document) => document.data()),
  };
  const parsed = parseFirebaseSolutionRegistryRevision(revision);
  if (parsed.sourceFingerprint !== pointer.sourceFingerprint) {
    throw new Error("Firebase Solutions pointer fingerprint mismatch");
  }
  return parsed;
}

export async function loadFirebaseSolutionRegistryRevision(
  dependencies: RegistryLoadDependencies = {},
): Promise<FirebaseSolutionRegistryRevision> {
  const now = dependencies.now ?? new Date();
  if (
    dependencies.forceLocal ??
    (process.env.DEMAA_FORCE_LOCAL_DATA === "true" || !hasFirebaseConfiguration())
  ) {
    return validatedSnapshot(now);
  }
  try {
    const remote = await (
      dependencies.fetchRemote ?? fetchActiveFirebaseSolutionRegistryRevisionFromFirestore
    )();
    const parsed = normalizeRevisionEntryOrder(remote);
    const errors = validateFirebaseSolutionRegistryRevision(parsed, {
      expectedSystemSlugs: EXPECTED_SYSTEM_SLUGS,
      now,
      requirePublishedRevision: true,
    });
    if (errors.length > 0) {
      throw new Error(errors.join("; "));
    }
    return parsed;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown error";
    (dependencies.warn ?? console.warn)(
      `[solutions-registry] Firebase unavailable or invalid; generated fallback used. ${detail}`,
    );
    return validatedSnapshot(now);
  }
}

export const getActiveFirebaseSolutionRegistryRevision = unstable_cache(
  async () => loadFirebaseSolutionRegistryRevision(),
  ["solutions-registry-active-revision"],
  {
    tags: ["solutions-registry"],
    revalidate: 300,
  },
);

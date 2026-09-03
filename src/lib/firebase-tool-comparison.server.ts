import "server-only";

import { unstable_cache } from "next/cache";
import type { Firestore } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  FIREBASE_TOOL_COMPARISON_REVISIONS_COLLECTION,
  parseFirebaseToolComparisonDocument,
  validateFirebaseToolComparisonDocument,
} from "@/lib/firebase-tool-comparison-contract";
import type { FirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";

export async function fetchFirebaseToolComparisonDocumentFromFirestore(
  registryFingerprint: string,
  systemSlug: string,
  database: Firestore = getAdminFirestore(),
) {
  if (!/^[a-f0-9]{64}$/.test(registryFingerprint)) {
    throw new TypeError("Tool comparison registry fingerprint is invalid");
  }
  if (!systemSlug || systemSlug.includes("/")) {
    throw new TypeError("Tool comparison system slug is invalid");
  }
  const snapshot = await database
    .collection(FIREBASE_TOOL_COMPARISON_REVISIONS_COLLECTION)
    .doc(registryFingerprint)
    .collection("systems")
    .doc(systemSlug)
    .get();
  return snapshot.exists ? parseFirebaseToolComparisonDocument(snapshot.data()) : null;
}

const getCachedFirebaseToolComparisonDocument = unstable_cache(
  fetchFirebaseToolComparisonDocumentFromFirestore,
  ["firebase-tool-comparison-v2"],
  { tags: ["solutions-registry", "tool-comparisons"], revalidate: 300 },
);

export async function getFirebaseToolComparisonViewForRevision(input: {
  revision: FirebaseSolutionRegistryRevision;
  systemSlug: string;
  sections: readonly RenderableSolutionSectionDto[];
  fetchDocument?: typeof fetchFirebaseToolComparisonDocumentFromFirestore;
  warn?: (message: string) => void;
}) {
  const software = input.sections.find(({ section }) => section === "software");
  if (!software || software.placements.length < 2) return null;

  try {
    const document = await (input.fetchDocument ?? getCachedFirebaseToolComparisonDocument)(
      input.revision.sourceFingerprint,
      input.systemSlug,
    );
    if (!document) return null;
    // A draft is a normal editorial state, not an operational error. Keep it
    // private without polluting public-page logs with validation warnings.
    if (document.publicationStatus !== "published") return null;
    const issues = validateFirebaseToolComparisonDocument(document, {
      registryRevisionId: input.revision.revisionId,
      registryFingerprint: input.revision.sourceFingerprint,
      systemSlug: input.systemSlug,
      visibleToolSlugs: software.placements.map(
        ({ resource }) => resource.resourceSlug,
      ),
    });
    if (issues.length > 0) {
      throw new Error(issues.join("; "));
    }
    return document.comparison;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown error";
    (input.warn ?? console.warn)(
      `[tool-comparisons] Firebase comparison hidden for ${input.systemSlug}. ${detail}`,
    );
    return null;
  }
}

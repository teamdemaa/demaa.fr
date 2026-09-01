import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  FIREBASE_TOOL_COMPARISON_REVISIONS_COLLECTION,
  parseFirebaseToolComparisonDocument,
  validateFirebaseToolComparisonDocument,
} from "@/lib/firebase-tool-comparison-contract";
import { selectRenderableSolutionSectionsFromRevision } from "@/lib/firebase-solution-registry-selection.server";
import { fetchActiveFirebaseSolutionRegistryRevisionFromFirestore } from "@/lib/firebase-solution-registry.server";

const database = getAdminFirestore();
const revision = await fetchActiveFirebaseSolutionRegistryRevisionFromFirestore(database);
const root = database
  .collection(FIREBASE_TOOL_COMPARISON_REVISIONS_COLLECTION)
  .doc(revision.sourceFingerprint);
const [metadataSnapshot, systemsSnapshot] = await Promise.all([
  root.get(),
  root.collection("systems").get(),
]);
if (!metadataSnapshot.exists) {
  throw new Error("Active Firebase comparison metadata is missing.");
}
const metadata = metadataSnapshot.data() as Record<string, unknown>;
const documents = systemsSnapshot.docs.map((snapshot) =>
  parseFirebaseToolComparisonDocument(snapshot.data())
);
const errors: string[] = [];
if (
  metadata.registryRevisionId !== revision.revisionId ||
  metadata.registryFingerprint !== revision.sourceFingerprint
) {
  errors.push("Active comparison metadata is bound to another registry revision.");
}
const knownSystemSlugs = enterpriseCatalog.map(({ slug }) => slug);
const publishedSystemSlugs = documents
  .filter(({ publicationStatus }) => publicationStatus === "published")
  .map(({ systemSlug }) => systemSlug);
const draftSystemSlugs = documents
  .filter(({ publicationStatus }) => publicationStatus === "draft")
  .map(({ systemSlug }) => systemSlug);
const blockedSystemSlugs = Array.isArray(metadata.blockedSystemSlugs)
  ? metadata.blockedSystemSlugs.filter((slug): slug is string => typeof slug === "string")
  : [];
const classified = new Set([
  ...publishedSystemSlugs,
  ...draftSystemSlugs,
  ...blockedSystemSlugs,
]);
if (
  classified.size !== knownSystemSlugs.length ||
  knownSystemSlugs.some((slug) => !classified.has(slug))
) {
  errors.push("Active comparisons do not classify all 115 systems.");
}

for (const document of documents) {
  if (document.publicationStatus !== "published") continue;
  const software = selectRenderableSolutionSectionsFromRevision(
    revision,
    document.systemSlug,
  ).find(({ section }) => section === "software");
  errors.push(...validateFirebaseToolComparisonDocument(document, {
    registryRevisionId: revision.revisionId,
    registryFingerprint: revision.sourceFingerprint,
    systemSlug: document.systemSlug,
    visibleToolSlugs: software?.placements.map(
      ({ resource }) => resource.resourceSlug,
    ) ?? [],
  }).map((issue) => `${document.systemSlug}: ${issue}`));
}

if (errors.length > 0) {
  throw new Error(errors.join("\n"));
}

console.log(JSON.stringify({
  status: "ok",
  projectId: process.env.FIREBASE_PROJECT_ID,
  registryRevisionId: revision.revisionId,
  registryFingerprint: revision.sourceFingerprint,
  systems: knownSystemSlugs.length,
  comparisonDocuments: documents.length,
  publishedSystemSlugs,
  draftSystems: draftSystemSlugs.length,
  blockedSystemSlugs,
}, null, 2));

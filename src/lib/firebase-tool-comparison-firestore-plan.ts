import "server-only";

import { createHash } from "node:crypto";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  FIREBASE_TOOL_COMPARISON_SCHEMA_VERSION,
  FIREBASE_TOOL_COMPARISON_REVISIONS_COLLECTION,
  parseFirebaseToolComparisonDocument,
  validateFirebaseToolComparisonDocument,
  type FirebaseToolComparisonDocument,
} from "@/lib/firebase-tool-comparison-contract";
import type { FirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";

export type FirebaseToolComparisonWrite = Readonly<{
  path: string;
  data: Readonly<Record<string, unknown>>;
}>;

export type FirebaseToolComparisonImportPlan = Readonly<{
  schemaVersion: 1;
  registryRevisionId: string;
  registryFingerprint: string;
  publishedSystemSlugs: readonly string[];
  draftSystemSlugs: readonly string[];
  blockedSystemSlugs: readonly string[];
  writes: readonly FirebaseToolComparisonWrite[];
  writeBatches: readonly (readonly FirebaseToolComparisonWrite[])[];
  planFingerprint: string;
}>;

function chunk<T>(items: readonly T[], size = 400) {
  return Array.from(
    { length: Math.ceil(items.length / size) },
    (_, index) => items.slice(index * size, (index + 1) * size),
  );
}

export function buildFirestoreToolComparisonImportPlan(input: {
  revision: FirebaseSolutionRegistryRevision;
  documents: readonly FirebaseToolComparisonDocument[];
  blockedSystemSlugs: readonly string[];
  now?: Date;
}): FirebaseToolComparisonImportPlan {
  const knownSystemSlugs = enterpriseCatalog.map(({ slug }) => slug);
  const knownSystems = new Set(knownSystemSlugs);
  const resources = new Set(input.revision.resources.map(({ resource }) => resource.resourceSlug));
  const visibleSoftwareBySystem = new Map<string, string[]>();
  for (const { placement } of input.revision.placements) {
    if (
      placement.section !== "software" ||
      placement.editorialStatus !== "selected" ||
      !resources.has(placement.resourceSlug)
    ) continue;
    const tools = visibleSoftwareBySystem.get(placement.systemSlug) ?? [];
    tools.push(placement.resourceSlug);
    visibleSoftwareBySystem.set(placement.systemSlug, tools);
  }
  const documents = input.documents.map(parseFirebaseToolComparisonDocument);
  const documentSystems = documents.map(({ systemSlug }) => systemSlug);
  if (new Set(documentSystems).size !== documentSystems.length) {
    throw new Error("Tool comparison import contains duplicate system documents");
  }
  const blockedSystemSlugs = [...new Set(input.blockedSystemSlugs)];
  for (const systemSlug of [...documentSystems, ...blockedSystemSlugs]) {
    if (!knownSystems.has(systemSlug)) {
      throw new Error(`${systemSlug}: unknown comparison system`);
    }
  }
  const coveredSystems = new Set([...documentSystems, ...blockedSystemSlugs]);
  if (
    coveredSystems.size !== knownSystemSlugs.length ||
    knownSystemSlugs.some((systemSlug) => !coveredSystems.has(systemSlug))
  ) {
    throw new Error("Tool comparison plan must classify all 115 systems");
  }

  for (const document of documents) {
    if (
      document.registryRevisionId !== input.revision.revisionId ||
      document.registryFingerprint !== input.revision.sourceFingerprint
    ) {
      throw new Error(`${document.systemSlug}: comparison is bound to another registry revision`);
    }
    if (document.publicationStatus !== "published") continue;
    const issues = validateFirebaseToolComparisonDocument(document, {
      registryRevisionId: input.revision.revisionId,
      registryFingerprint: input.revision.sourceFingerprint,
      systemSlug: document.systemSlug,
      visibleToolSlugs: visibleSoftwareBySystem.get(document.systemSlug) ?? [],
      now: input.now,
    });
    if (issues.length > 0) {
      throw new Error(`${document.systemSlug}: ${issues.join("; ")}`);
    }
  }

  const publishedSystemSlugs = knownSystemSlugs.filter((systemSlug) =>
    documents.some((document) =>
      document.systemSlug === systemSlug && document.publicationStatus === "published"
    ),
  );
  const draftSystemSlugs = knownSystemSlugs.filter((systemSlug) =>
    documents.some((document) =>
      document.systemSlug === systemSlug && document.publicationStatus === "draft"
    ),
  );
  const rootPath = `${FIREBASE_TOOL_COMPARISON_REVISIONS_COLLECTION}/${input.revision.sourceFingerprint}`;
  const writes: FirebaseToolComparisonWrite[] = [
    {
      path: rootPath,
      data: {
        schemaVersion: FIREBASE_TOOL_COMPARISON_SCHEMA_VERSION,
        registryRevisionId: input.revision.revisionId,
        registryFingerprint: input.revision.sourceFingerprint,
        knownSystemSlugs,
        publishedSystemSlugs,
        draftSystemSlugs,
        blockedSystemSlugs,
      },
    },
    ...documents.map((document) => ({
      path: `${rootPath}/systems/${document.systemSlug}`,
      data: document,
    })),
  ];
  const planFingerprint = createHash("sha256")
    .update(JSON.stringify(writes))
    .digest("hex");

  return {
    schemaVersion: 1,
    registryRevisionId: input.revision.revisionId,
    registryFingerprint: input.revision.sourceFingerprint,
    publishedSystemSlugs,
    draftSystemSlugs,
    blockedSystemSlugs,
    writes,
    writeBatches: chunk(writes),
    planFingerprint,
  };
}

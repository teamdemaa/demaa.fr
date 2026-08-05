import { isDeepStrictEqual } from "node:util";

import snapshot from "@/lib/firebase-solution-registry.snapshot.generated.json";
import {
  FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER,
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
  type FirebaseSolutionPlacementEntry,
  type FirebaseSolutionResourceEntry,
} from "@/lib/firebase-solution-registry-contract";
import {
  buildFirestoreSolutionRegistryImportPlan,
  type FirestoreSolutionRegistryWrite,
} from "@/lib/firebase-solution-registry-firestore-plan";
import { resolveFirebaseSolutionRegistryImportTarget } from "@/lib/firebase-solution-registry-import-gate";

const SOLUTION_SECTIONS = ["software", "providers", "models", "networks"] as const;

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

type BatchGetResponse = {
  found?: FirestoreDocument;
  missing?: string;
};

function commandArgument(prefix: string) {
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

function chunk<T>(items: readonly T[], size: number) {
  return Array.from(
    { length: Math.ceil(items.length / size) },
    (_, index) => items.slice(index * size, (index + 1) * size),
  );
}

function encodeValue(value: unknown): FirestoreValue {
  if (value === null) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Firestore data contains a non-finite number.");
    return Number.isSafeInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: value.length > 0
        ? { values: value.map((entry) => encodeValue(entry)) }
        : {},
    };
  }
  if (typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const entries = Object.entries(value as Record<string, unknown>);
    return {
      mapValue: entries.length > 0
        ? { fields: Object.fromEntries(entries.map(([key, entry]) => [key, encodeValue(entry)])) }
        : {},
    };
  }
  throw new Error("Firestore data contains an unsupported value.");
}

function encodeFields(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, encodeValue(value)]),
  );
}

function decodeValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("stringValue" in value) return value.stringValue;
  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map((entry) => decodeValue(entry));
  }
  return Object.fromEntries(
    Object.entries(value.mapValue.fields ?? {}).map(([key, entry]) => [key, decodeValue(entry)]),
  );
}

function decodeFields(fields: Record<string, FirestoreValue> | undefined) {
  return Object.fromEntries(
    Object.entries(fields ?? {}).map(([key, value]) => [key, decodeValue(value)]),
  );
}

if (process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("The remote importer refuses Firestore Emulator mode.");
}

const {
  accessToken: confirmedAccessToken,
  projectId: confirmedTargetProjectId,
  target,
  targetLabel,
} = resolveFirebaseSolutionRegistryImportTarget({
  arguments_: process.argv.slice(2),
  environment: process.env,
});

const revision = parseFirebaseSolutionRegistryRevision(snapshot);
const plan = buildFirestoreSolutionRegistryImportPlan(revision);
const confirmedPlanFingerprint = commandArgument("--confirm-plan=");
if (confirmedPlanFingerprint !== plan.planFingerprint) {
  throw new Error("The confirmed import plan fingerprint does not match the sealed plan.");
}
const confirmedActivationFingerprint = commandArgument("--confirm-activation=");
if (
  plan.revisionStatus !== "published" ||
  !plan.activation ||
  confirmedActivationFingerprint !== plan.sourceFingerprint
) {
  throw new Error(`Remote ${targetLabel} activation requires the exact published revision fingerprint.`);
}

const databaseName = `projects/${confirmedTargetProjectId}/databases/(default)`;
const apiRoot = "https://firestore.googleapis.com/v1";
const documentsEndpoint = `${apiRoot}/${databaseName}/documents`;
const documentName = (path: string) => `${databaseName}/documents/${path}`;
const documentUrl = (path: string) => `${documentsEndpoint}/${path}`;

async function firestoreRequest(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${confirmedAccessToken}`,
      "Content-Type": "application/json",
      "x-goog-user-project": confirmedTargetProjectId,
      ...init?.headers,
    },
  });
  return response;
}

async function readActivePointer() {
  const response = await firestoreRequest(documentUrl(FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER));
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Unable to read the active pointer (${response.status}).`);
  const document = await response.json() as FirestoreDocument;
  return decodeFields(document.fields);
}

async function batchGet(paths: readonly string[]) {
  const response = await firestoreRequest(`${documentsEndpoint}:batchGet`, {
    method: "POST",
    body: JSON.stringify({ documents: paths.map((path) => documentName(path)) }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 1_000);
    throw new Error(`Unable to read ${targetLabel} documents (${response.status}): ${detail}`);
  }
  const payload = await response.json() as BatchGetResponse[];
  return payload;
}

const pointerBeforeImport = await readActivePointer();
if (
  pointerBeforeImport &&
  !isDeepStrictEqual(pointerBeforeImport, plan.activation.data)
) {
  throw new Error(`${targetLabel} points to another Solutions revision; activation refused.`);
}

const missingWrites: FirestoreSolutionRegistryWrite[] = [];
const mismatchedPaths: string[] = [];
for (const writeGroup of chunk(plan.writes, 100)) {
  const responses = await batchGet(writeGroup.map(({ path }) => path));
  const foundByName = new Map(
    responses.flatMap((entry) => entry.found ? [[entry.found.name, entry.found] as const] : []),
  );
  for (const expectedWrite of writeGroup) {
    const document = foundByName.get(documentName(expectedWrite.path));
    if (!document) missingWrites.push(expectedWrite);
    else if (!isDeepStrictEqual(decodeFields(document.fields), expectedWrite.data)) {
      mismatchedPaths.push(expectedWrite.path);
    }
  }
}
if (mismatchedPaths.length > 0) {
  throw new Error(`${targetLabel} contains conflicting documents:\n${mismatchedPaths.join("\n")}`);
}

for (const writeGroup of chunk(missingWrites, 400)) {
  const response = await firestoreRequest(`${documentsEndpoint}:commit`, {
    method: "POST",
    body: JSON.stringify({
      writes: writeGroup.map((write) => ({
        update: {
          name: documentName(write.path),
          fields: encodeFields(write.data),
        },
        currentDocument: { exists: false },
      })),
    }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 1_000);
    throw new Error(`Unable to write ${targetLabel} documents (${response.status}): ${detail}`);
  }
}

const readBackResponses = (
  await Promise.all(chunk(plan.writes.map(({ path }) => path), 100).map((paths) => batchGet(paths)))
).flat();
const readBackDocuments = new Map(
  readBackResponses.flatMap((entry) => entry.found ? [[entry.found.name, entry.found] as const] : []),
);
if (readBackDocuments.size !== plan.writes.length) {
  throw new Error("Imported revision is incomplete after read-back.");
}
const revisionPrefix = `solution_registry_revisions/${revision.revisionId}`;
const metadataDocument = readBackDocuments.get(documentName(revisionPrefix));
if (!metadataDocument) throw new Error("Imported revision metadata is missing.");

const systemOrder = new Map(
  revision.knownSystemSlugs.map((systemSlug, index) => [systemSlug, index]),
);
const sectionOrder = new Map(
  SOLUTION_SECTIONS.map((section, index) => [section, index]),
);
const resources = [...readBackDocuments.entries()]
  .filter(([name]) => name.startsWith(`${documentName(revisionPrefix)}/resources/`))
  .map(([, document]) => decodeFields(document.fields) as FirebaseSolutionResourceEntry)
  .sort((left, right) => left.resource.resourceSlug.localeCompare(right.resource.resourceSlug));
const placements = [...readBackDocuments.entries()]
  .filter(([name]) => name.startsWith(`${documentName(revisionPrefix)}/placements/`))
  .map(([, document]) => decodeFields(document.fields) as FirebaseSolutionPlacementEntry)
  .sort((left, right) => {
    const systemDifference =
      (systemOrder.get(left.placement.systemSlug) ?? Number.MAX_SAFE_INTEGER) -
      (systemOrder.get(right.placement.systemSlug) ?? Number.MAX_SAFE_INTEGER);
    if (systemDifference !== 0) return systemDifference;
    const sectionDifference =
      (sectionOrder.get(left.placement.section) ?? Number.MAX_SAFE_INTEGER) -
      (sectionOrder.get(right.placement.section) ?? Number.MAX_SAFE_INTEGER);
    return sectionDifference || left.placement.rank - right.placement.rank;
  });
const importedRevision = parseFirebaseSolutionRegistryRevision({
  ...decodeFields(metadataDocument.fields),
  resources,
  placements,
});
const validationErrors = validateFirebaseSolutionRegistryRevision(importedRevision, {
  expectedSystemSlugs: revision.knownSystemSlugs,
  now: new Date(revision.createdAt),
});
if (validationErrors.length > 0) {
  throw new Error(`Imported revision is invalid:\n${validationErrors.join("\n")}`);
}
if (importedRevision.sourceFingerprint !== revision.sourceFingerprint) {
  throw new Error("Imported revision fingerprint differs from the sealed snapshot.");
}

let pointerCreated = false;
if (!pointerBeforeImport) {
  const response = await firestoreRequest(`${documentsEndpoint}:commit`, {
    method: "POST",
    body: JSON.stringify({
      writes: [{
        update: {
          name: documentName(plan.activation.path),
          fields: encodeFields(plan.activation.data),
        },
        currentDocument: { exists: false },
      }],
    }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 1_000);
    throw new Error(`Unable to activate the ${targetLabel} revision (${response.status}): ${detail}`);
  }
  pointerCreated = true;
}
const activePointer = await readActivePointer();
if (!isDeepStrictEqual(activePointer, plan.activation.data)) {
  throw new Error(`${targetLabel} active pointer does not match the sealed revision after activation.`);
}

console.log(JSON.stringify({
  mode: `firebase-${target}-active-revision`,
  projectId: confirmedTargetProjectId,
  revisionId: revision.revisionId,
  revisionStatus: revision.revisionStatus,
  plannedWrites: plan.writes.length,
  writesCreated: missingWrites.length,
  resourcesReadBack: resources.length,
  placementsReadBack: placements.length,
  pointerCreated,
  activePointer,
  sourceFingerprint: importedRevision.sourceFingerprint,
  planFingerprint: plan.planFingerprint,
}, null, 2));

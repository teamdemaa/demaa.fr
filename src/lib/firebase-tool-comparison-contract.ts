import type {
  ToolProcessComparisonEvidence,
  ToolProcessComparisonCell,
  ToolProcessComparisonView,
} from "@/lib/tool-process-comparison-contract";

export const FIREBASE_TOOL_COMPARISON_SCHEMA_VERSION = 2 as const;
export const FIREBASE_TOOL_COMPARISON_REVISIONS_COLLECTION =
  "solution_tool_comparison_revisions" as const;

export type FirebaseToolComparisonEvidence =
  ToolProcessComparisonEvidence & Readonly<{
    resourceSlug: string;
  }>;

export type FirebaseToolComparisonDocument = Readonly<{
  schemaVersion: typeof FIREBASE_TOOL_COMPARISON_SCHEMA_VERSION;
  publicationStatus: "draft" | "published";
  registryRevisionId: string;
  registryFingerprint: string;
  systemSlug: string;
  expiresAt: string;
  sourceUrls: readonly string[];
  evidence: readonly FirebaseToolComparisonEvidence[];
  comparison: ToolProcessComparisonView;
}>;

function record(input: unknown, path: string): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError(`${path} must be an object`);
  }
  return input as Record<string, unknown>;
}

function string(input: unknown, path: string): string {
  if (typeof input !== "string" || !input.trim()) {
    throw new TypeError(`${path} must be a non-empty string`);
  }
  return input;
}

function optionalString(input: unknown, path: string): string | undefined {
  return input === undefined ? undefined : string(input, path);
}

function array(input: unknown, path: string): unknown[] {
  if (!Array.isArray(input)) throw new TypeError(`${path} must be an array`);
  return input;
}

function parseCell(input: unknown, path: string): ToolProcessComparisonCell {
  const value = record(input, path);
  const status = string(value.status, `${path}.status`);
  if (!["covered", "configurable", "not_documented"].includes(status)) {
    throw new TypeError(`${path}.status is invalid`);
  }
  const note = optionalString(value.note, `${path}.note`);
  if (note && status !== "configurable") {
    throw new TypeError(`${path}.note is only allowed for configurable cells`);
  }
  const evidenceIds = array(value.evidenceIds, `${path}.evidenceIds`)
    .map((evidenceId, index) =>
      string(evidenceId, `${path}.evidenceIds[${index}]`),
    );
  if (new Set(evidenceIds).size !== evidenceIds.length) {
    throw new TypeError(`${path}.evidenceIds contains duplicates`);
  }
  return {
    status: status as ToolProcessComparisonCell["status"],
    evidenceIds,
    ...(note ? { note } : {}),
  };
}

function parseEvidence(
  input: unknown,
  path: string,
): FirebaseToolComparisonEvidence {
  const value = record(input, path);
  const sourceRef = string(value.sourceRef, `${path}.sourceRef`);
  if (!sourceRef.startsWith("https://")) {
    throw new TypeError(`${path}.sourceRef must use HTTPS`);
  }
  const capturedAt = string(value.capturedAt, `${path}.capturedAt`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(capturedAt)) {
    throw new TypeError(`${path}.capturedAt must be YYYY-MM-DD`);
  }
  return {
    evidenceId: string(value.evidenceId, `${path}.evidenceId`),
    resourceSlug: string(value.resourceSlug, `${path}.resourceSlug`),
    sourceRef,
    claim: string(value.claim, `${path}.claim`),
    capturedAt,
  };
}

function parseComparison(input: unknown): ToolProcessComparisonView {
  const value = record(input, "firebaseToolComparison.comparison");
  const tools = array(value.tools, "firebaseToolComparison.comparison.tools")
    .map((entry, index) => {
      const tool = record(entry, `firebaseToolComparison.comparison.tools[${index}]`);
      return {
        resourceSlug: string(tool.resourceSlug, `firebaseToolComparison.comparison.tools[${index}].resourceSlug`),
        name: string(tool.name, `firebaseToolComparison.comparison.tools[${index}].name`),
        positioning: string(tool.positioning, `firebaseToolComparison.comparison.tools[${index}].positioning`),
      };
    });
  if (tools.length < 2 || tools.length > 12) {
    throw new TypeError("firebaseToolComparison.comparison.tools must contain 2 to 12 tools");
  }
  if (new Set(tools.map(({ resourceSlug }) => resourceSlug)).size !== tools.length) {
    throw new TypeError("firebaseToolComparison.comparison.tools contains duplicate slugs");
  }

  const features = array(
    value.features,
    "firebaseToolComparison.comparison.features",
  ).map((entry, featureIndex) => {
    const feature = record(
      entry,
      `firebaseToolComparison.comparison.features[${featureIndex}]`,
    );
    const cells = array(
      feature.cells,
      `firebaseToolComparison.comparison.features[${featureIndex}].cells`,
    ).map((cell, cellIndex) => parseCell(
      cell,
      `firebaseToolComparison.comparison.features[${featureIndex}].cells[${cellIndex}]`,
    ));
    if (cells.length !== tools.length) {
      throw new TypeError(
        `firebaseToolComparison.comparison.features[${featureIndex}].cells must match the tool count`,
      );
    }
    const description = optionalString(
      feature.description,
      `firebaseToolComparison.comparison.features[${featureIndex}].description`,
    );
    return {
      featureId: string(
        feature.featureId,
        `firebaseToolComparison.comparison.features[${featureIndex}].featureId`,
      ),
      label: string(
        feature.label,
        `firebaseToolComparison.comparison.features[${featureIndex}].label`,
      ),
      ...(description ? { description } : {}),
      cells,
    };
  });
  if (features.length < 1 || features.length > 40) {
    throw new TypeError("firebaseToolComparison.comparison.features must contain 1 to 40 rows");
  }
  if (new Set(features.map(({ featureId }) => featureId)).size !== features.length) {
    throw new TypeError("firebaseToolComparison.comparison.features contains duplicate IDs");
  }

  const reviewedAt = string(
    value.reviewedAt,
    "firebaseToolComparison.comparison.reviewedAt",
  );
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) {
    throw new TypeError("firebaseToolComparison.comparison.reviewedAt must be YYYY-MM-DD");
  }

  return {
    systemSlug: string(
      value.systemSlug,
      "firebaseToolComparison.comparison.systemSlug",
    ),
    systemName: string(
      value.systemName,
      "firebaseToolComparison.comparison.systemName",
    ),
    reviewedAt,
    tools,
    features,
  };
}

export function parseFirebaseToolComparisonDocument(
  input: unknown,
): FirebaseToolComparisonDocument {
  const value = record(input, "firebaseToolComparison");
  if (value.schemaVersion !== FIREBASE_TOOL_COMPARISON_SCHEMA_VERSION) {
    throw new TypeError("firebaseToolComparison.schemaVersion is invalid");
  }
  const registryFingerprint = string(
    value.registryFingerprint,
    "firebaseToolComparison.registryFingerprint",
  );
  if (!/^[a-f0-9]{64}$/.test(registryFingerprint)) {
    throw new TypeError("firebaseToolComparison.registryFingerprint must be a SHA-256 digest");
  }
  const systemSlug = string(value.systemSlug, "firebaseToolComparison.systemSlug");
  const publicationStatus = string(
    value.publicationStatus,
    "firebaseToolComparison.publicationStatus",
  );
  if (!["draft", "published"].includes(publicationStatus)) {
    throw new TypeError("firebaseToolComparison.publicationStatus is invalid");
  }
  const expiresAt = string(value.expiresAt, "firebaseToolComparison.expiresAt");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
    throw new TypeError("firebaseToolComparison.expiresAt must be YYYY-MM-DD");
  }
  const sourceUrls = array(value.sourceUrls, "firebaseToolComparison.sourceUrls")
    .map((source, index) => string(
      source,
      `firebaseToolComparison.sourceUrls[${index}]`,
    ));
  if (sourceUrls.some((source) => !source.startsWith("https://"))) {
    throw new TypeError("firebaseToolComparison.sourceUrls must use HTTPS");
  }
  if (new Set(sourceUrls).size !== sourceUrls.length) {
    throw new TypeError("firebaseToolComparison.sourceUrls contains duplicates");
  }
  const evidence = array(value.evidence, "firebaseToolComparison.evidence")
    .map((item, index) =>
      parseEvidence(item, `firebaseToolComparison.evidence[${index}]`),
    );
  if (
    new Set(evidence.map(({ evidenceId }) => evidenceId)).size !==
    evidence.length
  ) {
    throw new TypeError("firebaseToolComparison.evidence contains duplicate IDs");
  }
  const comparison = parseComparison(value.comparison);
  if (comparison.systemSlug !== systemSlug) {
    throw new TypeError("firebaseToolComparison system slugs do not match");
  }
  return {
    schemaVersion: FIREBASE_TOOL_COMPARISON_SCHEMA_VERSION,
    publicationStatus: publicationStatus as "draft" | "published",
    registryRevisionId: string(
      value.registryRevisionId,
      "firebaseToolComparison.registryRevisionId",
    ),
    registryFingerprint,
    systemSlug,
    expiresAt,
    sourceUrls,
    evidence,
    comparison,
  };
}

export function validateFirebaseToolComparisonDocument(
  input: unknown,
  expected: {
    registryRevisionId: string;
    registryFingerprint: string;
    systemSlug: string;
    visibleToolSlugs: readonly string[];
    now?: Date;
  },
): string[] {
  let document: FirebaseToolComparisonDocument;
  try {
    document = parseFirebaseToolComparisonDocument(input);
  } catch (error) {
    return [error instanceof Error ? error.message : "Invalid Firebase tool comparison"];
  }
  const errors: string[] = [];
  if (document.registryRevisionId !== expected.registryRevisionId) {
    errors.push("comparison registry revision does not match the active revision");
  }
  if (document.registryFingerprint !== expected.registryFingerprint) {
    errors.push("comparison registry fingerprint does not match the active revision");
  }
  if (document.systemSlug !== expected.systemSlug) {
    errors.push("comparison system does not match the requested system");
  }
  if (document.publicationStatus !== "published") {
    errors.push("comparison is not published");
  }
  const expiresAt = Date.parse(`${document.expiresAt}T23:59:59.999Z`);
  if (!Number.isFinite(expiresAt) || expiresAt < (expected.now ?? new Date()).getTime()) {
    errors.push("comparison review is expired");
  }
  if (document.sourceUrls.length === 0) {
    errors.push("comparison has no evidence source URL");
  }
  const evidenceById = new Map(
    document.evidence.map((evidence) => [evidence.evidenceId, evidence]),
  );
  const evidenceSourceUrls = new Set(
    document.evidence.map(({ sourceRef }) => sourceRef),
  );
  for (const sourceUrl of document.sourceUrls) {
    if (!evidenceSourceUrls.has(sourceUrl)) {
      errors.push(`comparison source URL has no atomic evidence: ${sourceUrl}`);
    }
  }
  for (const sourceUrl of evidenceSourceUrls) {
    if (!document.sourceUrls.includes(sourceUrl)) {
      errors.push(`atomic evidence source is missing from sourceUrls: ${sourceUrl}`);
    }
  }
  const visibleToolSlugs = new Set(expected.visibleToolSlugs);
  for (const { resourceSlug } of document.comparison.tools) {
    if (!visibleToolSlugs.has(resourceSlug)) {
      errors.push(`${resourceSlug}: comparison tool is not visible in the active Firebase revision`);
    }
  }
  document.comparison.features.forEach((feature) => {
    feature.cells.forEach((cell, toolIndex) => {
      const tool = document.comparison.tools[toolIndex];
      const cellPath = `${tool.resourceSlug}/${feature.featureId}`;
      if (cell.status === "not_documented") {
        if (cell.evidenceIds.length > 0) {
          errors.push(`${cellPath}: non-documented cell must not reference evidence`);
        }
        return;
      }
      if (cell.evidenceIds.length === 0) {
        errors.push(`${cellPath}: documented cell has no atomic evidence`);
      }
      if (cell.status === "configurable" && !cell.note?.trim()) {
        errors.push(`${cellPath}: configurable cell has no qualification note`);
      }
      for (const evidenceId of cell.evidenceIds) {
        const evidence = evidenceById.get(evidenceId);
        if (!evidence) {
          errors.push(`${cellPath}: unknown evidence ${evidenceId}`);
        } else if (evidence.resourceSlug !== tool.resourceSlug) {
          errors.push(
            `${cellPath}: evidence ${evidenceId} belongs to ${evidence.resourceSlug}`,
          );
        }
      }
    });
  });
  const documentedRows = document.comparison.features.filter((feature) =>
    feature.cells.some((cell) => cell.status !== "not_documented"),
  ).length;
  const discriminatingRows = document.comparison.features.filter(
    (feature) => new Set(feature.cells.map((cell) => cell.status)).size > 1,
  ).length;
  if (documentedRows < 8) errors.push("comparison has fewer than 8 documented rows");
  if (discriminatingRows < 4) errors.push("comparison has fewer than 4 discriminating rows");
  document.comparison.tools.forEach(({ resourceSlug }, toolIndex) => {
    const documentedCells = document.comparison.features.filter(
      (feature) => feature.cells[toolIndex]?.status !== "not_documented",
    ).length;
    if (documentedCells < 3) {
      errors.push(`${resourceSlug}: comparison has fewer than 3 documented cells`);
    }
  });
  return errors;
}

import {
  deepFreeze,
  parseArray,
  parseEnum,
  parseNullableString,
  parseRecord,
  parseString,
  type UnknownRecord,
  validationError,
} from "@/lib/registry-contract-utils";

export const REGISTRY_PUBLICATION_STATUSES = ["draft", "published", "archived"] as const;
export type RegistryPublicationStatus = (typeof REGISTRY_PUBLICATION_STATUSES)[number];

export const COMMERCIAL_RELATIONSHIPS = [
  "none",
  "owned",
  "affiliate",
  "commercial_partner",
  "paid_referral",
  "unknown",
] as const;
export type CommercialRelationship = (typeof COMMERCIAL_RELATIONSHIPS)[number];

export const EVIDENCE_TYPES = [
  "official_product_page",
  "official_directory",
  "technical_documentation",
  "independent_source",
  "internal_test",
  "legacy_catalog_reference",
] as const;

export type EvidenceReference = Readonly<{
  evidenceId: string;
  sourceRef: string;
  claim: string;
  evidenceType: (typeof EVIDENCE_TYPES)[number];
  capturedAt: string;
}>;

export type ReviewMetadata = Readonly<{
  evidence: readonly EvidenceReference[];
  reviewer: string | null;
  reviewedAt: string | null;
  expiresAt: string | null;
}>;

export const REVIEW_FIELD_NAMES = ["evidence", "reviewer", "reviewedAt", "expiresAt"] as const;
const EVIDENCE_KEYS = [
  "evidenceId",
  "sourceRef",
  "claim",
  "evidenceType",
  "capturedAt",
] as const;

export function isIsoDateTime(value: string | null): value is string {
  if (!value) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function parseIsoDateTime(value: unknown, path: string): string {
  const timestamp = parseString(value, path);
  if (!isIsoDateTime(timestamp)) throw new TypeError(`${path} must be an ISO timestamp`);
  return timestamp;
}

export function parseReviewMetadataFields(record: UnknownRecord, path: string): ReviewMetadata {
  const evidence = parseArray(record.evidence, `${path}.evidence`).map((entry, index) => {
    const evidencePath = `${path}.evidence[${index}]`;
    const parsed = parseRecord(entry, evidencePath, EVIDENCE_KEYS);
    return deepFreeze({
      evidenceId: parseString(parsed.evidenceId, `${evidencePath}.evidenceId`),
      sourceRef: parseString(parsed.sourceRef, `${evidencePath}.sourceRef`),
      claim: parseString(parsed.claim, `${evidencePath}.claim`),
      evidenceType: parseEnum(parsed.evidenceType, EVIDENCE_TYPES, `${evidencePath}.evidenceType`),
      capturedAt: parseIsoDateTime(parsed.capturedAt, `${evidencePath}.capturedAt`),
    });
  });
  const reviewedAt = parseNullableString(record.reviewedAt, `${path}.reviewedAt`);
  const expiresAt = parseNullableString(record.expiresAt, `${path}.expiresAt`);
  if (reviewedAt !== null && !isIsoDateTime(reviewedAt)) {
    throw new TypeError(`${path}.reviewedAt must be null or an ISO timestamp`);
  }
  if (expiresAt !== null && !isIsoDateTime(expiresAt)) {
    throw new TypeError(`${path}.expiresAt must be null or an ISO timestamp`);
  }
  return deepFreeze({
    evidence,
    reviewer: parseNullableString(record.reviewer, `${path}.reviewer`),
    reviewedAt,
    expiresAt,
  });
}

export function parseReviewMetadata(input: unknown, path = "review"): ReviewMetadata {
  return parseReviewMetadataFields(parseRecord(input, path, REVIEW_FIELD_NAMES), path);
}

export function validateReviewMetadata(
  input: unknown,
  options: { requireComplete: boolean; now?: Date },
): string[] {
  let review: ReviewMetadata;
  try {
    review = parseReviewMetadata(input);
  } catch (error) {
    return [validationError(error)];
  }

  const now = options.now ?? new Date();
  if (!Number.isFinite(now.getTime())) return ["now must be a valid date"];
  const errors: string[] = [];
  const evidenceIds = review.evidence.map((entry) => entry.evidenceId);
  if (new Set(evidenceIds).size !== evidenceIds.length) errors.push("evidence IDs must be unique");

  for (const entry of review.evidence) {
    if (Date.parse(entry.capturedAt) > now.getTime()) {
      errors.push(`${entry.evidenceId}: capturedAt must not be in the future`);
    }
    if (review.reviewedAt && Date.parse(entry.capturedAt) > Date.parse(review.reviewedAt)) {
      errors.push(`${entry.evidenceId}: capturedAt must not be after reviewedAt`);
    }
  }
  if (review.reviewedAt && Date.parse(review.reviewedAt) > now.getTime()) {
    errors.push("reviewedAt must not be in the future");
  }
  if (review.reviewedAt && review.expiresAt && Date.parse(review.reviewedAt) >= Date.parse(review.expiresAt)) {
    errors.push("reviewedAt must be before expiresAt");
  }
  if (review.expiresAt && Date.parse(review.expiresAt) <= now.getTime()) {
    errors.push("entry evidence is expired");
  }
  if ((review.reviewer === null) !== (review.reviewedAt === null)) {
    errors.push("reviewer and reviewedAt must be set together");
  }

  if (options.requireComplete) {
    if (review.evidence.length === 0) errors.push("published entry requires evidence");
    if (!review.reviewer) errors.push("published entry requires reviewer");
    if (!review.reviewedAt) errors.push("published entry requires reviewedAt");
    if (!review.expiresAt) errors.push("published entry requires expiresAt");
  }
  return errors;
}

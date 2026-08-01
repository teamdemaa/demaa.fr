import "server-only";

import { deepFreeze, parseSlug } from "@/lib/registry-contract-utils";

export type SolutionReferralDisclosure = Readonly<{
  billingParty: string;
  commercialRelationship:
    | "affiliate"
    | "commercial_partner"
    | "none"
    | "paid_referral";
  contractingParty: string;
  disclosureVersion: string;
  effectiveAt: string;
  expiresAt: string;
  placementId: string;
  resourceSlug: string;
  reviewedAt: string;
  reviewer: string;
  transparency: string;
}>;

const disclosures: readonly SolutionReferralDisclosure[] = deepFreeze([]);

function isIsoDate(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

export function validateSolutionReferralDisclosure(
  disclosure: SolutionReferralDisclosure,
  now = new Date(),
) {
  const errors: string[] = [];
  if (!disclosure.billingParty.trim()) errors.push("billingParty is required");
  if (!disclosure.contractingParty.trim()) errors.push("contractingParty is required");
  if (!disclosure.transparency.trim()) errors.push("transparency is required");
  if (!disclosure.reviewer.trim()) errors.push("reviewer is required");
  if (!/^\d+\.\d+\.\d+$/.test(disclosure.disclosureVersion)) {
    errors.push("disclosureVersion must be semantic");
  }
  for (const field of ["effectiveAt", "expiresAt", "reviewedAt"] as const) {
    if (!isIsoDate(disclosure[field])) errors.push(`${field} must be an ISO timestamp`);
  }
  if (errors.length > 0) return errors;
  const nowMs = now.getTime();
  if (!Number.isFinite(nowMs)) return ["now must be valid"];
  if (Date.parse(disclosure.reviewedAt) > Date.parse(disclosure.effectiveAt)) {
    errors.push("reviewedAt must not be after effectiveAt");
  }
  if (Date.parse(disclosure.effectiveAt) > nowMs) errors.push("disclosure is not effective");
  if (Date.parse(disclosure.expiresAt) <= nowMs) errors.push("disclosure is expired");
  return errors;
}

export function getSolutionReferralDisclosure(input: {
  commercialRelationship: string;
  now?: Date;
  placementId: string;
  resourceSlug: unknown;
}) {
  let resourceSlug: string;
  try {
    resourceSlug = parseSlug(input.resourceSlug, "resourceSlug");
  } catch {
    return null;
  }
  const disclosure = disclosures.find((candidate) => (
    candidate.resourceSlug === resourceSlug
    && candidate.placementId === input.placementId
    && candidate.commercialRelationship === input.commercialRelationship
  ));
  if (!disclosure || validateSolutionReferralDisclosure(disclosure, input.now).length > 0) {
    return null;
  }
  return disclosure;
}

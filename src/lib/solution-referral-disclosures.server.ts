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

const JURIDI_CONSULTING_DISCLOSURE = {
  billingParty: "JuridiConsulting",
  commercialRelationship: "none",
  contractingParty: "JuridiConsulting",
  disclosureVersion: "1.0.0",
  effectiveAt: "2026-08-05T00:00:00.000Z",
  expiresAt: "2027-02-05T00:00:00.000Z",
  resourceSlug: "juridi-consulting",
  reviewedAt: "2026-08-05T00:00:00.000Z",
  reviewer: "Master Demaa",
  transparency:
    "JuridiConsulting contracte et facture ses prestations. Demaa facilite uniquement la mise en relation et ne perçoit aucune rémunération à ce stade.",
} as const;

const disclosures: readonly SolutionReferralDisclosure[] = deepFreeze([
  {
    ...JURIDI_CONSULTING_DISCLOSURE,
    placementId: "cabinet-comptable:juridi-consulting:providers:1",
  },
  {
    ...JURIDI_CONSULTING_DISCLOSURE,
    placementId: "cabinet-davocat:juridi-consulting:providers:1",
  },
  {
    ...JURIDI_CONSULTING_DISCLOSURE,
    placementId: "notaire:juridi-consulting:providers:1",
  },
]);

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

export function getExpertiseReferralDisclosure(input: {
  placementId: string;
  resourceSlug: unknown;
  now?: Date;
}): SolutionReferralDisclosure | null {
  let resourceSlug: string;
  try {
    resourceSlug = parseSlug(input.resourceSlug, "resourceSlug");
  } catch {
    return null;
  }
  const disclosure: SolutionReferralDisclosure = {
    billingParty: "Le professionnel retenu après qualification",
    commercialRelationship: "none",
    contractingParty: "Le professionnel retenu après qualification",
    disclosureVersion: "1.0.0",
    effectiveAt: "2026-08-08T00:00:00.000Z",
    expiresAt: "2027-08-08T00:00:00.000Z",
    placementId: input.placementId,
    resourceSlug,
    reviewedAt: "2026-08-08T00:00:00.000Z",
    reviewer: "Master Demaa",
    transparency:
      "Demaa qualifie votre besoin et peut vous orienter vers un professionnel adapté. Aucun professionnel n’est imposé et la mission reste soumise à votre accord.",
  };
  return validateSolutionReferralDisclosure(disclosure, input.now).length === 0
    ? deepFreeze(disclosure)
    : null;
}

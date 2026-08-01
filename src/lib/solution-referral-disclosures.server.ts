import "server-only";

import { deepFreeze, parseSlug } from "@/lib/registry-contract-utils";

export type SolutionReferralDisclosure = Readonly<{
  billingParty: string;
  contractingParty: string;
  transparency: string;
  version: string;
}>;

// This legal/commercial gate is intentionally empty in V1. Publishing a
// recommendation does not, on its own, authorize a referral workflow.
const disclosures: Readonly<Record<string, SolutionReferralDisclosure>> = deepFreeze({});

export function getSolutionReferralDisclosure(resourceSlug: unknown) {
  let slug: string;
  try {
    slug = parseSlug(resourceSlug, "resourceSlug");
  } catch {
    return null;
  }
  return disclosures[slug] ?? null;
}

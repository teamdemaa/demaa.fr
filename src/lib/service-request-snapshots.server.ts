import "server-only";

import { createHash } from "node:crypto";
import type {
  PublishedSolutionPlacementDto,
  PublishedSolutionResourceDto,
} from "@/lib/solution-registry-dto";
import type { SolutionReferralDisclosure } from "@/lib/solution-referral-disclosures.server";

type Json = boolean | null | number | string | readonly Json[] | { readonly [key: string]: Json };

function canonicalize(value: unknown): Json {
  if (value === null || typeof value === "boolean" || typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new TypeError("Snapshot must contain plain JSON values only.");
  }
  const result: Record<string, Json> = Object.create(null);
  for (const key of Object.keys(value).sort()) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      throw new TypeError("Snapshot contains an unsafe key.");
    }
    result[key] = canonicalize((value as Record<string, unknown>)[key]);
  }
  return result;
}

export function hashRequestSnapshot(value: unknown) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

export function buildSolutionReferralSnapshot(input: {
  disclosure: SolutionReferralDisclosure;
  placement: PublishedSolutionPlacementDto;
  resource: PublishedSolutionResourceDto;
}) {
  const snapshot = {
    billing_party: input.disclosure.billingParty,
    commercial_relationship: input.resource.commercialRelationship,
    contracting_party: input.disclosure.contractingParty,
    disclosure_version: input.disclosure.disclosureVersion,
    effective_at: input.disclosure.effectiveAt,
    expires_at: input.disclosure.expiresAt,
    fit_constraints: input.placement.fitConstraints,
    fit_rationale: input.placement.fitRationale,
    interaction: input.resource.interaction,
    placement_id: input.placement.placementId,
    placement_version: input.placement.placementVersion,
    resource_description: input.resource.description,
    resource_name: input.resource.name,
    resource_slug: input.resource.resourceSlug,
    resource_type: input.resource.resourceType,
    resource_version: input.resource.resourceVersion,
    reviewed_at: input.disclosure.reviewedAt,
    reviewer: input.disclosure.reviewer,
    section: input.placement.section,
    transparency: input.disclosure.transparency,
    usage: input.placement.usage,
  };
  return { ...snapshot, content_hash: hashRequestSnapshot(snapshot) };
}

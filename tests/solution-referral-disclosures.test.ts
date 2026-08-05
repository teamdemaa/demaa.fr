import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getSolutionReferralDisclosure,
  validateSolutionReferralDisclosure,
  type SolutionReferralDisclosure,
} from "@/lib/solution-referral-disclosures.server";

const valid: SolutionReferralDisclosure = {
  billingParty: "Juridique Services SAS",
  commercialRelationship: "paid_referral",
  contractingParty: "Juridique Services SAS",
  disclosureVersion: "1.0.0",
  effectiveAt: "2026-07-01T00:00:00.000Z",
  expiresAt: "2027-07-01T00:00:00.000Z",
  placementId: "cabinet-comptable:partenaire-juridique:providers:1",
  resourceSlug: "partenaire-juridique",
  reviewedAt: "2026-06-25T00:00:00.000Z",
  reviewer: "legal@demaa.fr",
  transparency: "Le partenaire contracte et facture. Demaa peut être rémunérée.",
};

describe("solution referral legal disclosure gate", () => {
  it("remains fail-closed for an unregistered referral", () => {
    expect(getSolutionReferralDisclosure({
      commercialRelationship: "paid_referral",
      placementId: valid.placementId,
      resourceSlug: valid.resourceSlug,
    })).toBeNull();
  });

  it("exposes the reviewed no-commission disclosure for JuridiConsulting", () => {
    expect(getSolutionReferralDisclosure({
      commercialRelationship: "none",
      placementId: "cabinet-comptable:juridi-consulting:providers:1",
      resourceSlug: "juridi-consulting",
      now: new Date("2026-08-05T12:00:00.000Z"),
    })).toMatchObject({
      billingParty: "JuridiConsulting",
      commercialRelationship: "none",
      contractingParty: "JuridiConsulting",
      transparency: expect.stringContaining("ne perçoit aucune rémunération"),
    });
  });

  it("requires exact linkage and refuses expired disclosures", () => {
    expect(validateSolutionReferralDisclosure(valid, new Date("2026-08-01T00:00:00.000Z")))
      .toEqual([]);
    expect(validateSolutionReferralDisclosure(
      { ...valid, expiresAt: "2026-07-15T00:00:00.000Z" },
      new Date("2026-08-01T00:00:00.000Z"),
    )).toContain("disclosure is expired");
  });
});

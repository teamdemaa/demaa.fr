import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getSolutionReferralDisclosure } from "@/lib/solution-referral-disclosures.server";

describe("solution referral legal disclosure gate", () => {
  it("fails closed until a reviewed contracting and billing disclosure exists", () => {
    expect(getSolutionReferralDisclosure("partenaire-juridique")).toBeNull();
    expect(getSolutionReferralDisclosure("Invalid slug")).toBeNull();
  });
});

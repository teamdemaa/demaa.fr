import { describe, expect, it } from "vitest";
import {
  buildCustomerIntentReturnTo,
  getSafeCustomerReturnTo,
  parseCustomerAccessIntent,
} from "@/lib/customer-space-redirect";

describe("customer-space safe return intents", () => {
  it("builds and parses typed in-app intents", () => {
    const guideReturnTo = buildCustomerIntentReturnTo({
      kind: "guide-notify",
      resourceSlug: "guide-cabinet-comptable-lancer",
      systemSlug: "cabinet-comptable",
    });

    expect(guideReturnTo).toBe(
      "/?intent=guide-notify&systemSlug=cabinet-comptable&resourceSlug=guide-cabinet-comptable-lancer",
    );
    expect(parseCustomerAccessIntent(guideReturnTo)).toEqual({
      kind: "guide-notify",
      resourceSlug: "guide-cabinet-comptable-lancer",
      systemSlug: "cabinet-comptable",
    });
    expect(getSafeCustomerReturnTo(guideReturnTo)).toBe(guideReturnTo);

    const solutionReturnTo = buildCustomerIntentReturnTo({
      kind: "solution-referral",
      resourceSlug: "chartered-accountant",
      systemSlug: "cabinet-davocat",
    });
    expect(parseCustomerAccessIntent(solutionReturnTo)).toEqual({
      kind: "solution-referral",
      resourceSlug: "chartered-accountant",
      systemSlug: "cabinet-davocat",
    });
    expect(getSafeCustomerReturnTo(solutionReturnTo)).toBe(solutionReturnTo);
  });

  it("rejects malformed intents and external redirects", () => {
    expect(getSafeCustomerReturnTo("/?intent=coaching&offer=unknown")).toBe("/");
    expect(getSafeCustomerReturnTo("/?intent=opportunity&opportunityId=../admin")).toBe("/");
    expect(getSafeCustomerReturnTo("//evil.example/path")).toBe("/");
    expect(getSafeCustomerReturnTo("/\\evil.example/path")).toBe("/");
  });

  it("keeps legacy plan links compatible", () => {
    expect(getSafeCustomerReturnTo("/mon-espace")).toBe("/plans");
    expect(getSafeCustomerReturnTo("/mon-espace/plans/plan-123")).toBe("/plans/plan-123");
    expect(getSafeCustomerReturnTo("/plans")).toBe("/plans");
    expect(
      getSafeCustomerReturnTo(
        "/plans/abc_123?intent=coaching&tab=messages",
      ),
    ).toBe("/plans/abc_123?intent=coaching&tab=messages");
  });

  it("canonicalizes legacy public intents back into the single app", () => {
    expect(getSafeCustomerReturnTo("/academie?intent=structure")).toBe(
      "/?intent=structure",
    );
    expect(getSafeCustomerReturnTo("/rejoindre-team-demaa?intent=team-demaa-profile")).toBe(
      "/?intent=team-demaa-profile",
    );
  });
});

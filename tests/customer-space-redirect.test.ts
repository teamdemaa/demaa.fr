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

    const specialistReturnTo = buildCustomerIntentReturnTo({
      kind: "coaching",
      offer: "pilotage_2",
    });
    expect(specialistReturnTo).toBe("/?intent=coaching&offer=pilotage_2");
    expect(parseCustomerAccessIntent(specialistReturnTo)).toEqual({
      kind: "coaching",
      offer: "pilotage_2",
    });
    expect(getSafeCustomerReturnTo(specialistReturnTo)).toBe(specialistReturnTo);

    const draftToken = "a".repeat(43);
    const specialistDraftReturnTo = buildCustomerIntentReturnTo({
      draftToken,
      kind: "coaching",
      tab: "messages",
    });
    expect(specialistDraftReturnTo).toBe(
      `/?intent=coaching&tab=messages&draftToken=${draftToken}`,
    );
    expect(parseCustomerAccessIntent(specialistDraftReturnTo)).toEqual({
      draftToken,
      kind: "coaching",
      tab: "messages",
    });
    expect(getSafeCustomerReturnTo(specialistDraftReturnTo)).toBe(
      specialistDraftReturnTo,
    );

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
    expect(getSafeCustomerReturnTo("/?intent=coaching&tab=unknown")).toBe("/");
    expect(
      getSafeCustomerReturnTo("/?intent=coaching&draftToken=too-short"),
    ).toBe("/");
    expect(
      getSafeCustomerReturnTo(
        `/?intent=coaching&tab=formules&draftToken=${"a".repeat(43)}`,
      ),
    ).toBe("/");
    expect(
      getSafeCustomerReturnTo(
        "/plans/plan-123?intent=coaching&draftToken=too-short",
      ),
    ).toBe("/");
  });

  it("preserves a coaching tab without requiring a draft", () => {
    const returnTo = buildCustomerIntentReturnTo({
      kind: "coaching",
      offer: "pilotage_1",
      tab: "formules",
    });

    expect(returnTo).toBe(
      "/?intent=coaching&offer=pilotage_1&tab=formules",
    );
    expect(parseCustomerAccessIntent(returnTo)).toEqual({
      kind: "coaching",
      offer: "pilotage_1",
      tab: "formules",
    });
  });

  it("keeps legacy plan links compatible", () => {
    expect(getSafeCustomerReturnTo("/mon-espace")).toBe("/plans");
    expect(getSafeCustomerReturnTo("/mon-espace/plans/plan-123")).toBe("/plans/plan-123");
    expect(getSafeCustomerReturnTo("/plans")).toBe("/plans");
    expect(
      getSafeCustomerReturnTo(
        "/plans/abc_123?intent=coaching&tab=formules&offer=pilotage_1",
      ),
    ).toBe("/plans/abc_123?intent=coaching&tab=formules&offer=pilotage_1");
    const draftToken = "a".repeat(43);
    expect(
      getSafeCustomerReturnTo(
        `/plans/abc_123?intent=coaching&tab=messages&draftToken=${draftToken}`,
      ),
    ).toBe(
      `/plans/abc_123?intent=coaching&tab=messages&draftToken=${draftToken}`,
    );
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

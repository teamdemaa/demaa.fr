import { describe, expect, it } from "vitest";
import { getMagicLinkEmailPresentation } from "@/lib/customer-space-email";

describe("magic-link email presentation", () => {
  it("uses plan-specific copy only for plan access", () => {
    expect(getMagicLinkEmailPresentation({
      actionPlanClaim: { actionPlanId: "plan-1" },
      returnTo: "/plans/plan-1",
    })).toMatchObject({
      subject: "Ouvrez votre plan Demaa",
      cta: "Ouvrir mon plan",
    });
  });

  it("restores specialist context without pretending a plan was saved", () => {
    const presentation = getMagicLinkEmailPresentation({
      returnTo: "/?intent=coaching",
    });

    expect(presentation.cta).toBe("Écrire à un spécialiste");
    expect(presentation.body).not.toContain("plan");
  });

  it("uses opportunity-specific copy for an opportunity intent", () => {
    expect(getMagicLinkEmailPresentation({
      returnTo: "/?intent=opportunity&opportunityId=mission-btp",
    })).toMatchObject({
      subject: "Continuez votre demande dans Demaa",
      cta: "Continuer ma demande",
    });
  });

  it("keeps a neutral fallback for other authenticated journeys", () => {
    expect(getMagicLinkEmailPresentation({
      returnTo: "/?intent=structure",
    })).toMatchObject({
      subject: "Votre lien sécurisé Demaa",
      cta: "Ouvrir Demaa",
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  buildActionPlanAppHref,
  buildPublicSystemAppHref,
  parseActionPlanAppContext,
} from "@/lib/action-plan-app-context";

describe("action plan app context", () => {
  it("normalizes the legacy system view into the main Solutions view", () => {
    expect(parseActionPlanAppContext(new URLSearchParams(
      "view=system&system=restaurant&systemTab=solutions&resource=lightspeed",
    ))).toEqual({
      view: "solutions",
      planSection: "actions",
      systemId: "restaurant",
      systemTab: "solutions",
      solutionResourceSlug: "lightspeed",
    });
  });

  it("normalizes the former plan Solutions tab into the main Solutions view", () => {
    expect(parseActionPlanAppContext(new URLSearchParams(
      "view=plan&planTab=solutions&system=restaurant&systemTab=resources&resource=lightspeed",
    ))).toEqual({
      view: "solutions",
      planSection: "actions",
      systemId: "restaurant",
      systemTab: "solutions",
      solutionResourceSlug: "lightspeed",
    });
  });

  it("keeps legacy authentication intents compatible", () => {
    expect(parseActionPlanAppContext(new URLSearchParams(
      "intent=solution-referral&systemSlug=restaurant&resourceSlug=lightspeed",
    ))).toEqual({
      view: "solutions",
      planSection: "actions",
      systemId: "restaurant",
      solutionResourceSlug: "lightspeed",
    });
    expect(parseActionPlanAppContext(new URLSearchParams(
      "intent=opportunity&opportunityId=mission-btp",
    ))).toMatchObject({
      view: "opportunities",
      planSection: "actions",
      opportunityId: "mission-btp",
    });
    expect(parseActionPlanAppContext(new URLSearchParams(
      "intent=team-demaa-profile",
    ))).toEqual({
      view: "opportunities",
      planSection: "actions",
    });
    for (const intent of ["structure", "structure-problem"]) {
      expect(parseActionPlanAppContext(new URLSearchParams(
        `intent=${intent}`,
      ))).toEqual({
        view: "academy",
        planSection: "actions",
      });
    }
  });

  it("preserves the current plan pathname for ordinary in-app navigation", () => {
    expect(buildActionPlanAppHref({
      context: {
        view: "academy",
        planSection: "actions",
        academyContentSlug: "piloter-sa-tresorerie",
      },
      pathname: "/plans/plan-1",
      search: "?demo=plan&intent=opportunity-submit&draftToken=secret&tab=messages&opportunityId=old",
    })).toBe(
      "/plans/plan-1?demo=plan&view=academy&academy=piloter-sa-tresorerie",
    );
  });

  it("builds system sharing on the public app entry, never on a saved plan", () => {
    const href = buildPublicSystemAppHref({
      systemId: "restaurant",
    });

    expect(href).toBe(
      "/?view=solutions&system=restaurant&systemTab=solutions",
    );
    expect(href).not.toContain("/plans/");
  });

  it("rejects unsafe context values", () => {
    expect(parseActionPlanAppContext(new URLSearchParams(
      "view=system&system=https://example.com&academy=../../secret",
    ))).toEqual({ view: "solutions", planSection: "actions" });
  });

  it("builds canonical Solutions contexts without the former local tab", () => {
    expect(buildActionPlanAppHref({
      context: {
        view: "solutions",
        planSection: "actions",
        systemId: "restaurant",
        systemTab: "solutions",
        solutionResourceSlug: "lightspeed",
      },
    })).toBe(
      "/?view=solutions&system=restaurant&systemTab=solutions&resource=lightspeed",
    );
  });

  it("keeps Pilotage sections only inside the Plan view", () => {
    expect(parseActionPlanAppContext(new URLSearchParams("view=plan&section=figures"))).toEqual({
      view: "plan",
      planSection: "figures",
    });
    expect(parseActionPlanAppContext(new URLSearchParams("view=academy&section=strategy"))).toMatchObject({
      view: "academy",
      planSection: "actions",
    });
    expect(buildActionPlanAppHref({
      context: { view: "plan", planSection: "strategy" },
      search: "?system=old&academy=old",
    })).toBe("/?view=plan&section=strategy");
  });
});

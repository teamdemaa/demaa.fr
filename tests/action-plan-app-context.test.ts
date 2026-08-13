import { describe, expect, it } from "vitest";
import {
  buildActionPlanAppHref,
  buildPublicSystemAppHref,
  parseActionPlanAppContext,
} from "@/lib/action-plan-app-context";

describe("action plan app context", () => {
  it("parses the canonical system context", () => {
    expect(parseActionPlanAppContext(new URLSearchParams(
      "view=system&system=restaurant&systemTab=solutions&resource=lightspeed",
    ))).toEqual({
      view: "system",
      systemId: "restaurant",
      systemTab: "solutions",
      solutionResourceSlug: "lightspeed",
    });
  });

  it("keeps legacy authentication intents compatible", () => {
    expect(parseActionPlanAppContext(new URLSearchParams(
      "intent=solution-referral&systemSlug=restaurant&resourceSlug=lightspeed",
    ))).toEqual({
      view: "system",
      systemId: "restaurant",
      solutionResourceSlug: "lightspeed",
    });
    expect(parseActionPlanAppContext(new URLSearchParams(
      "intent=opportunity&opportunityId=mission-btp",
    ))).toMatchObject({
      view: "opportunities",
      opportunityId: "mission-btp",
    });
  });

  it("preserves the current plan pathname for ordinary in-app navigation", () => {
    expect(buildActionPlanAppHref({
      context: {
        view: "academy",
        academyContentSlug: "piloter-sa-tresorerie",
      },
      pathname: "/plans/plan-1",
      search: "?demo=plan&intent=opportunity&opportunityId=old",
    })).toBe(
      "/plans/plan-1?demo=plan&view=academy&academy=piloter-sa-tresorerie",
    );
  });

  it("builds system sharing on the public app entry, never on a saved plan", () => {
    const href = buildPublicSystemAppHref({
      systemId: "restaurant",
    });

    expect(href).toBe("/?view=system&system=restaurant");
    expect(href).not.toContain("/plans/");
  });

  it("rejects unsafe context values", () => {
    expect(parseActionPlanAppContext(new URLSearchParams(
      "view=system&system=https://example.com&academy=../../secret",
    ))).toEqual({ view: "system" });
  });
});

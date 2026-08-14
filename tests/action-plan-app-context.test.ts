import { describe, expect, it } from "vitest";
import {
  buildActionPlanAppHref,
  buildPublicSystemAppHref,
  parseActionPlanAppContext,
} from "@/lib/action-plan-app-context";

describe("action plan app context", () => {
  it("normalizes the legacy system view into the plan solutions tab", () => {
    expect(parseActionPlanAppContext(new URLSearchParams(
      "view=system&system=restaurant&systemTab=solutions&resource=lightspeed",
    ))).toEqual({
      view: "plan",
      planTab: "solutions",
      systemId: "restaurant",
      systemTab: "solutions",
      solutionResourceSlug: "lightspeed",
    });
  });

  it("parses the canonical plan solutions context", () => {
    expect(parseActionPlanAppContext(new URLSearchParams(
      "view=plan&planTab=solutions&system=restaurant&systemTab=resources&resource=lightspeed",
    ))).toEqual({
      view: "plan",
      planTab: "solutions",
      systemId: "restaurant",
      systemTab: "resources",
      solutionResourceSlug: "lightspeed",
    });
  });

  it("keeps legacy authentication intents compatible", () => {
    expect(parseActionPlanAppContext(new URLSearchParams(
      "intent=solution-referral&systemSlug=restaurant&resourceSlug=lightspeed",
    ))).toEqual({
      view: "plan",
      planTab: "solutions",
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

    expect(href).toBe(
      "/?view=plan&planTab=solutions&system=restaurant&systemTab=solutions",
    );
    expect(href).not.toContain("/plans/");
  });

  it("rejects unsafe context values", () => {
    expect(parseActionPlanAppContext(new URLSearchParams(
      "view=system&system=https://example.com&academy=../../secret",
    ))).toEqual({ view: "plan", planTab: "solutions" });
  });

  it("canonicalizes legacy system contexts when building application links", () => {
    expect(buildActionPlanAppHref({
      context: {
        view: "system",
        systemId: "restaurant",
        systemTab: "solutions",
        solutionResourceSlug: "lightspeed",
      },
    })).toBe(
      "/?view=plan&planTab=solutions&system=restaurant&systemTab=solutions&resource=lightspeed",
    );
  });
});

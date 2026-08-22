import { describe, expect, it } from "vitest";
import { parseActionPlanAppContext } from "@/lib/action-plan-app-context";
import { parseActionPlanAccessIntent } from "@/lib/action-plan-access-intent";
import { shouldRedirectAuthenticatedHomeToPlans } from "@/lib/action-plan-home-routing";

function shouldRedirect(input: {
  isAuthenticated: boolean;
  query?: string;
  requestedIntent?: string;
  requestedNewPlan?: string;
}) {
  return shouldRedirectAuthenticatedHomeToPlans({
    isAuthenticated: input.isAuthenticated,
    appContext: parseActionPlanAppContext(new URLSearchParams(input.query)),
    requestedAccessIntent: parseActionPlanAccessIntent(
      new URLSearchParams(input.query),
    ),
    requestedIntent: input.requestedIntent,
    requestedNewPlan: input.requestedNewPlan,
  });
}

describe("authenticated homepage routing", () => {
  it("redirects the default connected plan entry to saved plans", () => {
    expect(shouldRedirect({ isAuthenticated: true })).toBe(true);
  });

  it("keeps the default anonymous plan entry on the homepage", () => {
    expect(shouldRedirect({ isAuthenticated: false })).toBe(false);
  });

  it("preserves canonical and legacy Solutions deep-links when connected", () => {
    expect(shouldRedirect({
      isAuthenticated: true,
      query: "view=solutions&system=restaurant",
    })).toBe(false);
    expect(shouldRedirect({
      isAuthenticated: true,
      query: "view=plan&planTab=solutions&system=restaurant",
    })).toBe(false);
    expect(shouldRedirect({
      isAuthenticated: true,
      query: "view=system&system=restaurant",
    })).toBe(false);
    expect(shouldRedirect({
      isAuthenticated: true,
      query: "view=plan&section=solutions&system=restaurant",
    })).toBe(false);
  });

  it("preserves explicit intents and new-plan entries", () => {
    expect(shouldRedirect({
      isAuthenticated: true,
      requestedIntent: "opportunity",
    })).toBe(false);
    expect(shouldRedirect({
      isAuthenticated: true,
      requestedNewPlan: "1",
    })).toBe(false);
    expect(shouldRedirect({
      isAuthenticated: true,
      requestedIntent: "generate-plan",
    })).toBe(false);
    expect(shouldRedirect({
      isAuthenticated: true,
      query: "intent=add-manual-action",
      requestedIntent: "add-manual-action",
    })).toBe(false);
    expect(shouldRedirect({
      isAuthenticated: true,
      query: "intent=edit-company-metric&period=2026-08",
      requestedIntent: "edit-company-metric",
    })).toBe(false);
    expect(shouldRedirect({
      isAuthenticated: true,
      query: "intent=open-company-strategy",
      requestedIntent: "open-company-strategy",
    })).toBe(true);
  });

  it("does not preserve a malformed metric intent", () => {
    expect(shouldRedirect({
      isAuthenticated: true,
      query: "intent=edit-company-metric&period=2026-13",
      requestedIntent: "edit-company-metric",
    })).toBe(true);
  });

  it("does not let an unknown intent bypass the latest-plan entry", () => {
    expect(shouldRedirect({
      isAuthenticated: true,
      requestedIntent: "unknown-intent",
    })).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  buildActionPlanAccessReturnTo,
  parseActionPlanAccessIntent,
} from "@/lib/action-plan-access-intent";

describe("action plan access intents", () => {
  it("round-trips the manual action intent without business content", () => {
    const returnTo = buildActionPlanAccessReturnTo("fr", {
      kind: "add-manual-action",
    });

    expect(returnTo).toBe("/?intent=add-manual-action");
    expect(parseActionPlanAccessIntent(new URL(returnTo, "https://demaa.co").searchParams))
      .toEqual({ kind: "add-manual-action" });
  });

  it("round-trips a validated metric period on the English route", () => {
    const returnTo = buildActionPlanAccessReturnTo("en", {
      kind: "edit-company-metric",
      period: "2026-08",
    });

    expect(returnTo).toBe("/en?intent=edit-company-metric&period=2026-08");
    expect(parseActionPlanAccessIntent(new URL(returnTo, "https://demaa.co").searchParams))
      .toEqual({ kind: "edit-company-metric", period: "2026-08" });
  });

  it("fails closed for unknown intents and invalid periods", () => {
    expect(parseActionPlanAccessIntent(new URLSearchParams("intent=unknown"))).toBeNull();
    expect(parseActionPlanAccessIntent(
      new URLSearchParams("intent=edit-company-metric&period=2026-13"),
    )).toBeNull();
    expect(parseActionPlanAccessIntent(
      new URLSearchParams("intent=edit-company-metric"),
    )).toBeNull();
  });
});

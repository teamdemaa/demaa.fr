import { describe, expect, it } from "vitest";
import {
  normalizeSystemDetailTab,
  SYSTEM_DETAIL_TABS,
} from "@/lib/system-detail-tabs";

describe("operational system tabs", () => {
  it("keeps only Process and Outils in the validated order", () => {
    expect(SYSTEM_DETAIL_TABS).toEqual(["process", "outils"]);
  });

  it("keeps legacy tab URLs on a meaningful section", () => {
    expect(normalizeSystemDetailTab("kit")).toBe("process");
    expect(normalizeSystemDetailTab("pilotage")).toBe("process");
    expect(normalizeSystemDetailTab("accompagnement")).toBe("process");
    expect(normalizeSystemDetailTab("services")).toBe("process");
    expect(normalizeSystemDetailTab("cours")).toBe("process");
    expect(normalizeSystemDetailTab("systeme")).toBe("process");
  });

  it("ignores unknown tabs", () => {
    expect(normalizeSystemDetailTab("inconnu")).toBeUndefined();
  });
});

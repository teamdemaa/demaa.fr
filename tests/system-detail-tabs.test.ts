import { describe, expect, it } from "vitest";
import {
  getNextSystemDetailTab,
  normalizeSystemDetailTab,
  SYSTEM_DETAIL_TABS,
} from "@/lib/system-detail-tabs";

describe("operational system tabs", () => {
  it("keeps Process and Solutions in the validated order", () => {
    expect(SYSTEM_DETAIL_TABS).toEqual(["process", "solutions"]);
  });

  it("keeps legacy tab URLs on a meaningful section", () => {
    expect(normalizeSystemDetailTab("outils")).toBe("solutions");
    expect(normalizeSystemDetailTab("ecosysteme")).toBe("solutions");
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

  it("supports cyclic arrows and Home/End keyboard navigation", () => {
    expect(getNextSystemDetailTab("process", "ArrowRight")).toBe("solutions");
    expect(getNextSystemDetailTab("solutions", "ArrowRight")).toBe("process");
    expect(getNextSystemDetailTab("process", "ArrowLeft")).toBe("solutions");
    expect(getNextSystemDetailTab("solutions", "ArrowLeft")).toBe("process");
    expect(getNextSystemDetailTab("solutions", "Home")).toBe("process");
    expect(getNextSystemDetailTab("process", "End")).toBe("solutions");
    expect(getNextSystemDetailTab("process", "Enter")).toBeUndefined();
  });
});

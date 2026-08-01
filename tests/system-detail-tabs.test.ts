import { describe, expect, it } from "vitest";
import {
  getNextSystemDetailTab,
  getVisibleSystemDetailTabs,
  normalizeSystemDetailTab,
  SYSTEM_DETAIL_TABS,
} from "@/lib/system-detail-tabs";

describe("operational system tabs", () => {
  it("keeps Process and Solutions in the validated order", () => {
    expect(SYSTEM_DETAIL_TABS).toEqual(["process", "solutions"]);
  });

  it("opens legacy Solutions URLs only when renderable DTOs exist", () => {
    expect(normalizeSystemDetailTab("outils", true)).toBe("solutions");
    expect(normalizeSystemDetailTab("ecosysteme", true)).toBe("solutions");
    expect(normalizeSystemDetailTab("solutions", true)).toBe("solutions");
    expect(normalizeSystemDetailTab("outils", false)).toBe("process");
    expect(normalizeSystemDetailTab("ecosysteme", false)).toBe("process");
    expect(normalizeSystemDetailTab("solutions", false)).toBe("process");
    expect(normalizeSystemDetailTab("kit", false)).toBe("process");
    expect(normalizeSystemDetailTab("pilotage", false)).toBe("process");
    expect(normalizeSystemDetailTab("accompagnement", false)).toBe("process");
    expect(normalizeSystemDetailTab("services", false)).toBe("process");
    expect(normalizeSystemDetailTab("cours", false)).toBe("process");
    expect(normalizeSystemDetailTab("systeme", false)).toBe("process");
  });

  it("ignores unknown tabs", () => {
    expect(normalizeSystemDetailTab("inconnu", false)).toBeUndefined();
  });

  it("supports cyclic arrows and Home/End keyboard navigation", () => {
    expect(getNextSystemDetailTab("process", "ArrowRight", true)).toBe("solutions");
    expect(getNextSystemDetailTab("solutions", "ArrowRight", true)).toBe("process");
    expect(getNextSystemDetailTab("process", "ArrowLeft", true)).toBe("solutions");
    expect(getNextSystemDetailTab("solutions", "ArrowLeft", true)).toBe("process");
    expect(getNextSystemDetailTab("solutions", "Home", true)).toBe("process");
    expect(getNextSystemDetailTab("process", "End", true)).toBe("solutions");
    expect(getNextSystemDetailTab("process", "ArrowRight", false)).toBe("process");
    expect(getNextSystemDetailTab("process", "Enter", false)).toBeUndefined();
    expect(getVisibleSystemDetailTabs(false)).toEqual(["process"]);
    expect(getVisibleSystemDetailTabs(true)).toEqual(["process", "solutions"]);
  });
});

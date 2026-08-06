import { describe, expect, it } from "vitest";
import {
  getNextSystemDetailTab,
  getVisibleSystemDetailTabs,
  normalizeSystemDetailTab,
  SYSTEM_DETAIL_TABS,
} from "@/lib/system-detail-tabs";

describe("operational system tabs", () => {
  it("keeps Process, Solutions and Resources in the validated order", () => {
    expect(SYSTEM_DETAIL_TABS).toEqual(["process", "solutions", "resources"]);
  });

  it("keeps legacy Solutions URLs on Solutions, including before publication", () => {
    expect(normalizeSystemDetailTab("outils")).toBe("solutions");
    expect(normalizeSystemDetailTab("ecosysteme")).toBe("solutions");
    expect(normalizeSystemDetailTab("solutions")).toBe("solutions");
    expect(normalizeSystemDetailTab("resources")).toBe("resources");
    expect(normalizeSystemDetailTab("ressources")).toBe("resources");
    expect(normalizeSystemDetailTab("modeles")).toBe("resources");
    expect(normalizeSystemDetailTab("modeles-de-documents")).toBe("resources");
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
    expect(getNextSystemDetailTab("solutions", "ArrowRight")).toBe("resources");
    expect(getNextSystemDetailTab("resources", "ArrowRight")).toBe("process");
    expect(getNextSystemDetailTab("process", "ArrowLeft")).toBe("resources");
    expect(getNextSystemDetailTab("resources", "ArrowLeft")).toBe("solutions");
    expect(getNextSystemDetailTab("solutions", "ArrowLeft")).toBe("process");
    expect(getNextSystemDetailTab("solutions", "Home")).toBe("process");
    expect(getNextSystemDetailTab("process", "End")).toBe("resources");
    expect(getNextSystemDetailTab("process", "Enter")).toBeUndefined();
    expect(getVisibleSystemDetailTabs()).toEqual(["process", "solutions", "resources"]);
  });
});

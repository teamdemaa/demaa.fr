import { describe, expect, it } from "vitest";
import {
  normalizeSystemDetailTab,
  SYSTEM_DETAIL_TABS,
} from "@/lib/system-detail-tabs";

describe("operational kit tabs", () => {
  it("shows the kit before tools and processes", () => {
    expect(SYSTEM_DETAIL_TABS).toEqual(["kit", "outils", "process"]);
  });

  it("keeps legacy tab URLs on a meaningful section", () => {
    expect(normalizeSystemDetailTab("accompagnement")).toBe("kit");
    expect(normalizeSystemDetailTab("cours")).toBe("process");
    expect(normalizeSystemDetailTab("systeme")).toBe("process");
  });

  it("ignores unknown tabs", () => {
    expect(normalizeSystemDetailTab("inconnu")).toBeUndefined();
  });
});

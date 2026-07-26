import { describe, expect, it } from "vitest";
import {
  normalizeSystemDetailTab,
  SYSTEM_DETAIL_TABS,
} from "@/lib/system-detail-tabs";

describe("operational kit tabs", () => {
  it("reconnaît les sections des parcours actuel et pilote", () => {
    expect(SYSTEM_DETAIL_TABS).toEqual([
      "kit",
      "outils",
      "process",
      "services",
    ]);
  });

  it("keeps legacy tab URLs on a meaningful section", () => {
    expect(normalizeSystemDetailTab("accompagnement")).toBe("services");
    expect(normalizeSystemDetailTab("cours")).toBe("process");
    expect(normalizeSystemDetailTab("systeme")).toBe("process");
  });

  it("ignores unknown tabs", () => {
    expect(normalizeSystemDetailTab("inconnu")).toBeUndefined();
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TOOLS_HUB_SECTOR_ORDER } from "@/lib/public-sectors";

describe("Tools hub positioning", () => {
  it("prioritizes service businesses and keeps unrelated sectors out of the hub", () => {
    expect(TOOLS_HUB_SECTOR_ORDER).toEqual([
      "Conseil & services aux entreprises",
      "BTP & services techniques",
      "Tech & Digital",
      "Mobilité & logistique",
      "Immobilier",
      "Éducation & formation",
      "Automobile & réparation",
    ]);
    for (const hidden of ["Restauration", "Commerce & retail", "Santé, bien-être & esthétique"]) expect(TOOLS_HUB_SECTOR_ORDER).not.toContain(hidden);
  });

  it("uses a responsive grid instead of horizontal card scrolling", () => {
    const source = readFileSync("src/components/SystemSearchHero.tsx", "utf8");
    expect(source).toContain("sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4");
    expect(source).not.toContain("HorizontalScrollHint");
    expect(source).not.toContain("restaurant");
  });
});

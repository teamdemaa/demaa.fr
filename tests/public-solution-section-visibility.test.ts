import { describe, expect, it } from "vitest";

import {
  filterPublicSolutionSections,
  isPublicSolutionSectionVisible,
  PUBLIC_SOLUTION_SECTION_VISIBILITY,
} from "@/lib/public-solution-section-visibility";
import type { SolutionSection } from "@/lib/solution-registry-dto";

describe("public Solution section visibility", () => {
  it("shows canonical Services while keeping legacy models hidden", () => {
    const sections = [
      { section: "software", value: "Outils" },
      { section: "services", value: "Prestations" },
      { section: "providers", value: "Fournisseurs" },
      { section: "networks", value: "Réseaux professionnels" },
      { section: "models", value: "Anciens modèles" },
    ] as const satisfies readonly Readonly<{
      section: SolutionSection;
      value: string;
    }>[];

    expect(PUBLIC_SOLUTION_SECTION_VISIBILITY.services).toBe(true);
    expect(isPublicSolutionSectionVisible("services")).toBe(true);
    expect(filterPublicSolutionSections(sections).map(({ section }) => section)).toEqual([
      "software",
      "services",
      "providers",
      "networks",
    ]);
    expect(sections.map(({ section }) => section)).toContain("services");
  });
});

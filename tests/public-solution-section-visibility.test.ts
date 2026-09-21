import { describe, expect, it } from "vitest";

import {
  filterPublicSolutionSections,
  isPublicSolutionSectionVisible,
  PUBLIC_SOLUTION_SECTION_VISIBILITY,
} from "@/lib/public-solution-section-visibility";
import type { SolutionSection } from "@/lib/solution-registry-dto";

describe("public Solution section visibility", () => {
  it("keeps specialist services and legacy models out of solution pages", () => {
    const sections = [
      { section: "software", value: "Outils" },
      { section: "services", value: "Prestations" },
      { section: "providers", value: "Fournisseurs" },
      { section: "financing", value: "Financement" },
      { section: "aids", value: "Aides et subventions" },
      { section: "networks", value: "Réseaux professionnels" },
      { section: "models", value: "Anciens modèles" },
    ] as const satisfies readonly Readonly<{
      section: SolutionSection;
      value: string;
    }>[];

    expect(PUBLIC_SOLUTION_SECTION_VISIBILITY.services).toBe(false);
    expect(isPublicSolutionSectionVisible("services")).toBe(false);
    expect(filterPublicSolutionSections(sections).map(({ section }) => section)).toEqual([
      "software",
      "providers",
      "financing",
      "aids",
      "networks",
    ]);
    expect(PUBLIC_SOLUTION_SECTION_VISIBILITY).toEqual({
      software: true,
      services: false,
      providers: true,
      financing: true,
      aids: true,
      models: false,
      networks: true,
    });
    expect(sections.map(({ section }) => section)).toContain("services");
  });
});

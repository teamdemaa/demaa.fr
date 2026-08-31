import { describe, expect, it } from "vitest";

import {
  filterPublicSolutionSections,
  isPublicSolutionSectionVisible,
  PUBLIC_SOLUTION_SECTION_VISIBILITY,
} from "@/lib/public-solution-section-visibility";
import type { SolutionSection } from "@/lib/solution-registry-dto";

describe("public Solution section visibility", () => {
  it("keeps aids, networks and legacy models hidden from public solution pages", () => {
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

    expect(PUBLIC_SOLUTION_SECTION_VISIBILITY.services).toBe(true);
    expect(isPublicSolutionSectionVisible("services")).toBe(true);
    expect(filterPublicSolutionSections(sections).map(({ section }) => section)).toEqual([
      "software",
      "services",
      "providers",
      "financing",
    ]);
    expect(PUBLIC_SOLUTION_SECTION_VISIBILITY).toEqual({
      software: true,
      services: true,
      providers: true,
      financing: true,
      aids: false,
      models: false,
      networks: false,
    });
    expect(sections.map(({ section }) => section)).toContain("services");
  });
});

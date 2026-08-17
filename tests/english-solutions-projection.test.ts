import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { projectEnglishSolutionSections } from "@/lib/english-solution-projections.server";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";

function placement(section: "software" | "services" | "providers", resourceSlug: string) {
  return {
    placementId: `${section}:${resourceSlug}`,
    systemSlug: "saas",
    rank: 1,
    section,
    usage: "Texte français",
    fitRationale: "Texte français",
    fitConstraints: ["Texte français"],
    resource: {
      resourceSlug,
      resourceType: section === "software" ? "software" as const : "expertise" as const,
      name: "Nom français",
      description: "Texte français",
      interaction: section === "software"
        ? { interactionMode: "external_link" as const, href: "https://example.com" }
        : { interactionMode: "detail" as const, href: `/services/${resourceSlug}` },
    },
  };
}

describe("English Solutions projections", () => {
  it("publishes only explicitly translated Tools and Accompaniment entries", () => {
    const input: RenderableSolutionSectionDto[] = [
      { section: "software", placements: [placement("software", "github"), placement("software", "freebe")] },
      { section: "services", placements: [placement("services", "coach-business"), placement("services", "expert-comptable")] },
      { section: "providers", placements: [placement("providers", "provider") ] },
    ];

    const result = projectEnglishSolutionSections(input);

    expect(result.map((group) => group.section)).toEqual(["software", "services"]);
    expect(result.flatMap((group) => group.placements).map((item) => item.resource.resourceSlug)).toEqual([
      "github",
      "coach-business",
    ]);
    expect(JSON.stringify(result)).not.toContain("Texte français");
    expect(result[1]?.placements[0]?.resource.ctaLabel).toBe("Send my request");
  });
});

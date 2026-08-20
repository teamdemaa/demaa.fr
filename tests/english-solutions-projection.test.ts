import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { projectEnglishSolutionSections } from "@/lib/english-solution-projections.server";
import SystemSolutionsTab from "@/components/SystemSolutionsTab";
import { ENGLISH_BETA_CONTEXT } from "@/lib/international-context";
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
  it("filters draft Tools, preserves Services and does not show an empty state", () => {
    const input: RenderableSolutionSectionDto[] = [
      { section: "software", placements: [placement("software", "github"), placement("software", "freebe")] },
      { section: "services", placements: [{
        ...placement("services", "coach-business"),
        usage: "English service usage",
        fitRationale: "English service rationale",
        fitConstraints: ["English constraint"],
        resource: {
          ...placement("services", "coach-business").resource,
          name: "Business coaching",
          description: "English service description",
          ctaLabel: "Send my request",
        },
      }] },
      { section: "providers", placements: [placement("providers", "provider") ] },
    ];

    const result = projectEnglishSolutionSections(input, ENGLISH_BETA_CONTEXT);

    expect(result.map((group) => group.section)).toEqual(["services"]);
    expect(result.flatMap((group) => group.placements).map((item) => item.resource.resourceSlug)).toEqual([
      "coach-business",
    ]);
    expect(JSON.stringify(result)).not.toContain("Nom français");
    expect(result[0]?.placements[0]?.resource.ctaLabel).toBe("Send my request");

    const markup = renderToStaticMarkup(createElement(SystemSolutionsTab, {
      localeCode: "en",
      sections: result,
    }));
    expect(markup).toContain("Services");
    expect(markup).toContain("Business coaching");
    expect(markup).not.toContain(
      "We are still reviewing the most relevant solutions for this business type.",
    );
  });

  it("returns a neutral English empty state when no section remains", () => {
    const result = projectEnglishSolutionSections([
      { section: "software", placements: [placement("software", "github")] },
    ], ENGLISH_BETA_CONTEXT);

    expect(result).toEqual([]);
    expect(renderToStaticMarkup(createElement(SystemSolutionsTab, {
      localeCode: "en",
      sections: result,
    }))).toContain(
      "We are still reviewing the most relevant solutions for this business type.",
    );
  });
});

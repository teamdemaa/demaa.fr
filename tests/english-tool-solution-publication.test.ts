import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  ENGLISH_BETA_CONTEXT,
  FRANCE_COMMERCIAL_CONTEXT,
  FRANCE_CONTEXT,
  createInternationalContext,
} from "@/lib/international-context";
import {
  ENGLISH_BETA_DRAFT_TOOL_PROJECTION_SLUGS,
  getToolSolutionProjectionPublicationStatus,
  hasToolSolutionProjectionForContext,
  projectToolSolutionPlacementForContext,
  projectToolSolutionSectionForContext,
} from "@/lib/tool-solution-internationalization.server";
import {
  getToolDirectoryItemBySlug,
  getToolDirectorySlug,
} from "@/lib/tool-directory";
import type { RenderableSolutionPlacementDto } from "@/lib/system-solutions-ui-dto";

function toolPlacement(resourceSlug: string): RenderableSolutionPlacementDto {
  return {
    placementId: `saas:${resourceSlug}:software:1`,
    systemSlug: "saas",
    rank: 1,
    section: "software",
    usage: "Texte français",
    fitRationale: "Texte français",
    fitConstraints: ["Texte français"],
    resource: {
      resourceSlug,
      resourceType: "software",
      name: "Nom français",
      description: "Texte français",
      interaction: {
        interactionMode: "external_link",
        href: "https://example.com/tool?source=canonical",
      },
    },
  };
}

describe("English Tool projections", () => {
  it("references only unique canonical Tool directory slugs", () => {
    expect(ENGLISH_BETA_DRAFT_TOOL_PROJECTION_SLUGS).toHaveLength(22);
    expect(new Set(ENGLISH_BETA_DRAFT_TOOL_PROJECTION_SLUGS).size).toBe(22);

    for (const slug of ENGLISH_BETA_DRAFT_TOOL_PROJECTION_SLUGS) {
      const tool = getToolDirectoryItemBySlug(slug);
      expect(tool, slug).not.toBeNull();
      expect(getToolDirectorySlug(tool!), slug).toBe(slug);
    }
  });

  it("separates an English projection from market availability and publication", () => {
    expect(hasToolSolutionProjectionForContext("github", ENGLISH_BETA_CONTEXT)).toBe(true);
    expect(hasToolSolutionProjectionForContext("freebe", ENGLISH_BETA_CONTEXT)).toBe(false);
    expect(hasToolSolutionProjectionForContext("github", FRANCE_CONTEXT)).toBe(false);
    expect(getToolSolutionProjectionPublicationStatus(
      "github",
      ENGLISH_BETA_CONTEXT,
    )).toBe("draft");
    expect(hasToolSolutionProjectionForContext(
      "github",
      createInternationalContext("en", FRANCE_COMMERCIAL_CONTEXT),
    )).toBe(true);
    expect(getToolSolutionProjectionPublicationStatus(
      "github",
      createInternationalContext("en", FRANCE_COMMERCIAL_CONTEXT),
    )).toBe("draft");
  });

  it("does not expose a canonical placement while its English projection is draft", () => {
    const placement = toolPlacement("github");
    const projected = projectToolSolutionPlacementForContext(
      placement,
      ENGLISH_BETA_CONTEXT,
    );

    expect(projected).toBeNull();
  });

  it("fails closed for an unpublished Tool and non-Tool sections", () => {
    expect(projectToolSolutionPlacementForContext(
      toolPlacement("freebe"),
      ENGLISH_BETA_CONTEXT,
    )).toBeNull();
    expect(projectToolSolutionSectionForContext({
      section: "services",
      placements: [],
    }, ENGLISH_BETA_CONTEXT)).toBeNull();
  });
});

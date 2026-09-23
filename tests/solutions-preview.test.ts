import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import snapshot from "@/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";
import reviewedPilotCandidate from "../docs/research/d091-tools/pilot-candidate-revision.generated.json";
import { parseFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";
import { selectRenderableSolutionSectionsFromRevision } from "@/lib/firebase-solution-registry-selection.server";
import { filterSolutionsPreviewSections } from "@/lib/public-solution-section-visibility";
import { publishedSolutionSectionsFixture } from "./fixtures/published-solution-sections";

describe("DEMAA Solutions preview", () => {
  it("has seven independently reviewed cabinet-comptable tools for the protected pilot", () => {
    const revision = parseFirebaseSolutionRegistryRevision(reviewedPilotCandidate);
    const tools = selectRenderableSolutionSectionsFromRevision(
      revision,
      "cabinet-comptable",
      { publishedOnly: true },
    ).find(({ section }) => section === "software")?.placements ?? [];

    expect(tools.map(({ resource }) => resource.resourceSlug)).toEqual([
      "pennylane", "myunisoft", "acd", "silae", "dext", "rca", "lefebvre-dalloz",
    ]);
    expect(readFileSync("src/app/(marketing)/solutions/[slug]/page.tsx", "utf8"))
      .toContain('process.env.VERCEL_ENV === "preview"');
    expect(readFileSync("src/app/(marketing)/solutions/[slug]/page.tsx", "utf8"))
      .not.toContain("Outils du lot pilote en vérification avant publication");
  });

  it("keeps published suppliers while separating paid services and Academy models", () => {
    const visible = filterSolutionsPreviewSections([
      ...publishedSolutionSectionsFixture,
      { section: "services", placements: publishedSolutionSectionsFixture[0]!.placements },
      { section: "models", placements: publishedSolutionSectionsFixture[0]!.placements },
    ]);
    expect(visible.map(({ section }) => section)).toEqual(["software", "providers"]);
  });

  it("never renders selected drafts or blocked publications from the registry snapshot", () => {
    const revision = parseFirebaseSolutionRegistryRevision(snapshot);
    const resources = new Map(revision.resources.map(({ resource }) => [resource.resourceSlug, resource]));
    const placements = new Map(revision.placements.map(({ placement }) => [placement.placementId, placement]));

    for (const { slug } of enterpriseCatalog) {
      const visible = filterSolutionsPreviewSections(
        selectRenderableSolutionSectionsFromRevision(revision, slug, { publishedOnly: true }),
      );
      for (const item of visible.flatMap(({ placements: sectionPlacements }) => sectionPlacements)) {
        const placement = placements.get(item.placementId);
        const resource = resources.get(item.resource.resourceSlug);
        expect(placement?.status).toBe("published");
        expect(placement?.publicationBlockers).toEqual([]);
        expect(resource?.status).toBe("published");
        expect(resource?.publicationBlockers).toEqual([]);
      }
    }
  });

  it("restores the complete métier selector, including previously hidden sectors", () => {
    const source = readFileSync("src/app/apercu-solutions/page.tsx", "utf8");
    expect(source).toContain("getEnterpriseCatalog()");
    expect(source).not.toContain("toolsHubSectorLabels");
    expect(enterpriseCatalog.some(({ sectorLabel }) => sectorLabel === "Restauration")).toBe(true);
  });
});

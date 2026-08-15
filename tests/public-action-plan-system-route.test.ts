import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getActiveRenderableSolutionSectionsForSystem: vi.fn(),
  getLocalRenderableSolutionSectionsForSystem: vi.fn(),
  getSystemDetailPageData: vi.fn(),
}));

vi.mock("@/lib/firebase-solution-registry-selection.server", () => ({
  getActiveRenderableSolutionSectionsForSystem:
    mocks.getActiveRenderableSolutionSectionsForSystem,
  getLocalRenderableSolutionSectionsForSystem:
    mocks.getLocalRenderableSolutionSectionsForSystem,
}));

vi.mock("@/lib/system-detail-page", () => ({
  buildOperationalSystemPageDetail: vi.fn(),
  buildSystemPageIntro: () => ({ eyebrow: "Système métier" }),
  getSystemDetailPageData: mocks.getSystemDetailPageData,
}));

import { GET } from "@/app/api/action-plan/system/[slug]/route";
import { publishedSolutionSectionsFixture } from "./fixtures/published-solution-sections";

describe("public action-plan system route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSystemDetailPageData.mockResolvedValue({
      detail: { systeme: null },
      enterprise: {},
      system: {
        slug: "cabinet-comptable",
        name: "Cabinet comptable",
        description: "Piloter un cabinet comptable.",
      },
    });
    mocks.getActiveRenderableSolutionSectionsForSystem.mockResolvedValue(
      publishedSolutionSectionsFixture,
    );
  });

  it("returns only Tools and Services after all canonical sections are composed", async () => {
    const response = await GET(
      new Request("https://demaa.co/api/action-plan/system/cabinet-comptable"),
      { params: Promise.resolve({ slug: "cabinet-comptable" }) },
    );
    const payload = await response.json();
    const sectionNames = payload.solutionSections.map(
      ({ section }: { section: string }) => section,
    );

    expect(response.status).toBe(200);
    expect(sectionNames).toEqual(["software", "services"]);
    expect(JSON.stringify(payload.solutionSections)).not.toMatch(
      /Prestataire Facturation|financing-|aid-|Fournisseurs|Financement|Aides/,
    );
    expect(mocks.getActiveRenderableSolutionSectionsForSystem)
      .toHaveBeenCalledWith("cabinet-comptable");
  });
});

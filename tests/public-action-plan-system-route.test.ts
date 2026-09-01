import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getActivePublicRenderableSolutionSectionsForSystem: vi.fn(),
  getSystemDetailPageData: vi.fn(),
}));

vi.mock("@/lib/firebase-solution-registry-selection.server", () => ({
  getActivePublicRenderableSolutionSectionsForSystem:
    mocks.getActivePublicRenderableSolutionSectionsForSystem,
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
    mocks.getActivePublicRenderableSolutionSectionsForSystem.mockResolvedValue(
      publishedSolutionSectionsFixture,
    );
  });

  it("returns the validated ecosystem after all canonical sections are composed", async () => {
    const response = await GET(
      new Request("https://demaa.co/api/action-plan/system/cabinet-comptable"),
      { params: Promise.resolve({ slug: "cabinet-comptable" }) },
    );
    const payload = await response.json();
    const sectionNames = payload.solutionSections.map(
      ({ section }: { section: string }) => section,
    );

    expect(response.status).toBe(200);
    expect(sectionNames).toEqual([
      "software",
      "services",
      "providers",
      "financing",
    ]);
    expect(JSON.stringify(payload.solutionSections)).toContain("Prestataire Facturation");
    expect(JSON.stringify(payload.solutionSections)).toContain("financing-");
    expect(JSON.stringify(payload.solutionSections)).not.toContain("aid-");
    expect(JSON.stringify(payload.solutionSections)).not.toContain('"section":"models"');
    expect(mocks.getActivePublicRenderableSolutionSectionsForSystem)
      .toHaveBeenCalledWith("cabinet-comptable");
  });
});

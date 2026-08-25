import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src");

async function source(path: string) {
  return readFile(join(root, path), "utf8");
}

describe("tool outbound surfaces", () => {
  it("uses the shared link in the directory, details, Solutions and system recap", async () => {
    const [directory, detail, solutions, recap] = await Promise.all([
      source("components/ToolDirectoryClient.tsx"),
      source("components/SoftwareDetailContent.tsx"),
      source("components/SystemSolutionsTab.tsx"),
      source("app/(marketing)/systemes/[slug]/recapitulatif/page.tsx"),
    ]);

    expect(directory).toContain('surface="tool_directory"');
    expect(detail).toContain('surface="tool_detail"');
    expect(detail).toContain('surface="pricing"');
    expect(solutions).toContain("isToolSolutionResourceType(resourceType)");
    expect(recap).toContain('surface="system_recap"');
  });

  it("carries the Action source without storing plan or user identifiers", async () => {
    const [experience, saved, context, solutionsPage, systemDetail] = await Promise.all([
      source("components/ActionPlanExperience.tsx"),
      source("components/SavedActionPlanDetail.tsx"),
      source("lib/action-plan-app-context.ts"),
      source("app/(marketing)/solutions/[slug]/page.tsx"),
      source("components/SystemDetailContent.tsx"),
    ]);

    for (const implementation of [experience, saved]) {
      expect(implementation).toContain(
        'solutionEntrySource: "action_recommendation"',
      );
      expect(implementation).toContain(
        'appContext.solutionEntrySource === "action_recommendation"',
      );
    }
    expect(context).toContain('"toolSource"');
    expect(solutionsPage).toContain('=== "action_recommendation"');
    expect(systemDetail).toContain(
      "toolOutboundSurface={toolOutboundSurface}",
    );
    expect(context).not.toContain("owner_uid");
    expect(context).not.toContain("companyId");
  });
});

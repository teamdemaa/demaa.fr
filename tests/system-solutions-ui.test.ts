import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import SystemSolutionsTab from "@/components/SystemSolutionsTab";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getPublishedSolutionSectionsForSystem } from "@/lib/solution-registry.server";
import { publishedSolutionSectionsFixture } from "./fixtures/published-solution-sections";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("system Solutions UI", () => {
  it("hides empty sections and never renders a fallback or placeholder", () => {
    expect(
      renderToStaticMarkup(createElement(SystemSolutionsTab, { sections: [] })),
    ).toBe("");

    const markup = renderToStaticMarkup(
      createElement(SystemSolutionsTab, {
        sections: publishedSolutionSectionsFixture,
      }),
    );
    expect(markup).toContain("Logiciels");
    expect(markup).toContain("Qonto");
    expect(markup).not.toContain("Prestataires et partenaires");
    expect(markup).not.toMatch(/en cours|bientôt|à venir|placeholder/i);
  });

  it("keeps every one of the 115 system payloads serializable and crash-free", () => {
    expect(enterpriseCatalog).toHaveLength(115);

    for (const system of enterpriseCatalog) {
      const sections = getPublishedSolutionSectionsForSystem(system.slug);
      expect(JSON.parse(JSON.stringify(sections))).toEqual(sections);
      expect(
        renderToStaticMarkup(createElement(SystemSolutionsTab, { sections })),
      ).toBe("");
    }
  });

  it("keeps the registry server-side and crosses RSC with public DTOs only", async () => {
    const pageSource = await readSource("src/app/kit-operationnel/[slug]/page.tsx");
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");
    const solutionsSource = await readSource("src/components/SystemSolutionsTab.tsx");

    expect(pageSource).toContain(
      'import { getPublishedSolutionSectionsForSystem } from "@/lib/solution-registry.server"',
    );
    expect(pageSource).toContain("solutionSections={solutionSections}");
    expect(detailSource).not.toMatch(/solution-registry\.(?:server|contract)/);
    expect(solutionsSource).toContain("import type {");
    expect(solutionsSource).toContain('from "@/lib/solution-registry-dto"');
    expect(solutionsSource).not.toMatch(/solution-registry\.(?:server|contract)/);
    expect(solutionsSource).not.toMatch(/SystemEcosystem|system-ecosystem/);
  });

  it("preserves query reset and keyboard focus contracts", async () => {
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");

    expect(detailSource).toContain('url.searchParams.set("tab", tab)');
    expect(detailSource).toContain('url.searchParams.delete("service")');
    expect(detailSource).toContain("getNextSystemDetailTab(currentTab, event.key)");
    expect(detailSource).toContain("requestAnimationFrame");
    expect(detailSource).toContain("?.focus()");
    expect(detailSource).toContain('activeTab === "solutions"');
    expect(detailSource).not.toMatch(/activeTab === "(?:outils|ecosysteme)"/);
  });

  it("reuses the accessible modal lifecycle and resets selection on close", async () => {
    const solutionsSource = await readSource("src/components/SystemSolutionsTab.tsx");
    const dialogSource = await readSource("src/components/DirectoryDetailDialogShell.tsx");
    const hookSource = await readSource("src/components/useAccessibleDialog.ts");

    expect(solutionsSource).toContain("DirectoryDetailDialogShell");
    expect(solutionsSource).toContain("setSelected(null)");
    expect(dialogSource).toContain("useAccessibleDialog({ onClose })");
    expect(dialogSource).toContain("data-dialog-initial-focus");
    expect(hookSource).toContain('event.key === "Escape"');
    expect(hookSource).toContain('event.key !== "Tab"');
    expect(hookSource).toContain("previouslyFocused?.focus()");
  });

  it("keeps the D012 rail constrained without page-level horizontal overflow", async () => {
    const source = await readSource("src/components/SystemSolutionsTab.tsx");

    expect(source).toContain("max-w-full");
    expect(source).toContain("min-w-0");
    expect(source).toContain("overflow-x-auto");
    expect(source).toContain("overscroll-x-contain");
    expect(source).toContain("auto-cols-[82%]");
    expect(source).toContain("md:auto-cols-[calc((100%_-_2rem)_/_3)]");
  });
});

import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  enterpriseCatalogBySlug,
  enterpriseToSystem,
} from "@/lib/enterprise-annuaire";
import { buildOperationalSystemPageDetail } from "@/lib/system-detail-page";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("system navigation performance contract", () => {
  it("builds the public system page without resolving the tool directory", () => {
    const enterprise = enterpriseCatalogBySlug.batiment;
    const system = enterpriseToSystem(enterprise);
    const detail = buildOperationalSystemPageDetail(system, enterprise);

    expect(detail.systeme).not.toBeNull();
    expect(detail.sectorLabel).toBe(enterprise.sectorLabel);
    expect(detail.tools).toEqual([]);
  });

  it("deduplicates the system page lookup and keeps tool loading outside the page loader", async () => {
    const source = await readSource("src/lib/system-detail-page.ts");

    expect(source).toContain('import { cache } from "react"');
    expect(source).toContain("unstable_cache(");
    expect(source).toContain("buildOperationalSystemPageDetail(system, enterprise)");
    expect(source).not.toContain("buildOperationalSystemDetail(system)");
    expect(source).not.toContain("getUnifiedToolDirectory");
  });

  it("lets Next prefetch system cards and provides a deterministic return link", async () => {
    const searchSource = await readSource("src/components/SystemSearchHero.tsx");
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");

    expect(searchSource).not.toContain("prefetch={false}");
    expect(searchSource).not.toContain("useLinkStatus");
    expect(searchSource).not.toContain("SystemDirectoryCardPendingOverlay");
    expect(detailSource).toMatch(/<Link\s+href="\/solutions"/);
    expect(detailSource).toContain("Retour aux solutions");
    expect(detailSource).not.toContain("router.back()");
  });

  it("uses the validated Solutions wording on the directory", async () => {
    const [pageSource, searchSource] = await Promise.all([
      readSource("src/app/(marketing)/solutions/page.tsx"),
      readSource("src/components/SystemSearchHero.tsx"),
    ]);

    expect(pageSource).toContain(
      "Solutions adaptées à votre activité | Demaa",
    );
    expect(searchSource).toContain(
      'aria-label="Trouvez les solutions adaptées à votre activité"',
    );
    expect(searchSource).toContain(
      '<h2 className="text-xl font-light tracking-tight text-brand-blue/85 sm:text-2xl">',
    );
    expect(searchSource).not.toContain("système opérationnel");
  });
});

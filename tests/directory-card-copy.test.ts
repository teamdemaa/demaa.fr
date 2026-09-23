import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("directory card copy", () => {
  it("describes suppliers as independent references without a partnership flag", async () => {
    const [catalog, detail] = await Promise.all([
      readSource("src/lib/supplier-catalog.ts"),
      readSource("src/components/SupplierDetailContent.tsx"),
    ]);
    expect(catalog).not.toContain("partner?: boolean");
    expect(detail).toContain("référencement indépendant, sans accord commercial avec Demaa");
    expect(detail).not.toContain("supplier.partner");
  });

  it("keeps one explanatory paragraph on tool, supplier and network cards", async () => {
    const [toolSource, supplierSource, networkSource] = await Promise.all([
      readSource("src/components/ToolDirectoryClient.tsx"),
      readSource("src/components/SupplierDirectoryClient.tsx"),
      readSource("src/components/ProNetworkDirectoryClient.tsx"),
    ]);

    expect(toolSource).not.toMatch(
      /<p[^>]*text-brand-blue\/65[^>]*>\s*\{tool\.bestFor\}/,
    );
    expect(supplierSource).not.toMatch(
      /<p[^>]*text-brand-blue\/65[^>]*>\s*\{supplier\.bestFor\}/,
    );
    expect(networkSource).not.toMatch(
      /<p[^>]*text-brand-blue\/65[^>]*>\s*\{network\.bestFor\}/,
    );
  });

  it("labels complementary guidance in detail views", async () => {
    const detailSources = await Promise.all(
      [
        "SupplierDetailContent.tsx",
        "ProNetworkDetailContent.tsx",
        "FinanceDetailContent.tsx",
        "AidDetailContent.tsx",
        "RecruitmentDetailContent.tsx",
        "TrainingDetailContent.tsx",
        "SoftwareDetailContent.tsx",
      ].map((file) => readSource(`src/components/${file}`)),
    );

    for (const source of detailSources) {
      expect(source).toContain("Idéal pour");
    }
  });
});

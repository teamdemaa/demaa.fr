import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("public route integrity", () => {
  it("keeps every sector hub link on an active public route", async () => {
    const [sectorPages, validator] = await Promise.all([
      readSource("src/lib/sector-pages.ts"),
      readSource("scripts/validate-sector-editorial-links.mjs"),
    ]);

    expect(sectorPages).not.toContain('href: "/annuaire-services"');
    expect(sectorPages).not.toContain('href: "/organisation"');
    expect(sectorPages).not.toContain('href: "/structuration"');
    expect(sectorPages).toContain('href: "/services"');
    expect(validator).toContain('"/services"');
    expect(validator).not.toContain('"/organisation"');
  });

  it("publishes the active Services index in the sitemap", async () => {
    const sitemap = await readSource("src/app/sitemap.ts");

    expect(sitemap).toContain('`${base}/services`');
  });

  it("does not reintroduce the retired callback flow", async () => {
    const systemContract = await readSource("tests/system-ux-contract.test.ts");

    expect(systemContract).toContain("OrganisationCallbackRequestButton");
    await expect(
      readSource("src/components/OrganisationCallbackRequestButton.tsx"),
    ).rejects.toThrow();
    await expect(
      readSource("src/app/api/organisation-callback-request/route.ts"),
    ).rejects.toThrow();
  });
});

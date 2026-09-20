import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

describe("SINI near-white background", () => {
  it("keeps a single near-white tint across the three public journeys", async () => {
    const [styles, navbar, tabs, reprise, vendre, conseil, detail] = await Promise.all([
      source("../src/app/globals.css"),
      source("../src/components/Navbar.tsx"),
      source("../src/components/PublicActionPlanNavigation.tsx"),
      source("../src/components/RepriseMarketplaceClient.tsx"),
      source("../src/components/BusinessSaleLandingPage.tsx"),
      source("../src/app/apercu-sini/conseil/page.tsx"),
      source("../src/app/apercu-sini/conseil/[slug]/page.tsx"),
    ]);

    expect(styles).toContain("--color-sini-background: #ffffff");
    expect(navbar).toContain("bg-sini-background/95");
    expect(tabs).toContain("bg-sini-background p-1");
    expect(tabs).toContain("bg-[#dce8f1]/30");
    for (const page of [reprise, vendre, conseil, detail]) {
      expect(page).toContain("bg-sini-background");
    }
    expect(reprise).toContain("bg-dema-forest");
  });
});

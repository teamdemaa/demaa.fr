import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { DEMAA_HOME_DESCRIPTION, DEMAA_HOME_TITLE } from "@/lib/demaa-positioning";

const readSource = (path: string) => readFile(
  new URL(`../${path}`, import.meta.url),
  "utf8",
);

describe("Demaa positioning", () => {
  it("keeps inherited demaa copy separate from the sini layout and homepage", async () => {
    const [layout, homePage] = await Promise.all([
      readSource("src/app/layout.tsx"),
      readSource("src/app/(application)/page.tsx"),
    ]);

    expect(DEMAA_HOME_TITLE).toBe(
      "Demaa : reprendre ou vendre une PME de services",
    );
    expect(DEMAA_HOME_DESCRIPTION).toBe(
      "Découvrez des PME de services à reprendre ou présentez gratuitement votre entreprise à des repreneurs.",
    );
    expect(layout).toContain('const siteTitle = "sini — reprendre ou vendre une entreprise"');
    expect(layout).not.toContain("title: DEMAA_HOME_TITLE");
    expect(homePage).toContain('title: "Entreprises à reprendre | sini"');
    expect(homePage).toContain('robots: { index: false, follow: false }');
    expect(homePage).not.toContain("Un plan d’action concret pour votre entreprise");
  });
});

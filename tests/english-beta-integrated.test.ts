import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("English beta integrated release boundaries", () => {
  it("keeps English social metadata English across the localized route group", () => {
    const layout = source("src/app/(english)/en/layout.tsx");
    const page = source("src/app/(english)/en/page.tsx");
    const copy = source("src/lib/english-beta-metadata.ts");

    expect(copy).toContain("Build a business that depends less on you");
    expect(copy).toContain("Clarify your priorities");
    expect(layout).toContain("ENGLISH_BETA_TITLE");
    expect(layout).toContain("ENGLISH_BETA_DESCRIPTION");
    expect(layout).toContain('url: "/twitter-image"');
    expect(layout).toContain("robots: { follow: false, index: false }");
    expect(page).toContain('canonical: "/en"');
    expect(page).toContain('languages: { fr: "/", en: "/en" }');
    expect(copy).not.toContain("Structurez votre entreprise");
  });

  it("keeps Opportunities on public discovery surfaces, still excluded from English Beta", () => {
    const page = source("src/app/(marketing)/opportunites/page.tsx");
    const footer = source("src/components/Footer.tsx");
    const sitemap = source("src/app/sitemap.ts");

    expect(page).toContain("<PublicOpportunitiesClient");
    expect(page).not.toMatch(/robots:\s*{\s*index:\s*false,\s*follow:\s*true\s*}/);
    expect(footer).toContain('href: "/opportunites"');
    expect(sitemap).toContain("`${base}/opportunites`");
  });
});

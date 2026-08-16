import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("hidden English beta foundation", () => {
  it("keeps /en server-flagged and out of indexing before product activation", () => {
    const page = source("src/app/(english)/en/page.tsx");
    expect(page).toContain("isEnglishBetaEnabled()");
    expect(page).toContain("notFound()");
    expect(page).toContain("robots: { follow: false, index: false }");
    expect(page).toContain('canonical: "/en"');
    expect(page).toContain("resolveRequestInternationalContext({ pathname: \"/en\" })");
    expect(page).toContain("<DocumentLocale localeCode={context.localeCode}");
    expect(page).toContain("document.documentElement.lang=");
  });

  it("uses dictionaries and shared international contracts instead of copied behavior", () => {
    const page = source("src/app/(english)/en/page.tsx");
    const dictionaries = source("src/lib/i18n/dictionaries.ts");
    expect(page).toContain("getInterfaceDictionary(context.localeCode)");
    expect(dictionaries).toContain("InterfaceLocaleCode");
    expect(dictionaries).toContain("What’s holding your business back?");
    expect(page).not.toContain("ActionPlanExperience");
  });
});

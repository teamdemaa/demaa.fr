import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAcademyUiCopy } from "@/lib/academy-ui-copy";

const AUDITED_COMPONENTS = [
  "AcademyIndexClient.tsx",
  "AcademyCoursePlayer.tsx",
  "ActionPlanAcademyPanel.tsx",
] as const;

describe("Academy UI copy", () => {
  it("keeps index, player, panel and diagram labels complete in both locales", () => {
    const fr = getAcademyUiCopy("fr");
    const en = getAcademyUiCopy("en");

    expect(Object.keys(fr.index)).toEqual(Object.keys(en.index));
    expect(Object.keys(fr.player)).toEqual(Object.keys(en.player));
    expect(Object.keys(fr.panel)).toEqual(Object.keys(en.panel));
    expect(Object.keys(fr.diagram)).toEqual(Object.keys(en.diagram));
    expect(en.player.back).toBe("Back to the Academy");
    expect(en.diagram.revenue).toBe("REVENUE");
  });

  it("keeps visible bilingual literals out of shared Academy components", () => {
    for (const fileName of AUDITED_COMPONENTS) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "src", "components", fileName),
        "utf8",
      );
      const sourceWithoutLocalizedRoutes = source
        .replaceAll('localeCode === "en" ? "/en?view=academy" : "/academie"', "")
        .replace(
          'localeCode === "en" ? `/en?view=academy&academy=${identity.slug}` : `/academie/${identity.slug}`',
          "",
        );
      expect(source, fileName).toContain("getAcademyUiCopy");
      expect(sourceWithoutLocalizedRoutes, fileName).not.toMatch(
        /localeCode\s*===\s*["']en["']\s*\?\s*["']/,
      );
    }
  });
});

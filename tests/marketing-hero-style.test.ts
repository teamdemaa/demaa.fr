import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("marketing hero typography", () => {
  it("uses one Satoshi color and size across the three main headers", () => {
    expect(satoshiHeroTitleClassName).toContain("text-[clamp(2.7rem,6vw,5rem)]");
    expect(satoshiHeroTitleClassName).toContain("text-brand-blue/62");

    for (const path of [
      "src/components/ActionPlanHeroTitle.tsx",
      "src/components/ApplicationMetierLandingPage.tsx",
      "src/components/MentoratAutomationLandingPage.tsx",
    ]) {
      expect(source(path)).toContain("satoshiHeroTitleClassName");
    }
  });
});

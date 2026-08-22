import { describe, expect, it } from "vitest";

import {
  getRecommendedAidsForSystem,
  resolveAidRecommendationsForSystem,
} from "@/lib/aid-recommendations";
import {
  getRecommendedFinanceForSystem,
  resolveFinanceRecommendationsForSystem,
} from "@/lib/finance-recommendations";

describe("solution recommendation provenance", () => {
  it("exposes finance fallback provenance without changing the current cards", () => {
    const explicit = resolveFinanceRecommendationsForSystem("saas");
    const fallback = resolveFinanceRecommendationsForSystem("agence-web");

    expect(explicit.source).toBe("system");
    expect(fallback.source).toBe("default");
    expect(explicit.items).toEqual(getRecommendedFinanceForSystem("saas"));
    expect(fallback.items).toEqual(getRecommendedFinanceForSystem("agence-web"));
  });

  it("distinguishes system, sector and default aid selections", () => {
    const explicit = resolveAidRecommendationsForSystem("batiment", "BTP & services techniques");
    const sector = resolveAidRecommendationsForSystem("systeme-de-test", "BTP & services techniques");
    const fallback = resolveAidRecommendationsForSystem("systeme-de-test");

    expect(explicit.source).toBe("system");
    expect(sector.source).toBe("sector");
    expect(fallback.source).toBe("default");
    expect(explicit.items).toEqual(
      getRecommendedAidsForSystem("batiment", "BTP & services techniques"),
    );
  });
});

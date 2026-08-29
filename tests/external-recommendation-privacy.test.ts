import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getExternalRecommendationBySlug,
  getExternalRecommendationCatalog,
} from "@/lib/external-recommendation-catalog.server";
import { getCanonicalServices } from "@/lib/canonical-service-catalog";

describe("external recommendation catalog", () => {
  it("keeps the public assistant and private legal reinforcement recommendable", () => {
    const catalog = getExternalRecommendationCatalog();
    expect(catalog.map((item) => item.slug)).toEqual([
      "assistance-administrative",
      "sous-traitance-formalites-juridiques",
    ]);
    expect(catalog).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: "assistance-administrative", active: true, visibility: "public" }),
      expect.objectContaining({ slug: "sous-traitance-formalites-juridiques", active: true, visibility: "recommendation_only" }),
    ]));
    expect(getExternalRecommendationBySlug("formalites-entreprise")).toBeNull();
  });

  it("exposes only the promoted assistant through the public canonical catalog", () => {
    const serialized = JSON.stringify(getCanonicalServices());
    expect(serialized).toContain("assistance-administrative");
    expect(serialized).not.toContain("sous-traitance-formalites-juridiques");
    expect(serialized).toContain("formalites-entreprise");
  });

  it("keeps the private catalog out of public page and API modules", () => {
    const paths = [
      "src/app/(marketing)/services/[slug]/page.tsx",
      "src/lib/canonical-services-system-section.server.ts",
      "src/app/api/action-plan/system/[slug]/route.ts",
    ];
    for (const path of paths) {
      const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
      expect(source).not.toContain("external-recommendation-catalog");
    }
  });
});

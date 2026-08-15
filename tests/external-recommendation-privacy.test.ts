import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getExternalRecommendationBySlug,
  getExternalRecommendationCatalog,
} from "@/lib/external-recommendation-catalog.server";
import { getCanonicalServices } from "@/lib/canonical-service-catalog";

describe("private external recommendation catalog", () => {
  it("keeps exactly two active recommendation-only services", () => {
    const catalog = getExternalRecommendationCatalog();
    expect(catalog.map((item) => item.slug)).toEqual([
      "assistance-administrative",
      "sous-traitance-formalites-juridiques",
    ]);
    expect(catalog.every((item) => item.active && item.visibility === "recommendation_only")).toBe(true);
    expect(getExternalRecommendationBySlug("formalites-entreprise")).toBeNull();
  });

  it("never exposes a private slug through the public canonical catalog", () => {
    const serialized = JSON.stringify(getCanonicalServices());
    expect(serialized).not.toMatch(/assistance-administrative|sous-traitance-formalites-juridiques/);
    expect(serialized).toContain("formalites-entreprise");
  });

  it("keeps the private catalog out of public page and API modules", () => {
    const paths = [
      "src/app/services/page.tsx",
      "src/app/services/[slug]/page.tsx",
      "src/lib/canonical-services-system-section.server.ts",
      "src/app/api/action-plan/system/[slug]/route.ts",
    ];
    for (const path of paths) {
      const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
      expect(source).not.toContain("external-recommendation-catalog");
    }
  });
});

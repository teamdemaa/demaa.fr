import { describe, expect, it } from "vitest";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { ORGANISER_DECISION_GUIDE_SLUGS } from "@/lib/organiser-process-guides";
import { buildSystemeDetail } from "@/lib/systeme-catalog";
import {
  getOperationalOrganiserProcessGuides,
  getSystemProcessGuideDetails,
} from "@/lib/system-process-guide-details";

describe("contextual métier process guides", () => {
  it("maps the twelve operational guides to an existing métier routine", () => {
    const guides = getOperationalOrganiserProcessGuides();
    expect(guides).toHaveLength(12);

    for (const guide of guides) {
      const systemSlug = guide.processGuide?.system.slug;
      const enterprise = enterpriseCatalog.find(({ slug }) => slug === systemSlug);
      expect(enterprise, guide.identity.slug).toBeDefined();

      const routines = buildSystemeDetail(enterprise!)?.routines ?? [];
      const details = getSystemProcessGuideDetails(systemSlug!, routines);
      expect(
        details.some(({ slug }) => slug === guide.identity.slug),
        guide.identity.slug,
      ).toBe(true);
    }
  });

  it("keeps the three decision guides available but outside métier processes", () => {
    const operationalSlugs = new Set<string>(
      getOperationalOrganiserProcessGuides().map(({ identity }) => identity.slug),
    );

    expect(ORGANISER_DECISION_GUIDE_SLUGS).toHaveLength(3);
    for (const slug of ORGANISER_DECISION_GUIDE_SLUGS) {
      expect(operationalSlugs.has(slug)).toBe(false);
    }
  });

  it("returns no empty promise for a métier without a detailed guide", () => {
    const enterprise = enterpriseCatalog.find(({ slug }) => slug === "pharmacie");
    const routines = buildSystemeDetail(enterprise!)?.routines ?? [];
    expect(getSystemProcessGuideDetails("pharmacie", routines)).toEqual([]);
  });
});

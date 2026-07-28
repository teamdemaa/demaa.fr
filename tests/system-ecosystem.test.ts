import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildSystemEcosystemGroups } from "@/lib/system-ecosystem.server";
import { getSystemEcosystemResourceIdentity } from "@/lib/system-ecosystem-types";

const CASES = [
  {
    sectorLabel: "BTP & services techniques",
    systemSlug: "batiment",
  },
  {
    sectorLabel: "Restauration",
    systemSlug: "restaurant",
  },
  {
    sectorLabel: "Conseil & services aux entreprises",
    systemSlug: "agence-marketing",
  },
  {
    sectorLabel: "Santé, bien-être & esthétique",
    systemSlug: "pharmacie",
  },
  {
    sectorLabel: "Conseil & services aux entreprises",
    systemSlug: "assistant-administratif-externalise",
  },
] as const;

const EXPECTED_TITLES = new Set([
  "Gérer mes finances",
  "Sécuriser mon activité",
  "Recruter et protéger mon équipe",
  "Équiper mes chantiers",
]);

describe("system ecosystem", () => {
  it.each(CASES)(
    "builds named canonical resources for $systemSlug",
    async ({ sectorLabel, systemSlug }) => {
      const groups = await buildSystemEcosystemGroups({
        sectorLabel,
        systemSlug,
      });

      expect(groups.length).toBeGreaterThanOrEqual(3);
      expect(groups.every((group) => EXPECTED_TITLES.has(group.title))).toBe(
        true,
      );
      expect(groups.every((group) => group.resources.length > 0)).toBe(true);

      const identities = groups.flatMap((group) =>
        group.resources.map(getSystemEcosystemResourceIdentity),
      );
      expect(identities.every((resource) => resource.name.trim().length > 0)).toBe(
        true,
      );
      expect(
        identities.every((resource) => resource.slug.trim().length > 0),
      ).toBe(true);
      expect(
        identities.some(
          (resource) =>
            resource.type === "accounting" &&
            resource.slug === "em2a-expertise",
        ),
      ).toBe(true);
      expect(
        identities.some(
          (resource) =>
            resource.type === "service" &&
            resource.slug === "expert-comptable",
        ),
      ).toBe(false);
    },
  );

  it("reserves the chantier group for the BTP recommendations", async () => {
    const results = await Promise.all(
      CASES.map(async (item) => ({
        slug: item.systemSlug,
        groups: await buildSystemEcosystemGroups(item),
      })),
    );

    const batiment = results.find((result) => result.slug === "batiment");
    expect(
      batiment?.groups.find((group) => group.slug === "chantiers")?.resources
        .length,
    ).toBeGreaterThanOrEqual(3);

    for (const result of results.filter(
      (candidate) => candidate.slug !== "batiment",
    )) {
      expect(result.groups.some((group) => group.slug === "chantiers")).toBe(
        false,
      );
    }
  });
});

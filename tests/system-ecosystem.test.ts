import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import rawEnterpriseAnnuaire from "@/lib/enterprise-annuaire.json";
import { buildSystemEcosystemGroups } from "@/lib/system-ecosystem.server";
import {
  getSystemEcosystemResourceCtaLabel,
  getSystemEcosystemResourceIdentity,
} from "@/lib/system-ecosystem-types";

type EnterpriseAnnuairePayload = {
  enterprises: Array<{
    sectorLabel: string;
    slug: string;
  }>;
};

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

  it("uses contextual CTA labels without changing the canonical directories", () => {
    const enterprises = (rawEnterpriseAnnuaire as EnterpriseAnnuairePayload)
      .enterprises;
    const resources = enterprises.flatMap(({ sectorLabel, slug }) =>
      buildSystemEcosystemGroups({
        sectorLabel,
        systemSlug: slug,
      }).flatMap((group) => group.resources),
    );
    const contextualOverrides = new Set(
      resources.flatMap((resource) => {
        if (!("cta" in resource.item)) return [];

        const contextualCta = getSystemEcosystemResourceCtaLabel(resource);
        return contextualCta === resource.item.cta
          ? []
          : [`${resource.type}:${resource.item.slug}:${contextualCta}`];
      }),
    );

    expect(enterprises).toHaveLength(115);
    expect(contextualOverrides).toEqual(
      new Set([
        "finance:qonto:Découvrir la solution",
        "supplier:alan:Découvrir la solution",
        "supplier:orus:Découvrir la solution",
      ]),
    );
    expect(
      resources
        .filter((resource) => "cta" in resource.item)
        .every((resource) =>
          Boolean(getSystemEcosystemResourceCtaLabel(resource)?.trim()),
        ),
    ).toBe(true);

    const qonto = resources.find(
      (resource) =>
        resource.type === "finance" && resource.item.slug === "qonto",
    );
    if (!qonto || qonto.type !== "finance") {
      throw new Error("La ressource Qonto est absente de l’Écosystème.");
    }

    expect(qonto.item.cta).toBe("Voir le financement");
    expect(
      getSystemEcosystemResourceCtaLabel(qonto),
    ).toBe("Découvrir la solution");
  });
});

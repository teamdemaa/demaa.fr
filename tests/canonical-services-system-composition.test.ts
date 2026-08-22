import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  composeCanonicalServicesForSystem,
  composePublicSolutionSectionsForSystem,
  getCanonicalServiceSlugsForSystem,
} from "@/lib/canonical-services-system-section.server";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getRecommendedAidsForSystem } from "@/lib/aid-recommendations";
import { getRecommendedFinanceForSystem } from "@/lib/finance-recommendations";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";

const sectionsWithLegacyReferral = [
  {
    section: "software",
    placements: [{
      placementId: "firebase:test:tool",
      systemSlug: "cabinet-comptable",
      rank: 1,
      section: "software",
      usage: "Piloter",
      fitRationale: "Outil sélectionné",
      fitConstraints: [],
      resource: {
        resourceSlug: "pennylane",
        resourceType: "software",
        name: "Pennylane",
        description: "Logiciel de gestion.",
        interaction: { interactionMode: "external_link", href: "https://www.pennylane.com/" },
      },
    }],
  },
  {
    section: "services",
    placements: [{
      placementId: "firebase:test:chartered-accountant",
      systemSlug: "cabinet-comptable",
      rank: 1,
      section: "services",
      usage: "Trouver un expert-comptable",
      fitRationale: "Ancien placement universel",
      fitConstraints: [],
      resource: {
        resourceSlug: "chartered-accountant",
        resourceType: "expertise",
        name: "Expert-comptable",
        description: "Ancien referral.",
        interaction: { interactionMode: "referral_form", referralKey: "chartered-accountant" },
      },
    }],
  },
  {
    section: "providers",
    placements: [
      {
        placementId: "firebase:test:provider",
        systemSlug: "cabinet-comptable",
        rank: 1,
        section: "providers",
        usage: "Fournir",
        fitRationale: "Fournisseur sélectionné",
        fitConstraints: [],
        resource: {
          resourceSlug: "provider-test",
          resourceType: "provider",
          name: "Fournisseur Test",
          description: "Fournisseur.",
          interaction: { interactionMode: "external_link", href: "https://example.com/" },
        },
      },
      {
        placementId: "firebase:test:juridi",
        systemSlug: "cabinet-comptable",
        rank: 2,
        section: "providers",
        usage: "Déléguer les formalités juridiques",
        fitRationale: "Ancienne carte fournisseur désormais remplacée par le service canonique.",
        fitConstraints: [],
        resource: {
          resourceSlug: "juridi-consulting",
          resourceType: "provider",
          name: "JuridiConsulting",
          description: "Formalités juridiques.",
          interaction: { interactionMode: "external_link", href: "https://example.com/juridi" },
        },
      },
    ],
  },
] as const satisfies readonly RenderableSolutionSectionDto[];

describe("canonical Services composition in every system", () => {
  it("composes the eligible canonical services for all 115 systems", () => {
    expect(enterpriseCatalog).toHaveLength(115);

    for (const system of enterpriseCatalog) {
      const sections = composeCanonicalServicesForSystem(system.slug, []);
      const services = sections.find(({ section }) => section === "services");
      const expectedSlugs = getCanonicalServiceSlugsForSystem(system.slug);

      expect(services?.placements.map(({ resource }) => resource.resourceSlug))
        .toEqual(expectedSlugs);
      expect(services?.placements).toHaveLength(expectedSlugs.length);
      expect(services?.placements.every(({ placementId }) =>
        placementId.startsWith(`render:${system.slug}:service:`)
      )).toBe(true);
      expect(services?.placements.every(({ resource }) =>
        resource.interaction.interactionMode === "detail" &&
        resource.interaction.href ===
          `${resource.resourceSlug === "application-metier" ? "/sur-mesure" : `/services/${resource.resourceSlug}`}?systemSlug=${system.slug}&source=solutions-systeme`
      )).toBe(true);
      expect(services?.placements.every(({ resource }) =>
        resource.indicativePricing === undefined
      )).toBe(true);
      expect(services?.placements.every(({ resource }) =>
        resource.displayCategory !== "Service Demaa"
      )).toBe(true);
    }
  });

  it("applies the explicit eligibility matrix to regulated professions", () => {
    expect(getCanonicalServiceSlugsForSystem("restaurant")).toEqual([
      "automatisation-processus",
      "application-metier",
      "coach-business",
      "assistance-administrative",
      "formalites-entreprise",
      "gestion-reseaux-sociaux",
      "publicite-en-ligne",
      "prospection-ciblee",
      "recruter-un-alternant",
    ]);
    expect(getCanonicalServiceSlugsForSystem("cabinet-comptable")).toEqual([
      "automatisation-processus",
      "application-metier",
      "coach-business",
      "assistance-administrative",
      "gestion-reseaux-sociaux",
      "publicite-en-ligne",
      "prospection-ciblee",
      "recruter-un-alternant",
    ]);
    expect(getCanonicalServiceSlugsForSystem("cabinet-davocat")).toEqual([
      "automatisation-processus",
      "application-metier",
      "coach-business",
      "assistance-administrative",
      "gestion-reseaux-sociaux",
      "publicite-en-ligne",
      "prospection-ciblee",
      "recruter-un-alternant",
    ]);
    expect(getCanonicalServiceSlugsForSystem("notaire")).toEqual([
      "automatisation-processus",
      "application-metier",
      "coach-business",
      "assistance-administrative",
      "gestion-reseaux-sociaux",
      "publicite-en-ligne",
      "prospection-ciblee",
      "recruter-un-alternant",
    ]);
    expect(getCanonicalServiceSlugsForSystem("expert-comptable")).not.toContain("formalites-entreprise");
    expect(getCanonicalServiceSlugsForSystem("assistant-administratif-externalise")).not.toContain("assistance-administrative");
  });

  it("places relevant catalog sections in order without mutating registry data", () => {
    const inputSnapshot = structuredClone(sectionsWithLegacyReferral);
    const sections = composeCanonicalServicesForSystem(
      "cabinet-comptable",
      sectionsWithLegacyReferral,
    );

    expect(sections.map(({ section }) => section)).toEqual([
      "software",
      "services",
      "providers",
      "financing",
      "aids",
    ]);
    expect(sections.find(({ section }) => section === "financing")?.placements)
      .toHaveLength(getRecommendedFinanceForSystem("cabinet-comptable").length);
    expect(sections.find(({ section }) => section === "aids")?.placements.length)
      .toBe(getRecommendedAidsForSystem(
        "cabinet-comptable",
        "Conseil & services aux entreprises",
      ).length);
    expect(sectionsWithLegacyReferral).toEqual(inputSnapshot);
  });

  it("uses the existing recommendation engines instead of exposing whole catalogs", () => {
    for (const system of enterpriseCatalog) {
      const sections = composeCanonicalServicesForSystem(system.slug, []);
      const financing = sections.find(({ section }) => section === "financing");
      const aids = sections.find(({ section }) => section === "aids");

      expect(financing?.placements.map(({ resource }) => resource.resourceSlug))
        .toEqual(getRecommendedFinanceForSystem(system.slug).map(
          ({ slug }) => `financing-${slug}`,
        ));
      expect(aids?.placements.map(({ resource }) => resource.resourceSlug))
        .toEqual(getRecommendedAidsForSystem(system.slug, system.sectorLabel).map(
          ({ slug }) => `aid-${slug}`,
        ));
      expect(financing?.placements.length ?? 0).toBeLessThanOrEqual(8);
      expect(aids?.placements.length ?? 0).toBeLessThanOrEqual(6);
    }

    const restaurant = composeCanonicalServicesForSystem("restaurant", []);
    const saas = composeCanonicalServicesForSystem("saas", []);
    expect(restaurant.find(({ section }) => section === "aids"))
      .not.toEqual(saas.find(({ section }) => section === "aids"));
  });

  it("filters after composition so public payloads expose the validated ecosystem without legacy models", () => {
    const inputSnapshot = structuredClone(sectionsWithLegacyReferral);
    const sections = composePublicSolutionSectionsForSystem(
      "cabinet-comptable",
      sectionsWithLegacyReferral,
    );

    expect(sections.map(({ section }) => section)).toEqual([
      "software",
      "services",
      "providers",
      "financing",
      "aids",
    ]);
    expect(JSON.stringify(sections)).toContain("Fournisseur Test");
    expect(JSON.stringify(sections)).toContain("financing-");
    expect(JSON.stringify(sections)).toContain("aid-");
    expect(JSON.stringify(sections)).not.toMatch(/Réseaux professionnels|Anciens modèles/);
    expect(sectionsWithLegacyReferral).toEqual(inputSnapshot);
  });

  it("replaces legacy service placements and removes duplicate referrals on Cabinet comptable", () => {
    const sections = composeCanonicalServicesForSystem(
      "cabinet-comptable",
      sectionsWithLegacyReferral,
    );
    const services = sections.find(({ section }) => section === "services");
    const serialized = JSON.stringify(services);

    expect(services?.placements.map(({ resource }) => resource.resourceSlug))
      .toEqual([
        "automatisation-processus",
        "application-metier",
        "coach-business",
        "assistance-administrative",
        "gestion-reseaux-sociaux",
        "publicite-en-ligne",
        "prospection-ciblee",
        "recruter-un-alternant",
      ]);
    expect(services?.placements.filter(({ resource }) =>
      resource.resourceSlug === "expert-comptable"
    )).toHaveLength(0);
    expect(serialized).not.toContain("chartered-accountant");
    expect(serialized).not.toContain("referral_form");
    expect(serialized).not.toContain("firebase:test");
    expect(sections.find(({ section }) => section === "providers")?.placements
      .map(({ resource }) => resource.resourceSlug)).toEqual(["provider-test"]);
  });
});

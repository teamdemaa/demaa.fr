import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { composeCanonicalServicesForSystem } from "@/lib/canonical-services-system-section.server";
import { CANONICAL_SERVICE_SLUGS } from "@/lib/canonical-service-catalog";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
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
    placements: [{
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
    }],
  },
] as const satisfies readonly RenderableSolutionSectionDto[];

describe("canonical Services composition in every system", () => {
  it("composes the four canonical services, except Expert-comptable on Cabinet comptable", () => {
    expect(enterpriseCatalog).toHaveLength(115);

    for (const system of enterpriseCatalog) {
      const sections = composeCanonicalServicesForSystem(system.slug, []);
      const services = sections.find(({ section }) => section === "services");
      const expectedSlugs = system.slug === "cabinet-comptable"
        ? CANONICAL_SERVICE_SLUGS.filter((slug) => slug !== "expert-comptable")
        : CANONICAL_SERVICE_SLUGS;

      expect(services?.placements.map(({ resource }) => resource.resourceSlug))
        .toEqual(expectedSlugs);
      expect(services?.placements).toHaveLength(expectedSlugs.length);
      expect(services?.placements.every(({ placementId }) =>
        placementId.startsWith(`render:${system.slug}:service:`)
      )).toBe(true);
      expect(services?.placements.every(({ resource }) =>
        resource.interaction.interactionMode === "detail" &&
        resource.interaction.href ===
          `/services/${resource.resourceSlug}?systemSlug=${system.slug}&source=solutions-systeme`
      )).toBe(true);
      expect(services?.placements.every(({ resource }) =>
        resource.displayCategory !== "Service Demaa"
      )).toBe(true);
    }
  });

  it("places Services between Outils and Fournisseurs without mutating registry data", () => {
    const inputSnapshot = structuredClone(sectionsWithLegacyReferral);
    const sections = composeCanonicalServicesForSystem(
      "cabinet-comptable",
      sectionsWithLegacyReferral,
    );

    expect(sections.map(({ section }) => section)).toEqual([
      "software",
      "services",
      "providers",
    ]);
    expect(sectionsWithLegacyReferral).toEqual(inputSnapshot);
  });

  it("replaces legacy service placements and removes the expert referral on Cabinet comptable", () => {
    const sections = composeCanonicalServicesForSystem(
      "cabinet-comptable",
      sectionsWithLegacyReferral,
    );
    const services = sections.find(({ section }) => section === "services");
    const serialized = JSON.stringify(services);

    expect(services?.placements.map(({ resource }) => resource.resourceSlug))
      .toEqual([
        "automatisation-processus",
        "marketing-vente",
        "assistance-facturation",
      ]);
    expect(services?.placements.filter(({ resource }) =>
      resource.resourceSlug === "expert-comptable"
    )).toHaveLength(0);
    expect(serialized).not.toContain("chartered-accountant");
    expect(serialized).not.toContain("referral_form");
    expect(serialized).not.toContain("firebase:test");
  });
});

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  FAMILY_SOLUTION_SENTINEL_SLUGS,
  FAMILY_SOLUTION_SOURCE_HASHES,
  getFamilySolutionGaps,
  getFamilySystemSolutionSelection,
  resolveFamilySolutionCatalogSelection,
} from "@/lib/family-solution-selections.server";
import { getRenderableSolutionSectionsForSystem } from "@/lib/system-solutions-ui.server";

const PILOTS = ["agence-marketing", "batiment", "cabinet-comptable"] as const;

describe("family solution selections", () => {
  it("owns every non-pilot system exactly once with the sealed source hashes", () => {
    expect(FAMILY_SOLUTION_SOURCE_HASHES).toEqual({
      operations: "d47ae9197882ba4267e2fc5121c920faf3093cd2ca8ccb2c2602137071b1da09",
      people: "ec80e39c7b615f5910472c1a93e7da82971d4b827653ab63c210f4b369554131",
      peopleSupplement: "847aa441baef38b135adae13359be42357a88858514058f052f1a399a745e2df",
      knowledge: "e0e5b1806fe94a8f17ae01f373d347e833c67c277b7a6422eaf5d3a3a49eab18",
    });
    const owned = enterpriseCatalog.filter(({ slug }) => !PILOTS.includes(slug as never));
    expect(owned).toHaveLength(112);
    expect(owned.every(({ slug }) => getFamilySystemSolutionSelection(slug) !== null)).toBe(true);
    expect(PILOTS.every((slug) => getFamilySystemSolutionSelection(slug) === null)).toBe(true);
    expect(FAMILY_SOLUTION_SENTINEL_SLUGS).toHaveLength(5);
  });

  it("keeps ranks bounded, exclusions inactive and third parties private drafts", () => {
    const systems = enterpriseCatalog.flatMap(({ slug }) => {
      const system = getFamilySystemSolutionSelection(slug);
      return system ? [system] : [];
    });
    const placements = systems.flatMap(({ placements }) => placements);

    expect(placements).toHaveLength(517);
    expect(placements.filter(({ resourceSlug }) => resourceSlug === "levier")).toHaveLength(81);
    for (const system of systems) {
      for (const section of ["software", "providers"] as const) {
        const sectionPlacements = system.placements.filter((item) => item.section === section);
        expect(sectionPlacements.length).toBeLessThanOrEqual(5);
        expect(new Set(sectionPlacements.map(({ rank }) => rank)).size).toBe(sectionPlacements.length);
      }
      expect(system.placements.some(({ resourceSlug }) =>
        system.excludedResourceSlugs.includes(resourceSlug)
      )).toBe(false);
    }
    for (const placement of placements.filter(({ resourceSlug }) => resourceSlug !== "levier")) {
      expect(placement).toMatchObject({
        status: "draft",
        commercialRelationship: "unknown",
        publicationBlockers: ["commercial-relationship-unconfirmed"],
        interactionMode: "external_link",
      });
      expect(resolveFamilySolutionCatalogSelection(placement)).not.toBeNull();
    }
  });

  it("excludes unsupported resources and fails closed when a catalog URL drifts", () => {
    const gaps = getFamilySolutionGaps();
    expect(gaps).toHaveLength(38);
    expect([...new Set(gaps.map(({ resourceSlug }) => resourceSlug))].sort()).toEqual([
      "aipr-chantier",
      "airbnb",
      "anacofi-presentiels-patrimoine",
      "booking-com",
      "caces-logistique-manutention",
      "cybersecurite-bpifrance-universite",
      "documents-obligations-rgpd",
      "formation-benevoles-associations-gouv",
      "habilitation-electrique-b0-h0v",
      "haccp-hygiene-alimentaire",
      "permis-exploitation",
      "secourisme-sst",
    ]);

    const medical = getFamilySystemSolutionSelection("cabinet-medical");
    const doctolib = medical?.placements.find(({ resourceSlug }) => resourceSlug === "doctolib");
    expect(doctolib).toBeDefined();
    expect(resolveFamilySolutionCatalogSelection(doctolib!)).toMatchObject({
      href: "https://info.doctolib.fr/chirurgien-dentiste/",
    });
    expect(resolveFamilySolutionCatalogSelection({
      ...doctolib!,
      catalogDestination: "https://example.invalid/",
    })).toBeNull();
  });

  it("keeps every public field of all 517 family placements free of relationship claims", () => {
    const forbiddenPublicClaims = /demaa|odema|partenaire|partenariat|affilié|affiliation|rémunéré/i;
    const placements = enterpriseCatalog.flatMap(({ slug }) =>
      getFamilySystemSolutionSelection(slug)
        ? getRenderableSolutionSectionsForSystem(slug).flatMap(({ placements }) => placements)
        : []
    );

    expect(placements).toHaveLength(517);
    const violations = placements.flatMap((placement) =>
      forbiddenPublicClaims.test(JSON.stringify(placement))
        ? [`${placement.systemSlug}:${placement.resource.resourceSlug}`]
        : []
    );
    expect(violations).toEqual([]);

    const coworking = getFamilySystemSolutionSelection("centre-affaires-coworking");
    expect(coworking?.placements.find(({ resourceSlug }) => resourceSlug === "cci-locale")
      ?.checksBeforeChoosing).toContain(
        "Vérifier les services réellement proposés par votre CCI locale.",
      );
    const investment = getFamilySystemSolutionSelection("investissement-immobilier");
    expect(investment?.placements.find(({ resourceSlug }) => resourceSlug === "notaires")
      ?.checksBeforeChoosing).toContain(
        "Vérifier les compétences et les modalités d’accompagnement de l’étude notariale choisie.",
      );
  });
});

import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getFamilySystemSolutionSelection } from "@/lib/family-solution-selections.server";
import {
  LEVIER_SOLUTION_PLACEMENTS,
  LEVIER_SOLUTION_RESOURCE,
} from "@/lib/levier-solution-registry.server";
import {
  PILOT_SOLUTION_DRAFT_PLACEMENTS,
  PILOT_SOLUTION_DRAFT_RESOURCES,
  PILOT_SOLUTION_UNMET_NEEDS,
} from "@/lib/pilot-solution-registry-drafts.server";
import { getDemaaProNetworkBySlug } from "@/lib/pro-network-catalog";
import {
  getPublishedSolutionPlacementsForSystem,
  getPublishedSolutionResources,
  getPublishedSolutionSectionsForSystem,
} from "@/lib/solution-registry.server";
import { validateSolutionRegistries } from "@/lib/solution-registry-contract";
import { getDemaaSupplierBySlug } from "@/lib/supplier-catalog";
import { getToolDirectoryItemBySlug } from "@/lib/tool-directory";
import {
  getPublishedRenderableSolutionSectionsForSystem,
  getRenderableSolutionSectionsForSystem,
} from "@/lib/system-solutions-ui.server";

const now = new Date("2026-08-05T12:00:00.000Z");
const expectedResourceSlugs = [
  "obat",
  "costructor",
  "progbat",
  "vertuoza",
  "fieldwire",
  "graneet",
  "point-p",
  "plateforme-du-batiment",
  "kiloutou",
  "wurth",
  "capeb",
  "tiimora",
  "pennylane",
  "silae",
  "ordre-experts-comptables",
  "croec-regional",
  "airtable",
  "canva",
  "brevo",
  "metricool",
  "chatgpt",
] as const;

function filesBelow(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? filesBelow(path) : [path];
  });
}

describe("three-pilot draft Solutions registry", () => {
  it("stores the reviewed resources, placements and unmet needs without inventing slugs", () => {
    expect(PILOT_SOLUTION_DRAFT_RESOURCES.map(({ resourceSlug }) => resourceSlug))
      .toEqual(expectedResourceSlugs);
    expect(PILOT_SOLUTION_DRAFT_PLACEMENTS).toHaveLength(19);
    expect(PILOT_SOLUTION_DRAFT_PLACEMENTS.map(({ systemSlug }) => systemSlug))
      .toEqual([
        "batiment", "batiment", "batiment", "batiment", "batiment", "batiment", "batiment", "batiment", "batiment",
        "cabinet-comptable", "cabinet-comptable", "cabinet-comptable", "cabinet-comptable", "cabinet-comptable",
        "agence-marketing", "agence-marketing", "agence-marketing", "agence-marketing", "agence-marketing",
      ]);
    expect(PILOT_SOLUTION_UNMET_NEEDS).toEqual([
      expect.objectContaining({
        needId: "need:batiment:reponse-appels-offres",
        resourceSlug: null,
        status: "unmet",
      }),
    ]);
    expect(PILOT_SOLUTION_UNMET_NEEDS.every((need) => (
      need.commercialRelationship === "unknown"
      && need.publicationBlockers.includes("commercial-relationship-unconfirmed")
      && need.publicationBlockers.includes("provider-unidentified")
    ))).toBe(true);
  });

  it("keeps every entry draft, evidenced, time-bounded and blocked fail-closed", () => {
    for (const resource of PILOT_SOLUTION_DRAFT_RESOURCES) {
      expect(resource.status).toBe("draft");
      expect(resource.evidence.length).toBeGreaterThan(0);
      expect(resource.evidence.every((entry) => (
        entry.evidenceType === "official_product_page"
        && entry.sourceRef.startsWith("https://")
        && Date.parse(entry.capturedAt) <= now.getTime()
      ))).toBe(true);
      expect(resource.reviewer).toBe("Master Demaa");
      expect(resource.reviewedAt).toBe("2026-08-05T00:01:00.000Z");
      expect(resource.expiresAt).toBe("2027-02-05T00:00:00.000Z");
      expect(resource.description.length).toBeGreaterThan(20);
      expect(resource.commercialRelationship).toBe("unknown");
      expect(resource.description).not.toMatch(/ODEMA|Demaa/i);
      expect(resource.publicationBlockers).toContain(
        "commercial-relationship-unconfirmed",
      );
    }

    for (const placement of PILOT_SOLUTION_DRAFT_PLACEMENTS) {
      const resource = PILOT_SOLUTION_DRAFT_RESOURCES.find(
        (candidate) => candidate.resourceSlug === placement.resourceSlug,
      );
      expect(resource).toBeDefined();
      expect(placement.status).toBe("draft");
      expect(placement.editorialStatus).toBe("selected");
      expect(placement.commercialRelationship).toBe(
        resource?.commercialRelationship,
      );
      expect(placement.usage.length).toBeGreaterThan(20);
      expect(placement.fitRationale.length).toBeGreaterThan(20);
      expect(placement.fitConstraints.length).toBeGreaterThan(0);
      expect(placement.publicationBlockers.length).toBeGreaterThan(0);
    }

    expect(validateSolutionRegistries({
      knownSystemSlugs: enterpriseCatalog.map(({ slug }) => slug),
      resources: [LEVIER_SOLUTION_RESOURCE, ...PILOT_SOLUTION_DRAFT_RESOURCES],
      placements: [
        ...LEVIER_SOLUTION_PLACEMENTS,
        ...PILOT_SOLUTION_DRAFT_PLACEMENTS,
      ],
    }, now)).toEqual([]);
  });

  it("keeps the three reviewed pilot orders contiguous and explicit", () => {
    const expectedBySystem = {
      batiment: ["obat", "costructor", "progbat", "vertuoza"],
      "cabinet-comptable": ["pennylane", "tiimora", "silae"],
      "agence-marketing": ["airtable", "canva", "brevo", "metricool", "chatgpt"],
    } as const;

    for (const [systemSlug, expected] of Object.entries(expectedBySystem)) {
      const placements = PILOT_SOLUTION_DRAFT_PLACEMENTS
        .filter((placement) => placement.systemSlug === systemSlug && placement.section === "software")
        .sort((a, b) => a.rank - b.rank);
      expect(placements.map(({ resourceSlug }) => resourceSlug)).toEqual(expected);
      expect(placements.map(({ rank }) => rank)).toEqual(
        placements.map((_, index) => index + 1),
      );
    }
  });

  it("resolves every draft resource to its catalog-backed official HTTPS destination", () => {
    for (const resource of PILOT_SOLUTION_DRAFT_RESOURCES) {
      expect(resource.interactionMode).toBe("external_link");
      if (resource.interactionMode !== "external_link") continue;
      expect(resource.href).toMatch(/^https:\/\//);

      if (resource.resourceType === "software") {
        expect(resource.href).toBe(getToolDirectoryItemBySlug(resource.resourceSlug)?.url);
      } else if (resource.resourceType === "provider") {
        expect(resource.href).toBe(getDemaaSupplierBySlug(resource.resourceSlug)?.href);
      } else {
        expect(resource.href).toBe(getDemaaProNetworkBySlug(resource.resourceSlug)?.href);
      }
    }
  });

  it("keeps drafts out of SEO/public selectors while exposing only sanitized pilot selections", () => {
    expect(getPublishedSolutionResources()).toEqual([
      expect.objectContaining({ resourceSlug: "levier" }),
      expect.objectContaining({
        resourceSlug: "juridi-consulting",
        interaction: {
          interactionMode: "referral_form",
          referralKey: "juridi-consulting",
        },
      }),
    ]);
    for (const system of enterpriseCatalog) {
      const placements = getPublishedSolutionPlacementsForSystem(system.slug);
      const hasJuridi = ["cabinet-comptable", "cabinet-davocat", "notaire"]
        .includes(system.slug);
      expect(placements).toHaveLength(hasJuridi ? 2 : 1);
      expect(placements).toContainEqual(expect.objectContaining({
        systemSlug: system.slug,
        rank: 1,
        section: "models",
        resource: expect.objectContaining({ resourceSlug: "levier" }),
      }));
      if (hasJuridi) {
        expect(placements).toContainEqual(expect.objectContaining({
          systemSlug: system.slug,
          rank: 1,
          section: "providers",
          resource: expect.objectContaining({ resourceSlug: "juridi-consulting" }),
        }));
      }
    }
    for (const systemSlug of ["batiment", "cabinet-comptable", "agence-marketing"]) {
      const serialized = JSON.stringify(
        getPublishedSolutionSectionsForSystem(systemSlug),
      );
      expect(serialized).toContain('"resourceSlug":"levier"');
      for (const slug of expectedResourceSlugs) {
        expect(serialized).not.toContain(`"resourceSlug":"${slug}"`);
      }
    }

    expect(getRenderableSolutionSectionsForSystem("batiment").map(({ placements }) =>
      placements.map(({ resource }) => resource.resourceSlug)
    )).toEqual([
      ["obat", "costructor", "progbat", "vertuoza"],
      ["point-p", "plateforme-du-batiment", "kiloutou", "wurth"],
      ["levier"],
      ["capeb"],
    ]);
    expect(getRenderableSolutionSectionsForSystem("cabinet-comptable").map(({ placements }) =>
      placements.map(({ resource }) => resource.resourceSlug)
    )).toEqual([
      ["pennylane", "tiimora", "silae"],
      ["juridi-consulting"],
      ["levier"],
      ["ordre-experts-comptables", "croec-regional"],
    ]);
    expect(getRenderableSolutionSectionsForSystem("agence-marketing").map(({ placements }) =>
      placements.map(({ resource }) => resource.resourceSlug)
    )).toEqual([["airtable", "canva", "brevo", "metricool", "chatgpt"], ["levier"]]);

    const pilotSlugs = new Set(["batiment", "cabinet-comptable", "agence-marketing"]);
    const familySystems = enterpriseCatalog.filter(({ slug }) => !pilotSlugs.has(slug));
    expect(familySystems).toHaveLength(112);
    for (const { slug } of familySystems) {
      const selection = getFamilySystemSolutionSelection(slug);
      expect(selection).not.toBeNull();
      const renderedSlugs = getRenderableSolutionSectionsForSystem(slug).flatMap(({ placements }) =>
        placements.map(({ resource }) => resource.resourceSlug)
      );
      expect(renderedSlugs).toContain("levier");
      const referralSlugs = ["cabinet-davocat", "notaire"].includes(slug)
        ? ["juridi-consulting"]
        : [];
      expect(new Set(renderedSlugs)).toEqual(
        new Set([
          ...(selection?.placements ?? [])
            .filter(({ resourceSlug, editorialStatus }) => (
              resourceSlug !== "levier" && editorialStatus === "selected"
            ))
            .map(({ resourceSlug }) => resourceSlug),
          ...referralSlugs,
          "levier",
        ]),
      );
    }

    for (const systemSlug of ["batiment", "cabinet-comptable", "agence-marketing"]) {
      const serializedUi = JSON.stringify(getRenderableSolutionSectionsForSystem(systemSlug));
      expect(serializedUi).not.toMatch(
        /commercialRelationship|editorialStatus|publicationBlockers|status|reviewer|reviewedAt|expiresAt|evidence|ODEMA|owned|affiliate|commercial_partner|paid_referral/i,
      );
      expect(getPublishedRenderableSolutionSectionsForSystem(systemSlug)[0]?.placements)
        .toHaveLength(1);
    }

    const clientFiles = [
      ...filesBelow(resolve(process.cwd(), "src/app")),
      ...filesBelow(resolve(process.cwd(), "src/components")),
    ].filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path));
    for (const path of clientFiles) {
      expect(readFileSync(path, "utf8")).not.toContain(
        "pilot-solution-registry-drafts",
      );
    }
  });
});

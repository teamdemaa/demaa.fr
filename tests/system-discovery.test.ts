import { describe, expect, it } from "vitest";
import { enterpriseCatalog, enterpriseToSystem } from "@/lib/enterprise-annuaire";
import {
  FUTURE_SYSTEM_CANDIDATES,
  SYSTEM_DISCOVERY_ENTRIES,
  getSystemDiscoveryOptionScore,
  getSystemDiscoveryScore,
} from "@/lib/system-discovery";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";

const systems = enterpriseCatalog.map((enterprise) => ({
  ...enterpriseToSystem(enterprise),
  sectorLabel: enterprise.sectorLabel,
}));

function rankedSlugs(query: string): string[] {
  return systems
    .map((system) => ({
      slug: system.slug,
      score: getSystemDiscoveryScore(system, query),
    }))
    .filter((result): result is { slug: string; score: number } => result.score !== null)
    .sort((left, right) => left.score - right.score || left.slug.localeCompare(right.slug, "fr"))
    .map((result) => result.slug);
}

function rankedActionPlanSlugs(query: string): string[] {
  return actionPlanSystemOptions
    .map((option) => ({
      slug: option.id,
      score: getSystemDiscoveryOptionScore(option, query),
    }))
    .filter((result): result is { slug: string; score: number } => result.score !== null)
    .sort((left, right) => left.score - right.score || left.slug.localeCompare(right.slug, "fr"))
    .map(({ slug }) => slug);
}

describe("system discovery content", () => {
  it("keeps the public catalog at 115 systems", () => {
    expect(systems).toHaveLength(115);
  });

  it("references only existing systems in the published pilot registry", () => {
    const existingSlugs = new Set(systems.map((system) => system.slug));

    for (const [key, entry] of Object.entries(SYSTEM_DISCOVERY_ENTRIES)) {
      expect(entry.systemSlug).toBe(key);
      expect(existingSlugs.has(entry.systemSlug)).toBe(true);
      expect(entry.terms.length).toBeGreaterThan(0);
      expect(entry.terms.every((term) => term.status === "published")).toBe(true);
    }
  });

  it("keeps a deterministic corpus of 200 to 300 published and draft queries", () => {
    const publishedQueries = Object.entries(SYSTEM_DISCOVERY_ENTRIES).flatMap(
      ([slug, entry]) => entry.terms.map((term) => ({ status: "published" as const, slug, term: term.value })),
    );
    const draftQueries = FUTURE_SYSTEM_CANDIDATES.flatMap((candidate) =>
      candidate.terms.map((term) => ({ status: "draft" as const, term })),
    );
    const corpus = [...publishedQueries, ...draftQueries];

    expect(corpus.length).toBeGreaterThanOrEqual(200);
    expect(corpus.length).toBeLessThanOrEqual(300);

    for (const query of corpus) {
      const results = rankedSlugs(query.term);

      if (query.status === "published") {
        expect(results, query.term).toContain(query.slug);
      } else {
        expect(results, query.term).toEqual([]);
      }
    }
  });

  it.each([
    ["chauffagiste", "plomberie-chauffage"],
    ["chaudières", "plomberie-chauffage"],
    ["charpentier", "couvreur"],
    ["étanchéité toiture", "couvreur"],
    ["ravalement", "renovation-interieur"],
    ["nettoyage de bureaux", "nettoyage-professionnel"],
    ["nettoyage après chantier", "nettoyage-professionnel"],
    ["élagueur", "paysagiste"],
    ["arrosage automatique", "paysagiste"],
    ["entretien de piscine", "pisciniste"],
    ["coursier", "livraison-dernier-kilometre"],
    ["transport frigorifique", "transport-de-marchandise"],
    ["taxi", "transport-de-personnes"],
    ["garage poids lourds", "garage-automobile"],
    ["mécanique mobile", "garage-automobile"],
  ])("ranks %s toward %s", (query, expectedSlug) => {
    expect(rankedSlugs(query)[0]).toBe(expectedSlug);
  });

  it("reuses published discovery vocabulary for activity selection without problem terms", () => {
    const vanActivity = actionPlanSystemOptions.find(
      (option) => option.id === "menuiserie-agencement",
    );
    const renovationActivity = actionPlanSystemOptions.find(
      (option) => option.id === "renovation-interieur",
    );

    expect(vanActivity?.aliases).toEqual(expect.arrayContaining([
      "van aménagé",
      "fourgon aménagé",
      "aménagement de vans",
      "véhicule de loisirs",
      "camping-car",
    ]));
    expect(renovationActivity?.aliases).not.toContain("rénovation énergétique");
    expect(rankedActionPlanSlugs("aménagement de vans")[0]).toBe(
      "menuiserie-agencement",
    );
    expect(rankedActionPlanSlugs("Cabinet comptable")[0]).toBe(
      "cabinet-comptable",
    );
  });

  it.each([
    "extincteurs",
    "désenfumage",
    "punaises de lit",
    "chambres froides",
    "réparation de nacelles",
  ])("does not publish the future-system term %s", (query) => {
    expect(rankedSlugs(query)).toEqual([]);
  });

  it("keeps every exact future-candidate term out of public results", () => {
    for (const candidate of FUTURE_SYSTEM_CANDIDATES) {
      for (const term of candidate.terms) {
        expect(rankedSlugs(term), `${candidate.candidateKey}: ${term}`).toEqual([]);
        expect(rankedActionPlanSlugs(term), `${candidate.candidateKey}: ${term}`).toEqual([]);
      }
    }
  });

  it("keeps future candidates explicitly draft", () => {
    expect(FUTURE_SYSTEM_CANDIDATES.length).toBeGreaterThanOrEqual(8);
    expect(FUTURE_SYSTEM_CANDIDATES.every((candidate) => candidate.status === "draft")).toBe(true);
  });

  it("provides a concise discovery summary for every system", () => {
    expect(systems.every((system) => system.shortDescription)).toBe(true);
    expect(new Set(systems.map((system) => system.shortDescription)).size).toBe(115);

    for (const system of systems) {
      expect(system.shortDescription?.length).toBeGreaterThanOrEqual(35);
      expect(system.shortDescription?.length).toBeLessThanOrEqual(55);
      expect(system.shortDescription).not.toMatch(/[\n…]/);
      expect(system.description).not.toBe(system.shortDescription);
    }
  });
});

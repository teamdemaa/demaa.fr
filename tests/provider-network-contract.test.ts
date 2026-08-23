import { describe, expect, it } from "vitest";
import expertiseSnapshot from "@/lib/expertise-catalog.snapshot.generated.json";
import opportunitySnapshot from "@/lib/opportunities.snapshot.generated.json";
import {
  EXPERTISE_FAMILIES,
  parseExpertiseCatalogEntry,
} from "@/lib/expertise-catalog-contract";
import {
  isPublicOpenOpportunity,
  OPPORTUNITY_TYPES,
  parseOpportunity,
} from "@/lib/opportunity-contract";
import { resolveProviderNetworkSource } from "@/lib/provider-network-source";

describe("provider network contract", () => {
  it("contains the 23 canonical public expertises without duplicate IDs", () => {
    const entries = expertiseSnapshot.map((entry, index) =>
      parseExpertiseCatalogEntry(entry, `expertise[${index}]`)
    );
    expect(entries).toHaveLength(23);
    expect(new Set(entries.map((entry) => entry.expertiseId)).size).toBe(23);
    expect(entries.every((entry) => entry.visibility === "public")).toBe(true);
    expect(new Set(entries.map((entry) => entry.family))).toEqual(
      new Set(EXPERTISE_FAMILIES),
    );
  });

  it("keeps the three demonstration opportunities as open dynamic records", () => {
    const entries = opportunitySnapshot.map((entry, index) =>
      parseOpportunity(entry, `opportunity[${index}]`)
    );
    expect(entries).toHaveLength(3);
    expect(entries.every((entry) => entry.opportunityType === "mission")).toBe(true);
    expect(entries.every((entry) => entry.expectations.length === 3)).toBe(true);
    expect(entries.map((entry) => entry.domainLabel)).toEqual([
      "Appels d’offres",
      "Réseaux sociaux",
      "Restauration",
    ]);
    expect(entries.map((entry) => entry.workMode)).toEqual([
      "hybrid",
      "remote",
      "remote",
    ]);
    expect(entries.every((entry) =>
      isPublicOpenOpportunity(entry, new Date("2026-08-08T12:00:00.000Z"))
    )).toBe(true);
  });

  it("accepts every opportunity type and keeps expertise optional", () => {
    for (const opportunityType of OPPORTUNITY_TYPES) {
      const entry = parseOpportunity({
        category: "Développement",
        createdAt: "2026-08-10T00:00:00.000Z",
        expertiseId: null,
        expiresAt: null,
        geography: null,
        opportunityId: `opportunite-${opportunityType}`,
        opportunityType,
        publishedAt: "2026-08-10T00:00:00.000Z",
        status: "open",
        summary: "Une opportunité formulée de manière claire et directement exploitable.",
        title: "Nouvelle opportunité",
      });
      expect(entry.expertiseId).toBeNull();
      expect(entry.opportunityType).toBe(opportunityType);
      expect(entry.workMode).toBeNull();
      expect(entry.expectations).toEqual([]);
      expect(entry.domainLabel).toBeNull();
    }
  });

  it("keeps older announcements readable without any source field", () => {
    const entry = parseOpportunity({
      category: "Bâtiment",
      createdAt: "2026-08-10T00:00:00.000Z",
      expiresAt: null,
      opportunityId: "annonce-historique",
      opportunityType: "mission",
      publishedAt: "2026-08-10T00:00:00.000Z",
      status: "open",
      summary: "Une annonce publiée avant l’extension du contrat de sourcing externe.",
      title: "Annonce historique",
    });
    expect(entry.ingestionMode).toBeNull();
    expect(entry.sourceKind).toBeNull();
    expect(entry.sourceName).toBeNull();
    expect(entry.sourceUrl).toBeNull();
    expect(entry.sourcePublishedAt).toBeNull();
    expect(entry.verifiedAt).toBeNull();
    expect(entry.sourceRemovedAt).toBeNull();
    expect(isPublicOpenOpportunity(entry, new Date("2026-08-11T00:00:00.000Z"))).toBe(true);
  });

  it("rejects a non-HTTPS source URL", () => {
    expect(() => parseOpportunity({
      category: "Bâtiment",
      createdAt: "2026-08-10T00:00:00.000Z",
      opportunityId: "annonce-source-non-securisee",
      opportunityType: "reprise-transmission",
      sourceUrl: "http://exemple.fr/annonce",
      status: "draft",
      summary: "Une reprise repérée sur un site tiers sans HTTPS.",
      title: "Reprise à vérifier",
    })).toThrow(/sourceUrl must be HTTPS/);
  });

  it("refuses to publish an externally sourced announcement without source, URL and verification date", () => {
    expect(() => parseOpportunity({
      category: "Bâtiment",
      createdAt: "2026-08-10T00:00:00.000Z",
      ingestionMode: "external_discovery",
      opportunityId: "reprise-btp-incomplete",
      opportunityType: "reprise-transmission",
      publishedAt: "2026-08-10T00:00:00.000Z",
      status: "open",
      summary: "Une reprise d’entreprise du bâtiment repérée sur une source externe.",
      title: "Reprise d’entreprise BTP",
    })).toThrow(/requires sourceName, sourceUrl and verifiedAt/);
  });

  it("publishes an externally sourced announcement once source, URL and verification date are set", () => {
    const entry = parseOpportunity({
      category: "Bâtiment",
      createdAt: "2026-08-10T00:00:00.000Z",
      ingestionMode: "external_discovery",
      opportunityId: "reprise-btp-complete",
      opportunityType: "reprise-transmission",
      publishedAt: "2026-08-10T00:00:00.000Z",
      sourceKind: "administrateur-judiciaire",
      sourceName: "Étude Dupont & Associés",
      sourcePublishedAt: "2026-08-05T00:00:00.000Z",
      sourceUrl: "https://exemple.fr/annonce",
      status: "open",
      summary: "Une reprise d’entreprise du bâtiment repérée sur une source externe.",
      title: "Reprise d’entreprise BTP",
      verifiedAt: "2026-08-09T00:00:00.000Z",
    });
    expect(entry.ingestionMode).toBe("external_discovery");
    expect(entry.sourceUrl).toBe("https://exemple.fr/annonce");
    expect(isPublicOpenOpportunity(entry, new Date("2026-08-11T00:00:00.000Z"))).toBe(true);
  });

  it("does not require source fields to publish a direct submission", () => {
    const entry = parseOpportunity({
      category: "Bâtiment",
      createdAt: "2026-08-10T00:00:00.000Z",
      ingestionMode: "direct_submission",
      opportunityId: "reprise-soumise-directement",
      opportunityType: "reprise-transmission",
      publishedAt: "2026-08-10T00:00:00.000Z",
      status: "open",
      summary: "Une reprise confiée directement à Demaa par le cédant.",
      title: "Reprise confiée directement",
    });
    expect(entry.sourceName).toBeNull();
    expect(isPublicOpenOpportunity(entry, new Date("2026-08-11T00:00:00.000Z"))).toBe(true);
  });

  it("hides an announcement removed by its source even while marked open", () => {
    const entry = parseOpportunity({
      category: "Bâtiment",
      createdAt: "2026-08-10T00:00:00.000Z",
      ingestionMode: "external_discovery",
      opportunityId: "reprise-retiree",
      opportunityType: "reprise-transmission",
      publishedAt: "2026-08-10T00:00:00.000Z",
      sourceName: "Étude Dupont & Associés",
      sourceRemovedAt: "2026-08-12T00:00:00.000Z",
      sourceUrl: "https://exemple.fr/annonce",
      status: "open",
      summary: "Une reprise retirée par sa source depuis la dernière vérification.",
      title: "Reprise retirée",
      verifiedAt: "2026-08-09T00:00:00.000Z",
    });
    expect(isPublicOpenOpportunity(entry, new Date("2026-08-13T00:00:00.000Z"))).toBe(false);
  });

  it("uses snapshots only outside deployed environments", () => {
    expect(resolveProviderNetworkSource(
      { NODE_ENV: "test" },
      false,
    )).toBe("snapshot");
    expect(resolveProviderNetworkSource(
      { NODE_ENV: "development" },
      true,
    )).toBe("firebase");
    expect(resolveProviderNetworkSource(
      { NODE_ENV: "production" },
      true,
    )).toBe("firebase");
    expect(() => resolveProviderNetworkSource(
      { NODE_ENV: "production" },
      false,
    )).toThrow(/Firebase Admin doit être configuré/);
    expect(() => resolveProviderNetworkSource(
      { NODE_ENV: "development", VERCEL_ENV: "preview" },
      false,
    )).toThrow(/Firebase Admin doit être configuré/);
  });
});

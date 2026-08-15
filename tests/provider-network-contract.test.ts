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

import { describe, expect, it } from "vitest";
import { matchesSearchQuery, normalizeSearchText } from "@/lib/search";

describe("matchesSearchQuery", () => {
  const teich = [
    "Salon de beauté à reprendre au Teich",
    "Fonds de commerce d’un salon de beauté à reprendre au Teich, en Gironde.",
    "Beauté et coiffure",
    "Fonds de commerce",
    "Reprise ou transmission",
    "Le Teich (33470)",
  ];

  it("matches on an accent-insensitive substring found in any part", () => {
    expect(matchesSearchQuery("Teich", teich)).toBe(true);
    expect(matchesSearchQuery("teich", teich)).toBe(true);
  });

  it("matches on an aliased term even when the query uses a different spelling", () => {
    expect(matchesSearchQuery("esthetique", teich)).toBe(true);
  });

  it("requires every query token to be present", () => {
    expect(matchesSearchQuery("salon bordeaux", teich)).toBe(false);
    expect(matchesSearchQuery("salon teich", teich)).toBe(true);
  });

  it("returns everything for an empty or blank query", () => {
    expect(matchesSearchQuery("", teich)).toBe(true);
    expect(matchesSearchQuery("   ", teich)).toBe(true);
  });

  it("returns false when nothing matches", () => {
    expect(matchesSearchQuery("zzzznonexistent", teich)).toBe(false);
  });
});

describe("normalizeSearchText", () => {
  it("strips accents, lowercases, and collapses punctuation to spaces", () => {
    expect(normalizeSearchText("Le Teich (33470)")).toBe("le teich 33470");
  });
});

import { describe, expect, it } from "vitest";
import {
  buildOperationalWorkbookPair,
  getOperationalWorkbookFactorySlugs,
  OPERATIONAL_WORKBOOK_SHEET_ORDER,
} from "@/lib/operational-workbook-factory";

describe("operational workbook factory", () => {
  it("builds one demo and one editable version for all 115 systems", () => {
    const slugs = getOperationalWorkbookFactorySlugs();

    expect(slugs).toHaveLength(115);
    expect(new Set(slugs).size).toBe(115);

    for (const slug of slugs) {
      const pair = buildOperationalWorkbookPair(slug);

      expect(pair.demo.variant).toBe("demo");
      expect(pair.editable.variant).toBe("editable");
      expect(pair.demo.processRows).toHaveLength(74);
      expect(pair.editable.processRows).toEqual(pair.demo.processRows);
      expect(pair.demo.sheetOrder).toEqual(OPERATIONAL_WORKBOOK_SHEET_ORDER);
      expect(pair.editable.sheetOrder).toEqual(OPERATIONAL_WORKBOOK_SHEET_ORDER);
      expect(pair.demo.actionRows.length).toBeGreaterThanOrEqual(10);
      expect(pair.editable.teamRows.length).toBeGreaterThanOrEqual(4);
      expect(pair.demo.calendarRows).toHaveLength(6);
      expect(pair.editable.calendarRows).toHaveLength(0);
    }
  });

  it("keeps concrete named resources in every ecosystem", () => {
    for (const slug of getOperationalWorkbookFactorySlugs()) {
      const { editable } = buildOperationalWorkbookPair(slug);
      const names = editable.ecosystemRows.map((row) => row.name);

      expect(names).toContain("EM2A Expertise");
      expect(
        editable.ecosystemRows.some((row) => row.category === "Outil métier"),
      ).toBe(true);
      expect(
        editable.ecosystemRows.some((row) => row.category === "Fournisseur"),
      ).toBe(true);
      expect(
        editable.ecosystemRows.every(
          (row) =>
            row.name.trim().length > 1 &&
            row.url.startsWith("https://") &&
            !row.name.startsWith("Demaa —"),
        ),
      ).toBe(true);
    }
  });

  it("preserves the 18-process, 74-content Plomberie reference", () => {
    const pair = buildOperationalWorkbookPair("plomberie-chauffage");

    expect(
      new Set(pair.editable.processRows.map((row) => row.process)).size,
    ).toBe(18);
    expect(pair.editable.actionRows).toHaveLength(14);
    expect(pair.editable.teamRows).toHaveLength(9);
    expect(pair.demo.companyName).toBe("Plomberie & chauffage Horizon");
  });

  it("keeps fictitious values out of the editable version", () => {
    const pair = buildOperationalWorkbookPair("agence-marketing");

    expect(pair.demo.actionRows.some((row) => row.owner)).toBe(true);
    expect(pair.editable.actionRows.every((row) => !row.owner)).toBe(true);
    expect(pair.demo.teamRows.some((row) => row.person)).toBe(true);
    expect(pair.editable.teamRows.every((row) => !row.person)).toBe(true);
    expect(pair.demo.ecosystemRows.some((row) => row.chosenSolution)).toBe(true);
    expect(
      pair.editable.ecosystemRows.every((row) => !row.chosenSolution),
    ).toBe(true);
  });

  it("keeps payment terminals out of office-only HR and support ecosystems", () => {
    for (const slug of [
      "agence-de-recrutement",
      "cabinet-rh-externalise",
      "centre-appels-support-client",
    ]) {
      const names = buildOperationalWorkbookPair(
        slug,
      ).editable.ecosystemRows.map((row) => row.name);

      expect(names).toContain("Bernard");
      expect(names).not.toContain("SumUp");
    }
  });

  it("does not repeat a supplier already represented by a branded tool", () => {
    const names = buildOperationalWorkbookPair(
      "salle-de-sport",
    ).editable.ecosystemRows.map((row) => row.name);

    expect(names).toContain("SumUp Caisse");
    expect(names).not.toContain("SumUp");
    expect(names).toContain("EDF Entreprises");
  });

  it("keeps payment terminals out of training ecosystems", () => {
    for (const slug of [
      "organisme-de-formation",
      "cfa",
      "formation-en-ligne",
    ]) {
      const names = buildOperationalWorkbookPair(
        slug,
      ).editable.ecosystemRows.map((row) => row.name);

      expect(names).toContain("Bernard");
      expect(names).not.toContain("SumUp");
    }
  });

  it("keeps payment terminals out of the association ecosystem", () => {
    const names = buildOperationalWorkbookPair(
      "association",
    ).editable.ecosystemRows.map((row) => row.name);

    expect(names).toContain("Bernard");
    expect(names).not.toContain("SumUp");
  });

  it("keeps payment terminals out of the concierge ecosystem", () => {
    const names = buildOperationalWorkbookPair(
      "conciergerie-airbnb",
    ).editable.ecosystemRows.map((row) => row.name);

    expect(names).toContain("Bernard");
    expect(names).toContain("EDF Entreprises");
    expect(names).not.toContain("SumUp");
  });

  it("keeps employee benefits out of the property investment ecosystem", () => {
    const names = buildOperationalWorkbookPair(
      "investissement-immobilier",
    ).editable.ecosystemRows.map((row) => row.name);

    expect(names).toContain("Onoff Business");
    expect(names).not.toContain("Swile");
  });
});

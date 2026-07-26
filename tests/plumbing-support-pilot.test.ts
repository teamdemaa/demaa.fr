import { describe, expect, it } from "vitest";

import {
  plumbingPilotProcessDefinitionsById,
} from "../src/lib/plumbing-process-pilot";
import {
  plumbingPilotSupportDefinitionsByProcessId,
  plumbingPilotSupportFormats,
} from "../src/lib/plumbing-support-pilot";

describe("plumbing support pilot", () => {
  const processIds = Object.keys(plumbingPilotProcessDefinitionsById);
  const supportEntries = Object.entries(
    plumbingPilotSupportDefinitionsByProcessId,
  );

  it("associe exactement un support aux 18 process", () => {
    expect(Object.keys(plumbingPilotSupportDefinitionsByProcessId).sort()).toEqual(
      [...processIds].sort(),
    );
  });

  it("utilise uniquement Google Docs ou Google Sheets", () => {
    const allowedFormats = new Set(plumbingPilotSupportFormats);

    for (const [, support] of supportEntries) {
      expect(allowedFormats.has(support.format)).toBe(true);
    }
  });

  it("prévoit une démonstration et un modèle vierge pour chaque support", () => {
    for (const [, support] of supportEntries) {
      expect(support.demoAndBlankRequired).toBe(true);
    }
  });

  it("ne publie jamais une seule variante d’un support", () => {
    for (const [, support] of supportEntries) {
      expect(Boolean(support.demoUrl)).toBe(Boolean(support.blankUrl));
    }
  });

  it("publie les quatre paires Direction", () => {
    const produced = supportEntries.filter(
      ([processId, support]) =>
        processId.startsWith("process.btp.direction.") &&
        support.demoUrl &&
        support.blankUrl,
    );

    expect(produced).toHaveLength(4);

    for (const [, support] of produced) {
      expect(support.demoUrl).toMatch(
        /^https:\/\/docs\.google\.com\/(document|spreadsheets)\/d\/[^/]+\/edit\?usp=sharing$/,
      );
      expect(support.blankUrl).toMatch(
        /^https:\/\/docs\.google\.com\/(document|spreadsheets)\/d\/[^/]+\/edit\?usp=sharing$/,
      );
    }
  });

  it("publie les trois paires Marketing et Vente", () => {
    const produced = supportEntries.filter(
      ([processId, support]) =>
        processId.startsWith("process.btp.marketing-vente.") &&
        support.demoUrl &&
        support.blankUrl,
    );

    expect(produced).toHaveLength(3);

    for (const [, support] of produced) {
      expect(support.demoUrl).toMatch(
        /^https:\/\/docs\.google\.com\/(document|spreadsheets)\/d\/[^/]+\/edit\?usp=sharing$/,
      );
      expect(support.blankUrl).toMatch(
        /^https:\/\/docs\.google\.com\/(document|spreadsheets)\/d\/[^/]+\/edit\?usp=sharing$/,
      );
    }
  });

  it("publie les quatre paires Opérations", () => {
    const produced = supportEntries.filter(
      ([processId, support]) =>
        processId.startsWith("process.btp.operations.") &&
        support.demoUrl &&
        support.blankUrl,
    );

    expect(produced).toHaveLength(4);

    for (const [, support] of produced) {
      expect(support.demoUrl).toMatch(
        /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[^/]+\/edit\?usp=sharing$/,
      );
      expect(support.blankUrl).toMatch(
        /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[^/]+\/edit\?usp=sharing$/,
      );
    }
  });

  it("publie les dix-huit paires du système Plomberie", () => {
    const produced = supportEntries.filter(
      ([, support]) => support.demoUrl && support.blankUrl,
    );

    expect(produced).toHaveLength(18);

    for (const [, support] of produced) {
      expect(support.demoUrl).toMatch(
        /^https:\/\/docs\.google\.com\/(document|spreadsheets)\/d\/[^/]+\/edit\?usp=sharing$/,
      );
      expect(support.blankUrl).toMatch(
        /^https:\/\/docs\.google\.com\/(document|spreadsheets)\/d\/[^/]+\/edit\?usp=sharing$/,
      );
    }
  });

  it("décrit un support directement exploitable", () => {
    for (const [, support] of supportEntries) {
      expect(support.name.trim().length).toBeGreaterThan(10);
      expect(support.purpose.trim().length).toBeGreaterThan(40);
      expect(support.sections.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("conserve un périmètre simple de trois Docs et quinze Sheets", () => {
    const counts = supportEntries.reduce<Record<string, number>>(
      (accumulator, [, support]) => {
        accumulator[support.format] =
          (accumulator[support.format] ?? 0) + 1;
        return accumulator;
      },
      {},
    );

    expect(counts).toEqual({
      "Google Docs": 3,
      "Google Sheets": 15,
    });
  });

  it("utilise des noms uniques", () => {
    const names = supportEntries.map(([, support]) => support.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

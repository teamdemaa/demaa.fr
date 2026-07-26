import { describe, expect, it } from "vitest";

import {
  plumbingDemoActionPlanning,
  plumbingDemoActivityVolume,
  plumbingDemoCompany,
  plumbingDemoEcosystem,
  plumbingDemoMarketingCalendar,
  plumbingDemoRevenue,
  plumbingDemoTeamAssignments,
} from "../src/lib/plumbing-demo-pilot";

describe("plumbing filled demonstration", () => {
  it("est explicitement fictive", () => {
    expect(plumbingDemoCompany.fictional).toBe(true);
    expect(plumbingDemoCompany.name).toBe("Plomberie Horizon");
  });

  it("renseigne les 14 actions et les 9 rôles du modèle", () => {
    expect(plumbingDemoActionPlanning).toHaveLength(14);
    expect(plumbingDemoTeamAssignments).toHaveLength(9);
  });

  it("renseigne trois mois historiques, douze mois prévisionnels et douze mois projetés", () => {
    expect(plumbingDemoRevenue.historyAndForecast).toHaveLength(15);
    expect(plumbingDemoRevenue.projection).toHaveLength(12);
    expect(plumbingDemoActivityVolume.historyAndForecast).toHaveLength(
      15,
    );
    expect(plumbingDemoActivityVolume.projection).toHaveLength(12);
  });

  it("illustre le marketing et l’écosystème avec des noms et des liens concrets", () => {
    expect(plumbingDemoMarketingCalendar.length).toBeGreaterThanOrEqual(6);
    expect(plumbingDemoEcosystem.length).toBeGreaterThanOrEqual(6);

    for (const row of plumbingDemoEcosystem) {
      expect(row[2].length).toBeGreaterThan(2);
      expect(row[2]).not.toMatch(/logiciel|cabinet|fournisseur|courtier/i);
      expect(row[7]).toMatch(/^https:\/\/demaa\.fr\//);
      expect([row[0], row[2], row[8]].join(" ")).not.toMatch(
        /\bDemaa\b/i,
      );
    }
  });

  it("utilise EM2A Expertise dans la démonstration comptable", () => {
    const accountingRow = plumbingDemoEcosystem.find(
      (row) => row[0] === "Professionnel",
    );

    expect(accountingRow).toEqual([
      "Professionnel",
      "Comptabilité et TVA",
      "EM2A Expertise",
      "EM2A Expertise",
      "Déjà utilisé",
      "Sur devis",
      "2026-12-31",
      "https://demaa.fr/annuaire-experts-comptables/cabinets/em2a-expertise",
      "Point mensuel prévu le 10.",
    ]);
  });
});

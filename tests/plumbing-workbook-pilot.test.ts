import { describe, expect, it } from "vitest";

import { plumbingPilotTeamRoles } from "../src/lib/plumbing-workbook-pilot";

describe("plumbing blank workbook pilot", () => {
  it("précharge une seule liste de neuf rôles recommandés", () => {
    expect(plumbingPilotTeamRoles).toHaveLength(9);
    expect(new Set(plumbingPilotTeamRoles.map((role) => role.role)).size).toBe(
      9,
    );
  });

  it("ne préremplit aucune personne ni situation implicite", () => {
    for (const role of plumbingPilotTeamRoles) {
      expect(role).not.toHaveProperty("person");
      expect(role).not.toHaveProperty("situation");
      expect(role).not.toHaveProperty("targetDate");
    }
  });

  it("ne crée pas de rôle Investisseur dans l’équipe", () => {
    expect(
      plumbingPilotTeamRoles.some((role) =>
        role.role.toLowerCase().includes("investisseur"),
      ),
    ).toBe(false);
  });

  it("donne une responsabilité et des process concrets à chaque rôle", () => {
    for (const role of plumbingPilotTeamRoles) {
      expect(role.mainResponsibility.length).toBeGreaterThan(40);
      expect(role.relatedProcesses.length).toBeGreaterThan(25);
    }
  });
});

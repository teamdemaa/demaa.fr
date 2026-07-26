import { describe, expect, it } from "vitest";

import {
  crecheProfile,
  generateCrecheDraft,
} from "@/lib/creche-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Crèche", () => {
  const draft = generateCrecheDraft();
  const labels = Object.values(draft.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("conserve les 12 processus et produit 74 contenus uniques", () => {
    const audit = auditProcessDraft(draft, {
      processCount: 12,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(new Set(labels).size).toBe(74);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
  });

  it("supprime les placeholders et les formulations abstraites", () => {
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
  });

  it("couvre l’accueil, la santé, les familles et l’encadrement", () => {
    const content = labels.join(" ");

    expect(content).toMatch(/préinscription|premier accueil/i);
    expect(content).toMatch(/référent Santé et Accueil inclusif|PAI/i);
    expect(content).toMatch(/ordonnance|médicament|registre/i);
    expect(content).toMatch(/ratio|professionnels présents/i);
    expect(content).toMatch(/repas|allerg|sommeil|change/i);
  });

  it("intègre les contrôles réglementaires déterminants", () => {
    const content = labels.join(" ");

    expect(content).toMatch(/autorisation départementale/i);
    expect(content).toMatch(/hospitalisation/i);
    expect(content).toMatch(/maltraitance/i);
    expect(content).toMatch(/honorabilité/i);
    expect(content).toMatch(/moins de trois ans à un écran/i);
  });

  it("documente des sources publiques suffisantes", () => {
    expect(crecheProfile.researchSources.length).toBeGreaterThanOrEqual(8);
  });
});

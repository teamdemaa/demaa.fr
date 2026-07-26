import { describe, expect, it } from "vitest";

import {
  associationProfile,
  generateAssociationDraft,
} from "@/lib/association-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Association", () => {
  const draft = generateAssociationDraft();
  const labels = Object.values(draft.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("conserve les 8 processus et produit 74 contenus uniques", () => {
    const audit = auditProcessDraft(draft, {
      processCount: 8,
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

  it("couvre gouvernance, bénévolat, subventions, dons et signalements", () => {
    const content = labels.join(" ");

    expect(content).toMatch(/assemblée générale|conseil d’administration/i);
    expect(content).toMatch(/bénévole|salarié|volontaire/i);
    expect(content).toMatch(/subvention|financeur|compte rendu/i);
    expect(content).toMatch(/reçu fiscal|rescrit/i);
    expect(content).toMatch(/signalement|représaille|confidentialité/i);
  });

  it("intègre les contrôles déterminants", () => {
    const content = labels.join(" ");

    expect(content).toMatch(/dans les trois mois/i);
    expect(content).toMatch(/ne pas utiliser une ressource affectée/i);
    expect(content).toMatch(/sans preuve vérifiable/i);
  });

  it("documente des sources publiques suffisantes", () => {
    expect(associationProfile.researchSources.length).toBeGreaterThanOrEqual(7);
  });
});

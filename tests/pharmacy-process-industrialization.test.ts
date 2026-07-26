import { describe, expect, it } from "vitest";

import {
  generatePharmacyDraft,
  pharmacyProfile,
} from "@/lib/pharmacy-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Pharmacie", () => {
  const draft = generatePharmacyDraft();
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

  it("couvre la dispensation, le stock et les missions de santé", () => {
    const content = labels.join(" ");

    expect(content).toMatch(/authenticité et validité de l’ordonnance/i);
    expect(content).toMatch(/posologie|interaction|contre-indication/i);
    expect(content).toMatch(/Dossier Pharmaceutique/i);
    expect(content).toMatch(/chaîne du froid|température/i);
    expect(content).toMatch(/retrait ou rappel/i);
    expect(content).toMatch(/vaccin|mission/i);
  });

  it("intègre les contrôles réglementaires et financiers déterminants", () => {
    const content = labels.join(" ");

    expect(content).toMatch(/stupéfiants/i);
    expect(content).toMatch(/effet indésirable/i);
    expect(content).toMatch(/carte Vitale/i);
    expect(content).toMatch(/rejet|double paiement/i);
    expect(content).toMatch(/donnée de santé|registre des traitements/i);
  });

  it("documente des sources publiques suffisantes", () => {
    expect(pharmacyProfile.researchSources.length).toBeGreaterThanOrEqual(9);
  });
});

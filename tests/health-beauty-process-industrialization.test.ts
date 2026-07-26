import { describe, expect, it } from "vitest";

import {
  generateHealthBeautyCoreDraft,
  generateHealthBeautyDraft,
  healthBeautyProfiles,
} from "@/lib/health-beauty-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Santé & bien-être", () => {
  const profiles = Object.values(healthBeautyProfiles);
  const core = generateHealthBeautyCoreDraft();
  const coreLabels = Object.values(core.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement les trois systèmes du lot", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "esthetique",
      "institut-de-beaute",
      "salon-de-coiffure",
    ]);
  });

  it("le socle contient 16 processus, 74 contenus et les quatre types", () => {
    const audit = auditProcessDraft(core, {
      processCount: 16,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
    expect(new Set(coreLabels).size).toBe(74);
  });

  it.each(profiles)("$name possède une variante concrète et sourcée", (profile) => {
    const draft = generateHealthBeautyDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 16,
      contentCount: 74,
    });
    const labels = Object.values(draft.contentByProcessId)
      .flat()
      .map((entry) => entry.label);

    expect(audit.errors).toEqual([]);
    expect(labels.filter((label, index) => label !== coreLabels[index])).toHaveLength(
      16,
    );
    expect(new Set(labels).size).toBe(74);
    expect(profile.researchSources.length).toBeGreaterThanOrEqual(4);
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
  });

  it("distingue l’institut, le salon et l’esthétique indépendante", () => {
    const contentFor = (slug: keyof typeof healthBeautyProfiles) =>
      Object.values(
        generateHealthBeautyDraft(healthBeautyProfiles[slug]).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("institut-de-beaute")).toMatch(/multi-cabines|cabines/i);
    expect(contentFor("salon-de-coiffure")).toMatch(/formule couleur|colorimétrie/i);
    expect(contentFor("esthetique")).toMatch(/tournée|domicile/i);
  });

  it("encadre les situations sensibles sans promesse médicale", () => {
    for (const profile of profiles) {
      const labels = Object.values(
        generateHealthBeautyDraft(profile).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

      expect(labels).toMatch(/hors du champ|professionnel de santé/i);
      expect(labels).not.toMatch(/diagnostiquer|guérir|traiter une pathologie/i);
    }
  });
});

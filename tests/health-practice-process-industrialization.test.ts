import { describe, expect, it } from "vitest";

import {
  generateHealthPracticeCoreDraft,
  generateHealthPracticeDraft,
  healthPracticeProfiles,
} from "@/lib/health-practice-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Cabinets de santé", () => {
  const profiles = Object.values(healthPracticeProfiles);
  const coreDraft = generateHealthPracticeCoreDraft();
  const coreLabels = Object.values(coreDraft.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement les six métiers du lot", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "cabinet-medical",
      "cabinet-paramedical",
      "dentiste",
      "osteopathe",
      "psychologue",
      "veterinaire",
    ]);
  });

  it("le socle contient 12 processus, 74 contenus et les quatre types", () => {
    const audit = auditProcessDraft(coreDraft, {
      processCount: 12,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
    expect(new Set(coreLabels).size).toBe(74);
  });

  it.each(profiles)("$name possède une variante concrète et sourcée", (profile) => {
    const draft = generateHealthPracticeDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 12,
      contentCount: 74,
    });
    const labels = Object.values(draft.contentByProcessId)
      .flat()
      .map((entry) => entry.label);

    expect(audit.errors).toEqual([]);
    expect(labels.filter((label, index) => label !== coreLabels[index])).toHaveLength(
      15,
    );
    expect(new Set(labels).size).toBe(74);
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
    expect(profile.researchSources.length).toBeGreaterThanOrEqual(3);
    expect(
      profile.researchSources.every((source) => source.startsWith("https://")),
    ).toBe(true);
  });

  it("nomme les opérations distinctives de chaque métier", () => {
    const contentFor = (slug: keyof typeof healthPracticeProfiles) =>
      Object.values(
        generateHealthPracticeDraft(healthPracticeProfiles[slug])
          .contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("cabinet-medical")).toMatch(
      /DMP|Mon espace santé|MSSanté/i,
    );
    expect(contentFor("cabinet-medical")).toMatch(/parcours de soins/i);
    expect(contentFor("cabinet-paramedical")).toMatch(/NGAP/i);
    expect(contentFor("cabinet-paramedical")).toMatch(/domicile/i);
    expect(contentFor("dentiste")).toMatch(/odontogramme/i);
    expect(contentFor("dentiste")).toMatch(/stérilisation/i);
    expect(contentFor("veterinaire")).toMatch(/animal et détenteur/i);
    expect(contentFor("veterinaire")).toMatch(/permanence|continuité/i);
    expect(contentFor("osteopathe")).toMatch(/drapeau rouge/i);
    expect(contentFor("osteopathe")).toMatch(/acte interdit/i);
    expect(contentFor("psychologue")).toMatch(/risque suicidaire/i);
    expect(contentFor("psychologue")).toMatch(/notes personnelles/i);
  });
});

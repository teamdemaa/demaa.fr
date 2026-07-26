import { describe, expect, it } from "vitest";

import {
  generateRegulatedPracticeCoreDraft,
  generateRegulatedPracticeDraft,
  regulatedPracticeProfiles,
} from "@/lib/regulated-practice-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Cabinets réglementés", () => {
  const profiles = Object.values(regulatedPracticeProfiles);
  const coreDraft = generateRegulatedPracticeCoreDraft();
  const coreLabels = Object.values(coreDraft.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement les quatre métiers du lot", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "cabinet-comptable",
      "cabinet-davocat",
      "gestionnaire-paie-independant",
      "notaire",
    ]);
  });

  it("le socle contient 19 processus, 74 contenus et les quatre types", () => {
    const audit = auditProcessDraft(coreDraft, {
      processCount: 19,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
    expect(new Set(coreLabels).size).toBe(74);
  });

  it.each(profiles)("$name possède une variante concrète et sourcée", (profile) => {
    const draft = generateRegulatedPracticeDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 19,
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
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
    expect(profile.researchSources.length).toBeGreaterThanOrEqual(4);
    expect(
      profile.researchSources.every((source) => source.startsWith("https://")),
    ).toBe(true);
  });

  it("nomme les opérations distinctives de chaque métier", () => {
    const contentFor = (slug: keyof typeof regulatedPracticeProfiles) =>
      Object.values(
        generateRegulatedPracticeDraft(regulatedPracticeProfiles[slug])
          .contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("cabinet-comptable")).toMatch(/lettre de mission/i);
    expect(contentFor("cabinet-comptable")).toMatch(/liasse|EDI/i);
    expect(contentFor("cabinet-davocat")).toMatch(/RPVA|e-Barreau/i);
    expect(contentFor("cabinet-davocat")).toMatch(/CARPA/i);
    expect(contentFor("notaire")).toMatch(/MICEN/i);
    expect(contentFor("notaire")).toMatch(/clé Real/i);
    expect(contentFor("gestionnaire-paie-independant")).toMatch(/DSN/i);
    expect(contentFor("gestionnaire-paie-independant")).toMatch(/DPAE/i);
  });
});

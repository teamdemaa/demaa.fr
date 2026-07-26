import { describe, expect, it } from "vitest";

import {
  generateRealEstateInvestmentCoreDraft,
  generateRealEstateInvestmentDraft,
  realEstateInvestmentProfiles,
} from "@/lib/real-estate-investment-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Investissement immobilier", () => {
  const profiles = Object.values(realEstateInvestmentProfiles);
  const coreDraft = generateRealEstateInvestmentCoreDraft();
  const coreLabels = Object.values(coreDraft.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement les trois systèmes du lot", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "investissement-immobilier",
      "investissement-locatif",
      "marchand-de-biens",
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
    const draft = generateRealEstateInvestmentDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 12,
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
    expect(profile.researchSources.length).toBeGreaterThanOrEqual(5);
  });

  it("nomme les opérations distinctives des trois systèmes", () => {
    const contentFor = (slug: keyof typeof realEstateInvestmentProfiles) =>
      Object.values(
        generateRealEstateInvestmentDraft(realEstateInvestmentProfiles[slug])
          .contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("marchand-de-biens")).toMatch(/engagement de revendre/i);
    expect(contentFor("investissement-locatif")).toMatch(/décence énergétique/i);
    expect(contentFor("investissement-immobilier")).toMatch(/allocation/i);
  });
});

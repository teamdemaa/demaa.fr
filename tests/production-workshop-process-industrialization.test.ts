import { describe, expect, it } from "vitest";

import {
  generateProductionWorkshopCoreDraft,
  generateProductionWorkshopDraft,
  productionWorkshopProfiles,
} from "@/lib/production-workshop-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Production & atelier", () => {
  const profiles = Object.values(productionWorkshopProfiles);
  const core = generateProductionWorkshopCoreDraft();
  const coreLabels = Object.values(core.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement les trois systèmes du lot", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "carrosserie",
      "garage-automobile",
      "production-industrie",
    ]);
  });

  it("le socle contient 11 processus, 74 contenus et les quatre types", () => {
    const audit = auditProcessDraft(core, {
      processCount: 11,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
    expect(new Set(coreLabels).size).toBe(74);
  });

  it.each(profiles)("$name possède une variante concrète et sourcée", (profile) => {
    const draft = generateProductionWorkshopDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 11,
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

  it("nomme les opérations distinctives", () => {
    const contentFor = (slug: keyof typeof productionWorkshopProfiles) =>
      Object.values(
        generateProductionWorkshopDraft(productionWorkshopProfiles[slug])
          .contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("production-industrie")).toMatch(/première pièce/i);
    expect(contentFor("garage-automobile")).toMatch(/VIN/i);
    expect(contentFor("carrosserie")).toMatch(/isocyanates/i);
  });
});

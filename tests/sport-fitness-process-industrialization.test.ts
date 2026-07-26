import { describe, expect, it } from "vitest";

import {
  generateSportFitnessCoreDraft,
  generateSportFitnessDraft,
  sportFitnessProfiles,
} from "@/lib/sport-fitness-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Sport & fitness", () => {
  const profiles = Object.values(sportFitnessProfiles);
  const core = generateSportFitnessCoreDraft();
  const coreLabels = Object.values(core.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement Coach sportif et Salle de sport", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "coach-sportif",
      "salle-de-sport",
    ]);
  });

  it("le socle contient 13 processus, 74 contenus et les quatre types", () => {
    const audit = auditProcessDraft(core, {
      processCount: 13,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
    expect(new Set(coreLabels).size).toBe(74);
  });

  it.each(profiles)("$name possède une variante concrète et sourcée", (profile) => {
    const draft = generateSportFitnessDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 13,
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
    expect(profile.researchSources.length).toBeGreaterThanOrEqual(5);
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
  });

  it("distingue le coach mobile de l’établissement avec abonnements", () => {
    const contentFor = (slug: keyof typeof sportFitnessProfiles) =>
      Object.values(
        generateSportFitnessDraft(sportFitnessProfiles[slug]).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("coach-sportif")).toMatch(
      /lieu partenaire|déplacement|petits groupes/i,
    );
    expect(contentFor("salle-de-sport")).toMatch(
      /EAPS|Signal-Sports|SEPA|résiliation/i,
    );
  });

  it("préserve les limites de compétence et la sécurité", () => {
    for (const profile of profiles) {
      const labels = Object.values(
        generateSportFitnessDraft(profile).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

      expect(labels).toMatch(/prérogatives|hors des prérogatives/i);
      expect(labels).toMatch(/secours|sécuriser|sécurité/i);
      expect(labels).toMatch(/diagnostic|garantir un résultat/i);
    }
  });
});

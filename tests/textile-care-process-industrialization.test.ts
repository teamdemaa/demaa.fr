import { describe, expect, it } from "vitest";

import {
  generateTextileCareDraft,
  textileCareProfiles,
} from "@/lib/textile-care-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Entretien textile", () => {
  const profiles = Object.values(textileCareProfiles);

  it("couvre exactement Laverie automatique et Pressing", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "laverie-automatique",
      "pressing",
    ]);
  });

  it.each(profiles)("$name possède 74 contenus uniques et les quatre types", (profile) => {
    const draft = generateTextileCareDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: profile.processCount,
      contentCount: 74,
    });
    const labels = Object.values(draft.contentByProcessId)
      .flat()
      .map((entry) => entry.label);

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
    expect(new Set(labels).size).toBe(74);
    expect(profile.researchSources.length).toBeGreaterThanOrEqual(5);
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
  });

  it("ne duplique aucun contenu exact entre les deux métiers", () => {
    const labelsFor = (slug: keyof typeof textileCareProfiles) =>
      new Set(
        Object.values(
          generateTextileCareDraft(textileCareProfiles[slug]).contentByProcessId,
        )
          .flat()
          .map((entry) => entry.label),
      );
    const laundromat = labelsFor("laverie-automatique");
    const pressing = labelsFor("pressing");

    expect([...laundromat].filter((label) => pressing.has(label))).toEqual([]);
  });

  it("distingue le libre-service de la prise en charge textile", () => {
    const contentFor = (slug: keyof typeof textileCareProfiles) =>
      Object.values(
        generateTextileCareDraft(textileCareProfiles[slug]).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("laverie-automatique")).toMatch(
      /chaque semaine|surveillance parentale|centrale de paiement|cycle/i,
    );
    expect(contentFor("pressing")).toMatch(
      /ICPE|FDS|ticket de dépôt|aquanettoyage|pièce/i,
    );
  });

  it("conserve les contrôles de sécurité déterminants", () => {
    expect(
      Object.values(
        generateTextileCareDraft(
          textileCareProfiles["laverie-automatique"],
        ).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" "),
    ).toMatch(/aucun cycle ne démarre porte ouverte/i);

    expect(
      Object.values(
        generateTextileCareDraft(
          textileCareProfiles.pressing,
        ).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" "),
    ).toMatch(/produit ou procédé non évalué/i);
  });
});

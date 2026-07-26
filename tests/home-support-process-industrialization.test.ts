import { describe, expect, it } from "vitest";

import {
  generateHomeSupportCoreDraft,
  generateHomeSupportDraft,
  homeSupportProfiles,
} from "@/lib/home-support-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Domicile & accompagnement", () => {
  const profiles = Object.values(homeSupportProfiles);
  const core = generateHomeSupportCoreDraft();
  const coreLabels = Object.values(core.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement les trois systèmes du lot", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "aide-a-domicile-menage",
      "infirmier-liberal",
      "services-a-la-personne",
    ]);
  });

  it("le socle contient 12 processus, 74 contenus et les quatre types", () => {
    const audit = auditProcessDraft(core, {
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
    const draft = generateHomeSupportDraft(profile);
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
    expect(profile.researchSources.length).toBeGreaterThanOrEqual(4);
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
  });

  it("distingue l’opérateur SAP, le soin infirmier et l’aide ménagère", () => {
    const contentFor = (slug: keyof typeof homeSupportProfiles) =>
      Object.values(
        generateHomeSupportDraft(homeSupportProfiles[slug]).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("services-a-la-personne")).toMatch(/NOVA|mandataire/i);
    expect(contentFor("infirmier-liberal")).toMatch(/NGAP|NOEMIE/i);
    expect(contentFor("aide-a-domicile-menage")).toMatch(/ménage|surfaces/i);
  });

  it("préserve les limites de rôle et la confidentialité", () => {
    for (const profile of profiles) {
      const labels = Object.values(
        generateHomeSupportDraft(profile).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

      expect(labels).toMatch(/limite|hors périmètre|dépasser son rôle/i);
      expect(labels).toMatch(/confidentialité|besoin d’en connaître|information sensible/i);
    }
  });
});

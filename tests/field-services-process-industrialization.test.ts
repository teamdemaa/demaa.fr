import { describe, expect, it } from "vitest";

import {
  fieldServicesProfiles,
  generateFieldServicesCoreDraft,
  generateFieldServicesDraft,
} from "@/lib/field-services-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Sécurité et services terrain", () => {
  const profiles = Object.values(fieldServicesProfiles);
  const coreDraft = generateFieldServicesCoreDraft();
  const coreLabels = Object.values(coreDraft.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement les deux métiers du lot", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "entreprise-de-securite",
      "nettoyage-professionnel",
    ]);
  });

  it("le socle contient 9 processus, 74 contenus et les quatre types", () => {
    const audit = auditProcessDraft(coreDraft, {
      processCount: 9,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
    expect(new Set(coreLabels).size).toBe(74);
  });

  it.each(profiles)("$name possède une variante concrète et sourcée", (profile) => {
    const draft = generateFieldServicesDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 9,
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
    const contentFor = (slug: keyof typeof fieldServicesProfiles) =>
      Object.values(
        generateFieldServicesDraft(fieldServicesProfiles[slug])
          .contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("nettoyage-professionnel")).toMatch(/FDS/i);
    expect(contentFor("nettoyage-professionnel")).toMatch(/ne jamais mélanger/i);
    expect(contentFor("entreprise-de-securite")).toMatch(/Dracar Ultimate/i);
    expect(contentFor("entreprise-de-securite")).toMatch(/au moins mensuellement/i);
  });
});

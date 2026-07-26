import { describe, expect, it } from "vitest";

import {
  generateHrSupportCoreDraft,
  generateHrSupportDraft,
  hrSupportProfiles,
} from "@/lib/hr-support-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Services RH et support", () => {
  const profiles = Object.values(hrSupportProfiles);
  const coreDraft = generateHrSupportCoreDraft();
  const coreLabels = Object.values(coreDraft.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement les trois métiers du lot", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "agence-de-recrutement",
      "cabinet-rh-externalise",
      "centre-appels-support-client",
    ]);
  });

  it("le socle contient 18 processus, 74 contenus et les quatre types", () => {
    const audit = auditProcessDraft(coreDraft, {
      processCount: 18,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
    expect(new Set(coreLabels).size).toBe(74);
  });

  it.each(profiles)("$name possède une variante concrète et sourcée", (profile) => {
    const draft = generateHrSupportDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 18,
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
    const contentFor = (slug: keyof typeof hrSupportProfiles) =>
      Object.values(
        generateHrSupportDraft(hrSupportProfiles[slug]).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("agence-de-recrutement")).toMatch(/ATS/i);
    expect(contentFor("agence-de-recrutement")).toMatch(/non discriminatoire/i);
    expect(contentFor("cabinet-rh-externalise")).toMatch(/SIRH/i);
    expect(contentFor("cabinet-rh-externalise")).toMatch(/employeur/i);
    expect(contentFor("centre-appels-support-client")).toMatch(/SLA/i);
    expect(contentFor("centre-appels-support-client")).toMatch(
      /11 août 2026/i,
    );
  });
});

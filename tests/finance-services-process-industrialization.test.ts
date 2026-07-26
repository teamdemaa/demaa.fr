import { describe, expect, it } from "vitest";

import {
  financeServicesProfiles,
  generateFinanceServicesCoreDraft,
  generateFinanceServicesDraft,
} from "@/lib/finance-services-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Services finance et assurance", () => {
  const profiles = Object.values(financeServicesProfiles);
  const coreDraft = generateFinanceServicesCoreDraft();
  const coreLabels = Object.values(coreDraft.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement les quatre métiers du lot", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "cabinet-assurance",
      "courtier-credit-assurance",
      "gestionnaire-de-patrimoine",
      "societe-recouvrement",
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
    const draft = generateFinanceServicesDraft(profile);
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
    const contentFor = (slug: keyof typeof financeServicesProfiles) =>
      Object.values(
        generateFinanceServicesDraft(financeServicesProfiles[slug])
          .contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("courtier-credit-assurance")).toMatch(/IOBSP/i);
    expect(contentFor("courtier-credit-assurance")).toMatch(/condition suspensive/i);
    expect(contentFor("cabinet-assurance")).toMatch(/exigences et besoins/i);
    expect(contentFor("cabinet-assurance")).toMatch(/DDA/i);
    expect(contentFor("gestionnaire-de-patrimoine")).toMatch(/rapport d’adéquation/i);
    expect(contentFor("gestionnaire-de-patrimoine")).toMatch(/lettre de mission/i);
    expect(contentFor("societe-recouvrement")).toMatch(
      /certaine liquide et exigible/i,
    );
    expect(contentFor("societe-recouvrement")).toMatch(/mise en demeure/i);
  });
});

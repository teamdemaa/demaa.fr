import { describe, expect, it } from "vitest";

import {
  generateRealEstateTransactionCoreDraft,
  generateRealEstateTransactionDraft,
  realEstateTransactionProfiles,
} from "@/lib/real-estate-transaction-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Immobilier transaction", () => {
  const profiles = Object.values(realEstateTransactionProfiles);
  const coreDraft = generateRealEstateTransactionCoreDraft();
  const coreLabels = Object.values(coreDraft.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement l’agence immobilière et le chasseur immobilier", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "agence-immobiliere",
      "chasseur-immobilier",
    ]);
  });

  it("le socle contient 13 processus, 74 contenus et les quatre types", () => {
    const audit = auditProcessDraft(coreDraft, {
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
    const draft = generateRealEstateTransactionDraft(profile);
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

  it("nomme les opérations distinctives des deux métiers", () => {
    const contentFor = (
      slug: keyof typeof realEstateTransactionProfiles,
    ) =>
      Object.values(
        generateRealEstateTransactionDraft(
          realEstateTransactionProfiles[slug],
        ).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("agence-immobiliere")).toMatch(/mandat de vente/i);
    expect(contentFor("agence-immobiliere")).toMatch(/DPE/i);
    expect(contentFor("chasseur-immobilier")).toMatch(/mandat de recherche/i);
    expect(contentFor("chasseur-immobilier")).toMatch(/off-market/i);
  });
});

import { describe, expect, it } from "vitest";

import {
  generateInvestmentCoreDraft,
  generateInvestmentDraft,
  investmentProfiles,
} from "@/lib/investment-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Investissement", () => {
  const profiles = Object.values(investmentProfiles);
  const core = generateInvestmentCoreDraft();
  const coreLabels = Object.values(core.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement les deux systèmes Investissement", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "investissement-entreprise",
      "investissement-financier",
    ]);
  });

  it("le socle contient 12 processus, 74 contenus uniques et les quatre types", () => {
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
    const draft = generateInvestmentDraft(profile);
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
    expect(profile.researchSources.length).toBeGreaterThanOrEqual(5);
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
  });

  it("distingue l’acquisition de sociétés du conseil financier réglementé", () => {
    const contentFor = (slug: keyof typeof investmentProfiles) =>
      Object.values(
        generateInvestmentDraft(investmentProfiles[slug]).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("investissement-entreprise")).toMatch(
      /data room|due diligence|lettre d’intention|closing/i,
    );
    expect(contentFor("investissement-financier")).toMatch(
      /CIF|ORIAS|KYC|adéquation/i,
    );
  });

  it("préserve les limites d’engagement propres à chaque activité", () => {
    expect(
      Object.values(
        generateInvestmentDraft(
          investmentProfiles["investissement-entreprise"],
        ).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" "),
    ).toMatch(/aucun engagement avant pouvoirs, comité, financement/i);

    expect(
      Object.values(
        generateInvestmentDraft(
          investmentProfiles["investissement-financier"],
        ).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" "),
    ).toMatch(/aucun conseil sans informations suffisantes/i);
  });
});

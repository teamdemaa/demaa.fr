import { describe, expect, it } from "vitest";

import {
  digitalCommerceProfiles,
  generateDigitalCommerceCoreDraft,
  generateDigitalCommerceDraft,
} from "@/lib/digital-commerce-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Commerce numérique", () => {
  const profiles = Object.values(digitalCommerceProfiles);

  it("couvre les deux systèmes du groupe", () => {
    expect(profiles).toHaveLength(2);
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "e-commerce",
      "marketplace",
    ]);
  });

  it.each(profiles)("$name possède tous ses processus et 74 contenus", (profile) => {
    const draft = generateDigitalCommerceDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: Object.keys(profile.processIds).length,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
  });

  it.each(profiles)("$name possède une variante concrète", (profile) => {
    const core = generateDigitalCommerceCoreDraft(profile);
    const draft = generateDigitalCommerceDraft(profile);
    const coreLabels = Object.values(core.contentByProcessId)
      .flat()
      .map((entry) => entry.label);
    const labels = Object.values(draft.contentByProcessId)
      .flat()
      .map((entry) => entry.label);

    expect(
      labels.filter((label, index) => label !== coreLabels[index]),
    ).toHaveLength(15);
    expect(new Set(labels).size).toBe(74);
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
  });

  it("nomme les preuves et opérations distinctives", () => {
    const labelsBySlug = Object.fromEntries(
      profiles.map((profile) => [
        profile.slug,
        Object.values(generateDigitalCommerceDraft(profile).contentByProcessId)
          .flat()
          .map((entry) => entry.label)
          .join(" "),
      ]),
    );

    expect(labelsBySlug["e-commerce"]).toMatch(
      /SKU|panier|transporteur|rétractation|CGV/i,
    );
    expect(labelsBySlug.marketplace).toMatch(
      /vendeur vérifié|modération|signalement|reversement|liquidité/i,
    );
  });
});

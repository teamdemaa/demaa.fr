import { describe, expect, it } from "vitest";

import {
  generatePropertyOperationsCoreDraft,
  generatePropertyOperationsDraft,
  propertyOperationsProfiles,
} from "@/lib/property-operations-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Immobilier", () => {
  const profiles = Object.values(propertyOperationsProfiles);

  it("couvre les trois systèmes du groupe", () => {
    expect(profiles).toHaveLength(3);
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "conciergerie-airbnb",
      "gestion-locative",
      "syndic",
    ]);
  });

  it.each(profiles)("$name possède 12 processus et 74 contenus", (profile) => {
    const draft = generatePropertyOperationsDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 12,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
  });

  it.each(profiles)("$name possède une variante concrète", (profile) => {
    const core = generatePropertyOperationsCoreDraft(profile);
    const draft = generatePropertyOperationsDraft(profile);
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
        Object.values(generatePropertyOperationsDraft(profile).contentByProcessId)
          .flat()
          .map((entry) => entry.label)
          .join(" "),
      ]),
    );

    expect(labelsBySlug.syndic).toMatch(
      /assemblée générale|procès-verbal|fonds|fiche synthétique/i,
    );
    expect(labelsBySlug["gestion-locative"]).toMatch(
      /bail|état des lieux|dépôt de garantie|quittance/i,
    );
    expect(labelsBySlug["conciergerie-airbnb"]).toMatch(
      /réservation|ménage|enregistrement|taxe de séjour/i,
    );
  });
});

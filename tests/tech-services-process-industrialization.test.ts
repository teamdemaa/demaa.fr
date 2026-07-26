import { describe, expect, it } from "vitest";

import {
  generateTechServicesTradeProcessDraft,
  techServicesFamilyCoreDraft,
  techServicesTradeProfiles,
} from "@/lib/tech-services-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Services tech B2B", () => {
  const profiles = Object.values(techServicesTradeProfiles);

  it("couvre les cinq métiers en deux vagues", () => {
    expect(profiles).toHaveLength(5);
    expect(profiles.filter((profile) => profile.wave === "managed")).toHaveLength(2);
    expect(profiles.filter((profile) => profile.wave === "product")).toHaveLength(3);
  });

  it("le socle contient 19 processus et 74 contenus", () => {
    const audit = auditProcessDraft(techServicesFamilyCoreDraft, {
      processCount: 19,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
  });

  it.each(profiles)("$name possède une variante concrète", (profile) => {
    const draft = generateTechServicesTradeProcessDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 19,
      contentCount: 74,
    });
    const core = Object.values(techServicesFamilyCoreDraft.contentByProcessId)
      .flat()
      .map((entry) => entry.label);
    const labels = Object.values(draft.contentByProcessId)
      .flat()
      .map((entry) => entry.label);

    expect(audit.errors).toEqual([]);
    expect(labels.filter((label, index) => label !== core[index])).toHaveLength(
      14,
    );
    expect(new Set(labels).size).toBe(74);
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
  });
});

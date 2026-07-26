import { describe, expect, it } from "vitest";

import {
  generateLogisticsTradeProcessDraft,
  logisticsFamilyCoreDraft,
  logisticsTradeProfiles,
} from "@/lib/logistics-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Logistique transport", () => {
  const profiles = Object.values(logisticsTradeProfiles);

  it("couvre les cinq métiers en deux vagues", () => {
    expect(profiles).toHaveLength(5);
    expect(profiles.filter((profile) => profile.wave === "goods")).toHaveLength(3);
    expect(profiles.filter((profile) => profile.wave === "people")).toHaveLength(2);
  });

  it("le socle contient 11 processus et 74 contenus", () => {
    const audit = auditProcessDraft(logisticsFamilyCoreDraft, {
      processCount: 11,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
  });

  it.each(profiles)("$name possède une variante concrète", (profile) => {
    const draft = generateLogisticsTradeProcessDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 11,
      contentCount: 74,
    });
    const core = Object.values(logisticsFamilyCoreDraft.contentByProcessId)
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

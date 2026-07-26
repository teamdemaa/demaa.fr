import { describe, expect, it } from "vitest";

import {
  fastFoodFamilyCoreDraft,
  fastFoodTradeProfiles,
  generateFastFoodTradeProcessDraft,
} from "@/lib/fast-food-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Fast Food", () => {
  const profiles = Object.values(fastFoodTradeProfiles);

  it("couvre les sept métiers", () => {
    expect(profiles).toHaveLength(7);
  });

  it("le socle contient 20 processus et 74 contenus", () => {
    const audit = auditProcessDraft(fastFoodFamilyCoreDraft, {
      processCount: 20,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
  });

  it.each(profiles)("$name possède une variante concrète", (profile) => {
    const draft = generateFastFoodTradeProcessDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 20,
      contentCount: 74,
    });
    const core = Object.values(fastFoodFamilyCoreDraft.contentByProcessId)
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

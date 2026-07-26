import { describe, expect, it } from "vitest";

import {
  commerceFamilyCoreDraft,
  commerceTradeProfiles,
  generateCommerceTradeProcessDraft,
} from "@/lib/commerce-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Commerce", () => {
  const profiles = Object.values(commerceTradeProfiles);

  it("couvre les sept métiers", () => {
    expect(profiles).toHaveLength(7);
  });

  it("le socle contient 17 processus et 74 contenus", () => {
    const audit = auditProcessDraft(commerceFamilyCoreDraft, {
      processCount: 17,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
  });

  it.each(profiles)("$name possède une variante concrète", (profile) => {
    const draft = generateCommerceTradeProcessDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 17,
      contentCount: 74,
    });
    const core = Object.values(commerceFamilyCoreDraft.contentByProcessId)
      .flat()
      .map((entry) => entry.label);
    const labels = Object.values(draft.contentByProcessId)
      .flat()
      .map((entry) => entry.label);

    expect(audit.errors).toEqual([]);
    expect(labels.filter((label, index) => label !== core[index])).toHaveLength(
      12,
    );
    expect(new Set(labels).size).toBe(74);
    expect(
      labels.some((label) => /support associé|à personnaliser|modèle à préparer/i.test(label)),
    ).toBe(false);
  });
});

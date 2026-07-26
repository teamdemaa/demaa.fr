import { describe, expect, it } from "vitest";

import {
  consultingFamilyCoreDraft,
  consultingTradeProfiles,
  generateConsultingTradeProcessDraft,
} from "@/lib/consulting-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Conseil expert", () => {
  const profiles = Object.values(consultingTradeProfiles);

  it("couvre les douze métiers en trois vagues", () => {
    expect(profiles).toHaveLength(12);
    expect(profiles.filter((profile) => profile.wave === "consulting")).toHaveLength(5);
    expect(profiles.filter((profile) => profile.wave === "externalized")).toHaveLength(4);
    expect(profiles.filter((profile) => profile.wave === "studies")).toHaveLength(3);
  });

  it("le socle contient 19 processus et 74 contenus", () => {
    const audit = auditProcessDraft(consultingFamilyCoreDraft, {
      processCount: 19,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
  });

  it.each(profiles)("$name possède une variante concrète", (profile) => {
    const draft = generateConsultingTradeProcessDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 19,
      contentCount: 74,
    });
    const core = Object.values(consultingFamilyCoreDraft.contentByProcessId)
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

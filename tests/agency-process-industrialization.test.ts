import { describe, expect, it } from "vitest";

import {
  agencyFamilyCoreDraft,
  agencyTradeProfiles,
  generateAgencyTradeProcessDraft,
} from "@/lib/agency-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process des agences digitales", () => {
  const profiles = Object.values(agencyTradeProfiles);

  it("couvre les huit métiers de la famille", () => {
    expect(profiles).toHaveLength(8);
    expect(new Set(profiles.map((profile) => profile.slug)).size).toBe(8);
  });

  it("le socle contient 19 processus et 74 contenus concrets", () => {
    const audit = auditProcessDraft(agencyFamilyCoreDraft, {
      processCount: 19,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
  });

  it.each(profiles)(
    "$name conserve le volume et adapte réellement le socle",
    (profile) => {
      const draft = generateAgencyTradeProcessDraft(profile);
      const audit = auditProcessDraft(draft, {
        processCount: 19,
        contentCount: 74,
      });
      const coreLabels = Object.values(
        agencyFamilyCoreDraft.contentByProcessId,
      ).flatMap((items) => items.map((item) => item.label));
      const labels = Object.values(draft.contentByProcessId).flatMap((items) =>
        items.map((item) => item.label),
      );
      const differences = labels.filter(
        (label, index) => label !== coreLabels[index],
      );

      expect(profile.reviewState).toBe("internal_review_complete");
      expect(audit.errors).toEqual([]);
      expect(audit.contentTypes.sort()).toEqual(
        [...operationalContentTypes].sort(),
      );
      expect(differences).toHaveLength(14);
      expect(new Set(labels).size).toBe(74);
      expect(
        labels.some((label) =>
          /à personnaliser|modèle à préparer|document associé/i.test(label),
        ),
      ).toBe(false);
    },
  );
});

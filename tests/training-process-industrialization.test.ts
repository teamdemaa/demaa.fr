import { describe, expect, it } from "vitest";

import {
  generateTrainingCoreDraft,
  generateTrainingDraft,
  trainingProfiles,
} from "@/lib/training-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Formation", () => {
  const profiles = Object.values(trainingProfiles);

  it("couvre exactement les trois systèmes du lot", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "cfa",
      "formation-en-ligne",
      "organisme-de-formation",
    ]);
  });

  it.each(profiles)("$name possède ses processus et 74 contenus", (profile) => {
    const audit = auditProcessDraft(generateTrainingDraft(profile), {
      processCount: profile.processes.length,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
  });

  it.each(profiles)("$name possède 15 adaptations concrètes", (profile) => {
    const coreLabels = Object.values(
      generateTrainingCoreDraft(profile).contentByProcessId,
    )
      .flat()
      .map((entry) => entry.label);
    const labels = Object.values(generateTrainingDraft(profile).contentByProcessId)
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

  it("nomme les opérations distinctives", () => {
    const labelsBySlug = Object.fromEntries(
      profiles.map((profile) => [
        profile.slug,
        Object.values(generateTrainingDraft(profile).contentByProcessId)
          .flat()
          .map((entry) => entry.label)
          .join(" "),
      ]),
    );

    expect(labelsBySlug["organisme-de-formation"]).toMatch(
      /BPF|convention|financeur|positionnement|attestation/i,
    );
    expect(labelsBySlug.cfa).toMatch(
      /maître d’apprentissage|rupture|OPCO|livret|employeur/i,
    );
    expect(labelsBySlug["formation-en-ligne"]).toMatch(
      /FOAD|LMS|assistance technique|activité horodatée|complétion/i,
    );
  });
});

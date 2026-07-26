import { describe, expect, it } from "vitest";

import {
  generateHospitalityEventsDraft,
  hospitalityEventsProfiles,
} from "@/lib/hospitality-events-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Hospitalité & événements", () => {
  const profiles = Object.values(hospitalityEventsProfiles);

  it("couvre exactement Événementiel et Hôtel indépendant", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "evenementiel",
      "hotel-hebergement-independant",
    ]);
  });

  it.each(profiles)("$name possède 74 contenus uniques et les quatre types", (profile) => {
    const draft = generateHospitalityEventsDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: profile.processCount,
      contentCount: 74,
    });
    const labels = Object.values(draft.contentByProcessId)
      .flat()
      .map((entry) => entry.label);

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
    expect(new Set(labels).size).toBe(74);
    expect(profile.researchSources.length).toBeGreaterThanOrEqual(5);
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
  });

  it("ne duplique aucun contenu exact entre les deux métiers", () => {
    const labelsFor = (slug: keyof typeof hospitalityEventsProfiles) =>
      new Set(
        Object.values(
          generateHospitalityEventsDraft(hospitalityEventsProfiles[slug])
            .contentByProcessId,
        )
          .flat()
          .map((entry) => entry.label),
      );
    const events = labelsFor("evenementiel");
    const hotel = labelsFor("hotel-hebergement-independant");

    expect([...events].filter((label) => hotel.has(label))).toEqual([]);
  });

  it("distingue production événementielle et exploitation hôtelière", () => {
    const contentFor = (slug: keyof typeof hospitalityEventsProfiles) =>
      Object.values(
        generateHospitalityEventsDraft(hospitalityEventsProfiles[slug])
          .contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("evenementiel")).toMatch(
      /jour J|conducteur minute|jauge|montage|prestataire/i,
    );
    expect(contentFor("hotel-hebergement-independant")).toMatch(
      /PMS|chambre|fiche de police|nuitée|ménage/i,
    );
  });

  it("conserve les contrôles réglementaires déterminants", () => {
    expect(
      Object.values(
        generateHospitalityEventsDraft(
          hospitalityEventsProfiles.evenementiel,
        ).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" "),
    ).toMatch(/ne pas ouvrir au public/i);

    expect(
      Object.values(
        generateHospitalityEventsDraft(
          hospitalityEventsProfiles["hotel-hebergement-independant"],
        ).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" "),
    ).toMatch(/support durable|registre de sécurité/i);
  });
});

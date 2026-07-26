import { describe, expect, it } from "vitest";

import {
  generateWelcomeServicesCoreDraft,
  generateWelcomeServicesDraft,
  welcomeServicesProfiles,
} from "@/lib/welcome-services-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Accueil & services", () => {
  const profiles = Object.values(welcomeServicesProfiles);
  const core = generateWelcomeServicesCoreDraft();
  const coreLabels = Object.values(core.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("couvre exactement Agence de voyage et Centre d’affaires / coworking", () => {
    expect(profiles.map((profile) => profile.slug).sort()).toEqual([
      "agence-de-voyage",
      "centre-affaires-coworking",
    ]);
  });

  it("le socle contient 13 processus, 74 contenus uniques et les quatre types", () => {
    const audit = auditProcessDraft(core, {
      processCount: 13,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
    expect(new Set(coreLabels).size).toBe(74);
  });

  it.each(profiles)("$name possède une variante concrète et sourcée", (profile) => {
    const draft = generateWelcomeServicesDraft(profile);
    const audit = auditProcessDraft(draft, {
      processCount: 13,
      contentCount: 74,
    });
    const labels = Object.values(draft.contentByProcessId)
      .flat()
      .map((entry) => entry.label);

    expect(audit.errors).toEqual([]);
    expect(labels.filter((label, index) => label !== coreLabels[index])).toHaveLength(
      16,
    );
    expect(new Set(labels).size).toBe(74);
    expect(profile.researchSources.length).toBeGreaterThanOrEqual(5);
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
  });

  it("distingue les dossiers voyageurs de l’exploitation d’un lieu", () => {
    const contentFor = (slug: keyof typeof welcomeServicesProfiles) =>
      Object.values(
        generateWelcomeServicesDraft(
          welcomeServicesProfiles[slug],
        ).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

    expect(contentFor("agence-de-voyage")).toMatch(
      /Atout France|voyageurs|GDS|rapatriement/i,
    );
    expect(contentFor("centre-affaires-coworking")).toMatch(
      /ERP|domiciliation|badge|Wi-Fi/i,
    );
  });

  it("préserve les limites critiques de vente et d’accès", () => {
    for (const profile of profiles) {
      const labels = Object.values(
        generateWelcomeServicesDraft(profile).contentByProcessId,
      )
        .flat()
        .map((entry) => entry.label)
        .join(" ");

      expect(labels).toMatch(/Ne pas confirmer une solution/i);
      expect(labels).toMatch(/Ne jamais considérer une option/i);
      expect(labels).toMatch(/sécuriser les personnes/i);
    }
  });
});

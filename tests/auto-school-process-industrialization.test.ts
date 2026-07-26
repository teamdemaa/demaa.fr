import { describe, expect, it } from "vitest";

import {
  autoSchoolResearchSources,
  generateAutoSchoolDraft,
} from "@/lib/auto-school-process-industrialization";
import {
  auditProcessDraft,
  operationalContentTypes,
} from "@/lib/process-industrialization";

describe("industrialisation Process Auto-école", () => {
  const draft = generateAutoSchoolDraft();
  const labels = Object.values(draft.contentByProcessId)
    .flat()
    .map((entry) => entry.label);

  it("conserve les 17 processus et produit exactement 74 contenus", () => {
    const audit = auditProcessDraft(draft, {
      processCount: 17,
      contentCount: 74,
    });

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual(
      [...operationalContentTypes].sort(),
    );
    expect(new Set(labels).size).toBe(74);
  });

  it("remplace les placeholders par des consignes opérationnelles", () => {
    expect(
      labels.some((label) =>
        /support associé|à personnaliser|modèle à préparer/i.test(label),
      ),
    ).toBe(false);
  });

  it("nomme les opérations distinctives du métier", () => {
    const content = labels.join(" ");

    expect(content).toMatch(/Google Business Profile/i);
    expect(content).toMatch(/ANTS|France Titres/i);
    expect(content).toMatch(/NEPH/i);
    expect(content).toMatch(/RdvPermis/i);
    expect(content).toMatch(/livret d’apprentissage numérique/i);
    expect(content).toMatch(/double commande/i);
    expect(content).toMatch(/agrément/i);
    expect(content).toMatch(/CPF/i);
  });

  it("s’appuie sur plusieurs sources publiques de référence", () => {
    expect(autoSchoolResearchSources).toHaveLength(5);
    expect(
      autoSchoolResearchSources.every((source) => source.startsWith("https://")),
    ).toBe(true);
  });
});

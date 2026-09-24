import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("situations concrètes de l’accompagnement", () => {
  it("shows concrete scenarios without presenting them as client testimonials", async () => {
    const [component, cases] = await Promise.all([
      readSource("src/components/AccompanimentCaseStudies.tsx"),
      readSource("src/lib/accompaniment-case-studies.ts"),
    ]);

    expect(component).toContain("Des situations concrètes.");
    expect(component).toContain("Aperçu illustratif");
    expect(component).toContain("elle ne constitue pas un témoignage client");
    expect(component).toContain("Le problème de départ");
    expect(component).toContain("Le système à installer");
    expect(component).toContain("Le flux de travail");
    expect(cases).toContain("Cabinet comptable");
    expect(cases).toContain("Sécurité incendie");
    expect(cases).toContain("BTP et rénovation");
    expect(cases).toContain("Entreprise d’électricité");
    expect(cases).toContain("Maintenance informatique");
  });
});

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readLanding() {
  return readFile(
    new URL("../src/components/OperationalAccompanimentLandingPage.tsx", import.meta.url),
    "utf8",
  );
}

describe("landing d’accompagnement", () => {
  it("keeps the promise focused on reducing dependence on the leader", async () => {
    const landing = await readLanding();

    expect(landing).toContain("On organise votre entreprise pour qu’elle repose moins sur vous.");
    expect(landing).toContain("On part de vos outils actuels.");
    expect(landing).toContain("On commence par un flux prioritaire");
    expect(landing).toContain("Accompagnement de quatre semaines · 3 500 € HT");
    expect(landing).toContain('label="Réserver un diagnostic offert"');
    expect(landing).not.toContain("Votre entreprise ne doit plus tenir dans votre tête.");
  });
});

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import rawProcessCadences from "@/lib/system-process-cadences.generated.json";
import {
  getSystemProcessCadence,
  normalizePublicProcessCadence,
} from "@/lib/system-process-cadences";
import { buildSystemeDetail } from "@/lib/systeme-catalog";

describe("public system Process cadences", () => {
  it("keeps a generated process-level cadence for every active system", () => {
    expect(rawProcessCadences.metadata).toEqual({
      cadenceCount: 1826,
      systemCount: 115,
      version: "1.0.0",
    });
    expect(Object.keys(rawProcessCadences.cadencesBySystem)).toHaveLength(115);

    for (const enterprise of enterpriseCatalog) {
      const cadences = rawProcessCadences.cadencesBySystem[
        enterprise.slug as keyof typeof rawProcessCadences.cadencesBySystem
      ];

      expect(cadences, enterprise.slug).toBeDefined();
      expect(
        Object.values(cadences).every(
          (cadence) =>
            cadence.trim().length > 0 &&
            cadence !== "Une fois, puis à revoir si besoin",
        ),
        enterprise.slug,
      ).toBe(true);
    }
  });

  it("normalizes only the simple source labels used in the public UI", () => {
    expect(normalizePublicProcessCadence("Quotidienne")).toBe("Chaque jour");
    expect(normalizePublicProcessCadence("Hebdomadaire")).toBe(
      "Chaque semaine",
    );
    expect(normalizePublicProcessCadence("Mensuelle")).toBe("Chaque mois");
    expect(normalizePublicProcessCadence("Trimestrielle")).toBe(
      "Chaque trimestre",
    );
    expect(normalizePublicProcessCadence("Annuelle")).toBe("Chaque année");
    expect(normalizePublicProcessCadence("Selon échéance")).toBe(
      "À chaque échéance",
    );
    expect(
      normalizePublicProcessCadence(
        "À chaque demande, revue hebdomadaire des devis",
      ),
    ).toBe("À chaque demande, revue hebdomadaire des devis");
  });

  it("resolves source cadences without reading a step recurrence", () => {
    expect(
      getSystemProcessCadence(
        "plomberie-chauffage",
        "process.btp.direction.garder-une-visibilite-sans-reprendre-la-main",
      ),
    ).toBe("Chaque mois");
    expect(
      getSystemProcessCadence(
        "plomberie-chauffage",
        "process.btp.marketing-vente.traiter-une-reclamation-ou-un-litige-client",
      ),
    ).toBe("À chaque réclamation");
    expect(getSystemProcessCadence("inconnu", "process.inconnu")).toBeNull();
  });

  it("removes the setup recurrence from every public routine card", () => {
    for (const enterprise of enterpriseCatalog) {
      const detail = buildSystemeDetail(enterprise);

      expect(detail, enterprise.slug).not.toBeNull();
      expect(
        detail?.routines.every(
          (routine) =>
            routine.cadence.trim().length > 0 &&
            routine.cadence !== "Une fois, puis à revoir si besoin",
        ),
        enterprise.slug,
      ).toBe(true);
    }
  });

  it("blocks a recurrence fallback in the public routine builder", async () => {
    const source = await readFile(
      new URL("../src/lib/systeme-catalog.ts", import.meta.url),
      "utf8",
    );

    expect(source).toContain("getSystemProcessCadence");
    expect(source).not.toMatch(
      /const (?:frequency|cadence) = item\.steps\.find/,
    );
  });
});

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getOperationalWorkbookV2PilotProfile } from "@/lib/operational-workbook-v2-profiles";
import {
  CURATED_SYSTEM_PROCESS_ROUTINE_SLUGS,
  getCuratedSystemProcessRoutines,
} from "@/lib/system-process-routines";
import { buildSystemeDetail } from "@/lib/systeme-catalog";
import expectedFingerprints from "./fixtures/systeme-detail-output-fingerprints-r1.json";

describe("system Process routine decoupling", () => {
  it("keeps the five curated profiles complete and stable", () => {
    const expectedCounts = {
      batiment: 8,
      restaurant: 8,
      "agence-marketing": 8,
      pharmacie: 8,
      "assistant-administratif-externalise": 9,
    } as const;

    for (const systemSlug of CURATED_SYSTEM_PROCESS_ROUTINE_SLUGS) {
      const routines = getCuratedSystemProcessRoutines(systemSlug);

      expect(routines, systemSlug).toHaveLength(expectedCounts[systemSlug]);
      expect(
        new Set(routines.map((routine) => routine.routineId)).size,
        systemSlug,
      ).toBe(routines.length);

      for (const routine of routines) {
        expect(routine.frequency.trim(), routine.routineId).not.toBe("");
        expect(routine.title.trim(), routine.routineId).not.toBe("");
        expect(routine.sourceProcessIds.length, routine.routineId).toBeGreaterThan(0);
        expect(routine.sourceStepIds.length, routine.routineId).toBeGreaterThanOrEqual(2);
        expect(routine.sourceStepIds.length, routine.routineId).toBeLessThanOrEqual(4);
      }
    }
  });

  it("keeps every public DTO byte-for-byte equivalent to the R1 baseline", () => {
    expect(enterpriseCatalog).toHaveLength(115);
    expect(Object.keys(expectedFingerprints)).toHaveLength(115);

    for (const enterprise of enterpriseCatalog) {
      const detail = buildSystemeDetail(enterprise);
      const sha256 = createHash("sha256")
        .update(JSON.stringify(detail))
        .digest("hex");

      expect(
        {
          sha256,
          routines: detail?.routines.length ?? 0,
        },
        enterprise.slug,
      ).toEqual(
        expectedFingerprints[
          enterprise.slug as keyof typeof expectedFingerprints
        ],
      );
    }
  });

  it("keeps workbook pilots downstream from the dedicated Process registry", () => {
    for (const systemSlug of CURATED_SYSTEM_PROCESS_ROUTINE_SLUGS) {
      expect(getOperationalWorkbookV2PilotProfile(systemSlug)?.routines).toEqual(
        getCuratedSystemProcessRoutines(systemSlug),
      );
    }
  });

  it("blocks workbook-v2 imports from the public Process runtime", async () => {
    const [catalogSource, registrySource, presentationSource, workbookProfilesSource] =
      await Promise.all([
        readFile(
          new URL("../src/lib/systeme-catalog.ts", import.meta.url),
          "utf8",
        ),
        readFile(
          new URL("../src/lib/system-process-routines.ts", import.meta.url),
          "utf8",
        ),
        readFile(
          new URL("../src/components/SystemeTabContent.tsx", import.meta.url),
          "utf8",
        ),
        readFile(
          new URL(
            "../src/lib/operational-workbook-v2-profiles.ts",
            import.meta.url,
          ),
          "utf8",
        ),
      ]);

    expect(catalogSource).not.toMatch(/operational-workbook-v2/);
    expect(registrySource).not.toMatch(/operational-workbook-v2/);
    expect(presentationSource).not.toMatch(/operational-workbook-v2/);
    expect(workbookProfilesSource).toContain(
      'from "@/lib/system-process-routines"',
    );
  });
});

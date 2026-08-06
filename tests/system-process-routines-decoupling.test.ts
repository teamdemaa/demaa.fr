import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getOperationalWorkbookV2PilotProfile } from "@/lib/operational-workbook-v2-profiles";
import {
  CURATED_SYSTEM_PROCESS_ROUTINE_SLUGS,
  findCuratedSystemProcessRoutines,
  getCuratedSystemProcessRoutines,
} from "@/lib/system-process-routines";
import { buildSystemeDetail } from "@/lib/systeme-catalog";
import legacyFingerprints from "./fixtures/systeme-detail-output-fingerprints-r1.json";
import expectedFingerprints from "./fixtures/systeme-detail-output-fingerprints-r2.json";

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

  it("keeps every public DTO byte-for-byte equivalent to the R2 cadence baseline", () => {
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

  it("changes only the Process cadence contract from the R1 public DTO", () => {
    expect(Object.keys(legacyFingerprints)).toHaveLength(115);

    for (const enterprise of enterpriseCatalog) {
      const detail = buildSystemeDetail(enterprise);
      expect(detail, enterprise.slug).not.toBeNull();

      const curatedFrequencyByRoutineId = new Map(
        (findCuratedSystemProcessRoutines(enterprise.slug) ?? []).map(
          (routine) => [routine.routineId, routine.frequency],
        ),
      );
      const processById = new Map(
        detail?.cards.flatMap((card) =>
          card.items.map((item) => [item.processId, item] as const),
        ),
      );
      const routinePrefix = `routine.${enterprise.slug}.`;
      const legacyDetail = detail
        ? {
            cards: detail.cards,
            routines: detail.routines.map((routine) => {
              const processId = routine.routineId.slice(routinePrefix.length);
              const frequency =
                curatedFrequencyByRoutineId.get(routine.routineId) ??
                processById
                  .get(processId)
                  ?.steps.find((step) => step.recurrence.trim())?.recurrence;

              expect(frequency, routine.routineId).toBeTruthy();

              return {
                bullets: routine.bullets,
                frequency,
                routineId: routine.routineId,
                support: routine.support,
                title: routine.title,
              };
            }),
          }
        : null;
      const sha256 = createHash("sha256")
        .update(JSON.stringify(legacyDetail))
        .digest("hex");

      expect(
        {
          sha256,
          routines: legacyDetail?.routines.length ?? 0,
        },
        enterprise.slug,
      ).toEqual(
        legacyFingerprints[
          enterprise.slug as keyof typeof legacyFingerprints
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

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import type { EnterpriseDefinition } from "@/lib/enterprise-annuaire";
import { buildSystemeDetail } from "@/lib/systeme-catalog";
import enterprisePayload from "@/lib/enterprise-annuaire.json";

const pilotSlugs = new Set([
  "batiment",
  "restaurant",
  "agence-marketing",
  "pharmacie",
  "assistant-administratif-externalise",
]);

describe("public operational system DTO", () => {
  it("never serializes document source or copy URLs to client components", () => {
    const plumbing = enterprisePayload.enterprises.find(
      (enterprise) => enterprise.slug === "plomberie-chauffage",
    );

    expect(plumbing).toBeDefined();

    const detail = buildSystemeDetail(plumbing as EnterpriseDefinition);
    const serialized = JSON.stringify(detail);

    expect(serialized).not.toContain("documentUrl");
    expect(serialized).not.toContain("documentCopyUrl");
    expect(serialized).not.toContain("docs.google.com");
  });

  it("projects the pilot routines without exposing support links", () => {
    const building = enterprisePayload.enterprises.find(
      (enterprise) => enterprise.slug === "batiment",
    );
    const detail = buildSystemeDetail(building as EnterpriseDefinition);

    expect(detail?.routines).toHaveLength(8);
    expect(
      detail?.routines?.every(
        (routine) =>
          routine.bullets.length >= 2 &&
          routine.bullets.length <= 4 &&
          routine.support === null,
      ),
    ).toBe(true);
    expect(JSON.stringify(detail?.routines)).not.toContain("docs.google.com");
  });

  it("projects 8 to 12 routines for all 115 systems with the five curated pilots intact", () => {
    const details = enterprisePayload.enterprises.map((enterprise) => ({
      slug: enterprise.slug,
      detail: buildSystemeDetail(enterprise as EnterpriseDefinition),
    }));

    expect(details).toHaveLength(115);

    for (const { detail, slug } of details) {
      expect(detail, slug).not.toBeNull();
      expect(detail?.routines.length, slug).toBeGreaterThanOrEqual(8);
      expect(detail?.routines.length, slug).toBeLessThanOrEqual(12);
      expect(
        detail?.routines.every(
          (routine) =>
            routine.bullets.length >= 2 &&
            routine.bullets.length <= 4 &&
            routine.frequency.trim().length > 0 &&
            routine.support === null &&
            routine.title.trim().length > 0,
        ),
        slug,
      ).toBe(true);
      expect(
        new Set(detail?.routines.map((routine) => routine.routineId)).size,
        slug,
      ).toBe(detail?.routines.length);

      if (pilotSlugs.has(slug)) {
        expect(
          detail?.routines.every(
            (routine) => !routine.routineId.startsWith(`routine.${slug}.`),
          ),
          slug,
        ).toBe(true);
      } else {
        expect(
          detail?.routines.every((routine) =>
            routine.routineId.startsWith(`routine.${slug}.`),
          ),
          slug,
        ).toBe(true);
      }
    }

    expect(JSON.stringify(details)).not.toContain("docs.google.com");
  });

  it("builds public Process routines without reading workbook activation pointers", async () => {
    const source = await readFile(
      new URL("../src/lib/systeme-catalog.ts", import.meta.url),
      "utf8",
    );

    expect(source).not.toMatch(
      /from "@\/lib\/(?:editable-operational-system-assets|operational-system-asset-revisions)/,
    );
    expect(source).not.toContain("activeRevision");
    expect(source).not.toContain("demoUrl");
    expect(source).not.toContain("previewUrl");
  });
});

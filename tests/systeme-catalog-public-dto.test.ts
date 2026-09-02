import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import type { EnterpriseDefinition } from "@/lib/enterprise-annuaire";
import { buildSystemeDetail } from "@/lib/systeme-catalog";
import {
  getSystemProcessDisplayOrder,
  orderSystemeRoutinesForDisplay,
} from "@/lib/system-process-order";
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
            routine.cadence.trim().length > 0 &&
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
    expect(
      JSON.stringify(details.map(({ detail }) => detail?.routines)),
    ).not.toContain("Une fois, puis à revoir si besoin");
  });

  it("orders derived routines as a readable business journey", () => {
    for (const enterprise of enterprisePayload.enterprises) {
      if (pilotSlugs.has(enterprise.slug)) continue;

      const detail = buildSystemeDetail(enterprise as EnterpriseDefinition)!;
      const routines = orderSystemeRoutinesForDisplay(
        detail.routines,
        detail.cards,
        enterprise.slug,
      );
      const contextByProcessId = new Map(
        detail.cards.flatMap((card) =>
          card.items.map((item) => [item.processId, { item, pillar: card.pillar }] as const),
        ),
      );
      const displayOrders = routines.map((routine) => {
        const processId = routine.routineId.slice(`routine.${enterprise.slug}.`.length);
        const context = contextByProcessId.get(processId);
        expect(context, `${enterprise.slug}:${processId}`).toBeDefined();
        return getSystemProcessDisplayOrder(
          context!.pillar,
          context!.item.process,
          context!.item.document,
        );
      });

      expect(displayOrders, enterprise.slug).toEqual(
        [...displayOrders].sort((left, right) => left - right),
      );
    }

    const cabinet = enterprisePayload.enterprises.find(
      (enterprise) => enterprise.slug === "cabinet-comptable",
    );
    const cabinetDetail = buildSystemeDetail(cabinet as EnterpriseDefinition)!;
    expect(orderSystemeRoutinesForDisplay(
      cabinetDetail.routines,
      cabinetDetail.cards,
      "cabinet-comptable",
    ).map(({ title }) => title)).toEqual([
      "Définir et piloter le cap du cabinet",
      "Développer les dossiers et recommandations",
      "Qualifier, proposer et conclure une mission ou un accompagnement",
      "Ouvrir et tenir un dossier client",
      "Produire et contrôler les livrables",
      "Planifier et régler les échéances",
      "Suivre la rentabilité des dossiers",
      "Organiser les collaborateurs et remplacements",
      "Transmettre un dossier en cas d’absence",
      "Arbitrer et valider les dossiers sans blocage",
      "Centraliser et sécuriser les accès essentiels",
      "Sécuriser confidentialité et obligations métier",
    ]);
  });

  it("keeps curated systems editorially ordered", () => {
    const restaurant = enterprisePayload.enterprises.find(
      (enterprise) => enterprise.slug === "restaurant",
    );
    const restaurantDetail = buildSystemeDetail(restaurant as EnterpriseDefinition)!;
    expect(orderSystemeRoutinesForDisplay(
      restaurantDetail.routines,
      restaurantDetail.cards,
      "restaurant",
    ).slice(0, 3).map(({ title }) => title)).toEqual([
      "Piloter les ventes, la marge et la capacité",
      "Planifier les actions d’acquisition locale",
      "Ouvrir et fermer le restaurant",
    ]);
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

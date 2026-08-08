import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  SYSTEM_RESOURCES,
  getSystemResource,
  getSystemResourcesForSystem,
} from "@/lib/system-resource-catalog";
import {
  getSystemResourceAssetSnapshot,
  resolveSystemResourceDelivery,
} from "@/lib/system-resource-assets.server";
import { getAllDocumentModels } from "@/lib/document-models";

describe("system Resources catalog", () => {
  it("publishes shared resources and generates two planned guides for every known system", () => {
    expect(SYSTEM_RESOURCES.map(({ title }) => title)).toEqual([
      "Tableau de pilotage opérationnel",
      "Suivi et prévisionnel financier",
      "CRM : suivi commercial",
      "Maîtriser les obligations et les finances de son entreprise",
      "La facturation électronique",
    ]);
    expect(SYSTEM_RESOURCES.filter(({ format }) => format === "template").map(({ title }) => title)).toEqual([
      "Tableau de pilotage opérationnel",
      "Suivi et prévisionnel financier",
      "CRM : suivi commercial",
    ]);
    expect(SYSTEM_RESOURCES.filter(({ availability }) => availability === "coming-soon")).toHaveLength(0);
    expect(getSystemResourcesForSystem("cabinet-comptable").filter(({ format }) => format === "guide").map(({ title }) => title)).toEqual([
      "Maîtriser les obligations et les finances de son entreprise",
      "La facturation électronique",
      "Créer et lancer votre activité",
      "Gérer votre activité au quotidien",
    ]);
    expect(getSystemResourcesForSystem("restaurant").filter(({ format }) => format === "guide").map(({ title }) => title)).toEqual([
      "Maîtriser les obligations et les finances de son entreprise",
      "La facturation électronique",
      "Comment ouvrir un restaurant ?",
      "Comment gérer un restaurant ?",
    ]);
    expect(getSystemResource("guide-cabinet-comptable-lancer")).toMatchObject({
      availability: "coming-soon",
      systemSlugs: ["cabinet-comptable"],
      title: "Créer et lancer votre activité",
    });
    expect(getSystemResource("guide-un-systeme-inconnu-lancer")).toBeNull();
    expect(JSON.stringify(SYSTEM_RESOURCES)).not.toMatch(
      /docs\.google\.com|airtable\.com|downloads\/guides|Levier/,
    );
  });

  it("keeps destinations server-only and ties delivery to an immutable revision", () => {
    for (const resource of SYSTEM_RESOURCES.filter(({ availability }) => availability === "available").slice(1)) {
      const snapshot = getSystemResourceAssetSnapshot(resource.resourceSlug);
      expect(snapshot).toMatchObject({
        resourceId: resource.resourceSlug,
        workbookVersion: resource.resourceSlug.startsWith("guide-") ? "2.0.0" : "1.0.0",
      });
      expect(snapshot?.assetRevision).toContain(resource.resourceSlug);
      expect(resolveSystemResourceDelivery(snapshot!)).toMatchObject({
        resourceSlug: resource.resourceSlug,
      });
    }
  });

  it("rejects unknown resources and mismatched revisions", () => {
    expect(getSystemResource("unknown")).toBeNull();
    expect(getSystemResourceAssetSnapshot("unknown")).toBeNull();
    expect(resolveSystemResourceDelivery({
      assetRevision: "wrong",
      resourceId: "crm-suivi-commercial",
      workbookVersion: "1.0.0",
    })).toBeNull();
  });

  it("keeps the replaced guides resolvable for historical deliveries", () => {
    expect(resolveSystemResourceDelivery({
      assetRevision: "guide-facturation-electronique-v1-2026-08-05",
      resourceId: "guide-facturation-electronique",
      workbookVersion: "1.0.0",
    })).toEqual({
      destination: "https://demaa.fr/downloads/guides/guide-facturation-electronique-demaa.pdf",
      resourceSlug: "guide-facturation-electronique",
    });
    expect(resolveSystemResourceDelivery({
      assetRevision: "guide-obligations-fiscales-sociales-comptables-v1-2026-08-05",
      resourceId: "guide-obligations-fiscales-sociales-comptables",
      workbookVersion: "1.0.0",
    })).toEqual({
      destination: "https://demaa.fr/downloads/guides/guide-obligations-fiscales-sociales-comptables-demaa.pdf",
      resourceSlug: "guide-obligations-fiscales-sociales-comptables",
    });
  });

  it("delivers the original slide presentations for new requests", () => {
    for (const resourceSlug of [
      "guide-facturation-electronique",
      "guide-obligations-fiscales-sociales-comptables",
    ] as const) {
      const snapshot = getSystemResourceAssetSnapshot(resourceSlug);
      expect(snapshot?.workbookVersion).toBe("2.0.0");
      expect(resolveSystemResourceDelivery(snapshot!)?.destination).toMatch(
        /^https:\/\/demaa\.fr\/downloads\/presentations\/presentation-.+\.pdf$/,
      );
    }
  });

  it("derives the three document models from the shared editorial catalog", () => {
    const templates = SYSTEM_RESOURCES
      .filter(({ format }) => format === "template")
      .sort((left, right) => left.rank - right.rank);
    const models = getAllDocumentModels();

    expect(models).toHaveLength(3);
    expect(models.map(({ slug, title, description }) => ({ slug, title, description }))).toEqual(
      templates.map(({ resourceSlug, title, description }) => ({
        description,
        slug: resourceSlug,
        title,
      })),
    );
    expect(models.every(({ ctaHref, slug }) => ctaHref === `/api/systeme-kit/open/${slug}`)).toBe(true);
  });
});

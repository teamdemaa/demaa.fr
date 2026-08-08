import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  SYSTEM_RESOURCES,
  getSystemResource,
  getSystemResourcesForSystem,
} from "@/lib/system-resource-catalog";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  getSystemResourceAssetSnapshot,
  resolveSystemResourceDelivery,
} from "@/lib/system-resource-assets.server";

describe("system Resources catalog", () => {
  it("publishes the templates and guides catalog in the agreed order", () => {
    const templates = SYSTEM_RESOURCES.filter((resource) => resource.format === "template");
    const guides = SYSTEM_RESOURCES.filter((resource) => resource.format === "guide");

    expect(templates.map(({ title }) => title)).toEqual([
      "Tableau de pilotage opérationnel",
      "Suivi et prévisionnel financier",
      "CRM - suivi commercial",
    ]);
    expect(templates.map(({ rank }) => rank)).toEqual([1, 2, 3]);

    expect(guides.map(({ title }) => title)).toEqual([
      "Maîtriser les obligations et les finances de son entreprise",
      "La facturation électronique",
    ]);
    expect(guides.map(({ availability }) => availability)).toEqual([
      "available",
      "available",
    ]);
    expect(JSON.stringify(SYSTEM_RESOURCES)).not.toMatch(
      /docs\.google\.com|airtable\.com|downloads\/guides|Levier/,
    );
  });

  it("keeps destinations server-only and ties delivery to an immutable revision", () => {
    const availableResources = SYSTEM_RESOURCES.filter(
      (resource) =>
        resource.availability === "available" &&
        resource.resourceSlug !== "tableau-pilotage-operationnel",
    );

    for (const resource of availableResources) {
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

  it("has no delivery asset for coming-soon guides", () => {
    for (const system of enterpriseCatalog) {
      const comingSoonResources = getSystemResourcesForSystem(system.slug).filter(
        (resource) => resource.availability === "coming-soon",
      );
      expect(comingSoonResources).toHaveLength(2);
      for (const resource of comingSoonResources) {
        expect(getSystemResourceAssetSnapshot(resource.resourceSlug)).toBeNull();
      }
    }
  });

  it("announces two contextual guides for every system", () => {
    expect(enterpriseCatalog).toHaveLength(115);

    for (const system of enterpriseCatalog) {
      const guides = getSystemResourcesForSystem(system.slug)
        .filter((resource) => resource.format === "guide");
      expect(guides).toHaveLength(4);
      expect(guides.slice(0, 2).map((resource) => resource.availability)).toEqual([
        "available",
        "available",
      ]);
      expect(guides.slice(2).map((resource) => resource.availability)).toEqual([
        "coming-soon",
        "coming-soon",
      ]);
      expect(guides.slice(2).map((resource) => resource.title)).not.toContain(
        "Créer et lancer votre activité",
      );
      expect(guides.slice(2).map((resource) => resource.title)).not.toContain(
        "Gérer votre activité au quotidien",
      );
    }

    expect(
      getSystemResourcesForSystem("restaurant").slice(-2).map((resource) => resource.title),
    ).toEqual([
      "Ouvrir un restaurant",
      "Gérer un restaurant au quotidien",
    ]);
    expect(getSystemResourcesForSystem("cabinet-comptable").slice(-2).map((resource) => resource.title)).toEqual([
      "Créer un cabinet comptable",
      "Piloter un cabinet comptable",
    ]);
    expect(getSystemResourcesForSystem("plomberie-chauffage").slice(-2).map((resource) => resource.title)).toEqual([
      "Lancer votre entreprise de plomberie et chauffage",
      "Gérer vos interventions et vos chantiers",
    ]);
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
});

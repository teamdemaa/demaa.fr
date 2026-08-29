import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  SYSTEM_RESOURCES,
  getHistoricalSystemResource,
  getSystemResource,
  getSystemResourcesForSystem,
} from "@/lib/system-resource-catalog";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  getSystemResourceAssetSnapshot,
  resolveSystemResourceDelivery,
} from "@/lib/system-resource-assets.server";

describe("system Resources catalog", () => {
  it("publishes only the three useful models and documents in the shared catalog", () => {
    const templates = SYSTEM_RESOURCES.filter((resource) => resource.format === "template");
    const guides = SYSTEM_RESOURCES.filter((resource) => resource.format === "guide");

    expect(templates.map(({ title }) => title)).toEqual([
      "Processus métier",
      "Suivi et prévisionnel financier",
      "CRM - suivi commercial",
    ]);
    expect(templates.map(({ rank }) => rank)).toEqual([0, 1, 2]);
    expect(templates.map(({ openLabel }) => openLabel)).toEqual([
      "Voir et imprimer",
      "Créer ma copie",
      "Ouvrir le modèle",
    ]);
    expect(templates.slice(1).every((resource) => Boolean(resource.preview))).toBe(true);
    expect(getSystemResource("tableau-pilotage-operationnel")).toBeNull();
    expect(getHistoricalSystemResource("tableau-pilotage-operationnel")?.title).toBe("Tableau de pilotage opérationnel");

    expect(guides).toEqual([]);
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
        workbookVersion: "1.0.0",
      });
      expect(snapshot?.assetRevision).toContain(resource.resourceSlug);
      expect(resolveSystemResourceDelivery(snapshot!, "cabinet-comptable")).toMatchObject({
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
      expect(guides).toHaveLength(2);
      expect(guides.map((resource) => resource.availability)).toEqual([
        "coming-soon",
        "coming-soon",
      ]);
      expect(guides.map((resource) => resource.title)).not.toContain(
        "Créer et lancer votre activité",
      );
      expect(guides.map((resource) => resource.title)).not.toContain(
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

  it("resolves the public process list to the requested system only", () => {
    const snapshot = getSystemResourceAssetSnapshot("processus-metier");
    expect(snapshot).toEqual({
      assetRevision: "processus-metier-v1-2026-08-15",
      resourceId: "processus-metier",
      workbookVersion: "1.0.0",
    });
    expect(resolveSystemResourceDelivery(snapshot!, "cabinet-comptable")).toEqual({
      destination: "https://demaa.fr/systemes/cabinet-comptable/processus",
      resourceSlug: "processus-metier",
    });
    expect(resolveSystemResourceDelivery(snapshot!)).toBeNull();
  });

  it("keeps the replaced system recap resolvable for historical deliveries", () => {
    const snapshot = getSystemResourceAssetSnapshot("recapitulatif-systeme");
    expect(snapshot).toEqual({
      assetRevision: "recapitulatif-systeme-v1-2026-08-08",
      resourceId: "recapitulatif-systeme",
      workbookVersion: "1.0.0",
    });
    expect(resolveSystemResourceDelivery(snapshot!, "cabinet-comptable")).toEqual({
      destination: "https://demaa.fr/systemes/cabinet-comptable/recapitulatif",
      resourceSlug: "recapitulatif-systeme",
    });
    expect(resolveSystemResourceDelivery(snapshot!)).toBeNull();
    expect(getSystemResource("recapitulatif-systeme")).toBeNull();
    expect(getHistoricalSystemResource("recapitulatif-systeme")?.title).toBe(
      "Récapitulatif du système",
    );
  });

  it("keeps the replaced guides resolvable for historical deliveries", () => {
    expect(getSystemResource("guide-facturation-electronique")).toBeNull();
    expect(getSystemResource("guide-obligations-fiscales-sociales-comptables")).toBeNull();
    expect(getHistoricalSystemResource("guide-facturation-electronique")?.availability).toBe(
      "available",
    );
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

  it("keeps the original slide presentations for historical email links only", () => {
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

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getAllCopyableModelDefinitions,
  getCopyableModelBySlug,
  getPublishedCopyableModelBySlug,
  getPublishedCopyableModels,
  getPublishedCopyableModelsForSystemSlug,
} from "@/lib/copyable-model-catalog";
import { getCopyableModelDestination } from "@/lib/copyable-model-assets.server";
import { getAllAcademyContent } from "@/lib/academy-course-content";
import { getAirtableEmbedUrl } from "@/lib/document-models";

const EXPECTED_TITLES = [
  "Suivi commercial et devis",
  "Projets et missions clients",
  "Interventions et chantiers",
  "Suivi et prévisionnel financier",
  "Suivi administratif et échéances",
  "Planning marketing et contenus",
  "Recrutement et candidatures",
  "Suivi client et demandes de support",
];

describe("copyable model catalogue", () => {
  it("keeps the eight validated workflow families as the canonical construction list", () => {
    const models = getAllCopyableModelDefinitions();

    expect(models.map((model) => model.title)).toEqual(EXPECTED_TITLES);
    expect(new Set(models.map((model) => model.slug))).toHaveProperty("size", 8);
    for (const model of models) {
      expect(model.workflowStart.length).toBeGreaterThan(10);
      expect(model.workflowEnd.length).toBeGreaterThan(10);
      expect(model.includedSections.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("publishes only models backed by a real copy destination", () => {
    const published = getPublishedCopyableModels();

    expect(published.map((model) => model.slug)).toEqual([
      "suivi-commercial-et-devis",
      "projets-et-missions-clients",
      "interventions-et-chantiers",
      "suivi-previsionnel-financier",
      "suivi-administratif-et-echeances",
      "planning-marketing-et-contenus",
      "recrutement-et-candidatures",
      "suivi-client-et-support",
    ]);
    expect(getPublishedCopyableModelBySlug("suivi-commercial-et-devis")).not.toBeNull();
    expect(getCopyableModelDestination("suivi-commercial-et-devis")).toMatch(
      /^https:\/\/airtable\.com\/app[A-Za-z0-9]{14}\/shr[A-Za-z0-9]{14}\/?$/,
    );
    expect(getCopyableModelDestination("interventions-et-chantiers")).toMatch(
      /^https:\/\/airtable\.com\/app[A-Za-z0-9]{14}\/shr[A-Za-z0-9]{14}\/?$/,
    );
    expect(getCopyableModelDestination("projets-et-missions-clients")).toMatch(
      /^https:\/\/airtable\.com\/app[A-Za-z0-9]{14}\/shr[A-Za-z0-9]{14}\/?$/,
    );
    for (const slug of [
      "suivi-administratif-et-echeances",
      "planning-marketing-et-contenus",
      "recrutement-et-candidatures",
      "suivi-client-et-support",
    ]) {
      expect(getCopyableModelDestination(slug)).toMatch(
        /^https:\/\/airtable\.com\/app[A-Za-z0-9]{14}\/shr[A-Za-z0-9]{14}\/?$/,
      );
    }
    expect(getCopyableModelDestination("suivi-previsionnel-financier")).toMatch(
      /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]+\/copy$/,
    );
  });

  it("can contextualize generic published models without creating 115 copies", () => {
    expect(getPublishedCopyableModelsForSystemSlug("plomberie-chauffage")).toEqual(
      getPublishedCopyableModels(),
    );
    expect(getPublishedCopyableModelsForSystemSlug("cabinet-de-conseil").map((model) => model.slug)).toEqual([
      "suivi-commercial-et-devis",
      "projets-et-missions-clients",
      "suivi-previsionnel-financier",
      "suivi-administratif-et-echeances",
      "planning-marketing-et-contenus",
      "recrutement-et-candidatures",
      "suivi-client-et-support",
    ]);
  });

  it("keeps the interventions model compact and limited to relevant field-service families", () => {
    const model = getCopyableModelBySlug("interventions-et-chantiers");

    expect(model?.includedSections).toEqual([
      "Clients et sites",
      "Demandes",
      "Interventions",
      "Équipes",
      "Suivi terrain",
    ]);
    expect(model?.compatibleSystemSlugs).not.toBe("all");
    expect(model?.compatibleSystemSlugs).toContain("plomberie-chauffage");
    expect(model?.compatibleSystemSlugs).toContain("batiment");
    expect(model?.compatibleSystemSlugs).not.toContain("cabinet-de-conseil");
    expect(model?.compatibleSystemSlugs).not.toContain("restaurant");
  });

  it("builds an embed only for a validated public Airtable base share", () => {
    expect(getAirtableEmbedUrl(
      "https://airtable.com/app0bcxfJ7Xs5cWnP/shrNvANFZlr1P503Q",
    )).toBe(
      "https://airtable.com/embed/app0bcxfJ7Xs5cWnP/shrNvANFZlr1P503Q?backgroundColor=gray&viewControls=on",
    );
    expect(getAirtableEmbedUrl(
      "https://airtable.com/app4IAGHfL6K0QyOV/shrMce04C1Vk0V83P",
    )).toBe(
      "https://airtable.com/embed/app4IAGHfL6K0QyOV/shrMce04C1Vk0V83P?backgroundColor=gray&viewControls=on",
    );
    expect(getAirtableEmbedUrl(
      "https://airtable.com/appg5iRcrXgad8gmB/shrCpB4qLt5j29LNU",
    )).toBe(
      "https://airtable.com/embed/appg5iRcrXgad8gmB/shrCpB4qLt5j29LNU?backgroundColor=gray&viewControls=on",
    );
    expect(getAirtableEmbedUrl("https://evil.example/app0bcxfJ7Xs5cWnP/shrNvANFZlr1P503Q")).toBeNull();
    expect(getAirtableEmbedUrl("https://airtable.com/app0bcxfJ7Xs5cWnP/private")).toBeNull();
    expect(getAirtableEmbedUrl("not-a-url")).toBeNull();
  });

  it("links only to Organiser content that really exists", () => {
    const organiserSlugs = new Set(
      getAllAcademyContent().map((content) => content.identity.slug),
    );

    for (const model of getAllCopyableModelDefinitions()) {
      if (model.relatedOrganiserSlug) {
        expect(organiserSlugs.has(model.relatedOrganiserSlug)).toBe(true);
      }
    }
  });
});

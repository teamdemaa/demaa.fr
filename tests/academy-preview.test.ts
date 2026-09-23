import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import AcademyPreviewLibrary from "@/components/AcademyPreviewLibrary";
import { getAcademyPreviewCards } from "@/lib/academy-preview-catalog";
import { getPublishedCopyableModelBySlug } from "@/lib/copyable-model-catalog";

describe("DEMAA Academy editorial preview", () => {
  it("publishes only the four approved Airtable tutorials", () => {
    const cards = getAcademyPreviewCards();
    expect(cards).toHaveLength(4);
    expect(new Set(cards.map(({ href }) => href)).size).toBe(cards.length);
    expect(cards.map(({ href }) => href)).toEqual([
      "/academie/creer-pipeline-commercial-airtable",
      "/academie/suivre-devis-relances-airtable",
      "/academie/organiser-projets-missions-clients-airtable",
      "/academie/planifier-interventions-chantiers-airtable",
    ]);
    expect(cards.every(({ href, format }) => href.startsWith("/academie/") && format === "Méthode")).toBe(true);
  });

  it("shows only real, available models beside related learning items", () => {
    const modelCards = getAcademyPreviewCards().filter((card) => card.modelHref);
    expect(modelCards.length).toBeGreaterThan(0);
    for (const card of modelCards) {
      const slug = card.modelHref?.split("/").at(-1);
      expect(getPublishedCopyableModelBySlug(slug ?? ""), card.title).not.toBeNull();
      expect(card.modelTitle).toBeTruthy();
    }
  });

  it("gives every card a distinct 16:9 cover on the approved light background", async () => {
    const cards = getAcademyPreviewCards();
    const images = cards.map(({ image }) => image);
    expect(images.every((image) => image?.startsWith("/images/academy/covers/") && image.endsWith("-v3.png"))).toBe(true);
    expect(new Set(images).size).toBe(4);
    for (const card of cards) {
      const imagePath = new URL(`../public${card.image}`, import.meta.url);
      const data = await readFile(imagePath);
      const metadata = await sharp(data).metadata();
      const firstPixel = await sharp(data).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();
      expect([metadata.width, metadata.height], card.title).toEqual([1536, 864]);
      expect([...firstPixel.subarray(0, 3)], card.title).toEqual([240, 244, 241]);
    }
  });

  it("keeps model links off the cards and sends readers to a method detail", () => {
    const markup = renderToStaticMarkup(createElement(AcademyPreviewLibrary, {
      cards: getAcademyPreviewCards(),
    }));
    expect(markup).toContain('href="/academie/creer-pipeline-commercial-airtable"');
    expect(markup).not.toContain("Modèle associé");
    expect(markup).not.toContain('href="/ressources');
  });
});

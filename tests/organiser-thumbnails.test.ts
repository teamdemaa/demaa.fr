import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getPublicOrganiserContent } from "@/lib/academy-course-content";
import { getAllPublishedContent } from "@/lib/content-catalog";
import {
  ORGANISER_THUMBNAIL_COLORS,
  ORGANISER_THUMBNAIL_SIZE,
  getAllOrganiserThumbnails,
  getOrganiserThumbnailPath,
} from "@/lib/organiser-thumbnail-catalog";

describe("Organisation thumbnails", () => {
  const thumbnails = getAllOrganiserThumbnails();
  const generator = readFileSync("scripts/generate-organiser-thumbnails.mjs", "utf8");

  it("uses only the validated Demaa palette and YouTube dimensions", () => {
    expect(ORGANISER_THUMBNAIL_COLORS).toEqual({
      background: "#F1F3F0",
      border: "#ECEEED",
      forest: "#315F46",
      muted: "#6F756E",
    });
    expect(ORGANISER_THUMBNAIL_SIZE).toEqual({ width: 1280, height: 720 });
  });

  it("keeps every title to three deliberate lines or fewer", () => {
    for (const thumbnail of thumbnails) {
      expect(thumbnail.lines.filter(Boolean).length).toBeLessThanOrEqual(3);
      expect(thumbnail.lines.every((line) => !line || line.trim() === line)).toBe(true);
      expect(thumbnail.fontSize).toBeGreaterThanOrEqual(60);
    }
  });

  it("covers every public Organisation card with a generated file", () => {
    const publicSlugs = [
      ...getPublicOrganiserContent().map((content) => content.identity.slug),
      ...getAllPublishedContent().map((content) => content.slug),
    ];

    for (const slug of publicSlugs) {
      const path = getOrganiserThumbnailPath(slug);
      expect(path, slug).not.toBeNull();
      expect(existsSync(`public${path}`), slug).toBe(true);
      const image = readFileSync(`public${path}`);
      expect(image.readUInt32BE(16), `${slug} width`).toBe(1_280);
      expect(image.readUInt32BE(20), `${slug} height`).toBe(720);
    }
  });

  it("does not duplicate slugs", () => {
    expect(new Set(thumbnails.map((thumbnail) => thumbnail.slug)).size).toBe(
      thumbnails.length,
    );
  });

  it("uses the light Gambetta face and the shared Lucide icon base", () => {
    expect(generator).toContain("gambetta-light-italic.woff2");
    expect(generator).toContain('from "lucide-react"');
    expect(generator).toContain("font-weight: 300");
    expect(generator).toContain("font-synthesis: none");
    expect(generator).not.toContain("function documentShape");
  });

  it("reuses the same catalog path in cards, articles and social previews", () => {
    const library = readFileSync("src/components/OrganiserLibrary.tsx", "utf8");
    const processArticle = readFileSync(
      "src/components/AcademyProcessGuideArticle.tsx",
      "utf8",
    );
    const guideArticle = readFileSync(
      "src/app/(marketing)/contenus/[slug]/page.tsx",
      "utf8",
    );
    const socialPreview = readFileSync(
      "src/app/(marketing)/organiser/[slug]/opengraph-image.tsx",
      "utf8",
    );

    expect(library).toContain("content.thumbnail");
    expect(processArticle).toContain(
      "thumbnail={getOrganiserThumbnailPath(content.identity.slug)}",
    );
    expect(guideArticle).toContain(
      "thumbnail={getOrganiserThumbnailPath(entry.slug)}",
    );
    expect(socialPreview).toContain("getOrganiserThumbnail(slug)");
  });
});

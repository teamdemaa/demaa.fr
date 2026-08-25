import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getAcademyActionHref,
  getAcademyActionLabel,
  getAcademyContentBySlug,
  getAcademyContentForSystem,
  getAcademyFundamentals,
  getAcademyCaseStudies,
  getAllAcademyContent,
  getCanonicalAcademySlugForLegacySlug,
  getPublicOrganiserContent,
} from "@/lib/academy-course-content";

function hasForbiddenVideoField(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasForbiddenVideoField);
  if (!value || typeof value !== "object") return false;

  return Object.entries(value).some(
    ([key, child]) =>
      /video|narration|durationSeconds/i.test(key) ||
      (typeof child === "string" && /\.(mp4|webm|mov)(?:$|\?)/i.test(child)) ||
      hasForbiddenVideoField(child),
  );
}

describe("academy course content", () => {
  it("preserves the fourteen historical items and publishes fourteen process guides", () => {
    expect(getAcademyFundamentals()).toHaveLength(8);
    expect(getAcademyCaseStudies()).toHaveLength(20);
    expect(getAcademyCaseStudies().filter((content) => content.processGuide)).toHaveLength(14);
    expect(getPublicOrganiserContent()).toHaveLength(14);
    expect(getAllAcademyContent()).toHaveLength(28);
    expect(getAcademyContentBySlug("juste-systeme-marketing")).toBeNull();
  });

  it("keeps the approved treasury course at seven notions", () => {
    expect(getAcademyContentBySlug("piloter-sa-tresorerie")?.lessons).toHaveLength(7);
  });

  it("keeps every ready item structurally complete and video-free", () => {
    const content = getAllAcademyContent();
    expect(new Set(content.map((item) => item.identity.slug)).size).toBe(28);

    for (const item of content) {
      expect(item.status).toBe("ready");
      if (item.processGuide) {
        expect(item.lessons).toHaveLength(0);
        expect(item.processGuide.steps).toHaveLength(6);
        expect(item.recap.points).toHaveLength(5);
        expect(item.quiz.questions).toHaveLength(0);
      } else {
        expect(item.lessons.length).toBeGreaterThanOrEqual(4);
        expect(item.lessons.length).toBeLessThanOrEqual(7);
        expect(item.recap.points).toHaveLength(4);
        expect(item.quiz.questions).toHaveLength(3);
      }
      if (item.kind === "course") {
        expect(item.identity.card.meta).toBe(
          `${item.identity.durationMinutes} min · Quiz de connaissances`,
        );
        expect(item.identity.card.meta).not.toContain("notions");
      }
      expect(hasForbiddenVideoField(item)).toBe(false);
      if (item.identity.card.image) {
        expect(
          existsSync(
            resolve(process.cwd(), "public", item.identity.card.image.replace(/^\//, "")),
          ),
        ).toBe(true);
      } else {
        expect(item.kind === "course" || Boolean(item.processGuide)).toBe(true);
      }
    }
  });

  it("redirects the former academy slugs to the current canonical lessons", () => {
    expect(getCanonicalAcademySlugForLegacySlug("entreprise-rentable-sans-tresorerie")).toBe(
      "piloter-sa-tresorerie",
    );
    expect(getCanonicalAcademySlugForLegacySlug("difference-chiffre-affaires-benefice")).toBe(
      "comprendre-chiffre-affaires-benefice",
    );
    expect(getCanonicalAcademySlugForLegacySlug("transformer-une-demande-en-client")).toBe(
      "transformer-demande-en-client",
    );
  });

  it("preserves contextual academy links on system pages without the video registry", () => {
    expect(getAcademyContentForSystem("restaurant").map((item) => item.identity.slug)).toEqual([
      "piloter-sa-tresorerie",
      "comprendre-chiffre-affaires-benefice",
    ]);
    expect(getAcademyContentForSystem("plomberie-chauffage")).toEqual([]);
  });

  it("uses a truthful Levier fallback until a neutral Academy trigger exists", () => {
    const action = getAcademyContentBySlug("piloter-sa-tresorerie")?.action;
    expect(action).not.toBeNull();
    expect(getAcademyActionHref(action!)).toBe("/systemes");
    expect(getAcademyActionLabel(action!)).toBe(
      "Trouver mon système et ses ressources",
    );
  });

  it("contains no old Academy video implementation in public routes", () => {
    const files = [
      "src/app/(marketing)/organiser/page.tsx",
      "src/app/(marketing)/organiser/[slug]/page.tsx",
      "src/app/sitemap.ts",
      "src/app/robots.ts",
    ];
    for (const file of files) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(source).not.toMatch(/academy-video|AcademyVideo|video-sitemap|youtube/i);
    }
  });

  it("keeps historical content reachable but out of the public sitemap", () => {
    const sitemap = readFileSync(resolve(process.cwd(), "src/app/sitemap.ts"), "utf8");
    const seo = readFileSync(resolve(process.cwd(), "src/lib/academy-content-seo.ts"), "utf8");

    expect(sitemap).toContain("getPublicOrganiserContent");
    expect(sitemap).not.toContain("getAllAcademyContent");
    expect(seo).toContain("{ index: false, follow: true }");
  });
});

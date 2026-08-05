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
  it("publishes eight fundamentals and six B2B cases", () => {
    expect(getAcademyFundamentals()).toHaveLength(8);
    expect(getAcademyCaseStudies()).toHaveLength(6);
    expect(getAllAcademyContent()).toHaveLength(14);
    expect(getAcademyContentBySlug("juste-systeme-marketing")).toBeNull();
  });

  it("keeps the approved treasury course at seven notions", () => {
    expect(getAcademyContentBySlug("piloter-sa-tresorerie")?.lessons).toHaveLength(7);
  });

  it("keeps every ready item structurally complete and video-free", () => {
    const content = getAllAcademyContent();
    expect(new Set(content.map((item) => item.identity.slug)).size).toBe(14);

    for (const item of content) {
      expect(item.status).toBe("ready");
      expect(item.lessons.length).toBeGreaterThanOrEqual(4);
      expect(item.lessons.length).toBeLessThanOrEqual(7);
      expect(item.recap.points).toHaveLength(4);
      expect(item.quiz.questions).toHaveLength(3);
      expect(hasForbiddenVideoField(item)).toBe(false);
      if (item.identity.card.image) {
        expect(
          existsSync(
            resolve(process.cwd(), "public", item.identity.card.image.replace(/^\//, "")),
          ),
        ).toBe(true);
      } else {
        expect(item.kind).toBe("course");
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
      "src/app/academie/page.tsx",
      "src/app/academie/[slug]/page.tsx",
      "src/app/sitemap.ts",
      "src/app/robots.ts",
    ];
    for (const file of files) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(source).not.toMatch(/academy-video|AcademyVideo|video-sitemap|youtube/i);
    }
  });
});

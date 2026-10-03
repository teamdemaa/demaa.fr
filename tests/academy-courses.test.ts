import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { ACADEMY_COURSES, academyWorksheetHref, getAcademyCourse } from "@/lib/academy-courses";
import { getAcademyPreviewCards } from "@/lib/academy-preview-catalog";
import { getPublishedTutorialBySlug } from "@/lib/tutorial-catalog";

describe("Academy practical courses", () => {
  it("publishes ten unique questions without replacing existing tutorial routes", () => {
    expect(ACADEMY_COURSES).toHaveLength(10);
    expect(new Set(ACADEMY_COURSES.map(c => c.slug)).size).toBe(10);
    expect(getAcademyPreviewCards().map(c => c.href)).toEqual(ACADEMY_COURSES.map(c => `/tutoriels/${c.slug}`));
    for (const course of ACADEMY_COURSES) {
      expect(course.title.endsWith("?")).toBe(true);
      expect(getPublishedTutorialBySlug(course.slug)).toBeNull();
      expect(course.steps.length).toBeGreaterThanOrEqual(4);
      expect(course.checks.length).toBeGreaterThanOrEqual(3);
      expect(course.columns.length).toBe(course.row.length);
      expect(course.exercise.length).toBeGreaterThan(80);
    }
    expect(getAcademyCourse("unknown-course")).toBeUndefined();
    expect(getPublishedTutorialBySlug("creer-pipeline-commercial-airtable")).not.toBeNull();
  });

  it("returns a real 404 for unknown courses and accepts current and legacy routes", () => {
    const unknown = proxy(new NextRequest("https://demaa.fr/tutoriels/cours-inexistant"));
    expect(unknown.status).toBe(404);
    expect(unknown.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    for (const slug of [...ACADEMY_COURSES.map(c => c.slug), "creer-pipeline-commercial-airtable"]) {
      expect(proxy(new NextRequest(`https://demaa.fr/tutoriels/${slug}`)).status).toBe(200);
    }
  });

  it("ships a matching UTF-8 worksheet for every exercise", async () => {
    for (const course of ACADEMY_COURSES) {
      const csv = await readFile(new URL(`../public${academyWorksheetHref(course.slug)}`, import.meta.url), "utf8");
      expect(csv.charCodeAt(0)).toBe(0xfeff);
      expect(csv.split(/\r?\n/)[0].replace(/^\uFEFF/, "")).toBe(course.columns.join(";"));
      expect(csv).toContain(course.row[0]);
    }
  });

  it("provides optimized landscape images in a consistent 16:9 format", async () => {
    for (const image of new Set(ACADEMY_COURSES.map(c => c.image))) {
      const info = await sharp(new URL(`../public${image}`, import.meta.url).pathname).metadata();
      expect([info.width, info.height, info.format]).toEqual([1600, 900, "webp"]);
    }
  });
});

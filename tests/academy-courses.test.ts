import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { ACADEMY_COURSES, academyWorksheetHref, getAcademyCourse } from "@/lib/academy-courses";
import archivedCourses from "@/lib/academy-courses-data.json";
import { LEARNING_PROJECT_SERIES } from "@/lib/academy-project-series";
import { getAcademyPreviewCards } from "@/lib/academy-preview-catalog";
import { getPublishedTutorialBySlug } from "@/lib/tutorial-catalog";

describe("Academy practical courses", () => {
  it("publishes three project series while preserving the ten archived courses", () => {
    expect(archivedCourses).toHaveLength(10);
    expect(LEARNING_PROJECT_SERIES.map(p => p.name)).toEqual(["Jago", "Dumaan", "Tiimora"]);
    for (const project of LEARNING_PROJECT_SERIES) {
      expect(project.episodes.map(e => e.number)).toEqual([0, 1, 2, 3, 4, 5]);
      expect(project.episodes.map(e => e.title)).toEqual(["La genèse du projet", "Stratégie", "Plan d’action", "Update 1", "Update 2", "Update 3"]);
      expect(project.episodes.filter(e => e.href).map(e => e.number)).toEqual(project.slug === "jago" ? [0] : []);
    }
    expect(new Set(archivedCourses.map(c => c.slug)).size).toBe(10);
    expect(getAcademyPreviewCards().map(c => c.href)).toEqual(LEARNING_PROJECT_SERIES.map(c => `/tutoriels/${c.slug}`));
    for (const course of archivedCourses) {
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

  it("returns a real 404 for archived courses and only accepts project series", () => {
    const unknown = proxy(new NextRequest("https://demaa.fr/tutoriels/cours-inexistant"));
    expect(unknown.status).toBe(404);
    for (const course of archivedCourses) {
      expect(proxy(new NextRequest(`https://demaa.fr/tutoriels/${course.slug}`)).status).toBe(404);
      expect(getAcademyCourse(course.slug)).toBeDefined();
    }
    for (const { slug } of LEARNING_PROJECT_SERIES) expect(proxy(new NextRequest(`https://demaa.fr/tutoriels/${slug}`)).status).toBe(200);
    expect(unknown.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    for (const slug of [...ACADEMY_COURSES.map(c => c.slug), "creer-pipeline-commercial-airtable"]) {
      expect(proxy(new NextRequest(`https://demaa.fr/tutoriels/${slug}`)).status).toBe(404);
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

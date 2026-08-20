import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("server-only", () => ({}));

import { GET } from "@/app/api/action-plan/academy/route";
import { getAcademyFundamentals } from "@/lib/academy-course-content";
import { getEnglishAcademyContent } from "@/lib/academy-course-content-en";
import AcademyLessonVisual from "@/components/AcademyLessonVisual";
import { CourseDiagram } from "@/components/AcademyIndexClient";

function allPublishedText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allPublishedText);
  if (!value || typeof value !== "object") return [];
  const nonVisibleKeys = new Set([
    "correctChoiceId",
    "courseId",
    "id",
    "image",
    "marketCodes",
    "resourceId",
    "slug",
  ]);
  return Object.entries(value).flatMap(([key, child]) =>
    nonVisibleKeys.has(key) ? [] : allPublishedText(child)
  );
}

describe("English Academy", () => {
  beforeEach(() => {
    process.env.DEMAA_ENGLISH_BETA_ENABLED = "true";
  });

  it("publishes only the eight approved, versioned English fundamentals", () => {
    const contents = getEnglishAcademyContent();

    expect(contents).toHaveLength(8);
    expect(contents.map((content) => content.identity.shortTitle)).toEqual([
      "Cash flow",
      "Revenue and profit",
      "Pricing",
      "Marketing and sales",
      "Enquiries to customers",
      "Delegation",
      "Building a clear offer",
      "Delivering consistently",
    ]);
    const canonical = getAcademyFundamentals();
    for (const [index, content] of contents.entries()) {
      expect(content.kind).toBe("course");
      expect(content.lessons.map((lesson) => ({ id: lesson.id, type: lesson.type, visual: lesson.visual.type })))
        .toEqual(canonical[index].lessons.map((lesson) => ({ id: lesson.id, type: lesson.type, visual: lesson.visual.type })));
      expect(content.quiz.questions).toHaveLength(3);
      expect(content.quiz.questions.map((question) => question.id))
        .toEqual(canonical[index].quiz.questions.map((question) => question.id));
      expect(content.action?.resourceId ?? null).toBe(canonical[index].action?.resourceId ?? null);
      expect(content.identity.card.image).toBe(canonical[index].identity.card.image);
      expect(content.editorial).toEqual({
        courseId: content.identity.slug,
        contentVersion: "1.0",
        localeCode: "en",
        marketCodes: ["fr-fr", "global-en-beta"],
        publicationStatus: "published",
      });
    }
  });

  it("uses the same canonical course structure in French and English", () => {
    const french = getAcademyFundamentals();
    const english = getEnglishAcademyContent();

    expect(english.map((course) => course.identity.slug))
      .toEqual(french.map((course) => course.identity.slug));
    expect(english.map((course) => course.lessons.length))
      .toEqual(french.map((course) => course.lessons.length));
    expect(english.map((course) => course.quiz.questions.length))
      .toEqual(french.map((course) => course.quiz.questions.length));
  });

  it("contains no French fallback in published English text", () => {
    const text = allPublishedText(getEnglishAcademyContent()).join(" ");
    expect(text).not.toMatch(/[àâçéèêëîïôùûüÿœ]/i);
    expect(text).not.toMatch(/\b(cours|trésorerie|chiffre|bénéfice|entreprise|dirigeants|quiz de connaissances)\b/i);
  });

  it("renders the shared diagrams and lesson visuals without French chrome", () => {
    const contents = getEnglishAcademyContent();
    const markup = [
      ...contents.map((content) => renderToStaticMarkup(createElement(CourseDiagram, {
        localeCode: "en",
        slug: content.identity.slug,
      }))),
      ...contents.flatMap((content) => content.lessons.map((lesson) =>
        renderToStaticMarkup(createElement(AcademyLessonVisual, {
          lesson,
          localeCode: "en",
        })),
      )),
    ].join(" ");

    expect(markup).toContain("REVENUE");
    expect(markup).toContain("PRICE STRUCTURE");
    expect(markup).not.toMatch(
      /CHIFFRE D.AFFAIRES|CHARGES|BÉNÉFICE|COÛTS|MARGE|ATTIRER|FIDÉLISER|RÉSULTAT|Pendant l.attente|Prix de vente|Résultat attendu/i,
    );
  });

  it("serves English content without lives or case studies through the shared API", async () => {
    const response = await GET(new Request(
      "https://demaa.co/api/action-plan/academy?locale=en&market=global-en-beta",
    ));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.contents).toHaveLength(8);
    expect(payload.liveTrainings).toEqual([]);
  });

  it("rejects English access while the server flag is disabled", async () => {
    process.env.DEMAA_ENGLISH_BETA_ENABLED = "false";
    const response = await GET(new Request(
      "https://demaa.co/api/action-plan/academy?locale=en&market=global-en-beta",
    ));

    expect(response.status).toBe(404);
  });

  it("serves the same English Academy in the French commercial market", async () => {
    const response = await GET(new Request(
      "https://demaa.co/api/action-plan/academy?locale=en&market=fr-fr",
    ));

    expect(response.status).toBe(200);
    expect((await response.json()).contents).toHaveLength(8);
  });

  it("rejects unsupported locale and market combinations", async () => {
    const response = await GET(new Request(
      "https://demaa.co/api/action-plan/academy?locale=fr&market=global-en-beta",
    ));

    expect(response.status).toBe(400);
  });
});

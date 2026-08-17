import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { GET } from "@/app/api/action-plan/academy/route";
import { getEnglishAcademyContent } from "@/lib/academy-course-content-en";

function allPublishedText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allPublishedText);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) =>
    key === "slug" || key === "courseId" ? [] : allPublishedText(child)
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
    for (const content of contents) {
      expect(content.kind).toBe("course");
      expect(content.lessons).toHaveLength(4);
      expect(content.quiz.questions).toHaveLength(3);
      expect(content.action).toBeNull();
      expect(content.editorial).toEqual({
        courseId: content.identity.slug,
        contentVersion: "en-1.0",
        localeCode: "en",
        marketCodes: ["global-en-beta"],
        publicationStatus: "published",
      });
    }
  });

  it("contains no French fallback in published English text", () => {
    const text = allPublishedText(getEnglishAcademyContent()).join(" ");
    expect(text).not.toMatch(/[àâçéèêëîïôùûüÿœ]/i);
    expect(text).not.toMatch(/\b(cours|trésorerie|chiffre|bénéfice|entreprise|dirigeants|quiz de connaissances)\b/i);
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

  it("rejects unsupported locale and market combinations", async () => {
    const response = await GET(new Request(
      "https://demaa.co/api/action-plan/academy?locale=en&market=fr-fr",
    ));

    expect(response.status).toBe(400);
  });
});

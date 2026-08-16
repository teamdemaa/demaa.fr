import { describe, expect, it } from "vitest";
import { getAcademyCourseProgressKey } from "@/lib/academy-course-progress.client";

describe("Academy course progress identity", () => {
  it("isolates progress by course, locale and content version", () => {
    const french = getAcademyCourseProgressKey({
      contentVersion: "1.0",
      courseId: "cash-flow",
      localeCode: "fr",
    });
    const english = getAcademyCourseProgressKey({
      contentVersion: "en-1.0",
      courseId: "cash-flow",
      localeCode: "en",
    });
    const nextVersion = getAcademyCourseProgressKey({
      contentVersion: "en-2.0",
      courseId: "cash-flow",
      localeCode: "en",
    });

    expect(new Set([french, english, nextVersion]).size).toBe(3);
  });
});

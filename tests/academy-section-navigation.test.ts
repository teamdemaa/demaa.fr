import { describe, expect, it } from "vitest";
import { groupAcademyContents } from "@/components/AcademyIndexClient";
import {
  getAcademyCaseStudies,
  getAcademyFundamentals,
} from "@/lib/academy-course-content";
import { PUBLIC_EDITORIAL_VISIBILITY } from "@/lib/public-editorial-visibility";

describe("Academy content sections", () => {
  it("publishes Tutorials and Formations as independent rails", () => {
    const fundamentals = getAcademyFundamentals();
    const caseStudies = getAcademyCaseStudies();
    const grouped = groupAcademyContents([...fundamentals, ...caseStudies]);

    expect(PUBLIC_EDITORIAL_VISIBILITY.academyTutorials).toBe(true);
    expect(grouped.tutorials).toHaveLength(6);
    expect(grouped.formations).toHaveLength(8);
    expect(grouped.tutorials.every((content) => content.kind === "case-study")).toBe(true);
    expect(grouped.formations.every((content) => content.kind === "course")).toBe(true);
  });
});

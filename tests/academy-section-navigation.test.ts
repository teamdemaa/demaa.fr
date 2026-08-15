import { describe, expect, it } from "vitest";
import { getNextAcademySection } from "@/components/AcademyIndexClient";
import { PUBLIC_EDITORIAL_VISIBILITY } from "@/lib/public-editorial-visibility";

const visibleSections = [
  { id: "courses" as const },
];

describe("Academy section keyboard navigation", () => {
  it("keeps the temporary single-course surface without public tabs", () => {
    expect(PUBLIC_EDITORIAL_VISIBILITY.academyTutorials).toBe(false);
    expect(getNextAcademySection(visibleSections, "courses", "ArrowRight")).toBe(
      "courses",
    );
    expect(getNextAcademySection(visibleSections, "courses", "Home")).toBe(
      "courses",
    );
    expect(getNextAcademySection(visibleSections, "courses", "End")).toBe(
      "courses",
    );
    expect(getNextAcademySection(visibleSections, "courses", "Enter")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { getNextAcademySection } from "@/components/AcademyIndexClient";

const visibleSections = [
  { id: "tutorials" as const },
  { id: "courses" as const },
];

describe("Academy section keyboard navigation", () => {
  it("cycles only between Tutoriels and Cours", () => {
    expect(getNextAcademySection(visibleSections, "tutorials", "ArrowRight")).toBe(
      "courses",
    );
    expect(getNextAcademySection(visibleSections, "courses", "ArrowRight")).toBe(
      "tutorials",
    );
    expect(getNextAcademySection(visibleSections, "tutorials", "ArrowLeft")).toBe(
      "courses",
    );
    expect(getNextAcademySection(visibleSections, "courses", "Home")).toBe(
      "tutorials",
    );
    expect(getNextAcademySection(visibleSections, "tutorials", "End")).toBe(
      "courses",
    );
    expect(getNextAcademySection(visibleSections, "tutorials", "Enter")).toBeNull();
  });
});

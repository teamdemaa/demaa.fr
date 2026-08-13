import { describe, expect, it } from "vitest";
import { getNextAcademySection } from "@/components/AcademyIndexClient";

const visibleSections = [
  { id: "courses" as const },
  { id: "workshops" as const },
];

describe("Academy section keyboard navigation", () => {
  it("cycles only between Cours and Ateliers", () => {
    expect(getNextAcademySection(visibleSections, "courses", "ArrowRight")).toBe(
      "workshops",
    );
    expect(getNextAcademySection(visibleSections, "workshops", "ArrowRight")).toBe(
      "courses",
    );
    expect(getNextAcademySection(visibleSections, "courses", "ArrowLeft")).toBe(
      "workshops",
    );
    expect(getNextAcademySection(visibleSections, "workshops", "Home")).toBe(
      "courses",
    );
    expect(getNextAcademySection(visibleSections, "courses", "End")).toBe(
      "workshops",
    );
    expect(getNextAcademySection(visibleSections, "courses", "Enter")).toBeNull();
  });
});

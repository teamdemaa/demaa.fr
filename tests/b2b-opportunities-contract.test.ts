import { describe, expect, it } from "vitest";
import { INITIAL_B2B_OPPORTUNITIES } from "@/lib/b2b-opportunities-contract";

describe("B2B opportunities bootstrap", () => {
  it("keeps exactly three published demonstration opportunities with stable slugs", () => {
    expect(INITIAL_B2B_OPPORTUNITIES).toHaveLength(3);
    expect(new Set(INITIAL_B2B_OPPORTUNITIES.map(({ slug }) => slug)).size).toBe(3);
    expect(INITIAL_B2B_OPPORTUNITIES.every(({ status }) => status === "published")).toBe(true);
  });
});

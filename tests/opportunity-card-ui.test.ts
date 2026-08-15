import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../src/components/PublicOpportunitiesClient.tsx", import.meta.url),
  "utf8",
);

describe("public opportunity cards", () => {
  it("keeps a fixed responsive height with aligned tags", () => {
    expect(source).toContain('h-[20rem]');
    expect(source).toContain("sm:h-72");
    expect(source).toContain("line-clamp-2");
    expect(source).toContain("mt-auto flex flex-wrap gap-2");
    expect(source).toContain(".slice(0, 3)");
  });

  it("keeps the detail dialog interaction accessible", () => {
    expect(source).toContain('aria-haspopup="dialog"');
    expect(source).toContain('aria-controls="opportunity-details-dialog"');
    expect(source).toContain('id="opportunity-details-dialog"');
    expect(source).toContain("setLocalSelected(opportunity)");
  });
});

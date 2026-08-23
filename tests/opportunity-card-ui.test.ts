import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../src/components/PublicOpportunitiesClient.tsx", import.meta.url),
  "utf8",
);

describe("public opportunity cards", () => {
  it("uses compact full-width rows with uniform tags", () => {
    expect(source).toContain('className="mt-6 grid gap-3"');
    expect(source).not.toContain("sm:grid-cols-2");
    expect(source).toContain("min-h-[13rem]");
    expect(source).toContain("sm:min-h-44");
    expect(source).toContain('className="mt-2 line-clamp-2');
    expect(source).toContain("mt-auto flex flex-wrap gap-2");
    expect(source).toContain(".slice(0, 3).map((tag) =>");
    expect(source).toContain('className="inline-flex min-h-8 items-center rounded-[0.45rem] bg-dema-sage/70 px-3 text-xs font-medium text-dema-forest"');
    expect(source).not.toContain("map((tag, index)");
  });

  it("keeps the detail dialog interaction accessible", () => {
    expect(source).toContain('aria-haspopup="dialog"');
    expect(source).toContain('aria-controls="opportunity-details-dialog"');
    expect(source).toContain('id="opportunity-details-dialog"');
    expect(source).toContain("setLocalSelected(opportunity)");
  });
});

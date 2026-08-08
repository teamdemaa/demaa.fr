import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("sector editorial links validator", () => {
  it("validates direct links only against known system resources", async () => {
    const source = await readFile(
      new URL("../scripts/validate-sector-editorial-links.mjs", import.meta.url),
      "utf8",
    );

    expect(source).toContain('href.startsWith("/api/systeme-kit/open/")');
    expect(source).toContain("systemResourceSlugs.has(slug)");
    expect(source).toContain("unknown system resource slug");
  });
});

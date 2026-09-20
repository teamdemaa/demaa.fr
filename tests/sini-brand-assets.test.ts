import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const exists = (path: string) => existsSync(new URL(path, root));

describe("sini preview brand assets", () => {
  it("archives the old demaa icons and serves generated lowercase sini icons", () => {
    for (const file of ["favicon.ico", "icon.png", "apple-icon.png"]) {
      expect(exists(`archive/brand/demaa/${file}`)).toBe(true);
      expect(exists(`src/app/${file}`)).toBe(false);
    }
    expect(read("src/app/icon.tsx")).toContain("buildSiniIcon");
    expect(read("src/app/apple-icon.tsx")).toContain("buildSiniIcon");
    expect(read("src/app/brand-image-utils.tsx")).toContain("sini");
  });

  it("uses sini social copy and the Vercel preview host without a custom domain", () => {
    const layout = read("src/app/layout.tsx");
    expect(layout).toContain("metadataBase: new URL(metadataOrigin)");
    expect(layout).toContain("process.env.VERCEL_URL");
    expect(read("src/app/opengraph-image.tsx")).toContain('alt = "sini —');
    expect(read("src/app/twitter-image.tsx")).toContain('alt = "sini —');
    expect(read("src/app/opengraph-image.alt.txt")).not.toMatch(/Demaa|DEMAA/);
  });
});

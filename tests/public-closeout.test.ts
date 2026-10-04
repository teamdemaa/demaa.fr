import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { DEMAA_DIRECTORY_NAVIGATION } from "@/lib/demaa-public-routes";

describe("public closeout", () => {
  it("excludes retained directories from the public sitemap", async () => {
    const entries = await sitemap();
    for (const { href } of DEMAA_DIRECTORY_NAVIGATION) {
      expect(entries.some(entry => new URL(entry.url).pathname === href)).toBe(false);
    }
    expect(entries.some(entry => new URL(entry.url).pathname === "/equipe")).toBe(true);
  });
});

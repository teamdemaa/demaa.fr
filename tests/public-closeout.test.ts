import { describe, expect, it } from "vitest";
import { GET } from "@/app/[...catchAll]/route";
import sitemap from "@/app/sitemap";
import { DEMAA_DIRECTORY_NAVIGATION } from "@/lib/demaa-public-routes";

describe("public closeout", () => {
  it("serves a real non-streamed 404 with recovery links", async () => {
    const response = GET();
    expect(response.status).toBe(404);
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(await response.text()).toContain('href="/studio"');
  });
  it("excludes retained directories from the public sitemap", async () => {
    const entries = await sitemap();
    for (const { href } of DEMAA_DIRECTORY_NAVIGATION) {
      expect(entries.some(entry => new URL(entry.url).pathname === href)).toBe(false);
    }
    expect(entries.some(entry => new URL(entry.url).pathname === "/equipe")).toBe(true);
  });
});

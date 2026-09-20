import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

describe("sini app manifest", () => {
  it("does not reuse demaa branding or icons before sini assets are ready", () => {
    const value = manifest();
    expect(value).toMatchObject({
      name: "sini",
      short_name: "sini",
      start_url: "/",
      scope: "/",
      display: "standalone",
      lang: "fr",
      background_color: "#fbfcfe",
      theme_color: "#244a68",
    });
    expect(value.icons).toBeUndefined();
  });

  it("ships every icon referenced by the manifest", () => {
    for (const icon of manifest().icons || []) {
      expect(existsSync(`public${icon.src}`)).toBe(true);
    }
  });
});

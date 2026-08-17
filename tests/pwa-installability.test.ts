import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

describe("installable Demaa app", () => {
  it("exposes a standalone French manifest with the required icons", () => {
    const value = manifest();
    expect(value).toMatchObject({
      name: "Demaa",
      short_name: "Demaa",
      start_url: "/",
      scope: "/",
      display: "standalone",
      lang: "fr",
      background_color: "#315f46",
      theme_color: "#315f46",
    });
    expect(value.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: "/pwa/demaa-192.png", sizes: "192x192" }),
      expect.objectContaining({ src: "/pwa/demaa-512.png", sizes: "512x512" }),
      expect.objectContaining({
        src: "/pwa/demaa-maskable-512.png",
        purpose: "maskable",
      }),
    ]));
  });

  it("ships every icon referenced by the manifest", () => {
    for (const icon of manifest().icons || []) {
      expect(existsSync(`public${icon.src}`)).toBe(true);
    }
  });
});

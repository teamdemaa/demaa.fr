import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { GET as getEnglishManifest } from "@/app/(english)/en/manifest.webmanifest/route";
import { buildDemaaManifest } from "@/lib/pwa-manifest";

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

  it("uses the same icon set with an English start URL and copy", () => {
    const french = buildDemaaManifest("fr");
    const english = buildDemaaManifest("en");

    expect(english).toMatchObject({
      lang: "en",
      start_url: "/en",
      scope: "/",
      display: "standalone",
    });
    expect(english.description).not.toBe(french.description);
    expect(english.icons).toEqual(french.icons);
  });

  it("keeps the English manifest behind the English beta flag", async () => {
    const previous = process.env.DEMAA_ENGLISH_BETA_ENABLED;
    try {
      delete process.env.DEMAA_ENGLISH_BETA_ENABLED;
      expect(getEnglishManifest().status).toBe(404);

      process.env.DEMAA_ENGLISH_BETA_ENABLED = "true";
      const response = getEnglishManifest();
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("application/manifest+json");
      await expect(response.json()).resolves.toMatchObject({ lang: "en", start_url: "/en" });
    } finally {
      if (previous === undefined) delete process.env.DEMAA_ENGLISH_BETA_ENABLED;
      else process.env.DEMAA_ENGLISH_BETA_ENABLED = previous;
    }
  });
});

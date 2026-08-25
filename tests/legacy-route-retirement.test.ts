import { access } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

describe("legacy public route retirement", () => {
  it("keeps useful legacy URLs as permanent redirects", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/modeles-de-documents",
          destination: "/organiser",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/modeles-de-documents/tableau-de-pilotage-:slug",
          destination: "/solutions/:slug",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/ressources",
          destination: "/organiser",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/opportunites-b2b",
          destination: "/opportunites",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/opportunites/0034",
          destination: "/opportunites",
          permanent: true,
        }),
      ]),
    );

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/kit-operationnel/:slug",
          destination: "/solutions/:slug",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/systemes-operationnels/:slug",
          destination: "/solutions/:slug",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/kit-systeme/:slug",
          destination: "/solutions/:slug",
          permanent: true,
        }),
      ]),
    );
  });

  it("does not keep unreachable page implementations behind redirects or 404 rewrites", async () => {
    const root = process.cwd();
    const retiredPages = [
      "src/app/partenaires/page.tsx",
      "src/app/rejoindre-le-reseau/page.tsx",
      "src/app/structuration/page.tsx",
    ];

    for (const retiredPage of retiredPages) {
      await expect(access(path.join(root, retiredPage))).rejects.toThrow();
    }

    await expect(
      access(path.join(root, "src/components/StructurationLandingPage.tsx")),
    ).rejects.toThrow();
  });
});

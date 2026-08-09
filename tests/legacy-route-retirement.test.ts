import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

describe("legacy public route retirement", () => {
  it("keeps useful legacy URLs as permanent redirects", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/modeles-de-documents",
          destination: "/academie",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/modeles-de-documents/tableau-de-pilotage-:slug",
          destination: "/kit-operationnel/:slug?tab=resources",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/ressources",
          destination: "/academie",
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
  });
});

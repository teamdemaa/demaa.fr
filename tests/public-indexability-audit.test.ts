import { describe, expect, it } from "vitest";
import {
  extractSitemapUrls,
  inspectPublicHtml,
} from "../scripts/audit-public-indexability.mjs";

describe("public indexability audit", () => {
  it("extracts and decodes sitemap locations", () => {
    expect(extractSitemapUrls("<urlset><url><loc>https://demaa.co/a&amp;b</loc></url></urlset>"))
      .toEqual(["https://demaa.co/a&b"]);
  });

  it("accepts one complete and indexable public document", () => {
    const html = `
      <html><head>
        <title>Page | Demaa</title>
        <meta name="description" content="Description">
        <meta property="og:image" content="https://demaa.co/opengraph-image">
        <link rel="canonical" href="https://demaa.co/page">
      </head><body><h1>Page</h1></body></html>
    `;

    expect(inspectPublicHtml(html, "https://demaa.co/page")).toEqual([]);
  });

  it("reports every missing indexability signal", () => {
    const failures = inspectPublicHtml(
      '<meta name="robots" content="noindex"><h1>Un</h1><h1>Deux</h1>',
      "https://demaa.co/page",
    );

    expect(failures).toEqual(expect.arrayContaining([
      "title manquant",
      "meta description manquante",
      "page déclarée noindex",
      "canonical manquante",
      "og:image manquante",
      "2 H1 au lieu de 1",
    ]));
  });
});

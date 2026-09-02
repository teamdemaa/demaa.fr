import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import nextConfig from "../next.config";
import {
  getAllPublishedContent,
  getContentFormat,
  getPublishedContentBySlug,
} from "@/lib/content-catalog";
import {
  buildContentJsonLd,
  buildContentMetadata,
  serializeContentJsonLd,
} from "@/lib/content-seo";

describe("canonical content catalog", () => {
  it("publishes the electronic invoicing article with a progressive slide medium", () => {
    const entries = getAllPublishedContent();
    expect(entries).toHaveLength(1);

    const entry = getPublishedContentBySlug("facturation-electronique");
    expect(entry).not.toBeNull();
    expect(entry?.status).toBe("published");
    expect(entry?.verifiedAt).toBe("2026-08-09");
    expect(entry?.media.youtubeId).toBeUndefined();
    expect(entry?.media.slides).toHaveLength(9);
    expect(getContentFormat(entry!)).toBe("Diaporama");
    expect(entry?.article.length).toBeGreaterThanOrEqual(7);
    expect(JSON.stringify(entry)).not.toMatch(/15\s*€|sanction|amende/i);

    for (const slide of entry?.media.slides ?? []) {
      expect(existsSync(resolve(process.cwd(), "public", slide.replace(/^\//, "")))).toBe(true);
    }
  });

  it("presents the electronic invoicing guide as a concrete Organisation case", () => {
    const contentPage = readFileSync(
      resolve(process.cwd(), "src/app/(marketing)/contenus/[slug]/page.tsx"),
      "utf8",
    );

    expect(contentPage).toContain('<Navbar minimal publicNavigationActiveView="academy" />');
    expect(contentPage).toContain('href="/organiser#cas-concrets"');
    expect(contentPage).toContain("<CaseVideoOverview");
    expect(contentPage).toContain("items={entry.article.map((section) => section.heading)}");
    expect(contentPage).toContain("<NumberedSectionHeading");
  });

  it("uses only the four official sources selected for the legal review", () => {
    const entry = getPublishedContentBySlug("facturation-electronique");
    expect(entry?.sources.map(({ href }) => href)).toEqual([
      "https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees",
      "https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises",
      "https://www.impots.gouv.fr/professionnel/questions/partir-de-quand-suis-je-concerne-par-la-reforme-de-la-facturation",
      "https://www.impots.gouv.fr/foire-aux-questions-japprofondis-la-facturation-electronique",
    ]);
  });

  it("builds canonical metadata, BreadcrumbList and Article without a false VideoObject", () => {
    const entry = getPublishedContentBySlug("facturation-electronique")!;
    const metadata = buildContentMetadata(entry);
    const jsonLd = buildContentJsonLd(entry);

    expect(metadata.alternates?.canonical).toBe("https://demaa.fr/contenus/facturation-electronique");
    expect(jsonLd).toHaveLength(2);
    expect(jsonLd[0]).toMatchObject({ "@type": "BreadcrumbList" });
    expect(jsonLd[1]).toMatchObject({
      "@type": "Article",
      url: "https://demaa.fr/contenus/facturation-electronique",
      dateModified: "2026-08-09",
    });
    expect(JSON.stringify(jsonLd)).not.toContain("VideoObject");
    expect(serializeContentJsonLd({ value: "</script>" })).toBe('{"value":"\\u003c/script>"}');
  });

  it("redirects the legacy course only after the canonical destination exists", async () => {
    expect(getPublishedContentBySlug("facturation-electronique")).not.toBeNull();
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toContainEqual({
      source: "/cours/facture-electronique",
      destination: "/contenus/facturation-electronique",
      permanent: true,
    });
  });

  it("exposes the hub in the footer without restoring legacy Courses entries", () => {
    const footer = readFileSync(resolve(process.cwd(), "src/components/Footer.tsx"), "utf8");
    const sitemap = readFileSync(resolve(process.cwd(), "src/app/sitemap.ts"), "utf8");
    expect(footer).toContain('{ label: "Contenus", href: "/contenus" }');
    expect(sitemap).toContain("`${base}/contenus`");
    expect(sitemap).toContain("`${base}/contenus/${entry.slug}`");
    expect(sitemap).not.toContain("courseContentEntries");
    expect(sitemap).not.toMatch(/from ["']@\/lib\/course-content["']/);
  });
});

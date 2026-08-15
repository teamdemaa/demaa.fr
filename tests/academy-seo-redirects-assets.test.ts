import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import nextConfig from "../next.config";
import { generateMetadata } from "@/app/academie/[slug]/page";
import {
  buildAcademyContentJsonLd,
  buildAcademyContentMetadata,
  serializeAcademyContentJsonLd,
} from "@/lib/academy-content-seo";
import {
  getAcademyCaseStudies,
  getAcademyFundamentals,
  getAllAcademyContent,
} from "@/lib/academy-course-content";
import {
  ACADEMY_CONTENT_SLUGS,
  ACADEMY_PERMANENT_REDIRECTS,
  LEGACY_ACADEMY_SLUG_ALIASES,
} from "@/lib/academy-course-routes";

type AssetManifest = {
  assets: Array<{
    slug: string;
    path: string;
    sourceContentPath: string;
    sha256: string;
    width: number;
    height: number;
    bytes: number;
    provenanceStatus: string;
    rightsStatus: string;
    optimization?: {
      mode: string;
      decodedPixelsVerifiedIdentical: boolean;
    };
  }>;
};

function readPngDimensions(buffer: Buffer) {
  expect(buffer.subarray(1, 4).toString("ascii")).toBe("PNG");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

describe("Academy SEO, redirects and assets", () => {
  it("uses every short title and exact canonical URL in route metadata", async () => {
    for (const content of getAllAcademyContent()) {
      const expectedTitle = `${content.identity.shortTitle} | Académie Demaa`;
      const expectedCanonical = `https://demaa.co/academie/${content.identity.slug}`;
      const metadata = buildAcademyContentMetadata(content);
      const routeMetadata = await generateMetadata({
        params: Promise.resolve({ slug: content.identity.slug }),
      });

      expect(metadata.title).toBe(expectedTitle);
      expect(metadata.alternates?.canonical).toBe(expectedCanonical);
      expect(metadata.openGraph?.url).toBe(expectedCanonical);
      expect(routeMetadata.title).toBe(expectedTitle);
      expect(routeMetadata.alternates?.canonical).toBe(expectedCanonical);
    }
  });

  it("emits BreadcrumbList plus Course/LearningResource for fundamentals", () => {
    for (const content of getAcademyFundamentals()) {
      const jsonLd = buildAcademyContentJsonLd(content);
      const canonicalUrl = `https://demaa.co/academie/${content.identity.slug}`;

      expect(jsonLd).toHaveLength(2);
      expect(jsonLd[0]).toEqual({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: "https://demaa.co",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Académie",
            item: "https://demaa.co/academie",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: content.identity.shortTitle,
            item: canonicalUrl,
          },
        ],
      });
      expect(jsonLd[1]).toMatchObject({
        "@context": "https://schema.org",
        "@type": ["Course", "LearningResource"],
        "@id": `${canonicalUrl}#course`,
        url: canonicalUrl,
        name: content.identity.shortTitle,
        description: content.identity.promise,
        timeRequired: `PT${content.identity.durationMinutes}M`,
        provider: {
          "@type": "Organization",
          name: "Demaa",
          url: "https://demaa.co",
        },
      });
      expect(JSON.stringify(jsonLd)).not.toContain("VideoObject");
    }
  });

  it("emits BreadcrumbList plus Article for case studies", () => {
    for (const content of getAcademyCaseStudies()) {
      const jsonLd = buildAcademyContentJsonLd(content);
      const canonicalUrl = `https://demaa.co/academie/${content.identity.slug}`;

      expect(jsonLd).toHaveLength(2);
      expect(jsonLd[0]).toMatchObject({ "@type": "BreadcrumbList" });
      expect(jsonLd[1]).toMatchObject({
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        url: canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        headline: content.identity.title,
        name: content.identity.shortTitle,
        articleSection: content.identity.category,
      });
      expect(JSON.stringify(jsonLd)).not.toContain("VideoObject");
    }
  });

  it("escapes JSON-LD before embedding it in the page", () => {
    expect(serializeAcademyContentJsonLd({ value: "</script><script>" })).toBe(
      '{"value":"\\u003c/script>\\u003cscript>"}',
    );
  });

  it("registers only the explicit permanent Academy redirects", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toBeDefined();

    for (const redirect of ACADEMY_PERMANENT_REDIRECTS) {
      expect(redirects).toContainEqual(redirect);
    }

    expect(ACADEMY_PERMANENT_REDIRECTS).toHaveLength(
      5 + 2 * ACADEMY_CONTENT_SLUGS.length + 3 * Object.keys(LEGACY_ACADEMY_SLUG_ALIASES).length,
    );
    expect(redirects).not.toContainEqual(
      expect.objectContaining({ source: "/cours/:slug" }),
    );
    expect(redirects).not.toContainEqual(
      expect.objectContaining({ source: "/cours/:path*" }),
    );
    expect(redirects).not.toContainEqual(
      expect.objectContaining({ source: "/academy/:path*" }),
    );
    expect(redirects).toContainEqual({
      source: "/academy",
      destination: "/academie",
      permanent: true,
    });
    for (const slug of ACADEMY_CONTENT_SLUGS) {
      expect(redirects).toContainEqual({
        source: `/academy/${slug}`,
        destination: `/academie/${slug}`,
        permanent: true,
      });
    }
    expect(redirects).toContainEqual(
      expect.objectContaining({
        source: "/cours/facture-electronique",
        destination: "/contenus/facturation-electronique",
        permanent: true,
      }),
    );
  });

  it("keeps an exact manifest for the eleven referenced PNG assets", () => {
    const manifestPath = resolve(
      process.cwd(),
      "studio/academy-course-pack-v1/assets-manifest.json",
    );
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as AssetManifest;
    const contentBySlug = new Map(
      getAllAcademyContent().map((content) => [content.identity.slug, content]),
    );

    expect(manifest.assets).toHaveLength(11);
    expect(new Set(manifest.assets.map((asset) => asset.slug)).size).toBe(11);

    for (const asset of manifest.assets) {
      const content = contentBySlug.get(asset.slug);
      expect(content?.identity.card.image).toBe(asset.path);
      expect(existsSync(resolve(process.cwd(), asset.sourceContentPath))).toBe(true);

      const buffer = readFileSync(
        resolve(process.cwd(), "public", asset.path.replace(/^\//, "")),
      );
      expect(createHash("sha256").update(buffer).digest("hex")).toBe(asset.sha256);
      expect(buffer.byteLength).toBe(asset.bytes);
      expect(readPngDimensions(buffer)).toEqual({
        width: asset.width,
        height: asset.height,
      });
      expect(asset.provenanceStatus).toBe("needs-confirmation");
      expect(asset.rightsStatus).toBe("needs-confirmation");
      if (asset.optimization) {
        expect(asset.optimization).toMatchObject({
          mode: "lossless PNG compression",
          decodedPixelsVerifiedIdentical: true,
        });
      }
    }
  });
});

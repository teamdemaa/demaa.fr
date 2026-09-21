import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import nextConfig from "../next.config";
import { generateMetadata as generateAcademyMetadata } from "@/app/(marketing)/academie/[slug]/page";
import {
  buildAcademyContentJsonLd,
  serializeAcademyContentJsonLd,
} from "@/lib/academy-content-seo";
import {
  getAcademyCaseStudies,
  getAcademyFundamentals,
  getAllAcademyContent,
} from "@/lib/academy-course-content";
import { getAcademyPreviewCards } from "@/lib/academy-preview-catalog";
import {
  ACADEMY_PERMANENT_REDIRECTS,
  ARCHIVED_ACADEMY_DESTINATION,
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
  it("publishes the complete, unique illustrated Academy article set", () => {
    const cards = getAcademyPreviewCards();

    expect(cards).toHaveLength(13);
    expect(new Set(cards.map((card) => card.href)).size).toBe(cards.length);
    for (const card of cards) {
      expect(card.href).toMatch(/^\/academie\//);
      expect(card.image).toMatch(/^\/images\/academy\/covers\/.+-v3\.png$/);
      expect(existsSync(resolve(process.cwd(), "public", card.image!.slice(1)))).toBe(true);
    }
  });

  it("uses indexable Academy article URLs and exact canonical metadata", async () => {
    for (const card of getAcademyPreviewCards()) {
      const slug = card.href.slice("/academie/".length);
      const routeMetadata = await generateAcademyMetadata({
        params: Promise.resolve({ slug }),
      });

      expect(routeMetadata.title).toBe(`${card.title} | Académie Demaa`);
      expect(routeMetadata.alternates?.canonical).toBe(`/academie/${slug}`);
      expect(routeMetadata.openGraph?.url).toBe(`/academie/${slug}`);
      expect(routeMetadata.robots).toBeUndefined();
    }
  });

  it("emits BreadcrumbList plus Course/LearningResource for fundamentals", () => {
    for (const content of getAcademyFundamentals()) {
      const jsonLd = buildAcademyContentJsonLd(content);
      const canonicalUrl = `https://demaa.fr/organiser/${content.identity.slug}`;

      expect(jsonLd).toHaveLength(2);
      expect(jsonLd[0]).toEqual({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: "https://demaa.fr",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Organisation",
            item: "https://demaa.fr/organiser",
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
          url: "https://demaa.fr",
        },
      });
      expect(JSON.stringify(jsonLd)).not.toContain("VideoObject");
    }
  });

  it("emits BreadcrumbList plus Article for case studies", () => {
    for (const content of getAcademyCaseStudies()) {
      const jsonLd = buildAcademyContentJsonLd(content);
      const canonicalUrl = `https://demaa.fr/organiser/${content.identity.slug}`;
      const expectedImage = content.identity.card.image
        ? `https://demaa.fr${content.identity.card.image}`
        : `${canonicalUrl}/process-map.png`;

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
        image: expectedImage,
      });
      expect(JSON.stringify(jsonLd)).not.toContain("VideoObject");
    }
  });

  it("escapes JSON-LD before embedding it in the page", () => {
    expect(serializeAcademyContentJsonLd({ value: "</script><script>" })).toBe(
      '{"value":"\\u003c/script>\\u003cscript>"}',
    );
  });

  it("keeps the canonical Academy route and redirects only legacy entry points", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toBeDefined();

    for (const redirect of ACADEMY_PERMANENT_REDIRECTS) {
      expect(redirects).toContainEqual(redirect);
    }

    expect(ACADEMY_PERMANENT_REDIRECTS).toHaveLength(7);
    for (const source of ["/cours", "/cours/:path*"]) {
      expect(redirects).toContainEqual({
        source,
        destination: ARCHIVED_ACADEMY_DESTINATION,
        permanent: true,
      });
    }
    for (const source of ["/academy", "/academy/:path*", "/organiser"]) {
      expect(redirects).toContainEqual({
        source,
        destination: "/academie",
        permanent: true,
      });
    }
    expect(redirects).not.toContainEqual(expect.objectContaining({ source: "/academie" }));
    expect(redirects).toContainEqual(
      expect.objectContaining({
        source: "/cours/facture-electronique",
        destination: "/contenus/facturation-electronique",
        permanent: true,
      }),
    );
    expect(redirects).toContainEqual({
      source: "/cours/obligations-finances-entreprise",
      destination: "/solutions",
      permanent: true,
    });
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

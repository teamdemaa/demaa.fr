import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { generateStaticParams } from "@/app/academie/[slug]/page";
import {
  getAllAcademyVideos,
  getPublishedAcademyVideos,
} from "@/lib/academy-video-catalog";

const DRAFT_SLUGS = [
  "fixer-ses-prix-sans-vendre-a-perte",
  "transformer-une-demande-en-client",
  "deleguer-sans-perdre-le-controle",
] as const;

describe("academy draft publication boundary", () => {
  it("keeps draft-only fields free of publishable video and artwork data", () => {
    const drafts = getAllAcademyVideos().filter(
      (video) => video.publication.status === "draft",
    );

    expect(drafts).toHaveLength(3);

    for (const draft of drafts) {
      expect(draft.artworkPath).toBeNull();
      expect(draft.thumbnailComposition).toBeNull();
      expect(draft.durationLabel).toBeNull();
      expect(draft.durationSeconds).toBeNull();
      expect(draft.editorialPublishedAt).toBeNull();
      expect(draft.updatedAt).toBeNull();
      expect(draft.publication).toEqual({ status: "draft" });
    }
  });

  it("generates static parameters for published pages only", () => {
    expect(generateStaticParams()).toEqual(
      getPublishedAcademyVideos().map((video) => ({ slug: video.slug })),
    );

    const serializedParams = JSON.stringify(generateStaticParams());
    for (const slug of DRAFT_SLUGS) {
      expect(serializedParams).not.toContain(slug);
    }
  });

  it("uses published selectors at every public Academy boundary", async () => {
    const files = await Promise.all(
      [
        "../src/app/academie/page.tsx",
        "../src/app/academie/[slug]/page.tsx",
        "../src/app/sitemap.ts",
        "../src/app/academie/video-sitemap.xml/route.ts",
      ].map((path) =>
        readFile(new URL(path, import.meta.url), "utf8"),
      ),
    );

    for (const source of files) {
      expect(source).not.toContain("getAllAcademyVideos");
    }

    expect(files[0]).toContain("getPublishedAcademyVideos");
    expect(files[1]).toContain("getPublishedAcademyVideoBySlug");
    expect(files[1]).toContain("getPublishedAcademyVideos");
    expect(files[1]).toContain("export const dynamicParams = false");
    expect(files[2]).toContain("getPublishedAcademyVideos");
    expect(files[3]).toContain("getPublishedAcademyVideos");
  });

  it("keeps the full server catalog out of client runtime imports", async () => {
    const [catalogClient, artwork, player] = await Promise.all(
      [
        "../src/components/AcademyCatalogClient.tsx",
        "../src/components/AcademyVideoArtwork.tsx",
        "../src/components/AcademyVideoPlayer.tsx",
      ].map((path) =>
        readFile(new URL(path, import.meta.url), "utf8"),
      ),
    );

    expect(catalogClient).toContain(
      'import type {\n  AcademyCourseCategory,\n  PublishedAcademyVideoEntry,\n} from "@/lib/academy-video-catalog";',
    );
    expect(artwork).toContain(
      'import type { PublishedAcademyVideoEntry } from "@/lib/academy-video-catalog";',
    );
    expect(player).toContain(
      'import type { PublishedAcademyVideoEntry } from "@/lib/academy-video-catalog";',
    );
    expect(artwork).toContain('from "@/lib/academy-thumbnail"');
  });

  it("does not ship draft thumbnail assets in the public directory", async () => {
    const draftAssetNames = [
      "illustration-fixer-prix.png",
      "illustration-demande-client.png",
      "illustration-delegation.png",
    ];
    const publicFiles = await Promise.all(
      draftAssetNames.map(async (fileName) => {
        try {
          await readFile(
            new URL(`../public/images/academy/${fileName}`, import.meta.url),
          );
          return true;
        } catch {
          return false;
        }
      }),
    );

    expect(publicFiles).toEqual([false, false, false]);
  });
});

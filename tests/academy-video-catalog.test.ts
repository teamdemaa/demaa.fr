import { describe, expect, it } from "vitest";
import { GET as getVideoSitemap } from "@/app/academie/video-sitemap.xml/route";
import {
  ACADEMY_THUMBNAIL_CANVAS,
  ACADEMY_THUMBNAIL_TARGET_CROP_RATIO,
  DEFAULT_ACADEMY_THUMBNAIL_COMPOSITION,
  getAcademyVideoBySlug,
  getAcademyVideosForSystem,
  getAllAcademyVideos,
  getPublishedAcademyVideos,
} from "@/lib/academy-video-catalog";
import {
  buildAcademyPageJsonLd,
  serializeJsonLd,
} from "@/lib/academy-seo";

describe("academy video catalog", () => {
  it("exposes two distinct autonomous SEO pages", () => {
    const videos = getAllAcademyVideos();

    expect(videos).toHaveLength(2);
    expect(new Set(videos.map((video) => video.slug)).size).toBe(2);
    expect(new Set(videos.map((video) => video.seoTitle)).size).toBe(2);
    expect(new Set(videos.map((video) => video.h1)).size).toBe(2);

    for (const video of videos) {
      expect(video.seoTitle.length).toBeLessThanOrEqual(60);
      expect(video.seoDescription.length).toBeLessThanOrEqual(160);
      expect(video.shortAnswer.length).toBeGreaterThan(180);
      expect(video.essentialPoints.length).toBeGreaterThanOrEqual(5);
      expect(video.actions.length).toBeGreaterThanOrEqual(5);
      expect(video.faq.length).toBeGreaterThanOrEqual(5);
      expect(getAcademyVideoBySlug(video.relatedVideoSlug)).toBeDefined();
    }
  });

  it("uses only the two validated public YouTube publications", () => {
    expect(
      getPublishedAcademyVideos().map((video) => ({
        id: video.publication.youtubeId,
        title: video.publication.youtubeTitle,
      })),
    ).toEqual([
      {
        id: "SMlvcrgm9Wc",
        title: "Gérer sa trésorerie au quotidien | Mini-cours Demaa",
      },
      {
        id: "Wch_wDVu4Wc",
        title: "Chiffre d’affaires ≠ bénéfice | Mini-cours Demaa",
      },
    ]);

    for (const video of getPublishedAcademyVideos()) {
      expect(video.publication.status).toBe("published");
      expect(video.publication.embedUrl).toMatch(
        /^https:\/\/www\.youtube-nocookie\.com\/embed\//,
      );
      expect(video.publication.embedUrl).not.toContain("autoplay");
      expect(video.publication.thumbnailUrl).toMatch(
        /^https:\/\/i\.ytimg\.com\/vi\//,
      );
      expect(video.publication.uploadDate).toMatch(
        /^2026-07-27T14:3[14]:\d{2}-07:00$/,
      );
      expect(video.publication.thumbnailWidth).toBe(1280);
      expect(video.publication.thumbnailHeight).toBe(720);
    }
  });

  it("keeps measured composition parameters distinct for both thumbnails", () => {
    const benefit = getAcademyVideoBySlug(
      "difference-chiffre-affaires-benefice",
    );
    const treasury = getAcademyVideoBySlug(
      "entreprise-rentable-sans-tresorerie",
    );

    expect(benefit).toMatchObject({
      artworkTheme: "sage",
      thumbnailComposition: {
        artwork: {
          scale: Math.SQRT2,
          offsetXPercent: -6.3,
          offsetYPercent: 0,
        },
        title: {
          scale: 0.69,
          offsetXPercent: 15.9,
          offsetYPercent: 0,
        },
        safeZone: {
          targetAspectRatio: ACADEMY_THUMBNAIL_TARGET_CROP_RATIO,
          minimumSafeAspectRatio: 1.3056,
        },
      },
    });
    expect(treasury).toMatchObject({
      artworkTheme: "forest",
      thumbnailLines: ["Rentable.", "Mais sans", "trésorerie."],
      thumbnailComposition: {
        artwork: {
          scale: 1.25,
          offsetXPercent: -10,
          offsetYPercent: 0,
        },
        title: {
          scale: 1,
          offsetXPercent: 17,
          offsetYPercent: 0,
        },
        safeZone: {
          targetAspectRatio: ACADEMY_THUMBNAIL_TARGET_CROP_RATIO,
          minimumSafeAspectRatio: 1.2722,
        },
      },
    });

    expect(treasury?.thumbnailComposition).not.toEqual(
      benefit?.thumbnailComposition,
    );
    expect(
      DEFAULT_ACADEMY_THUMBNAIL_COMPOSITION.safeZone.minimumSafeAspectRatio,
    ).toBe(ACADEMY_THUMBNAIL_TARGET_CROP_RATIO);

    for (const video of getPublishedAcademyVideos()) {
      expect(video.thumbnailComposition.safeZone.minimumSafeAspectRatio).toBeLessThanOrEqual(
        ACADEMY_THUMBNAIL_TARGET_CROP_RATIO,
      );
      expect(video.publication.thumbnailWidth).toBe(
        ACADEMY_THUMBNAIL_CANVAS.width,
      );
      expect(video.publication.thumbnailHeight).toBe(
        ACADEMY_THUMBNAIL_CANVAS.height,
      );
    }
  });

  it("emits real VideoObject data and escapes JSON-LD", () => {
    for (const video of getPublishedAcademyVideos()) {
      const jsonLd = buildAcademyPageJsonLd(video);
      const videoObject = jsonLd.find((item) => item["@type"] === "VideoObject");

      expect(videoObject).toMatchObject({
        name: video.publication.youtubeTitle,
        thumbnailUrl: [video.publication.thumbnailUrl],
        uploadDate: video.publication.uploadDate,
        duration: video.publication.durationIso,
        embedUrl: video.publication.embedUrl,
      });
      expect(videoObject).not.toHaveProperty("contentUrl");
    }

    expect(serializeJsonLd({ value: "<unsafe>" })).toContain("\\u003cunsafe>");
  });

  it("links only relevant academy pages from a system", () => {
    expect(
      getAcademyVideosForSystem("daf-externalise").map((video) => video.slug),
    ).toEqual([
      "entreprise-rentable-sans-tresorerie",
      "difference-chiffre-affaires-benefice",
    ]);
    expect(getAcademyVideosForSystem("plomberie-chauffage")).toHaveLength(0);
  });

  it("publishes both real videos in the video sitemap", async () => {
    const response = getVideoSitemap();
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/xml");
    expect(xml.match(/<video:video>/g)).toHaveLength(2);
    expect(xml).toContain("SMlvcrgm9Wc");
    expect(xml).toContain("Wch_wDVu4Wc");
    expect(xml).toContain("www.youtube-nocookie.com");
    expect(xml).not.toContain("autoplay");
  });
});

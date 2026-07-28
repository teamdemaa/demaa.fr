import { getPublishedAcademyVideos } from "@/lib/academy-video-catalog";
import { getCanonicalOrigin } from "@/lib/site-url";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const origin = getCanonicalOrigin();
  const urls = getPublishedAcademyVideos()
    .map((video) => {
      const publication = video.publication;
      return [
        "  <url>",
        `    <loc>${escapeXml(`${origin}/academie/${video.slug}`)}</loc>`,
        "    <video:video>",
        `      <video:thumbnail_loc>${escapeXml(publication.thumbnailUrl)}</video:thumbnail_loc>`,
        `      <video:title>${escapeXml(publication.youtubeTitle)}</video:title>`,
        `      <video:description>${escapeXml(video.seoDescription)}</video:description>`,
        `      <video:player_loc>${escapeXml(publication.embedUrl)}</video:player_loc>`,
        `      <video:duration>${video.durationSeconds}</video:duration>`,
        `      <video:publication_date>${publication.uploadDate}</video:publication_date>`,
        "    </video:video>",
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return new Response(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
      '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
      urls,
      "</urlset>",
    ].join("\n"),
    {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=3600",
        "Content-Type": "application/xml; charset=utf-8",
      },
    },
  );
}

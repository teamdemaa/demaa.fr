import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getAcademyContentBySlug } from "@/lib/academy-course-content";
import { getOrganiserThumbnail } from "@/lib/organiser-thumbnail-catalog";

export const alt = "Miniature d’un cas concret Organisation Demaa";
export const size = { width: 1280, height: 720 };
export const contentType = "image/png";

export default async function OrganiserOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const thumbnail = getOrganiserThumbnail(slug);
  const content = getAcademyContentBySlug(slug);
  const imagePath = thumbnail
    ? `images/organiser/thumbnails/${thumbnail.slug}.png`
    : content?.identity.card.image?.replace(/^\//, "");

  if (!imagePath) {
    return new Response("Miniature introuvable", { status: 404 });
  }

  const image = await readFile(
    join(process.cwd(), "public", imagePath),
  );

  return new Response(image, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

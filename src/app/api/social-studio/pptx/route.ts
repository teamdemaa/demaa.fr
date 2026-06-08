import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import type { SocialCarousel } from "@/lib/social-carousels";
import { createSocialCarouselPptx } from "@/lib/social-pptx";

function isValidCarouselPayload(carousel: SocialCarousel | null): carousel is SocialCarousel {
  const slug = normalizeText(carousel?.sector?.slug, 80);
  const slides = Array.isArray(carousel?.slides) ? carousel.slides : [];

  return Boolean(slug && slides.length > 0 && slides.length <= 12);
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    keyPrefix: "social-pptx",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data: carousel, response } =
    await readJsonBody<SocialCarousel>(request, 128 * 1024);
  if (response) return response;

  if (!isValidCarouselPayload(carousel)) {
    return NextResponse.json({ error: "Invalid carousel payload" }, { status: 400 });
  }

  const pptx = createSocialCarouselPptx(carousel);
  const arrayBuffer = new ArrayBuffer(pptx.byteLength);
  new Uint8Array(arrayBuffer).set(pptx);

  const body = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${carousel.sector.slug}-canva-editable.pptx"`,
    },
  });
}

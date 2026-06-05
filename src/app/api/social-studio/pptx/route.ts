import { NextResponse } from "next/server";
import type { SocialCarousel } from "@/lib/social-carousels";
import { createSocialCarouselPptx } from "@/lib/social-pptx";

export async function POST(request: Request) {
  const carousel = (await request.json()) as SocialCarousel;

  if (!carousel?.sector?.slug || !Array.isArray(carousel.slides)) {
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

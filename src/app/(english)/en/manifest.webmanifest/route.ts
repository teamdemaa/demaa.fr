import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import { buildDemaaManifest } from "@/lib/pwa-manifest";

export function GET() {
  if (!isEnglishBetaEnabled()) {
    return new Response(null, { status: 404 });
  }

  return Response.json(buildDemaaManifest("en"), {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Type": "application/manifest+json",
    },
  });
}

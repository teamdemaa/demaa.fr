import { getAllAcademyContent } from "@/lib/academy-course-content";
import { getEnglishAcademyContent } from "@/lib/academy-course-content-en";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import { getVisibleAcademyLiveTrainings } from "@/lib/live-session-catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const localeCode = url.searchParams.get("locale") ?? "fr";
  const marketCode = url.searchParams.get("market") ?? "fr-fr";
  const isEnglish = localeCode === "en"
    && (marketCode === "fr-fr" || marketCode === "global-en-beta");
  if (isEnglish && !isEnglishBetaEnabled()) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  if (!isEnglish && (localeCode !== "fr" || marketCode !== "fr-fr")) {
    return Response.json({ error: "invalid_international_context" }, { status: 400 });
  }

  return Response.json(
    {
      contents: isEnglish ? getEnglishAcademyContent() : getAllAcademyContent(),
      liveTrainings: isEnglish ? [] : getVisibleAcademyLiveTrainings(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

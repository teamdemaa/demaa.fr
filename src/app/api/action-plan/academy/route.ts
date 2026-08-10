import { getAcademyFundamentals } from "@/lib/academy-course-content";
import { getVisibleAcademyLiveTrainings } from "@/lib/live-session-catalog";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(
    {
      contents: getAcademyFundamentals(),
      liveTrainings: getVisibleAcademyLiveTrainings(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

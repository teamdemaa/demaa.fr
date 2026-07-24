import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  isKitAnalyticsSessionValid,
  KIT_ANALYTICS_SESSION_COOKIE,
} from "@/lib/kit-analytics-auth.server";
import { getKitAnalyticsOverview } from "@/lib/kit-analytics.server";
import { normalizeKitAnalyticsPeriod } from "@/lib/kit-analytics-utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function escapeCsvValue(value: string | number | null) {
  const normalized = value === null ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(KIT_ANALYTICS_SESSION_COOKIE)?.value;

  if (!isKitAnalyticsSessionValid(sessionToken)) {
    return NextResponse.redirect(new URL("/suivi-kits", request.url), 307);
  }

  const requestUrl = new URL(request.url);
  const period = normalizeKitAnalyticsPeriod(
    requestUrl.searchParams.get("periode") ?? undefined,
  );
  const overview = await getKitAnalyticsOverview(period);
  const rows = [
    ["Kit", "Slug", "Total", `Période ${period} jours`, "7 derniers jours", "Aujourd’hui", "Dernière ouverture"],
    ...overview.rows.map((row) => [
      row.kitName,
      row.kitSlug,
      row.totalOpens,
      row.periodOpens,
      row.last7Days,
      row.todayOpens,
      row.lastOpenedAt,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(";"))
    .join("\n");

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `attachment; filename="suivi-kits-${period}-jours.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}

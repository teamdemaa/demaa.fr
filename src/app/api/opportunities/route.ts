import { NextResponse } from "next/server";
import {
  getPublicExpertiseSnapshot,
  getPublicExpertises,
  getPublicOpportunitySnapshot,
  getPublicOpenOpportunities,
} from "@/lib/provider-network.server";
import { enforceAllowedHost } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const isDemo =
    process.env.NODE_ENV !== "production" &&
    new URL(request.url).searchParams.get("demo") === "1";
  const [allExpertises, opportunities] = isDemo
    ? [getPublicExpertiseSnapshot(), getPublicOpportunitySnapshot()]
    : await Promise.all([
        getPublicExpertises(),
        getPublicOpenOpportunities(),
      ]);
  const referencedExpertiseIds = new Set(
    opportunities.flatMap((opportunity) =>
      opportunity.expertiseId ? [opportunity.expertiseId] : []
    ),
  );
  const expertises = allExpertises.filter((expertise) =>
    referencedExpertiseIds.has(expertise.expertiseId)
  );

  const response = NextResponse.json({ expertises, opportunities });
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300",
  );
  if (isDemo) response.headers.set("X-Demaa-Data-Source", "snapshot-demo");
  return response;
}

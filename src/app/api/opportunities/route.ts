import { NextResponse } from "next/server";
import {
  getPublicExpertises,
  getPublicOpenOpportunities,
} from "@/lib/provider-network.server";
import { enforceAllowedHost } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const [allExpertises, opportunities] = await Promise.all([
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
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

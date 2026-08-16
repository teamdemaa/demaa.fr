import { NextResponse } from "next/server";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { CompanyPilotageAccessError } from "@/lib/company-metrics.server";
import { companyPilotageAccessDeniedResponse, requireCompanyPilotageIdentity } from "@/lib/company-pilotage-api.server";
import { getCompanyStrategyHistoryForIdentity } from "@/lib/company-strategy.server";
import { enforceRateLimit } from "@/lib/api-security";
import { enforceAllowedHost } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const limited = await enforceRateLimit(request, { keyPrefix: "company-strategy-history", limit: 120, windowMs: 60 * 60 * 1000 });
  if (limited) return withNoStore(limited);
  const url = new URL(request.url);
  if (url.searchParams.has("company_id") || url.searchParams.has("companyId")) return NextResponse.json({ error: "Paramètre entreprise interdit." }, { status: 400, headers: noStoreHeaders() });
  const cursor = url.searchParams.get("cursor") ?? undefined;
  if (cursor && !/^cycle_[A-Za-z0-9-]{20,64}$/.test(cursor)) return NextResponse.json({ error: "Curseur invalide." }, { status: 400, headers: noStoreHeaders() });
  const access = await requireCompanyPilotageIdentity();
  if (access.response) return access.response;
  try {
    const history = await getCompanyStrategyHistoryForIdentity({ identity: access.identity, cursor });
    return NextResponse.json(history, { headers: noStoreHeaders() });
  } catch (error) {
    if (error instanceof CompanyPilotageAccessError) return companyPilotageAccessDeniedResponse();
    throw error;
  }
}

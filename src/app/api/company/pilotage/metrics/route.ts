import { NextResponse } from "next/server";
import { companyMonthSchema, enumerateCompanyMonths } from "@/lib/company-pilotage-contract";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { CompanyPilotageAccessError, getCompanyMetricsForIdentity } from "@/lib/company-metrics.server";
import { companyPilotageAccessDeniedResponse, requireCompanyPilotageIdentity } from "@/lib/company-pilotage-api.server";
import { enforceRateLimit } from "@/lib/api-security";
import { enforceAllowedHost } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const limited = await enforceRateLimit(request, { keyPrefix: "company-metrics-read", limit: 180, windowMs: 60 * 60 * 1000 });
  if (limited) return withNoStore(limited);
  const url = new URL(request.url);
  if (url.searchParams.has("company_id") || url.searchParams.has("companyId")) {
    return NextResponse.json({ error: "Paramètre entreprise interdit." }, { status: 400, headers: noStoreHeaders() });
  }
  const from = companyMonthSchema.safeParse(url.searchParams.get("from"));
  const to = companyMonthSchema.safeParse(url.searchParams.get("to"));
  if (!from.success || !to.success) {
    return NextResponse.json({ error: "Période invalide." }, { status: 400, headers: noStoreHeaders() });
  }
  try {
    enumerateCompanyMonths(from.data, to.data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Période invalide." }, { status: 400, headers: noStoreHeaders() });
  }
  const access = await requireCompanyPilotageIdentity();
  if (access.response) return access.response;
  try {
    const metrics = await getCompanyMetricsForIdentity({ identity: access.identity, from: from.data, to: to.data });
    return NextResponse.json({ from: from.data, to: to.data, metrics }, { headers: noStoreHeaders() });
  } catch (error) {
    if (error instanceof CompanyPilotageAccessError) return companyPilotageAccessDeniedResponse();
    throw error;
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { CompanyPilotageAccessError } from "@/lib/company-metrics.server";
import { companyPilotageAccessDeniedResponse, requireCompanyPilotageIdentity } from "@/lib/company-pilotage-api.server";
import { initializeCompanyStrategyForIdentity } from "@/lib/company-strategy.server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);
  const limited = await enforceRateLimit(request, { keyPrefix: "company-strategy-initialize", limit: 30, windowMs: 60 * 60 * 1000 });
  if (limited) return withNoStore(limited);
  const { data, response } = await readJsonBody<unknown>(request, 1024);
  if (response) return withNoStore(response);
  if (!z.object({}).strict().safeParse(data).success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: noStoreHeaders() });
  }
  const access = await requireCompanyPilotageIdentity();
  if (access.response) return access.response;
  try {
    const cycle = await initializeCompanyStrategyForIdentity({ identity: access.identity });
    return NextResponse.json({ status: "initialized", cycle }, { status: 201, headers: noStoreHeaders() });
  } catch (error) {
    if (error instanceof CompanyPilotageAccessError) return companyPilotageAccessDeniedResponse();
    throw error;
  }
}

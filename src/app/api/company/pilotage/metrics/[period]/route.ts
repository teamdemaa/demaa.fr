import { NextResponse } from "next/server";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { companyMetricWriteSchema, companyMonthSchema } from "@/lib/company-pilotage-contract";
import { CompanyMetricRevisionConflictError, CompanyPilotageAccessError, putCompanyMetricForIdentity } from "@/lib/company-metrics.server";
import { companyPilotageAccessDeniedResponse, requireCompanyPilotageIdentity } from "@/lib/company-pilotage-api.server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ period: string }> }) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);
  const limited = await enforceRateLimit(request, { keyPrefix: "company-metrics-write", limit: 120, windowMs: 60 * 60 * 1000 });
  if (limited) return withNoStore(limited);
  const period = companyMonthSchema.safeParse((await params).period);
  if (!period.success) return NextResponse.json({ error: "Mois invalide." }, { status: 400, headers: noStoreHeaders() });
  const { data, response } = await readJsonBody<unknown>(request, 8 * 1024);
  if (response) return withNoStore(response);
  const parsed = companyMetricWriteSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "Montants ou révision invalides." }, { status: 400, headers: noStoreHeaders() });
  const access = await requireCompanyPilotageIdentity();
  if (access.response) return access.response;
  try {
    const metric = await putCompanyMetricForIdentity({ identity: access.identity, period: period.data, metric: parsed.data });
    return NextResponse.json({ status: "saved", metric }, { headers: noStoreHeaders() });
  } catch (error) {
    if (error instanceof CompanyPilotageAccessError) return companyPilotageAccessDeniedResponse();
    if (error instanceof CompanyMetricRevisionConflictError) {
      return NextResponse.json({ error: "Ce mois a été modifié ailleurs.", code: "revision_conflict", current: error.current }, { status: 409, headers: noStoreHeaders() });
    }
    throw error;
  }
}

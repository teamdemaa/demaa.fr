import { NextResponse } from "next/server";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { companyStrategyUpdateSchema } from "@/lib/company-pilotage-contract";
import { CompanyPilotageAccessError } from "@/lib/company-metrics.server";
import { companyPilotageAccessDeniedResponse, requireCompanyPilotageIdentity } from "@/lib/company-pilotage-api.server";
import { CompanyStrategyArchivedError, CompanyStrategyRevisionConflictError, updateCompanyStrategyForIdentity } from "@/lib/company-strategy.server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ cycleId: string }> }) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);
  const limited = await enforceRateLimit(request, { keyPrefix: "company-strategy-write", limit: 180, windowMs: 60 * 60 * 1000 });
  if (limited) return withNoStore(limited);
  const { cycleId } = await params;
  if (!/^cycle_[A-Za-z0-9-]{20,64}$/.test(cycleId)) return NextResponse.json({ error: "Cycle introuvable." }, { status: 404, headers: noStoreHeaders() });
  const { data, response } = await readJsonBody<unknown>(request, 16 * 1024);
  if (response) return withNoStore(response);
  const parsed = companyStrategyUpdateSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "Réponses ou révision invalides." }, { status: 400, headers: noStoreHeaders() });
  const access = await requireCompanyPilotageIdentity();
  if (access.response) return access.response;
  try {
    const cycle = await updateCompanyStrategyForIdentity({ identity: access.identity, cycleId, update: parsed.data });
    if (!cycle) return NextResponse.json({ error: "Cycle introuvable." }, { status: 404, headers: noStoreHeaders() });
    return NextResponse.json({ status: "saved", cycle }, { headers: noStoreHeaders() });
  } catch (error) {
    if (error instanceof CompanyPilotageAccessError) return companyPilotageAccessDeniedResponse();
    if (error instanceof CompanyStrategyArchivedError) return NextResponse.json({ error: "Un cycle archivé est en lecture seule.", code: "archived_cycle" }, { status: 409, headers: noStoreHeaders() });
    if (error instanceof CompanyStrategyRevisionConflictError) {
      return NextResponse.json({ error: "La stratégie a été modifiée ailleurs.", code: "revision_conflict", current: error.current }, { status: 409, headers: noStoreHeaders() });
    }
    throw error;
  }
}

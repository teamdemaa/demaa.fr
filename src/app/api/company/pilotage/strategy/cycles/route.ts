import { NextResponse } from "next/server";
import { z } from "zod";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { CompanyPilotageAccessError } from "@/lib/company-metrics.server";
import { companyPilotageAccessDeniedResponse, requireCompanyPilotageIdentity } from "@/lib/company-pilotage-api.server";
import { CompanyStrategyRevisionConflictError, createNextCompanyStrategyCycleForIdentity } from "@/lib/company-strategy.server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const requestSchema = z.object({ expectedRevision: z.number().int().min(1) }).strict();

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);
  const limited = await enforceRateLimit(request, { keyPrefix: "company-strategy-cycle", limit: 20, windowMs: 60 * 60 * 1000 });
  if (limited) return withNoStore(limited);
  const { data, response } = await readJsonBody<unknown>(request, 1024);
  if (response) return withNoStore(response);
  const parsed = requestSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: "Révision invalide." }, { status: 400, headers: noStoreHeaders() });
  const access = await requireCompanyPilotageIdentity();
  if (access.response) return access.response;
  try {
    const cycle = await createNextCompanyStrategyCycleForIdentity({ identity: access.identity, expectedRevision: parsed.data.expectedRevision });
    if (!cycle) return NextResponse.json({ error: "Cycle actif introuvable." }, { status: 404, headers: noStoreHeaders() });
    return NextResponse.json({ status: "created", cycle }, { status: 201, headers: noStoreHeaders() });
  } catch (error) {
    if (error instanceof CompanyPilotageAccessError) return companyPilotageAccessDeniedResponse();
    if (error instanceof CompanyStrategyRevisionConflictError) {
      return NextResponse.json({ error: "La stratégie a été modifiée ailleurs.", code: "revision_conflict", current: error.current }, { status: 409, headers: noStoreHeaders() });
    }
    throw error;
  }
}

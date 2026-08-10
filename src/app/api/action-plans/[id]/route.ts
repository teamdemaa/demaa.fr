import { NextResponse } from "next/server";
import {
  actionPlanUpdateRequestSchema,
  getCurrentCustomerEmail,
  noStoreHeaders,
  withNoStore,
} from "@/lib/action-plan-api.server";
import {
  ActionPlanRevisionConflictError,
  updateOwnedActionPlanWorkspace,
} from "@/lib/action-plan-storage.server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);

  const limited = await enforceRateLimit(request, {
    keyPrefix: "action-plan-update",
    limit: 120,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return withNoStore(limited);

  const email = await getCurrentCustomerEmail();
  if (!email) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{12,64}$/.test(id)) {
    return NextResponse.json(
      { error: "Plan introuvable." },
      { status: 404, headers: noStoreHeaders() },
    );
  }

  const { data, response } = await readJsonBody<unknown>(request, 128 * 1024);
  if (response) return withNoStore(response);
  const parsed = actionPlanUpdateRequestSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Les modifications du plan sont invalides." },
      { status: 400, headers: noStoreHeaders() },
    );
  }

  try {
    const updated = await updateOwnedActionPlanWorkspace(
      email,
      id,
      parsed.data.expectedRevision,
      parsed.data.workspaceState,
    );
    if (!updated) {
      return NextResponse.json(
        { error: "Plan introuvable." },
        { status: 404, headers: noStoreHeaders() },
      );
    }

    return NextResponse.json(
      { status: "saved", ...updated },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    if (error instanceof ActionPlanRevisionConflictError) {
      return NextResponse.json(
        {
          error:
            "Ce plan a été modifié ailleurs. Rechargez la page avant de continuer.",
          code: "revision_conflict",
        },
        { status: 409, headers: noStoreHeaders() },
      );
    }
    throw error;
  }
}

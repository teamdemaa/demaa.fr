import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  actionPlanUpdateRequestSchema,
  actionPlanDeleteRequestSchema,
  getCurrentCustomerEmail,
  noStoreHeaders,
  withNoStore,
} from "@/lib/action-plan-api.server";
import {
  ACTION_PLAN_ACCESS_COOKIE,
  ActionPlanRevisionConflictError,
  InvalidActionPlanMutationError,
  deleteActionPlanForAccess,
  updateActionPlanWorkspaceForAccess,
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
  const cookieStore = await cookies();
  const temporaryAccessToken =
    cookieStore.get(ACTION_PLAN_ACCESS_COOKIE)?.value || null;

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
    const updated = await updateActionPlanWorkspaceForAccess({
      email,
      id,
      expectedRevision: parsed.data.expectedRevision,
      generation: parsed.data.generation,
      plan: parsed.data.plan,
      sourceText: parsed.data.sourceText,
      title: parsed.data.title,
      temporaryAccessToken,
      workspaceState: parsed.data.workspaceState,
    });
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
    if (error instanceof InvalidActionPlanMutationError) {
      return NextResponse.json(
        { error: "Seul un plan vierge peut recevoir de nouvelles actions." },
        { status: 400, headers: noStoreHeaders() },
      );
    }
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);

  const limited = await enforceRateLimit(request, {
    keyPrefix: "action-plan-delete",
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return withNoStore(limited);

  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{12,64}$/.test(id)) {
    return NextResponse.json(
      { error: "Plan introuvable." },
      { status: 404, headers: noStoreHeaders() },
    );
  }

  const { data, response } = await readJsonBody<unknown>(request, 8 * 1024);
  if (response) return withNoStore(response);
  const parsed = actionPlanDeleteRequestSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La suppression du plan est invalide." },
      { status: 400, headers: noStoreHeaders() },
    );
  }

  const email = await getCurrentCustomerEmail();
  const cookieStore = await cookies();
  const temporaryAccessToken =
    cookieStore.get(ACTION_PLAN_ACCESS_COOKIE)?.value || null;

  try {
    const deleted = await deleteActionPlanForAccess({
      email,
      id,
      expectedRevision: parsed.data.expectedRevision,
      temporaryAccessToken,
    });
    if (!deleted) {
      return NextResponse.json(
        { error: "Plan introuvable." },
        { status: 404, headers: noStoreHeaders() },
      );
    }

    const result = NextResponse.json(
      { status: "deleted", ...deleted },
      { headers: noStoreHeaders() },
    );
    result.cookies.delete(ACTION_PLAN_ACCESS_COOKIE);
    return result;
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

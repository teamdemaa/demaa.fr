import { NextResponse } from "next/server";
import {
  actionPlanUpdateRequestSchema,
  actionPlanDeleteRequestSchema,
  getCurrentCustomerIdentity,
  noStoreHeaders,
  withNoStore,
} from "@/lib/action-plan-api.server";
import {
  ActionPlanRevisionConflictError,
  InvalidActionPlanMutationError,
  deleteActionPlanForAccess,
  getActionPlanForAccess,
  updateActionPlanWorkspaceForAccess,
} from "@/lib/action-plan-storage.server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);

  const limited = await enforceRateLimit(request, {
    keyPrefix: "action-plan-read",
    limit: 180,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return withNoStore(limited);

  const identity = await getCurrentCustomerIdentity();
  if (!identity) {
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

  const plan = await getActionPlanForAccess({ id, uid: identity.uid });
  if (!plan) {
    return NextResponse.json(
      { error: "Plan introuvable." },
      { status: 404, headers: noStoreHeaders() },
    );
  }

  return NextResponse.json(
    { id: plan.id, revision: plan.revision },
    { headers: noStoreHeaders() },
  );
}

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

  const identity = await getCurrentCustomerIdentity();
  if (!identity) {
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
    const updated = await updateActionPlanWorkspaceForAccess({
      uid: identity.uid,
      id,
      expectedRevision: parsed.data.expectedRevision,
      generation: parsed.data.generation,
      plan: parsed.data.plan,
      sourceText: parsed.data.sourceText,
      title: parsed.data.title,
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

  const identity = await getCurrentCustomerIdentity();
  if (!identity) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401, headers: noStoreHeaders() },
    );
  }

  try {
    const deleted = await deleteActionPlanForAccess({
      uid: identity.uid,
      id,
      expectedRevision: parsed.data.expectedRevision,
    });
    if (!deleted) {
      return NextResponse.json(
        { error: "Plan introuvable." },
        { status: 404, headers: noStoreHeaders() },
      );
    }

    return NextResponse.json(
      { status: "deleted", ...deleted },
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

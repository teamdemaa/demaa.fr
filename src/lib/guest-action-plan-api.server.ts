import "server-only";

import { NextResponse } from "next/server";
import { noStoreHeaders } from "@/lib/action-plan-api.server";
import type { GuestActionPlanGenerationState } from "@/lib/guest-action-plan-generation.server";

export function guestActionPlanStateResponse(
  state: GuestActionPlanGenerationState | null,
  options: { created?: boolean } = {},
) {
  if (!state) {
    return NextResponse.json(
      { error: "Plan introuvable ou expiré." },
      { status: 404, headers: noStoreHeaders() },
    );
  }
  if (state.status === "active") {
    return NextResponse.json({
      status: "active",
      generationId: state.id,
      actionPlan: {
        id: state.actionPlan.id,
        title: state.actionPlan.title,
        plan: state.actionPlan.plan,
        workspaceState: state.actionPlan.workspaceState,
        contentLocaleCode: state.actionPlan.contentLocaleCode,
        marketCodeAtCreation: state.actionPlan.marketCodeAtCreation,
        expiresAt: state.actionPlan.expiresAt,
      },
    }, {
      status: options.created ? 201 : 200,
      headers: noStoreHeaders(),
    });
  }
  if (state.status === "generating") {
    return NextResponse.json({
      status: "generating",
      generationId: state.id,
      leaseExpiresAt: state.leaseExpiresAt,
      expiresAt: state.expiresAt,
    }, { status: 202, headers: noStoreHeaders() });
  }
  return NextResponse.json({
    status: "failed",
    generationId: state.id,
    canRetry: state.canRetry,
    expiresAt: state.expiresAt,
    error: state.canRetry
      ? "La génération a été interrompue. Réessayez."
      : "Le plan n’a pas pu être généré pour le moment.",
  }, {
    status: state.canRetry ? 502 : 503,
    headers: noStoreHeaders(),
  });
}

export function guestProductUnavailableResponse() {
  return NextResponse.json(
    { error: "Cette fonctionnalité n’est pas disponible." },
    { status: 404, headers: noStoreHeaders() },
  );
}

export function guestCapacityUnavailableResponse() {
  return NextResponse.json(
    { error: "La capacité de génération est temporairement atteinte. Réessayez plus tard." },
    {
      status: 503,
      headers: { ...noStoreHeaders(), "Retry-After": "3600" },
    },
  );
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { readJsonBody } from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { getGuestActionPlanGenerationForAccess } from "@/lib/guest-action-plan-generation.server";
import { guestProductUnavailableResponse } from "@/lib/guest-action-plan-api.server";
import { isGuestProductEnabled, readGuestAccessKey } from "@/lib/guest-action-plan-security.server";
import {
  deliverGuestPlanEmail,
  GuestPlanEmailIdempotencyConflictError,
  prepareGuestPlanEmailDelivery,
} from "@/lib/guest-plan-email-delivery.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { enforceServiceRequestRateLimit } from "@/lib/service-request-security.server";

export const runtime = "nodejs";
export const maxDuration = 30;

type RouteContext = { params: Promise<{ id: string }> };

const requestSchema = z.object({
  email: z.string().trim().max(160),
  idempotencyKey: z.string().trim().regex(/^[A-Za-z0-9:_-]{16,160}$/),
  website: z.string().max(200).optional(),
}).strict();

export async function POST(request: Request, context: RouteContext) {
  if (!isGuestProductEnabled()) return guestProductUnavailableResponse();
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);

  const { data, response } = await readJsonBody<unknown>(request, 8 * 1_024);
  if (response) return withNoStore(response);
  const parsed = requestSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Indiquez une adresse e-mail valide." }, {
      status: 400,
      headers: noStoreHeaders(),
    });
  }
  if (parsed.data.website?.trim()) {
    return NextResponse.json({ ok: true }, { status: 202, headers: noStoreHeaders() });
  }
  const email = normalizeEmail(parsed.data.email);
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Indiquez une adresse e-mail valide." }, {
      status: 400,
      headers: noStoreHeaders(),
    });
  }

  const limited = await enforceServiceRequestRateLimit(request, {
    limit: 5,
    scope: "ip",
    windowMs: 60 * 60 * 1_000,
  }) ?? await enforceServiceRequestRateLimit(request, {
    identity: email,
    limit: 3,
    scope: "email",
    windowMs: 60 * 60 * 1_000,
  });
  if (limited) return withNoStore(limited);

  const { id } = await context.params;
  const accessKey = readGuestAccessKey(request);
  if (!/^gpl_[A-Za-z0-9_-]{40}$/.test(id) || !accessKey) {
    return NextResponse.json({ error: "Accès au plan invalide." }, {
      status: 401,
      headers: noStoreHeaders(),
    });
  }
  const state = await getGuestActionPlanGenerationForAccess({ id, accessKey });
  if (!state || state.status !== "active") {
    return NextResponse.json({ error: "Ce plan est introuvable, incomplet ou expiré." }, {
      status: 404,
      headers: noStoreHeaders(),
    });
  }

  try {
    const delivery = await prepareGuestPlanEmailDelivery({
      email,
      generationId: id,
      idempotencyKey: parsed.data.idempotencyKey,
    });
    const result = await deliverGuestPlanEmail({
      deliveryId: delivery.id,
      plan: state.actionPlan,
    });
    if (result.status === "sent") {
      return NextResponse.json({ ok: true, status: "sent" }, {
        status: 200,
        headers: noStoreHeaders(),
      });
    }
    if (result.status === "processing") {
      return NextResponse.json({ ok: true, status: "processing" }, {
        status: 202,
        headers: noStoreHeaders(),
      });
    }
    return NextResponse.json({ error: "L’e-mail n’a pas pu être envoyé. Réessayez." }, {
      status: 502,
      headers: noStoreHeaders(),
    });
  } catch (error) {
    if (error instanceof GuestPlanEmailIdempotencyConflictError) {
      return NextResponse.json({ error: "Cette demande d’envoi a déjà été utilisée." }, {
        status: 409,
        headers: noStoreHeaders(),
      });
    }
    throw error;
  }
}

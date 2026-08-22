import { NextResponse } from "next/server";
import { z } from "zod";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { readJsonBody } from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import {
  GuestDiagnosticIdempotencyConflictError,
  submitGuestDiagnosticRequest,
} from "@/lib/guest-diagnostic-request.server";
import { getGuestActionPlanGenerationForAccess } from "@/lib/guest-action-plan-generation.server";
import { guestProductUnavailableResponse } from "@/lib/guest-action-plan-api.server";
import { isGuestProductEnabled, readGuestAccessKey } from "@/lib/guest-action-plan-security.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { enforceServiceRequestRateLimit } from "@/lib/service-request-security.server";

export const runtime = "nodejs";
export const maxDuration = 30;

type RouteContext = { params: Promise<{ id: string }> };

const requestSchema = z.object({
  attribution: z.unknown().optional(),
  contactConsent: z.literal(true),
  email: z.string().trim().max(160),
  idempotencyKey: z.string().trim().regex(/^[A-Za-z0-9:_-]{16,160}$/),
  message: z.string().trim().max(2_000).optional(),
  phone: z.string().trim().max(60).optional(),
  website: z.string().max(200).optional(),
}).strict();

function normalizePhone(value: string | undefined) {
  const phone = value?.replace(/\s+/g, " ").trim() || null;
  if (!phone) return null;
  if (!/^\+?[0-9\s().-]+$/.test(phone)) return undefined;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? phone : undefined;
}

export async function POST(request: Request, context: RouteContext) {
  if (!isGuestProductEnabled()) return guestProductUnavailableResponse();
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);

  const { data, response } = await readJsonBody<unknown>(request, 16 * 1_024);
  if (response) return withNoStore(response);
  const parsed = requestSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifiez les informations du diagnostic." }, {
      status: 400,
      headers: noStoreHeaders(),
    });
  }
  if (parsed.data.website?.trim()) {
    return NextResponse.json({ ok: true }, { status: 202, headers: noStoreHeaders() });
  }
  const email = normalizeEmail(parsed.data.email);
  const phone = normalizePhone(parsed.data.phone);
  if (!isValidEmail(email) || phone === undefined) {
    return NextResponse.json({ error: "Vérifiez votre e-mail et votre téléphone." }, {
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
    windowMs: 24 * 60 * 60 * 1_000,
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
    const result = await submitGuestDiagnosticRequest({
      attribution: parsed.data.attribution,
      email,
      idempotencyKey: parsed.data.idempotencyKey,
      message: parsed.data.message?.trim() || null,
      phone,
      plan: state.actionPlan,
      request,
    });
    return NextResponse.json({ ok: true, requestId: result.leadId }, {
      status: result.duplicate ? 200 : 201,
      headers: noStoreHeaders(),
    });
  } catch (error) {
    if (error instanceof GuestDiagnosticIdempotencyConflictError) {
      return NextResponse.json({ error: "Cette demande a déjà été utilisée avec un autre contenu." }, {
        status: 409,
        headers: noStoreHeaders(),
      });
    }
    throw error;
  }
}

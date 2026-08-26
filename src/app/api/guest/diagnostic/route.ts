import { NextResponse } from "next/server";
import { noStoreHeaders, withNoStore } from "@/lib/action-plan-api.server";
import { readJsonBody } from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { guestProductUnavailableResponse } from "@/lib/guest-action-plan-api.server";
import { isGuestProductEnabled } from "@/lib/guest-action-plan-security.server";
import {
  guestDiagnosticRequestSchema,
  normalizeGuestDiagnosticPhone,
} from "@/lib/guest-diagnostic-input";
import {
  GuestDiagnosticIdempotencyConflictError,
  submitGuestDiagnosticRequest,
} from "@/lib/guest-diagnostic-request.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { enforceServiceRequestRateLimit } from "@/lib/service-request-security.server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  if (!isGuestProductEnabled()) return guestProductUnavailableResponse();
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return withNoStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return withNoStore(blockedOrigin);

  const { data, response } = await readJsonBody<unknown>(request, 20 * 1_024);
  if (response) return withNoStore(response);
  const parsed = guestDiagnosticRequestSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifiez les informations du diagnostic." }, {
      status: 400,
      headers: noStoreHeaders(),
    });
  }
  if (parsed.data.website?.trim()) {
    return NextResponse.json({ ok: true }, { status: 202, headers: noStoreHeaders() });
  }
  if (!parsed.data.message?.trim()) {
    return NextResponse.json({ error: "Décrivez brièvement comment nous pouvons vous aider." }, {
      status: 400,
      headers: noStoreHeaders(),
    });
  }

  const email = normalizeEmail(parsed.data.email);
  const phone = normalizeGuestDiagnosticPhone(parsed.data.phone);
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

  try {
    const result = await submitGuestDiagnosticRequest({
      attribution: parsed.data.attribution,
      callbackAvailability: parsed.data.callbackAvailability?.trim() || null,
      email,
      idempotencyKey: parsed.data.idempotencyKey,
      message: parsed.data.message.trim(),
      phone,
      plan: null,
      request,
      situation: parsed.data.situation?.trim() || null,
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

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { syncResendAudienceContact } from "@/lib/resend-audience";

export const runtime = "nodejs";

type SubscribeRequestBody = {
  attribution?: unknown;
  email?: unknown;
  idempotencyKey?: unknown;
  systemSlug?: unknown;
  website?: unknown;
};

function buildEmailRateLimitKey(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

function buildFallbackIdempotencyKey(email: string) {
  const day = new Date().toISOString().slice(0, 10);
  const digest = createHash("sha256").update(`${email}:${day}`).digest("hex");

  return `preferential-rates:${digest}`;
}

function buildScopedIdempotencyKey(clientKey: string, email: string) {
  const digest = createHash("sha256").update(`${clientKey}:${email}`).digest("hex");

  return `preferential-rates:${digest}`;
}

function successResponse() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

async function handlePost(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limitedByIp = await enforceRateLimit(request, {
    keyPrefix: "preferential-rates-ip",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (limitedByIp) return limitedByIp;

  const { data: body, response } = await readJsonBody<SubscribeRequestBody>(
    request,
    4 * 1024,
  );
  if (response) return response;

  const honeypot = normalizeText(body?.website, 200);
  if (honeypot) {
    return successResponse();
  }

  const email = normalizeEmail(normalizeText(body?.email, 160));
  const systemSlug = normalizeText(body?.systemSlug, 120);

  if (!email) {
    return NextResponse.json(
      { error: "Merci de renseigner votre adresse e-mail." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Merci de renseigner une adresse e-mail valide." },
      { status: 400 },
    );
  }

  const limitedByEmail = await enforceRateLimit(
    request,
    {
      keyPrefix: "preferential-rates-email",
      limit: 4,
      windowMs: 60 * 60 * 1000,
    },
    buildEmailRateLimitKey(email),
  );
  if (limitedByEmail) return limitedByEmail;

  const context = await resolveLeadContext({
    systemSlug: systemSlug || null,
    source: "Système métier - Tarifs préférentiels partenaires",
    sourceUrl: request.headers.get("referer"),
  });

  if (!context) {
    return NextResponse.json(
      { error: "Impossible d’enregistrer votre inscription pour le moment." },
      { status: 400 },
    );
  }

  const clientIdempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
  const idempotencyKey = clientIdempotencyKey
    ? buildScopedIdempotencyKey(clientIdempotencyKey, email)
    : buildFallbackIdempotencyKey(email);

  await submitLeadRequest({
    attribution: resolveLeadAttribution(request, body?.attribution),
    channels: {
      email: false,
      resend: false,
      slack: true,
    },
    contact: { email },
    context,
    emoji: "💶",
    idempotencyKey,
    requestType: "preferential_rates_subscription",
    title: "Inscription tarifs préférentiels partenaires",
  });

  const audienceId = process.env.RESEND_PREFERENTIAL_RATES_AUDIENCE_ID?.trim();
  if (audienceId) {
    try {
      await syncResendAudienceContact({ audienceId, email });
    } catch (error) {
      logOperationalError("preferential_rates.resend_sync_failed", error, {
        requestType: "preferential_rates_subscription",
      });
    }
  }

  return successResponse();
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    logOperationalError("preferential_rates.route.failed", error, {
      requestType: "preferential_rates_subscription",
    });
    return NextResponse.json(
      { error: "Impossible d’enregistrer votre inscription pour le moment." },
      { status: 500 },
    );
  }
}

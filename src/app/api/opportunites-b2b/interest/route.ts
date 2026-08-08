import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { getB2BOpportunity } from "@/lib/b2b-opportunities";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

type InterestRequestBody = {
  attribution?: unknown;
  email?: unknown;
  fullName?: unknown;
  idempotencyKey?: unknown;
  opportunitySlug?: unknown;
  website?: unknown;
};

function buildEmailRateLimitKey(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

function buildFallbackIdempotencyKey(opportunitySlug: string, email: string) {
  const day = new Date().toISOString().slice(0, 10);
  const digest = createHash("sha256")
    .update(`${opportunitySlug}:${email}:${day}`)
    .digest("hex");

  return `b2b-opportunity-interest:${digest}`;
}

function buildScopedIdempotencyKey(
  opportunitySlug: string,
  clientKey: string,
  email: string,
) {
  const digest = createHash("sha256")
    .update(`${opportunitySlug}:${clientKey}:${email}`)
    .digest("hex");

  return `b2b-opportunity-interest:${digest}`;
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
    keyPrefix: "b2b-opportunity-interest-ip",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (limitedByIp) return limitedByIp;

  const { data: body, response } = await readJsonBody<InterestRequestBody>(
    request,
    4 * 1024,
  );
  if (response) return response;

  const honeypot = normalizeText(body?.website, 200);
  if (honeypot) {
    return successResponse();
  }

  const fullName = normalizeText(body?.fullName, 140);
  const email = normalizeEmail(normalizeText(body?.email, 160));
  const opportunitySlug = normalizeText(body?.opportunitySlug, 160);

  if (!fullName || !email || !opportunitySlug) {
    return NextResponse.json(
      { error: "Merci de renseigner votre nom et votre adresse e-mail." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Merci de renseigner une adresse e-mail valide." },
      { status: 400 },
    );
  }

  const opportunity = getB2BOpportunity(opportunitySlug);
  if (!opportunity) {
    return NextResponse.json(
      { error: "Cette opportunité est introuvable." },
      { status: 404 },
    );
  }

  const limitedByEmail = await enforceRateLimit(
    request,
    {
      keyPrefix: "b2b-opportunity-interest-email",
      limit: 4,
      windowMs: 60 * 60 * 1000,
    },
    buildEmailRateLimitKey(email),
  );
  if (limitedByEmail) return limitedByEmail;

  const context = await resolveLeadContext({
    source: `Opportunité B2B - ${opportunity.title}`,
    sourceUrl: request.headers.get("referer"),
  });

  if (!context) {
    return NextResponse.json(
      { error: "Impossible d’enregistrer votre intérêt pour le moment." },
      { status: 400 },
    );
  }

  const clientIdempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
  const idempotencyKey = clientIdempotencyKey
    ? buildScopedIdempotencyKey(opportunitySlug, clientIdempotencyKey, email)
    : buildFallbackIdempotencyKey(opportunitySlug, email);

  await submitLeadRequest({
    attribution: resolveLeadAttribution(request, body?.attribution),
    channels: {
      email: false,
      resend: false,
      slack: true,
    },
    contact: { email, name: fullName },
    context,
    emoji: "🤝",
    fields: [
      { label: "Opportunité", value: opportunity.title },
      { label: "Catégorie", value: opportunity.category },
    ],
    idempotencyKey,
    requestType: "b2b_opportunity_interest",
    title: `Intérêt opportunité B2B - ${opportunity.title}`,
  });

  return successResponse();
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    logOperationalError("b2b_opportunity_interest.route.failed", error, {
      requestType: "b2b_opportunity_interest",
    });
    return NextResponse.json(
      { error: "Impossible d’enregistrer votre intérêt pour le moment." },
      { status: 500 },
    );
  }
}

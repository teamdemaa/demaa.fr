import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getSystemResource } from "@/lib/system-resource-catalog";

export const runtime = "nodejs";

const MARKETING_CONSENT_TEXT =
  "J’accepte de recevoir les conseils et actualités Demaa par e-mail.";
const MARKETING_CONSENT_VERSION = "guide-waitlist-v1";

type GuideNotifyRequestBody = {
  attribution?: unknown;
  email?: unknown;
  idempotencyKey?: unknown;
  marketingConsent?: unknown;
  resourceSlug?: unknown;
  systemSlug?: unknown;
  website?: unknown;
};

function isValidSectorSlug(value: string) {
  return /^[a-z0-9-]{2,120}$/.test(value);
}

function buildEmailRateLimitKey(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

function buildFallbackIdempotencyKey(resourceSlug: string, email: string) {
  const day = new Date().toISOString().slice(0, 10);
  const digest = createHash("sha256")
    .update(`${resourceSlug}:${email}:${day}`)
    .digest("hex");

  return `guide-waitlist:${digest}`;
}

function buildScopedIdempotencyKey(
  resourceSlug: string,
  clientKey: string,
  email: string,
) {
  const digest = createHash("sha256")
    .update(`${resourceSlug}:${clientKey}:${email}`)
    .digest("hex");

  return `guide-waitlist:${digest}`;
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
    keyPrefix: "guide-waitlist-ip",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (limitedByIp) return limitedByIp;

  const { data: body, response } = await readJsonBody<GuideNotifyRequestBody>(
    request,
    4 * 1024,
  );
  if (response) return response;

  const honeypot = normalizeText(body?.website, 200);
  if (honeypot) {
    return successResponse();
  }

  const systemSlug = normalizeText(body?.systemSlug, 120);
  const email = normalizeEmail(normalizeText(body?.email, 160));
  const marketingConsent = body?.marketingConsent === true;
  const resourceSlug = normalizeText(body?.resourceSlug, 120);

  if (!systemSlug || !email || !resourceSlug) {
    return NextResponse.json(
      { error: "Merci de renseigner votre adresse e-mail." },
      { status: 400 },
    );
  }

  if (!isValidSectorSlug(systemSlug)) {
    return NextResponse.json(
      { error: "Le métier sélectionné est invalide." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Merci de renseigner une adresse e-mail valide." },
      { status: 400 },
    );
  }

  const resource = getSystemResource(resourceSlug);
  if (
    !resource ||
    resource.availability !== "coming-soon" ||
    (resource.systemSlugs && !resource.systemSlugs.includes(systemSlug))
  ) {
    return NextResponse.json(
      { error: "Cette ressource n’est pas en liste d’attente." },
      { status: 404 },
    );
  }

  const limitedByEmail = await enforceRateLimit(
    request,
    {
      keyPrefix: "guide-waitlist-email",
      limit: 4,
      windowMs: 60 * 60 * 1000,
    },
    buildEmailRateLimitKey(email),
  );
  if (limitedByEmail) return limitedByEmail;

  const enterprise = await getEnterpriseBySlug(systemSlug);
  if (!enterprise) {
    return NextResponse.json(
      { error: "Le métier sélectionné est introuvable." },
      { status: 404 },
    );
  }

  const systemName = enterpriseToSystem(enterprise).name;
  const context = await resolveLeadContext({
    systemSlug,
    source: `Liste d’attente - ${resource.title}`,
    sourceUrl: request.headers.get("referer"),
  });

  if (!context) {
    return NextResponse.json(
      { error: "Le contexte du système est introuvable." },
      { status: 400 },
    );
  }

  const clientIdempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
  const idempotencyKey = clientIdempotencyKey
    ? buildScopedIdempotencyKey(resourceSlug, clientIdempotencyKey, email)
    : buildFallbackIdempotencyKey(resourceSlug, email);
  const consentCapturedAt = new Date().toISOString();

  await submitLeadRequest({
    attribution: resolveLeadAttribution(request, body?.attribution),
    channels: {
      email: false,
      resend: marketingConsent,
      slack: true,
    },
    contact: { email, firstName: null },
    context,
    emoji: "🔔",
    fields: [{ label: "Guide", value: resource.title }],
    idempotencyKey,
    marketingConsent: {
      capturedAt: consentCapturedAt,
      granted: marketingConsent,
      text: MARKETING_CONSENT_TEXT,
      version: MARKETING_CONSENT_VERSION,
    },
    requestType: "guide_waitlist",
    title: `Liste d’attente - ${resource.title} - ${systemName}`,
  });

  return successResponse();
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    logOperationalError("guide_waitlist.route.failed", error, {
      requestType: "guide_waitlist",
    });
    return NextResponse.json(
      { error: "Impossible d’enregistrer votre inscription pour le moment." },
      { status: 500 },
    );
  }
}

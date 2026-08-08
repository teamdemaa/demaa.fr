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

export const runtime = "nodejs";

type SubmitRequestBody = {
  attribution?: unknown;
  company?: unknown;
  description?: unknown;
  email?: unknown;
  fullName?: unknown;
  idempotencyKey?: unknown;
  title?: unknown;
  website?: unknown;
};

function buildEmailRateLimitKey(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

function buildFallbackIdempotencyKey(title: string, email: string) {
  const day = new Date().toISOString().slice(0, 10);
  const digest = createHash("sha256")
    .update(`${title}:${email}:${day}`)
    .digest("hex");

  return `b2b-opportunity-submission:${digest}`;
}

function buildScopedIdempotencyKey(
  title: string,
  clientKey: string,
  email: string,
) {
  const digest = createHash("sha256")
    .update(`${title}:${clientKey}:${email}`)
    .digest("hex");

  return `b2b-opportunity-submission:${digest}`;
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
    keyPrefix: "b2b-opportunity-submit-ip",
    limit: 6,
    windowMs: 10 * 60 * 1000,
  });
  if (limitedByIp) return limitedByIp;

  const { data: body, response } = await readJsonBody<SubmitRequestBody>(
    request,
    8 * 1024,
  );
  if (response) return response;

  const honeypot = normalizeText(body?.website, 200);
  if (honeypot) {
    return successResponse();
  }

  const fullName = normalizeText(body?.fullName, 140);
  const email = normalizeEmail(normalizeText(body?.email, 160));
  const company = normalizeText(body?.company, 160);
  const title = normalizeText(body?.title, 160);
  const description = normalizeText(body?.description, 2000);

  if (!fullName || !email || !title || description.length < 20) {
    return NextResponse.json(
      { error: "Merci de compléter le titre, la description et vos coordonnées." },
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
      keyPrefix: "b2b-opportunity-submit-email",
      limit: 3,
      windowMs: 60 * 60 * 1000,
    },
    buildEmailRateLimitKey(email),
  );
  if (limitedByEmail) return limitedByEmail;

  const context = await resolveLeadContext({
    source: "Opportunités B2B - Proposition",
    sourceUrl: request.headers.get("referer"),
  });

  if (!context) {
    return NextResponse.json(
      { error: "Impossible d’envoyer votre proposition pour le moment." },
      { status: 400 },
    );
  }

  const clientIdempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
  const idempotencyKey = clientIdempotencyKey
    ? buildScopedIdempotencyKey(title, clientIdempotencyKey, email)
    : buildFallbackIdempotencyKey(title, email);

  await submitLeadRequest({
    attribution: resolveLeadAttribution(request, body?.attribution),
    channels: {
      email: false,
      resend: false,
      slack: true,
    },
    contact: { company: company || null, email, name: fullName },
    context,
    emoji: "📣",
    fields: [
      { label: "Titre de l’opportunité", value: title },
      { label: "Description", value: description },
    ],
    idempotencyKey,
    requestType: "b2b_opportunity_submission",
    title: `Nouvelle opportunité B2B proposée - ${title}`,
  });

  return successResponse();
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    logOperationalError("b2b_opportunity_submission.route.failed", error, {
      requestType: "b2b_opportunity_submission",
    });
    return NextResponse.json(
      { error: "Impossible d’envoyer votre proposition pour le moment." },
      { status: 500 },
    );
  }
}

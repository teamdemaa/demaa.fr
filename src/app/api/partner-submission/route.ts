import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import {
  isPartnerSolutionType,
  MAX_PARTNER_SELECTED_SYSTEMS,
  PARTNER_SUBMISSION_CONSENT_TEXT,
  PARTNER_SUBMISSION_CONSENT_VERSION,
  PARTNER_SOLUTION_TYPE_LABELS,
  type PartnerSubmissionRequest,
} from "@/lib/partner-submission-contract";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

type PartnerSubmissionBody = Partial<
  Record<keyof PartnerSubmissionRequest, unknown>
>;

function normalizeWebsite(value: unknown) {
  const rawValue = normalizeText(value, 500);
  if (!rawValue) return null;

  try {
    const url = new URL(
      /^[a-z][a-z0-9+.-]*:/i.test(rawValue)
        ? rawValue
        : `https://${rawValue}`,
    );
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
      return null;
    }
    return url.toString().slice(0, 500);
  } catch {
    return null;
  }
}

function normalizeSystemSlugs(value: unknown) {
  if (
    !Array.isArray(value)
    || value.length > MAX_PARTNER_SELECTED_SYSTEMS
  ) return null;

  const slugs = [
    ...new Set(
      value
        .map((entry) => normalizeText(entry, 120))
        .filter((entry) => /^[a-z0-9-]{2,120}$/.test(entry)),
    ),
  ];

  return slugs.length === value.length ? slugs : null;
}

function buildEmailRateLimitKey(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

function buildFallbackIdempotencyKey(email: string, solutionName: string) {
  const day = new Date().toISOString().slice(0, 10);
  const digest = createHash("sha256")
    .update(`${email}:${solutionName}:${day}`)
    .digest("hex");
  return `partner-submission:${digest}`;
}

function successResponse() {
  const response = NextResponse.json({ ok: true }, { status: 202 });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

async function handlePost(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limitedByIp = await enforceRateLimit(request, {
    keyPrefix: "partner-submission-ip",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (limitedByIp) return limitedByIp;

  const { data: body, response } = await readJsonBody<PartnerSubmissionBody>(
    request,
    20 * 1024,
  );
  if (response) return response;

  const honeypot = normalizeText(body?.fax, 200);
  if (honeypot) return successResponse();

  const company = normalizeText(body?.company, 160);
  const description = normalizeText(body?.description, 2000, {
    multiline: true,
  });
  const email = normalizeEmail(normalizeText(body?.email, 160));
  const fullName = normalizeText(body?.fullName, 140);
  const selectedSystemSlugs = normalizeSystemSlugs(body?.selectedSystemSlugs);
  const solutionName = normalizeText(body?.solutionName, 160);
  const solutionType = normalizeText(body?.solutionType, 80);
  const website = normalizeWebsite(body?.website);

  if (
    !company
    || description.length < 20
    || !email
    || !fullName
    || !selectedSystemSlugs?.length
    || !solutionName
    || !isPartnerSolutionType(solutionType)
    || !website
    || body?.consent !== true
  ) {
    return NextResponse.json(
      { error: "Merci de compléter tous les champs et d’accepter la transmission de votre proposition." },
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
      keyPrefix: "partner-submission-email",
      limit: 3,
      windowMs: 60 * 60 * 1000,
    },
    buildEmailRateLimitKey(email),
  );
  if (limitedByEmail) return limitedByEmail;

  const selectedSystems = await Promise.all(
    selectedSystemSlugs.map((slug) => getEnterpriseBySlug(slug)),
  );
  if (selectedSystems.some((system) => !system)) {
    return NextResponse.json(
      { error: "Un métier sélectionné est introuvable." },
      { status: 400 },
    );
  }

  const context = await resolveLeadContext({
    source: "Page partenaires - Proposition de solution",
    sourceUrl: request.headers.get("referer"),
  });
  if (!context) {
    return NextResponse.json(
      { error: "Le contexte de la proposition est invalide." },
      { status: 400 },
    );
  }

  const clientIdempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
  const idempotencyKey = clientIdempotencyKey
    ?? buildFallbackIdempotencyKey(email, solutionName);
  const consentCapturedAt = new Date().toISOString();
  const selectedSystemNames = selectedSystems
    .map((system) => system?.name)
    .filter((name): name is string => Boolean(name));

  const lead = await submitLeadRequest({
    attribution: resolveLeadAttribution(request, body?.attribution),
    channels: { email: true, resend: false, slack: true },
    contact: { company, email, name: fullName },
    context,
    emoji: "🤝",
    fields: [
      { label: "Solution", value: solutionName },
      { label: "Site web", value: website },
      {
        label: "Type de solution",
        value: PARTNER_SOLUTION_TYPE_LABELS[solutionType],
      },
      { label: "Description", value: description },
      { label: "Métiers concernés", value: selectedSystemNames.join(", ") },
      { label: "Consentement", value: `Accepté le ${consentCapturedAt}` },
      { label: "Version du consentement", value: PARTNER_SUBMISSION_CONSENT_VERSION },
      { label: "Texte du consentement", value: PARTNER_SUBMISSION_CONSENT_TEXT },
    ],
    idempotencyKey,
    requestType: "partner_solution_submission",
    title: `Nouvelle proposition de solution · ${solutionName}`,
  });

  logOperationalEvent("partner_submission.scheduled", {
    leadId: lead.leadId,
    selectedSystemCount: selectedSystemSlugs.length,
  });

  return successResponse();
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    logOperationalError("partner_submission.route.failed", error, {
      requestType: "partner_solution_submission",
    });
    return NextResponse.json(
      { error: "Impossible d’envoyer votre proposition pour le moment. Merci de réessayer." },
      { status: 500 },
    );
  }
}

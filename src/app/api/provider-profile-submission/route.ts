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
import {
  getExpertiseById,
  getOpportunityById,
} from "@/lib/provider-network.server";
import { isPublicOpenOpportunity } from "@/lib/opportunity-contract";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

const PROVIDER_CONSENT_VERSION = "provider-network-v1";
const PROVIDER_CONSENT_TEXT =
  "J’accepte que Demaa conserve ces informations afin de me contacter lorsqu’un besoin correspond à mon profil.";

type ProviderProfileSubmissionBody = {
  attribution?: unknown;
  company?: unknown;
  consent?: unknown;
  countries?: unknown;
  email?: unknown;
  expertiseIds?: unknown;
  fullName?: unknown;
  idempotencyKey?: unknown;
  message?: unknown;
  opportunityId?: unknown;
  profileUrl?: unknown;
  website?: unknown;
};

function successResponse() {
  const response = NextResponse.json({ ok: true }, { status: 202 });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

function normalizeExpertiseIds(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 3) return null;
  const ids = [...new Set(value.map((entry) => normalizeText(entry, 100)))];
  if (
    ids.length !== value.length
    || ids.some((entry) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry))
  ) return null;
  return ids;
}

function normalizeOptionalUrl(value: unknown) {
  const raw = normalizeText(value, 500);
  if (!raw) return null;
  try {
    const url = new URL(
      /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`,
    );
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) return null;
    return url.toString().slice(0, 500);
  } catch {
    return null;
  }
}

function buildIdempotencyKey(input: {
  clientKey: string | null;
  email: string;
  opportunityId: string | null;
}) {
  const scope = input.opportunityId ?? "general";
  const clientKey = input.clientKey ?? new Date().toISOString().slice(0, 10);
  const digest = createHash("sha256")
    .update(`${scope}:${input.email}:${clientKey}`)
    .digest("hex");
  return `provider-profile:${digest}`;
}

async function handlePost(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limitedByIp = await enforceRateLimit(request, {
    keyPrefix: "provider-profile-ip",
    limit: 6,
    windowMs: 15 * 60 * 1000,
  });
  if (limitedByIp) return limitedByIp;

  const { data: body, response } = await readJsonBody<ProviderProfileSubmissionBody>(
    request,
    16 * 1024,
  );
  if (response) return response;

  if (normalizeText(body?.website, 200)) return successResponse();

  const fullName = normalizeText(body?.fullName, 140);
  const email = normalizeEmail(normalizeText(body?.email, 160));
  const company = normalizeText(body?.company, 160);
  const countries = normalizeText(body?.countries, 300);
  const message = normalizeText(body?.message, 1600, { multiline: true });
  const profileUrlRaw = normalizeText(body?.profileUrl, 500);
  const profileUrl = normalizeOptionalUrl(profileUrlRaw);
  const expertiseIds = normalizeExpertiseIds(body?.expertiseIds);
  const opportunityId = normalizeText(body?.opportunityId, 120) || null;

  if (
    !fullName
    || !email
    || !company
    || !countries
    || message.length < 20
    || !expertiseIds
    || body?.consent !== true
  ) {
    return NextResponse.json(
      { error: "Merci de compléter vos coordonnées, vos expertises et votre présentation." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Merci de renseigner une adresse e-mail valide." },
      { status: 400 },
    );
  }
  if (profileUrlRaw && !profileUrl) {
    return NextResponse.json(
      { error: "Merci d’indiquer un lien professionnel valide." },
      { status: 400 },
    );
  }

  const expertises = await Promise.all(expertiseIds.map(getExpertiseById));
  if (expertises.some((expertise) => !expertise || expertise.visibility !== "public")) {
    return NextResponse.json(
      { error: "Une expertise sélectionnée est introuvable." },
      { status: 400 },
    );
  }

  const opportunity = opportunityId
    ? await getOpportunityById(opportunityId)
    : null;
  if (
    opportunityId
    && (
      !opportunity
      || !isPublicOpenOpportunity(opportunity)
      || !expertiseIds.includes(opportunity.expertiseId)
    )
  ) {
    return NextResponse.json(
      { error: "Cette opportunité n’est plus disponible." },
      { status: 404 },
    );
  }

  const limitedByEmail = await enforceRateLimit(
    request,
    {
      keyPrefix: "provider-profile-email",
      limit: 4,
      windowMs: 60 * 60 * 1000,
    },
    createHash("sha256").update(email).digest("hex"),
  );
  if (limitedByEmail) return limitedByEmail;

  const context = await resolveLeadContext({
    source: opportunity
      ? `Opportunité - ${opportunity.title}`
      : "Rejoindre Team Demaa - Profil",
    sourceUrl: request.headers.get("referer"),
  });
  if (!context) {
    return NextResponse.json(
      { error: "Impossible d’enregistrer votre profil pour le moment." },
      { status: 400 },
    );
  }

  const expertiseLabels = expertises
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .map((entry) => entry.label);
  const consentCapturedAt = new Date().toISOString();

  await submitLeadRequest({
    attribution: resolveLeadAttribution(request, body?.attribution),
    channels: { email: false, resend: false, slack: true },
    contact: { company, email, name: fullName },
    context,
    emoji: opportunity ? "🎯" : "🤝",
    fields: [
      { label: "Expertises", value: expertiseLabels.join(", ") },
      { label: "Pays couverts", value: countries },
      { label: "Présentation", value: message },
      ...(profileUrl ? [{ label: "Profil ou site", value: profileUrl }] : []),
      ...(opportunity ? [{ label: "Opportunité", value: opportunity.title }] : []),
      { label: "Consentement", value: `Accepté le ${consentCapturedAt}` },
      { label: "Version du consentement", value: PROVIDER_CONSENT_VERSION },
      { label: "Texte du consentement", value: PROVIDER_CONSENT_TEXT },
    ],
    idempotencyKey: buildIdempotencyKey({
      clientKey: normalizeIdempotencyKey(body?.idempotencyKey),
      email,
      opportunityId,
    }),
    requestType: opportunity
      ? "opportunity_application"
      : "provider_profile_submission",
    title: opportunity
      ? `Candidature opportunité - ${opportunity.title}`
      : `Nouveau profil - ${expertiseLabels.join(", ")}`,
  });

  return successResponse();
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    logOperationalError("provider_profile_submission.route.failed", error, {
      requestType: "provider_profile_submission",
    });
    return NextResponse.json(
      { error: "Impossible d’enregistrer votre profil pour le moment." },
      { status: 500 },
    );
  }
}

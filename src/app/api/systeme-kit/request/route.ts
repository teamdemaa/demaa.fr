import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import {
  getActiveOperationalSystemDeliverySnapshot,
  hasEditableOperationalSystemAsset,
} from "@/lib/editable-operational-system-assets.server";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { LEVIER_ASSET_SNAPSHOT } from "@/lib/levier-asset.server";
import { submitLeadRequest } from "@/lib/lead-notifications";
import {
  getLeadDeliveryState,
  updateLeadDeliveryStatus,
} from "@/lib/lead-storage";
import { logOperationalError } from "@/lib/operational-log";
import type { OperationalSystemDeliveryRequest } from "@/lib/operational-system-delivery-contract";
import { sendOperationalSystemDeliveryEmail } from "@/lib/operational-system-delivery-email.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getPublishedSolutionPlacementsForSystem } from "@/lib/solution-registry.server";

export const runtime = "nodejs";

const MARKETING_CONSENT_TEXT =
  "J’accepte de recevoir les conseils et actualités Demaa par e-mail.";
const MARKETING_CONSENT_VERSION = "system-delivery-v1";

type SystemKitRequestBody = Partial<
  Record<keyof OperationalSystemDeliveryRequest, unknown>
> & {
  sectorSlug?: unknown;
};

function isValidSectorSlug(value: string) {
  return /^[a-z0-9-]{2,120}$/.test(value);
}

function buildFallbackIdempotencyKey(
  assetRevision: string,
  email: string,
  systemSlug: string,
) {
  const day = new Date().toISOString().slice(0, 10);
  const digest = createHash("sha256")
    .update(`${assetRevision}:${email}:${systemSlug}:${day}`)
    .digest("hex");

  return `system-delivery:${digest}`;
}

function buildScopedIdempotencyKey(
  assetRevision: string,
  clientKey: string,
  email: string,
  systemSlug: string,
) {
  const digest = createHash("sha256")
    .update(`${assetRevision}:${clientKey}:${email}:${systemSlug}`)
    .digest("hex");

  return `system-delivery:${digest}`;
}

function buildEmailRateLimitKey(email: string) {
  return createHash("sha256").update(email).digest("hex");
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
    keyPrefix: "system-delivery-ip",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (limitedByIp) return limitedByIp;

  const { data: body, response } = await readJsonBody<SystemKitRequestBody>(
    request,
    8 * 1024,
  );
  if (response) return response;

  const honeypot = normalizeText(body?.website, 200);
  if (honeypot) {
    return successResponse();
  }

  const firstName = normalizeText(body?.firstName, 80);
  const systemSlug = normalizeText(
    body?.systemSlug ?? body?.sectorSlug,
    120,
  );
  const email = normalizeEmail(normalizeText(body?.email, 160));
  const marketingConsent = body?.marketingConsent === true;

  if (!firstName || !systemSlug || !email) {
    return NextResponse.json(
      { error: "Merci de renseigner votre prénom et votre e-mail." },
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

  const limitedByEmail = await enforceRateLimit(
    request,
    {
      keyPrefix: "system-delivery-email",
      limit: 4,
      windowMs: 60 * 60 * 1000,
    },
    buildEmailRateLimitKey(email),
  );
  if (limitedByEmail) return limitedByEmail;

  const hasPublishedLevier = getPublishedSolutionPlacementsForSystem(systemSlug)
    .some(({ resource }) =>
      resource.resourceSlug === "levier" &&
      resource.interaction.interactionMode === "system_delivery"
    );
  if (!hasPublishedLevier && !hasEditableOperationalSystemAsset(systemSlug)) {
    return NextResponse.json(
      { error: "Le système opérationnel demandé est introuvable." },
      { status: 404 },
    );
  }
  const requestedAssetSnapshot = hasPublishedLevier
    ? LEVIER_ASSET_SNAPSHOT
    : getActiveOperationalSystemDeliverySnapshot(systemSlug);
  if (!requestedAssetSnapshot) {
    return NextResponse.json(
      { error: "Le système opérationnel demandé est indisponible." },
      { status: 503 },
    );
  }

  const enterprise = await getEnterpriseBySlug(systemSlug);
  if (!enterprise) {
    return NextResponse.json(
      { error: "Le métier sélectionné est introuvable." },
      { status: 404 },
    );
  }

  const systemName = enterpriseToSystem(enterprise).name;
  if (!systemName) {
    return NextResponse.json(
      { error: "Le nom du système opérationnel est introuvable." },
      { status: 404 },
    );
  }
  const context = await resolveLeadContext({
    systemSlug,
    source: hasPublishedLevier
      ? "Livraison de Levier"
      : "Livraison du système opérationnel gratuit",
    sourceUrl: request.headers.get("referer"),
  });

  if (!context) {
    return NextResponse.json(
      { error: "Le contexte du système est introuvable." },
      { status: 400 },
    );
  }

  const clientIdempotencyKey = normalizeIdempotencyKey(
    body?.idempotencyKey,
  );
  const idempotencyKey = clientIdempotencyKey
    ? buildScopedIdempotencyKey(
        requestedAssetSnapshot.assetRevision,
        clientIdempotencyKey,
        email,
        systemSlug,
      )
    : buildFallbackIdempotencyKey(
        requestedAssetSnapshot.assetRevision,
        email,
        systemSlug,
      );
  const consentCapturedAt = new Date().toISOString();
  const lead = await submitLeadRequest({
    assetSnapshot: {
      assetRevision: requestedAssetSnapshot.assetRevision,
      workbookVersion: requestedAssetSnapshot.workbookVersion,
    },
    attribution: resolveLeadAttribution(request, body?.attribution),
    channels: {
      email: false,
      resend: marketingConsent,
      slack: true,
    },
    contact: { email, firstName },
    context,
    emoji: "📦",
    idempotencyKey,
    marketingConsent: {
      capturedAt: consentCapturedAt,
      granted: marketingConsent,
      text: MARKETING_CONSENT_TEXT,
      version: MARKETING_CONSENT_VERSION,
    },
    requestType: "system_kit_request",
    title: hasPublishedLevier
      ? `Livraison de Levier - ${systemName}`
      : `Livraison du système opérationnel gratuit - ${systemName}`,
  });

  const deliveryState = await getLeadDeliveryState(lead.leadId, "kit_email");
  if (deliveryState === "sent") {
    return successResponse();
  }

  if (!lead.assetSnapshot?.assetRevision) {
    return NextResponse.json(
      { error: "La version du système demandé est indisponible." },
      { status: 503 },
    );
  }

  const delivery = await sendOperationalSystemDeliveryEmail({
    assetRevision: lead.assetSnapshot.assetRevision,
    deliveryId: `lead-${lead.leadId}-system`,
    email,
    firstName,
    systemName,
    systemSlug,
  });

  if (!delivery.sent) {
    await updateLeadDeliveryStatus({
      channel: "kit_email",
      error: delivery.reason,
      leadId: lead.leadId,
      status: "failed",
    });

    return NextResponse.json(
      {
        error:
          hasPublishedLevier
            ? "Impossible d’envoyer Levier pour le moment. Merci de réessayer dans quelques instants."
            : "Impossible d’envoyer le système pour le moment. Merci de réessayer dans quelques instants.",
      },
      { status: 502 },
    );
  }

  await updateLeadDeliveryStatus({
    channel: "kit_email",
    leadId: lead.leadId,
    status: "sent",
  });

  return successResponse();
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    logOperationalError("system_delivery.route.failed", error, {
      requestType: "system_kit_request",
    });
    return NextResponse.json(
      { error: "Impossible d’envoyer le système pour le moment." },
      { status: 500 },
    );
  }
}

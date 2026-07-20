import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { getPilotingSheetCopyUrl } from "@/lib/document-models";
import { enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import {
  scheduleSystemKitSequence,
} from "@/lib/generations-db";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import {
  getLeadDeliveryState,
  updateLeadDeliveryStatus,
} from "@/lib/lead-storage";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import {
  getSystemKitEmailErrorMessage,
  sendSystemKitEmail,
} from "@/lib/system-kit-email";
import { logOperationalError } from "@/lib/operational-log";

export const runtime = "nodejs";

type SystemKitRequestBody = {
  attribution?: unknown;
  email?: unknown;
  firstName?: unknown;
  idempotencyKey?: unknown;
  sectorName?: unknown;
  sectorSlug?: unknown;
  website?: unknown;
};

function isValidSectorSlug(value: string) {
  return /^[a-z0-9-]{2,120}$/.test(value);
}

async function handlePost(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "systeme-kit-request",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data: body, response } = await readJsonBody<SystemKitRequestBody>(request, 8 * 1024);
  if (response) return response;

  const firstName = normalizeText(body?.firstName, 80);
  const sectorSlug = normalizeText(body?.sectorSlug, 120);
  const requestedSectorName = normalizeText(body?.sectorName, 160);
  const email = normalizeEmail(normalizeText(body?.email, 160));
  const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
  const honeypot = normalizeText(body?.website, 200);

  if (honeypot) {
    return NextResponse.json({
      ok: true,
      copyUrl: getPilotingSheetCopyUrl(sectorSlug) || new URL(request.url).origin,
    });
  }

  if (!firstName || !sectorSlug || !email) {
    return NextResponse.json(
      { error: "Merci de renseigner votre prénom et votre email." },
      { status: 400 }
    );
  }

  if (!isValidSectorSlug(sectorSlug)) {
    return NextResponse.json(
      { error: "Le métier sélectionné est invalide." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Merci de renseigner une adresse email valide." },
      { status: 400 }
    );
  }

  const enterprise = await getEnterpriseBySlug(sectorSlug);

  if (!enterprise) {
    return NextResponse.json(
      { error: "Le métier sélectionné est introuvable." },
      { status: 404 }
    );
  }

  const resolvedSystemName = enterpriseToSystem(enterprise).name || requestedSectorName || sectorSlug;
  const copyUrl = getPilotingSheetCopyUrl(sectorSlug);

  if (!copyUrl) {
    return NextResponse.json(
      { error: "Le Google Sheet de ce métier est introuvable." },
      { status: 404 },
    );
  }

  const context = await resolveLeadContext({
    systemSlug: sectorSlug,
    source: "Réception du kit opérationnel",
    sourceUrl: request.headers.get("referer"),
  });

  if (!context) {
    return NextResponse.json({ error: "Le contexte du kit est introuvable." }, { status: 400 });
  }

  const lead = await submitLeadRequest({
    attribution: resolveLeadAttribution(request, body?.attribution),
    channels: { email: false, resend: true, slack: true },
    contact: { email, firstName },
    context,
    emoji: "📦",
    idempotencyKey,
    requestType: "system_kit_request",
    title: `Réception du kit opérationnel — ${resolvedSystemName}`,
  });

  const existingKitEmailState = await getLeadDeliveryState(lead.leadId, "kit_email");
  const emailResult = existingKitEmailState === "sent"
    ? { sent: true as const, reason: null }
    : await sendSystemKitEmail({
        email,
        firstName,
        systemSlug: sectorSlug,
        systemName: resolvedSystemName,
        idempotencyKey: `lead-${lead.leadId}-kit`,
        request,
      });

  if (!emailResult.sent) {
    await updateLeadDeliveryStatus({
      channel: "kit_email",
      error: emailResult.reason,
      leadId: lead.leadId,
      status: "failed",
    });
    return NextResponse.json(
      { error: getSystemKitEmailErrorMessage(emailResult.reason) },
      { status: 502 }
    );
  }

  if (existingKitEmailState !== "sent") {
    await updateLeadDeliveryStatus({
      channel: "kit_email",
      leadId: lead.leadId,
      status: "sent",
    });
  }

  await scheduleSystemKitSequence({
    email,
    firstName,
    leadId: lead.leadId,
    systemName: resolvedSystemName,
    systemSlug: sectorSlug,
  });

  return NextResponse.json({ ok: true, leadId: lead.leadId, copyUrl });
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    logOperationalError("lead.route.failed", error, {
      requestType: "system_kit_request",
    });
    return NextResponse.json(
      { error: "Impossible d’envoyer le kit pour le moment." },
      { status: 500 },
    );
  }
}

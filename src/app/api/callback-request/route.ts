import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

type CallbackRequestBody = {
  attribution?: unknown;
  context?: unknown;
  firstName?: unknown;
  idempotencyKey?: unknown;
  need?: unknown;
  phone?: unknown;
  preferredTime?: unknown;
  systemSlug?: unknown;
  website?: unknown;
};

const SOURCES = {
  process: "Système métier - Demande de rappel (Process)",
  solutions: "Système métier - Demande de rappel (Solutions)",
} as const;

const PREFERRED_TIMES = new Set(["Matin", "Midi", "Après-midi"]);

function normalizePhone(value: unknown) {
  const raw = normalizeText(value, 40).replace(/[\s().-]/g, "");
  const international = raw.startsWith("00") ? `+${raw.slice(2)}` : raw;
  const normalized = /^0\d{9}$/.test(international)
    ? `+33${international.slice(1)}`
    : international;

  if (!/^\+?[0-9]{8,15}$/.test(normalized)) return null;
  return normalized;
}

function phoneRateLimitKey(phone: string) {
  return createHash("sha256").update(phone).digest("hex");
}

function successResponse() {
  const response = NextResponse.json({ ok: true }, { status: 202 });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function POST(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request);
    if (blockedHost) return blockedHost;
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limitedByIp = await enforceRateLimit(request, {
      keyPrefix: "callback-request-ip",
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (limitedByIp) return limitedByIp;

    const { data: body, response } = await readJsonBody<CallbackRequestBody>(
      request,
      12 * 1024,
    );
    if (response) return response;

    if (normalizeText(body?.website, 200)) return successResponse();

    const context = normalizeText(body?.context, 20);
    const firstName = normalizeText(body?.firstName, 80);
    const need = normalizeText(body?.need, 1500, { multiline: true });
    const phone = normalizePhone(body?.phone);
    const preferredTime = normalizeText(body?.preferredTime, 20);
    const systemSlug = normalizeText(body?.systemSlug, 120);
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);

    if ((context !== "process" && context !== "solutions") || !systemSlug) {
      return NextResponse.json({ error: "Le contexte de la demande est invalide." }, { status: 400 });
    }
    if (!firstName || !phone || !need) {
      return NextResponse.json({ error: "Merci d’indiquer votre prénom, téléphone et besoin." }, { status: 400 });
    }
    if (preferredTime && !PREFERRED_TIMES.has(preferredTime)) {
      return NextResponse.json({ error: "Le moment de rappel choisi est invalide." }, { status: 400 });
    }

    const limitedByPhone = await enforceRateLimit(
      request,
      { keyPrefix: "callback-request-phone", limit: 3, windowMs: 60 * 60 * 1000 },
      phoneRateLimitKey(phone),
    );
    if (limitedByPhone) return limitedByPhone;

    const leadContext = await resolveLeadContext({
      source: SOURCES[context],
      sourceUrl: request.headers.get("referer"),
      systemSlug,
    });
    if (!leadContext) {
      return NextResponse.json({ error: "Le système d’origine est introuvable." }, { status: 400 });
    }

    await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: true, resend: false, slack: true },
      contact: { firstName, phone },
      context: leadContext,
      emoji: "📞",
      fields: [
        { label: "Contexte", value: context === "process" ? "Process" : "Solutions" },
        { label: "Besoin", value: need },
        { label: "Moment préféré", value: preferredTime || "Non précisé" },
        { label: "Consentement rappel", value: `Demande de rappel acceptée le ${new Date().toISOString()}` },
      ],
      idempotencyKey,
      requestType: "system_callback_request",
      title: "Demande de rappel",
    });

    return successResponse();
  } catch (error) {
    logOperationalError("callback_request.route.failed", error, {
      requestType: "system_callback_request",
    });
    return NextResponse.json(
      { error: "Impossible d’envoyer votre demande pour le moment. Merci de réessayer." },
      { status: 500 },
    );
  }
}

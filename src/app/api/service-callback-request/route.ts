import { NextResponse } from "next/server";
import {
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { getCanonicalServiceBySlug } from "@/lib/canonical-service-catalog";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { parseRecord } from "@/lib/registry-contract-utils";
import { enforceServiceRequestRateLimit } from "@/lib/service-request-security.server";

export const runtime = "nodejs";

type ServiceCallbackRequestBody = Readonly<{
  attribution?: unknown;
  company?: unknown;
  idempotencyKey?: unknown;
  phone?: unknown;
  serviceSlug?: unknown;
  source?: unknown;
  systemSlug?: unknown;
  website?: unknown;
}>;

function isValidPhone(phone: string) {
  if (!/^\+?[0-9\s().-]+$/.test(phone)) return false;
  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= 8 && digitCount <= 15;
}

function success() {
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

    const limitedByIp = await enforceServiceRequestRateLimit(request, {
      limit: 8,
      scope: "ip",
      windowMs: 10 * 60 * 1000,
    });
    if (limitedByIp) return limitedByIp;

    const { data, response: invalidBody } =
      await readJsonBody<ServiceCallbackRequestBody>(request, 8 * 1024);
    if (invalidBody) return invalidBody;

    let body: ServiceCallbackRequestBody;
    try {
      body = parseRecord(data, "serviceCallbackRequest", [
        "attribution",
        "company",
        "idempotencyKey",
        "phone",
        "serviceSlug",
        "source",
        "systemSlug",
        "website",
      ]) as ServiceCallbackRequestBody;
    } catch {
      return NextResponse.json(
        { error: "Les informations envoyées sont invalides." },
        { status: 400 },
      );
    }

    const honeypot = normalizeText(body?.website, 200);
    if (honeypot) return success();

    const company = normalizeText(body?.company, 160);
    const phone = normalizeText(body?.phone, 60);
    const serviceSlug = normalizeText(body?.serviceSlug, 120);
    const requestedSource = normalizeText(body?.source, 80);
    const systemSlug = normalizeText(body?.systemSlug, 120);
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const service = getCanonicalServiceBySlug(serviceSlug);

    if (!company || !isValidPhone(phone) || !idempotencyKey) {
      return NextResponse.json(
        { error: "Indiquez une entreprise et un numéro WhatsApp valides." },
        { status: 400 },
      );
    }

    if (!service || service.cta.kind !== "callback") {
      return NextResponse.json(
        { error: "Ce service ne propose pas de demande de contact." },
        { status: 404 },
      );
    }

    const limitedByPhone = await enforceServiceRequestRateLimit(request, {
      identity: phone,
      limit: 4,
      scope: "phone",
      windowMs: 60 * 60 * 1000,
    });
    if (limitedByPhone) return limitedByPhone;

    const context = await resolveLeadContext({
      systemSlug: systemSlug || null,
      source:
        requestedSource === "solutions-systeme" && systemSlug
          ? `Solutions - ${service.name}`
          : `Services - ${service.name}`,
      sourceUrl: request.headers.get("referer"),
    });
    if (!context) {
      return NextResponse.json(
        { error: "Le contexte de la demande est invalide." },
        { status: 400 },
      );
    }

    await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: false, resend: false, slack: true },
      contact: { company, phone },
      context,
      emoji: "💬",
      fields: [
        { label: "Service", value: service.name },
        { label: "Slug du service", value: service.slug },
        { label: "Numéro WhatsApp", value: phone },
        ...(context.systemName
          ? [{ label: "Système métier", value: context.systemName }]
          : []),
      ],
      idempotencyKey,
      requestType: "service_callback_request",
      title: `Demande de contact WhatsApp - ${service.name}`,
    });

    return success();
  } catch (error) {
    logOperationalError("service_callback_request.route.failed", error, {
      requestType: "service_callback_request",
    });
    return NextResponse.json(
      { error: "La demande n’a pas pu être enregistrée. Merci de réessayer." },
      { status: 500 },
    );
  }
}

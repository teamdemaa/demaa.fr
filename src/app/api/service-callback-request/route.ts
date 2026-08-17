import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import {
  getCanonicalServiceBySlug,
  getCanonicalServicePackage,
} from "@/lib/canonical-service-catalog";
import {
  isMonthlyAccompanimentDiscountEligible,
  resolveMonthlyAccompanimentDiscount,
} from "@/lib/monthly-accompaniment-benefit.server";
import { getCurrentCustomerIdentityFromSession } from "@/lib/customer-space-session.server";
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
  countryCode?: unknown;
  idempotencyKey?: unknown;
  localeCode?: unknown;
  marketCode?: unknown;
  packageSlug?: unknown;
  phone?: unknown;
  serviceSlug?: unknown;
  source?: unknown;
  sourcePage?: unknown;
  systemSlug?: unknown;
  website?: unknown;
}>;

function isValidPhone(phone: string) {
  if (!/^\+?[0-9\s().-]+$/.test(phone)) return false;
  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= 8 && digitCount <= 15;
}

function normalizeInternalSourcePage(value: unknown, requestOrigin: string) {
  const sourcePage = normalizeText(value, 240);
  if (!sourcePage || sourcePage.startsWith("//")) return null;
  try {
    const parsed = new URL(sourcePage, requestOrigin);
    if (parsed.origin !== requestOrigin) return null;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
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
        "countryCode",
        "idempotencyKey",
        "localeCode",
        "marketCode",
        "packageSlug",
        "phone",
        "serviceSlug",
        "source",
        "sourcePage",
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
    const localeCode = normalizeText(body?.localeCode, 20) || "fr";
    const marketCode = normalizeText(body?.marketCode, 40) || "fr-fr";
    const packageSlug = normalizeText(body?.packageSlug, 120);
    const phone = normalizeText(body?.phone, 60);
    const countryCode = normalizeText(body?.countryCode, 2).toUpperCase();
    const serviceSlug = normalizeText(body?.serviceSlug, 120);
    const requestedSource = normalizeText(body?.source, 80);
    const systemSlug = normalizeText(body?.systemSlug, 120);
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const service = getCanonicalServiceBySlug(serviceSlug);
    const requestOrigin = new URL(request.url).origin;
    const requestedSourcePage = normalizeText(body?.sourcePage, 240);
    const validatedSourcePage = normalizeInternalSourcePage(
      requestedSourcePage,
      requestOrigin,
    );
    const sourcePage = requestedSourcePage
      ? validatedSourcePage
      : normalizeInternalSourcePage(request.headers.get("referer"), requestOrigin);

    if (!((localeCode === "fr" && marketCode === "fr-fr") || (localeCode === "en" && marketCode === "global-en-beta"))) {
      return NextResponse.json({ error: "Le contexte international est invalide." }, { status: 400 });
    }

    if (!company || !isValidPhone(phone) || !idempotencyKey) {
      return NextResponse.json(
        {
          error: localeCode === "en"
            ? "Enter a company and a valid contact number."
            : "Indiquez une entreprise et un numéro WhatsApp valides.",
        },
        { status: 400 },
      );
    }

    if (!service || service.cta.kind !== "callback") {
      return NextResponse.json(
        { error: "Ce service ne propose pas de demande de contact." },
        { status: 404 },
      );
    }

    if (!sourcePage) {
      return NextResponse.json(
        { error: "Le contexte de la demande est invalide." },
        { status: 400 },
      );
    }

    const servicePackage = packageSlug
      ? getCanonicalServicePackage(service, packageSlug)
      : null;
    if (
      (service.packages.length > 0 && !servicePackage)
      || (service.packages.length === 0 && Boolean(packageSlug))
    ) {
      return NextResponse.json(
        { error: "Choisissez un forfait valide pour cette prestation." },
        { status: 400 },
      );
    }
    const scopedIdempotencyKey = createHash("sha256")
      .update(`${idempotencyKey}:${service.slug}:${servicePackage?.slug ?? "default"}`)
      .digest("hex");

    let monthlyBenefitDiscount: {
      apply: boolean;
      eligible: boolean;
      percent: number;
      source: "coach_business" | "expert_accountant" | null;
      validUntil: string | null;
    } = {
      apply: false,
      eligible: isMonthlyAccompanimentDiscountEligible(service),
      percent: 0,
      source: null,
      validUntil: null,
    };
    try {
      const customer = await getCurrentCustomerIdentityFromSession();
      monthlyBenefitDiscount = await resolveMonthlyAccompanimentDiscount({
        service,
        uid: customer?.uid,
      });
    } catch (error) {
      logOperationalError("service_callback_request.monthly_discount_verification_failed", error, {
        serviceSlug: service.slug,
      });
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
        ...(servicePackage
          ? [
              { label: "Forfait", value: servicePackage.name },
              { label: "Slug du forfait", value: servicePackage.slug },
              { label: "Prix de référence", value: servicePackage.pricing.label },
            ]
          : []),
        { label: localeCode === "en" ? "Contact number" : "Numéro WhatsApp", value: phone },
        { label: localeCode === "en" ? "Langue" : "Locale", value: localeCode },
        { label: "Marché", value: marketCode },
        ...(countryCode ? [{ label: "Pays", value: countryCode }] : []),
        { label: "Page source", value: sourcePage },
        ...(monthlyBenefitDiscount.eligible
          ? [{
              label: "Avantage accompagnement mensuel",
              value: monthlyBenefitDiscount.apply
                ? "−12 % confirmé côté serveur sur les honoraires Demaa"
                : "Prestation éligible, accompagnement mensuel actif non confirmé",
            }]
          : []),
        ...(context.systemName
          ? [{ label: "Système métier", value: context.systemName }]
          : []),
      ],
      idempotencyKey: scopedIdempotencyKey,
      requestType: "service_callback_request",
      title: localeCode === "en"
        ? `Service request - ${service.name}${servicePackage ? ` - ${servicePackage.name}` : ""}`
        : `Demande de contact WhatsApp - ${service.name}${servicePackage ? ` - ${servicePackage.name}` : ""}`,
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

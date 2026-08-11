import { NextResponse } from "next/server";
import {
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { enforceServiceRequestRateLimit } from "@/lib/service-request-security.server";
import { requireCurrentCustomerEmail } from "@/lib/customer-space-session.server";

export const runtime = "nodejs";

type CoachingRequestBody = {
  attribution?: unknown;
  company?: unknown;
  idempotencyKey?: unknown;
  message?: unknown;
  offer?: unknown;
  phone?: unknown;
  requestKind?: unknown;
  website?: unknown;
};

const OFFERS = new Set(["session", "parcours", "echange"]);

function isValidPhone(value: string) {
  return /^\+?[0-9\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 8;
}

export async function POST(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request);
    if (blockedHost) return blockedHost;
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limited = await enforceServiceRequestRateLimit(request, {
      limit: 8,
      scope: "ip",
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const customer = await requireCurrentCustomerEmail();
    if (customer.response) return customer.response;
    const email = customer.email;

    const { data, response } = await readJsonBody<CoachingRequestBody>(request, 12 * 1024);
    if (response) return response;

    const website = normalizeText(data?.website, 200);
    if (website) return NextResponse.json({ ok: true }, { status: 202 });

    const requestKind = normalizeText(data?.requestKind, 20);
    const company = normalizeText(data?.company, 160);
    const phone = normalizeText(data?.phone, 60);
    const message = normalizeText(data?.message, 2_000);
    const offer = normalizeText(data?.offer, 30);
    const idempotencyKey = normalizeIdempotencyKey(data?.idempotencyKey);

    const isMessage = requestKind === "message";
    const valid = isMessage
      ? message.length >= 10
      : Boolean(company && isValidPhone(phone) && OFFERS.has(offer));

    if (!valid || !idempotencyKey) {
      return NextResponse.json(
        { error: "Les informations envoyées sont incomplètes." },
        { status: 400 },
      );
    }

    const context = await resolveLeadContext({
      source: isMessage ? "Coaching - Messages" : "Coaching - Sessions",
      sourceUrl: request.headers.get("referer"),
    });
    if (!context) {
      return NextResponse.json({ error: "Contexte invalide." }, { status: 400 });
    }

    await submitLeadRequest({
      attribution: resolveLeadAttribution(request, data?.attribution),
      channels: { email: false, resend: false, slack: true },
      contact: {
        company: company || undefined,
        email: email || undefined,
        phone: phone || undefined,
      },
      context,
      emoji: isMessage ? "💬" : "📞",
      fields: isMessage
        ? [{ label: "Message", value: message }]
        : [
            { label: "Formule", value: offer },
            ...(message ? [{ label: "Situation", value: message }] : []),
          ],
      idempotencyKey,
      requestType: isMessage ? "coaching_message" : "coaching_session_request",
      title: isMessage ? "Nouveau message Coaching" : "Nouvelle demande Coaching",
    });

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    logOperationalError("coaching_request.failed", error);
    return NextResponse.json(
      { error: "La demande n’a pas pu être envoyée." },
      { status: 500 },
    );
  }
}

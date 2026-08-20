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
import { requireCurrentCustomerIdentity } from "@/lib/customer-space-session.server";
import {
  appendCustomerCoachingMessage,
  getCustomerCoachingState,
} from "@/lib/coaching-conversation.server";
import {
  claimPendingCoachingMessageDraft,
  markCoachingMessageDraftSent,
  type ClaimedCoachingMessageDraft,
} from "@/lib/coaching-message-draft.server";
import {
  isSpecialistOffer,
  SPECIALIST_OFFERS,
} from "@/lib/specialist-offers";
import {
  getConfiguredVisitorCommercialContext,
  resolveAuthenticatedInternationalContext,
} from "@/lib/international-context.server";
import { normalizeInterfaceLocaleCode } from "@/lib/international-context";

export const runtime = "nodejs";

type CoachingRequestBody = {
  attribution?: unknown;
  company?: unknown;
  draftToken?: unknown;
  idempotencyKey?: unknown;
  message?: unknown;
  localeCode?: unknown;
  offer?: unknown;
  phone?: unknown;
  requestKind?: unknown;
  website?: unknown;
};

function isValidPhone(value: string) {
  return /^\+?[0-9\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 8;
}

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  Vary: "Cookie",
} as const;

export async function GET(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request);
    if (blockedHost) return blockedHost;

    const customer = await requireCurrentCustomerIdentity();
    if (customer.response) return customer.response;

    const state = await getCustomerCoachingState(customer.identity.uid);
    return NextResponse.json(
      state,
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  } catch (error) {
    logOperationalError("coaching_conversation.read_failed", error);
    return NextResponse.json(
      { error: "La conversation n’a pas pu être chargée." },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}

export async function POST(request: Request) {
  let claimedDraft: ClaimedCoachingMessageDraft | null = null;

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

    const { data, response } = await readJsonBody<CoachingRequestBody>(request, 12 * 1024);
    if (response) return response;

    const website = normalizeText(data?.website, 200);
    if (website) return NextResponse.json({ ok: true }, { status: 202 });

    const requestKind = normalizeText(data?.requestKind, 20);
    const company = normalizeText(data?.company, 160);
    const phone = normalizeText(data?.phone, 60);
    const message = normalizeText(data?.message, 2_000, { multiline: true });
    const draftToken = normalizeText(data?.draftToken, 80);
    const offer = normalizeText(data?.offer, 30);
    const idempotencyKey = normalizeIdempotencyKey(data?.idempotencyKey);
    const localeCode = data?.localeCode === undefined
      ? "fr"
      : normalizeInterfaceLocaleCode(data.localeCode);
    if (!localeCode) {
      return NextResponse.json(
        { error: "Contexte international invalide." },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const isMessage = requestKind === "message";
    const isAccompaniment = requestKind === "accompaniment";
    const customer = isMessage
      ? await requireCurrentCustomerIdentity()
      : { identity: null, response: null };
    if (customer.response) return customer.response;
    const email = customer.identity?.email ?? "";
    const uid = customer.identity?.uid ?? "";
    const commercialContext = customer.identity
      ? (await resolveAuthenticatedInternationalContext({
          identity: customer.identity,
          localeCode,
        })).internationalContext
      : getConfiguredVisitorCommercialContext(localeCode);
    const marketCode = commercialContext.marketCode;
    const countryCode = commercialContext.countryCode;
    const source = localeCode === "en" ? "english-talk-to-us" : "echange";
    if (isMessage && draftToken) {
      claimedDraft = await claimPendingCoachingMessageDraft({
        draftToken,
        uid,
      });
      if (!claimedDraft) {
        return NextResponse.json(
          { error: "Ce brouillon n’est plus disponible. Réessayez depuis votre message." },
          { status: 409, headers: PRIVATE_NO_STORE_HEADERS },
        );
      }
    }
    const effectiveMessage = claimedDraft?.body ?? message;
    const effectiveIdempotencyKey = claimedDraft?.idempotencyKey ?? idempotencyKey;
    const valid = isMessage
      ? effectiveMessage.length >= 2
      : Boolean(isAccompaniment && company && isValidPhone(phone) && isSpecialistOffer(offer));

    if (!valid || !effectiveIdempotencyKey) {
      return NextResponse.json(
        {
          error: "Les informations envoyées sont incomplètes.",
          ...(claimedDraft ? { draftMessage: claimedDraft.body } : {}),
        },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const context = await resolveLeadContext({
      source: isMessage ? "Spécialiste - Messages" : "Coach business - Accompagnement",
      sourceUrl: request.headers.get("referer"),
    });
    if (!context) {
      return NextResponse.json(
        {
          error: "Contexte invalide.",
          ...(claimedDraft ? { draftMessage: claimedDraft.body } : {}),
        },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const conversationMessage = isMessage
      ? await appendCustomerCoachingMessage({
          body: effectiveMessage,
          email,
          idempotencyKey: effectiveIdempotencyKey,
          localeCode,
          marketCode,
          countryCode,
          source,
          uid,
        })
      : null;

    if (conversationMessage?.allowed === false) {
      return NextResponse.json(
        {
          code: "free_clarification_completed",
          draftMessage: effectiveMessage,
          error: "Votre première clarification est terminée.",
        },
        { status: 409, headers: PRIVATE_NO_STORE_HEADERS },
      );
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
        ? [
            { label: "Message", value: effectiveMessage },
            { label: "Langue", value: localeCode },
            { label: "Marché", value: marketCode },
            ...(countryCode ? [{ label: "Pays", value: countryCode }] : []),
            { label: "Source", value: source },
          ]
        : [
            { label: "Accompagnement", value: isSpecialistOffer(offer) ? SPECIALIST_OFFERS[offer].title : offer },
            ...(isSpecialistOffer(offer) ? [{ label: "Tarif affiché", value: SPECIALIST_OFFERS[offer].price }] : []),
            ...(message ? [{ label: "Situation", value: message }] : []),
          ],
      idempotencyKey: effectiveIdempotencyKey,
      requestType: isMessage ? "coaching_message" : "coach_business_callback",
      title: isMessage
        ? "Nouvelle clarification gratuite"
        : "Nouvelle demande d’accompagnement Coach business",
    });

    if (
      claimedDraft
      && !await markCoachingMessageDraftSent({ draftToken, uid })
    ) {
      throw new Error("Unable to mark the coaching draft as sent.");
    }

    return NextResponse.json(
      {
        ok: true,
        ...(conversationMessage?.message
          ? { access: conversationMessage.access, message: conversationMessage.message }
          : {}),
      },
      { status: 202, headers: PRIVATE_NO_STORE_HEADERS },
    );
  } catch (error) {
    logOperationalError("coaching_request.failed", error);
    return NextResponse.json(
      {
        error: "La demande n’a pas pu être envoyée.",
        ...(claimedDraft ? { draftMessage: claimedDraft.body } : {}),
      },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}

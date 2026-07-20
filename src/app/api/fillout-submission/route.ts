import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { enforceSameOrigin } from "@/lib/request-guard";
import { logOperationalError } from "@/lib/operational-log";

type FilloutSubmissionBody = {
  attribution?: unknown;
  source?: unknown;
  sourceUrl?: unknown;
  submissionUuid?: unknown;
  systemSlug?: unknown;
};

function isValidSubmissionUuid(value: string) {
  return /^[A-Za-z0-9_-]{8,120}$/.test(value);
}

export async function POST(request: Request) {
  try {
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limited = await enforceRateLimit(request, {
      keyPrefix: "fillout-submission",
      limit: 12,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } =
      await readJsonBody<FilloutSubmissionBody>(request);
    if (response) return response;

    const submissionUuid = normalizeText(body?.submissionUuid, 120);
    const source = normalizeText(body?.source, 120);
    const sourceUrl = normalizeText(body?.sourceUrl, 500);
    const systemSlug = normalizeText(body?.systemSlug, 160);

    if (!isValidSubmissionUuid(submissionUuid)) {
      return NextResponse.json(
        { error: "La référence de soumission Fillout est invalide." },
        { status: 400 },
      );
    }

    const context = await resolveLeadContext({
      systemSlug,
      source: source || "Diagnostic organisation Fillout",
      sourceUrl: request.headers.get("referer") || sourceUrl,
    });

    if (!context) {
      return NextResponse.json(
        { error: "Le kit d’origine est introuvable." },
        { status: 400 },
      );
    }

    const lead = await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: false, resend: false, slack: true },
      contact: {},
      context,
      emoji: "📅",
      fields: [
        { label: "Formulaire", value: "Diagnostic organisation (Fillout)" },
        { label: "Référence Fillout", value: submissionUuid },
      ],
      idempotencyKey: `fillout:${submissionUuid}`,
      requestType: "organisation_audit_booking",
      title: "Diagnostic organisation — formulaire envoyé",
    });

    return NextResponse.json({
      duplicate: lead.duplicate,
      leadId: lead.leadId,
      ok: true,
    });
  } catch (error) {
    logOperationalError("lead.route.failed", error, {
      requestType: "organisation_audit_booking",
    });
    return NextResponse.json(
      { error: "La trace de cette soumission n’a pas pu être enregistrée." },
      { status: 500 },
    );
  }
}

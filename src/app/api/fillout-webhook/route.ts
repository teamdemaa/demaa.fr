import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api-security";
import { isValidFilloutWebhookAuthorization } from "@/lib/fillout-webhook-auth";
import { parseFilloutWebhookSubmission } from "@/lib/fillout-webhook";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";

export const runtime = "nodejs";

const ORGANISATION_FORM_ID = "sWP6PSPRVLus";

async function handlePost(request: Request) {
  const secret = process.env.FILLOUT_WEBHOOK_SECRET?.trim();
  if (!secret) {
    logOperationalError(
      "fillout.webhook.configuration_missing",
      new Error("FILLOUT_WEBHOOK_SECRET is not configured."),
    );
    return NextResponse.json({ error: "Webhook indisponible." }, { status: 503 });
  }

  if (!isValidFilloutWebhookAuthorization(
    request.headers.get("authorization"),
    secret,
  )) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, response } = await readJsonBody<unknown>(request, 256 * 1024);
  if (response) return response;

  const submission = parseFilloutWebhookSubmission(data);
  if (!submission) {
    return NextResponse.json({ error: "Soumission Fillout invalide." }, { status: 400 });
  }
  if (submission.formId && submission.formId !== ORGANISATION_FORM_ID) {
    return NextResponse.json({ error: "Formulaire Fillout non autorisé." }, { status: 400 });
  }

  const context = await resolveLeadContext({
    systemSlug: submission.systemSlug,
    source: submission.source,
    sourceUrl: submission.sourceUrl,
  });
  if (!context) {
    return NextResponse.json({ error: "Le kit d’origine est introuvable." }, { status: 400 });
  }

  const lead = await submitLeadRequest({
    attribution: submission.attribution,
    channels: {
      email: true,
      resend: Boolean(submission.contact.email),
      slack: true,
    },
    contact: submission.contact,
    context,
    emoji: "📅",
    fields: [
      { label: "Formulaire", value: "Session stratégique (Fillout)" },
      { label: "Référence Fillout", value: submission.submissionId },
    ],
    idempotencyKey: `fillout:${submission.submissionId}`,
    requestType: "organisation_session_booking",
    title: "Session stratégique — formulaire envoyé",
  });

  logOperationalEvent("fillout.webhook.processed", {
    duplicate: lead.duplicate,
    leadId: lead.leadId,
    systemSlug: context.systemSlug,
  });

  return NextResponse.json({
    duplicate: lead.duplicate,
    leadId: lead.leadId,
    ok: true,
  });
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    logOperationalError("fillout.webhook.failed", error);
    return NextResponse.json(
      { error: "La soumission Fillout n’a pas pu être enregistrée." },
      { status: 500 },
    );
  }
}

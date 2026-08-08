import "server-only";

import { syncResendLeadContact } from "@/lib/resend-audience";
import { escapeSlackMrkdwn } from "@/lib/api-security";
import { sendSlackMessage } from "@/lib/slack";
import type {
  RequestDeliveryChannel,
  StoredServiceRequest,
  StoredSolutionReferral,
} from "@/lib/service-request-storage.server";

export class RequestDeliveryProviderError extends Error {
  readonly code: string;
  readonly providerStatus: number | null;

  constructor(code: string, providerStatus: number | null = null) {
    super(code);
    this.name = "RequestDeliveryProviderError";
    this.code = code;
    this.providerStatus = providerStatus;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendResendEmail(input: {
  html: string;
  idempotencyKey: string;
  replyTo?: string;
  subject: string;
  text: string;
  to: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) throw new RequestDeliveryProviderError("email_configuration_missing");
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        from,
        html: input.html,
        reply_to: input.replyTo,
        subject: input.subject,
        text: input.text,
        to: input.to,
      }),
      cache: "no-store",
    });
  } catch {
    throw new RequestDeliveryProviderError("email_network_failed");
  }
  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined);
    throw new RequestDeliveryProviderError("email_provider_rejected", response.status);
  }
}

function internalRecipient() {
  return process.env.LEAD_NOTIFICATION_EMAIL?.trim() || "team@demaa.fr";
}

function slackLine(label: string, value: string) {
  return `*${escapeSlackMrkdwn(label)}* : ${escapeSlackMrkdwn(value)}`;
}

async function sendServiceRequestSlack(record: StoredServiceRequest, requestId: string) {
  const lines = [
    `*[Services] ${escapeSlackMrkdwn(record.service.service_name)}*`,
    slackLine("Référence", requestId),
    slackLine("Prénom", record.contact.first_name),
    slackLine("E-mail", record.contact.email),
    slackLine("Entreprise", record.contact.company),
    slackLine("Système", record.system_slug ?? "Non renseigné"),
    slackLine("Besoin", record.need),
  ];
  return sendSlackMessage({
    text: `[Services] ${record.service.service_name}`,
    blocks: [{ type: "section", text: { type: "mrkdwn", text: lines.join("\n") } }],
  });
}

async function sendSolutionReferralSlack(record: StoredSolutionReferral, requestId: string) {
  const lines = [
    `*[Solutions] Mise en relation - ${escapeSlackMrkdwn(record.solution.resource_name)}*`,
    slackLine("Référence", requestId),
    slackLine("Prénom", record.contact.first_name),
    slackLine("E-mail", record.contact.email),
    slackLine("Entreprise", record.contact.company),
    slackLine("Système", record.system_slug),
    slackLine("Relation", record.solution.commercial_relationship),
    slackLine("Besoin", record.need),
  ];
  return sendSlackMessage({
    text: `[Solutions] Mise en relation - ${record.solution.resource_name}`,
    blocks: [{ type: "section", text: { type: "mrkdwn", text: lines.join("\n") } }],
  });
}

async function syncMarketing(record: StoredServiceRequest | StoredSolutionReferral) {
  if (record.marketing_consent?.granted !== true) return;
  try {
    await syncResendLeadContact({
      email: record.contact.email,
      firstName: record.contact.first_name,
    });
  } catch {
    throw new RequestDeliveryProviderError("marketing_provider_failed");
  }
}

export async function deliverServiceRequestChannel(input: {
  channel: RequestDeliveryChannel;
  record: StoredServiceRequest;
  requestId: string;
}) {
  const { channel, record, requestId } = input;
  if (channel === "marketing_sync") return syncMarketing(record);
  if (channel === "slack") return sendServiceRequestSlack(record, requestId);
  if (channel === "customer_email") {
    const subject = `Demande reçue - ${record.service.service_name}`;
    return sendResendEmail({
      html: `<p>Bonjour ${escapeHtml(record.contact.first_name)},</p><p>Nous avons bien reçu votre demande concernant <strong>${escapeHtml(record.service.service_name)}</strong>. L’équipe vous recontactera pour confirmer le besoin et la prochaine étape.</p><p>Référence : ${escapeHtml(requestId)}</p>`,
      idempotencyKey: `service-request-${requestId}-customer`,
      subject,
      text: `Bonjour ${record.contact.first_name},\n\nNous avons bien reçu votre demande concernant « ${record.service.service_name} ». L’équipe vous recontactera pour confirmer le besoin et la prochaine étape.\n\nRéférence : ${requestId}`,
      to: record.contact.email,
    });
  }
  const pricing = record.service.pricing.mode === "fixed"
    ? `${(record.service.pricing.amountMinor / 100).toFixed(2)} EUR HT`
    : "Sur devis";
  const subject = `[Services] ${record.service.service_name}`;
  return sendResendEmail({
    html: `<h1>${escapeHtml(subject)}</h1><p>Référence : ${escapeHtml(requestId)}</p><p><strong>Prénom :</strong> ${escapeHtml(record.contact.first_name)}<br><strong>E-mail :</strong> ${escapeHtml(record.contact.email)}<br><strong>Entreprise :</strong> ${escapeHtml(record.contact.company)}<br><strong>Système :</strong> ${escapeHtml(record.system_slug ?? "Non renseigné")}<br><strong>Opérateur :</strong> ${escapeHtml(record.service.contracting_party)}<br><strong>Tarification :</strong> ${escapeHtml(pricing)}<br><strong>Version :</strong> ${escapeHtml(record.service.offer_version)}</p><p style="white-space:pre-wrap">${escapeHtml(record.need)}</p>`,
    idempotencyKey: `service-request-${requestId}-internal`,
    replyTo: record.contact.email,
    subject,
    text: [
      subject,
      `Référence : ${requestId}`,
      `Prénom : ${record.contact.first_name}`,
      `E-mail : ${record.contact.email}`,
      `Entreprise : ${record.contact.company}`,
      `Système : ${record.system_slug ?? "Non renseigné"}`,
      `Opérateur : ${record.service.contracting_party}`,
      `Tarification : ${pricing}`,
      `Version : ${record.service.offer_version}`,
      "",
      record.need,
    ].join("\n"),
    to: internalRecipient(),
  });
}

export async function deliverSolutionReferralChannel(input: {
  channel: RequestDeliveryChannel;
  record: StoredSolutionReferral;
  requestId: string;
}) {
  const { channel, record, requestId } = input;
  if (channel === "marketing_sync") return syncMarketing(record);
  if (channel === "slack") return sendSolutionReferralSlack(record, requestId);
  if (channel === "customer_email") {
    const subject = `Demande de mise en relation reçue - ${record.solution.resource_name}`;
    return sendResendEmail({
      html: `<p>Bonjour ${escapeHtml(record.contact.first_name)},</p><p>Nous avons bien reçu votre demande de mise en relation avec <strong>${escapeHtml(record.solution.resource_name)}</strong>.</p><p>${escapeHtml(record.solution.transparency)}</p><p>Référence : ${escapeHtml(requestId)}</p>`,
      idempotencyKey: `solution-referral-${requestId}-customer`,
      subject,
      text: `Bonjour ${record.contact.first_name},\n\nNous avons bien reçu votre demande de mise en relation avec ${record.solution.resource_name}. ${record.solution.transparency}\n\nRéférence : ${requestId}`,
      to: record.contact.email,
    });
  }
  const subject = `[Solutions] Mise en relation - ${record.solution.resource_name}`;
  return sendResendEmail({
    html: `<h1>${escapeHtml(subject)}</h1><p>Référence : ${escapeHtml(requestId)}</p><p><strong>Prénom :</strong> ${escapeHtml(record.contact.first_name)}<br><strong>E-mail :</strong> ${escapeHtml(record.contact.email)}<br><strong>Entreprise :</strong> ${escapeHtml(record.contact.company)}<br><strong>Système :</strong> ${escapeHtml(record.system_slug)}<br><strong>Contractant :</strong> ${escapeHtml(record.solution.contracting_party)}<br><strong>Facturant :</strong> ${escapeHtml(record.solution.billing_party)}<br><strong>Relation :</strong> ${escapeHtml(record.solution.commercial_relationship)}<br><strong>Transparence :</strong> ${escapeHtml(record.solution.transparency)}</p><p style="white-space:pre-wrap">${escapeHtml(record.need)}</p>`,
    idempotencyKey: `solution-referral-${requestId}-internal`,
    replyTo: record.contact.email,
    subject,
    text: [
      subject,
      `Référence : ${requestId}`,
      `Prénom : ${record.contact.first_name}`,
      `E-mail : ${record.contact.email}`,
      `Entreprise : ${record.contact.company}`,
      `Système : ${record.system_slug}`,
      `Contractant : ${record.solution.contracting_party}`,
      `Facturant : ${record.solution.billing_party}`,
      `Relation : ${record.solution.commercial_relationship}`,
      `Transparence : ${record.solution.transparency}`,
      `Placement : ${record.solution.placement_id} (${record.solution.placement_version})`,
      "",
      record.need,
    ].join("\n"),
    to: internalRecipient(),
  });
}

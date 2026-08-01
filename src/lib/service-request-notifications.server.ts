import "server-only";

import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import { syncResendLeadContact } from "@/lib/resend-audience";
import {
  updateServiceRequestDeliveryState,
  updateSolutionReferralDeliveryState,
  type RequestDeliveryChannel,
  type RequestDeliveryState,
  type StoredServiceRequest,
  type StoredSolutionReferral,
} from "@/lib/service-request-storage.server";

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
  if (!apiKey || !from) throw new Error("Resend email configuration is missing.");

  const response = await fetch("https://api.resend.com/emails", {
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
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend email ${response.status}: ${body || "unknown error"}`);
  }
}

function shouldDeliver(state: RequestDeliveryState) {
  return state.status === "pending" || state.status === "failed";
}

async function deliverChannel(input: {
  channel: RequestDeliveryChannel;
  operation: () => Promise<unknown>;
  requestId: string;
  requestType: "service_request" | "solution_referral";
  update: typeof updateServiceRequestDeliveryState;
}) {
  try {
    await input.operation();
    await input.update({
      channel: input.channel,
      requestId: input.requestId,
      status: "sent",
    });
    return { channel: input.channel, status: "sent" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown delivery error";
    logOperationalError("request.delivery.failed", error, {
      channel: input.channel,
      requestId: input.requestId,
      requestType: input.requestType,
    });
    await input.update({
      channel: input.channel,
      error: message,
      requestId: input.requestId,
      status: "failed",
    }).catch((statusError) => {
      logOperationalError("request.delivery_status.failed", statusError, {
        channel: input.channel,
        requestId: input.requestId,
        requestType: input.requestType,
      });
    });
    return { channel: input.channel, status: "failed" as const };
  }
}

function internalRecipient() {
  return process.env.LEAD_NOTIFICATION_EMAIL?.trim() || "team@demaa.fr";
}

export async function deliverServiceRequestNotifications(input: {
  record: StoredServiceRequest;
  requestId: string;
}) {
  const { record, requestId } = input;
  const deliveries: Array<Promise<{ channel: RequestDeliveryChannel; status: "failed" | "sent" }>> = [];

  if (shouldDeliver(record.notification_status.customer_email)) {
    const subject = `Demande reçue - ${record.service.service_name}`;
    const message = `Bonjour ${record.contact.first_name},\n\nNous avons bien reçu votre demande concernant « ${record.service.service_name} ». L’équipe vous recontactera pour confirmer le besoin et la prochaine étape.\n\nRéférence : ${requestId}`;
    deliveries.push(deliverChannel({
      channel: "customer_email",
      operation: () => sendResendEmail({
        html: `<p>Bonjour ${escapeHtml(record.contact.first_name)},</p><p>Nous avons bien reçu votre demande concernant <strong>${escapeHtml(record.service.service_name)}</strong>. L’équipe vous recontactera pour confirmer le besoin et la prochaine étape.</p><p>Référence : ${escapeHtml(requestId)}</p>`,
        idempotencyKey: `service-request-${requestId}-customer`,
        subject,
        text: message,
        to: record.contact.email,
      }),
      requestId,
      requestType: "service_request",
      update: updateServiceRequestDeliveryState,
    }));
  }

  if (shouldDeliver(record.notification_status.internal_email)) {
    const pricing = record.service.pricing.mode === "fixed"
      ? `${(record.service.pricing.amountMinor / 100).toFixed(2)} EUR HT`
      : "Sur devis";
    const subject = `[Services] ${record.service.service_name}`;
    const text = [
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
    ].join("\n");
    deliveries.push(deliverChannel({
      channel: "internal_email",
      operation: () => sendResendEmail({
        html: `<h1>${escapeHtml(subject)}</h1><p>Référence : ${escapeHtml(requestId)}</p><p><strong>Prénom :</strong> ${escapeHtml(record.contact.first_name)}<br><strong>E-mail :</strong> ${escapeHtml(record.contact.email)}<br><strong>Entreprise :</strong> ${escapeHtml(record.contact.company)}<br><strong>Système :</strong> ${escapeHtml(record.system_slug ?? "Non renseigné")}<br><strong>Opérateur :</strong> ${escapeHtml(record.service.contracting_party)}<br><strong>Tarification :</strong> ${escapeHtml(pricing)}<br><strong>Version :</strong> ${escapeHtml(record.service.offer_version)}</p><p style="white-space:pre-wrap">${escapeHtml(record.need)}</p>`,
        idempotencyKey: `service-request-${requestId}-internal`,
        replyTo: record.contact.email,
        subject,
        text,
        to: internalRecipient(),
      }),
      requestId,
      requestType: "service_request",
      update: updateServiceRequestDeliveryState,
    }));
  }

  if (
    record.marketing_consent?.granted === true
    && shouldDeliver(record.notification_status.marketing_sync)
  ) {
    deliveries.push(deliverChannel({
      channel: "marketing_sync",
      operation: () => syncResendLeadContact({
        email: record.contact.email,
        firstName: record.contact.first_name,
      }),
      requestId,
      requestType: "service_request",
      update: updateServiceRequestDeliveryState,
    }));
  }

  const results = await Promise.all(deliveries);
  logOperationalEvent("service_request.deliveries.completed", {
    failed: results.filter((result) => result.status === "failed").length,
    requestId,
    sent: results.filter((result) => result.status === "sent").length,
  });
  return results;
}

export async function deliverSolutionReferralNotifications(input: {
  record: StoredSolutionReferral;
  requestId: string;
}) {
  const { record, requestId } = input;
  const deliveries: Array<Promise<{ channel: RequestDeliveryChannel; status: "failed" | "sent" }>> = [];

  if (shouldDeliver(record.notification_status.customer_email)) {
    const subject = `Demande de mise en relation reçue - ${record.solution.resource_name}`;
    const text = `Bonjour ${record.contact.first_name},\n\nNous avons bien reçu votre demande de mise en relation avec ${record.solution.resource_name}. ${record.solution.transparency}\n\nRéférence : ${requestId}`;
    deliveries.push(deliverChannel({
      channel: "customer_email",
      operation: () => sendResendEmail({
        html: `<p>Bonjour ${escapeHtml(record.contact.first_name)},</p><p>Nous avons bien reçu votre demande de mise en relation avec <strong>${escapeHtml(record.solution.resource_name)}</strong>.</p><p>${escapeHtml(record.solution.transparency)}</p><p>Référence : ${escapeHtml(requestId)}</p>`,
        idempotencyKey: `solution-referral-${requestId}-customer`,
        subject,
        text,
        to: record.contact.email,
      }),
      requestId,
      requestType: "solution_referral",
      update: updateSolutionReferralDeliveryState,
    }));
  }

  if (shouldDeliver(record.notification_status.internal_email)) {
    const subject = `[Solutions] Mise en relation - ${record.solution.resource_name}`;
    const text = [
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
    ].join("\n");
    deliveries.push(deliverChannel({
      channel: "internal_email",
      operation: () => sendResendEmail({
        html: `<h1>${escapeHtml(subject)}</h1><p>Référence : ${escapeHtml(requestId)}</p><p><strong>Prénom :</strong> ${escapeHtml(record.contact.first_name)}<br><strong>E-mail :</strong> ${escapeHtml(record.contact.email)}<br><strong>Entreprise :</strong> ${escapeHtml(record.contact.company)}<br><strong>Système :</strong> ${escapeHtml(record.system_slug ?? "")}<br><strong>Contractant :</strong> ${escapeHtml(record.solution.contracting_party)}<br><strong>Facturant :</strong> ${escapeHtml(record.solution.billing_party)}<br><strong>Relation :</strong> ${escapeHtml(record.solution.commercial_relationship)}<br><strong>Transparence :</strong> ${escapeHtml(record.solution.transparency)}</p><p style="white-space:pre-wrap">${escapeHtml(record.need)}</p>`,
        idempotencyKey: `solution-referral-${requestId}-internal`,
        replyTo: record.contact.email,
        subject,
        text,
        to: internalRecipient(),
      }),
      requestId,
      requestType: "solution_referral",
      update: updateSolutionReferralDeliveryState,
    }));
  }

  if (
    record.marketing_consent?.granted === true
    && shouldDeliver(record.notification_status.marketing_sync)
  ) {
    deliveries.push(deliverChannel({
      channel: "marketing_sync",
      operation: () => syncResendLeadContact({
        email: record.contact.email,
        firstName: record.contact.first_name,
      }),
      requestId,
      requestType: "solution_referral",
      update: updateSolutionReferralDeliveryState,
    }));
  }

  const results = await Promise.all(deliveries);
  logOperationalEvent("solution_referral.deliveries.completed", {
    failed: results.filter((result) => result.status === "failed").length,
    requestId,
    sent: results.filter((result) => result.status === "sent").length,
  });
  return results;
}

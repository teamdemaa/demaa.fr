import "server-only";

import { escapeSlackMrkdwn } from "@/lib/api-security";
import type { LeadContext } from "@/lib/lead-context";
import {
  createLeadRequest,
  type LeadContact,
  type LeadDeliveryChannel,
  type LeadField,
  updateLeadDeliveryStatus,
} from "@/lib/lead-storage";
import { syncResendLeadContact } from "@/lib/resend-audience";
import { sendSlackMessage } from "@/lib/slack";

type LeadSubmission = {
  channels: {
    email: boolean;
    resend: boolean;
    slack: boolean;
  };
  contact: LeadContact;
  context: LeadContext;
  emoji: string;
  fields?: LeadField[];
  requestType: string;
  title: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getContactName(contact: LeadContact) {
  return contact.name?.trim()
    || [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim()
    || "Non renseigné";
}

function buildDisplayFields(input: LeadSubmission) {
  return [
    { label: "Nom", value: getContactName(input.contact) },
    { label: "Téléphone", value: input.contact.phone },
    { label: "Email", value: input.contact.email },
    { label: "Entreprise", value: input.contact.company },
    { label: "Activité / kit", value: input.context.systemName },
    { label: "Slug du kit", value: input.context.systemSlug },
    { label: "Secteur", value: input.context.sectorLabel },
    { label: "Source", value: input.context.source },
    { label: "Page d’origine", value: input.context.sourceUrl },
    ...(input.fields ?? []),
  ].filter((field) => field.value?.trim());
}

function buildTitle(input: LeadSubmission) {
  return input.context.sectorLabel
    ? `[${input.context.sectorLabel}] ${input.title}`
    : input.title;
}

async function sendInternalLeadEmail(input: LeadSubmission, leadId: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const to = process.env.LEAD_NOTIFICATION_EMAIL?.trim() || "team@demaa.fr";

  if (!apiKey || !from) {
    throw new Error("Resend internal email configuration is missing.");
  }

  const fields = buildDisplayFields(input);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `lead-${leadId}-internal`,
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: input.contact.email?.trim() || undefined,
      subject: buildTitle(input),
      html: `
        <h1 style="font-family:Arial,sans-serif;font-size:22px;color:#17231d;">${escapeHtml(buildTitle(input))}</h1>
        <p style="font-family:Arial,sans-serif;color:#526158;">Référence : ${escapeHtml(leadId)}</p>
        <table style="border-collapse:collapse;font-family:Arial,sans-serif;">
          ${fields.map((field) => `<tr><td style="padding:6px 16px 6px 0;font-weight:700;vertical-align:top;">${escapeHtml(field.label)}</td><td style="padding:6px 0;white-space:pre-wrap;">${escapeHtml(field.value ?? "")}</td></tr>`).join("")}
        </table>
      `,
      text: [buildTitle(input), `Référence : ${leadId}`, "", ...fields.map((field) => `${field.label} : ${field.value}`)].join("\n"),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend internal email ${response.status}: ${body || "unknown error"}`);
  }
}

async function deliverChannel(input: {
  channel: LeadDeliveryChannel;
  leadId: string;
  operation: () => Promise<unknown>;
}) {
  try {
    await input.operation();
    await updateLeadDeliveryStatus({
      channel: input.channel,
      leadId: input.leadId,
      status: "sent",
    });
    return { channel: input.channel, status: "sent" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown delivery error";
    console.error(`[lead-notifications] ${input.channel} failed for ${input.leadId}:`, message);
    await updateLeadDeliveryStatus({
      channel: input.channel,
      error: message,
      leadId: input.leadId,
      status: "failed",
    }).catch((statusError) => {
      console.error(`[lead-notifications] Unable to persist ${input.channel} failure for ${input.leadId}:`, statusError);
    });
    return { channel: input.channel, status: "failed" as const };
  }
}

export async function submitLeadRequest(input: LeadSubmission) {
  const fields = buildDisplayFields(input);
  const lead = await createLeadRequest({
    channels: input.channels,
    contact: input.contact,
    context: input.context,
    fields: input.fields ?? [],
    requestType: input.requestType,
    title: input.title,
  });
  const deliveries: Array<Promise<{ channel: LeadDeliveryChannel; status: "failed" | "sent" }>> = [];

  if (input.channels.slack) {
    deliveries.push(deliverChannel({
      channel: "slack",
      leadId: lead.id,
      operation: () => sendSlackMessage({
        text: `${input.emoji} ${buildTitle(input)}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${escapeSlackMrkdwn(buildTitle(input))}*\n${fields.map((field) => `*${escapeSlackMrkdwn(field.label)}* : ${escapeSlackMrkdwn(field.value ?? "")}`).join("\n")}`,
            },
          },
          {
            type: "context",
            elements: [{
              type: "mrkdwn",
              text: `Référence ${escapeSlackMrkdwn(lead.id)} · ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`,
            }],
          },
        ],
      }),
    }));
  }

  if (input.channels.email) {
    deliveries.push(deliverChannel({
      channel: "email",
      leadId: lead.id,
      operation: () => sendInternalLeadEmail(input, lead.id),
    }));
  }

  if (input.channels.resend && input.contact.email) {
    deliveries.push(deliverChannel({
      channel: "resend",
      leadId: lead.id,
      operation: () => syncResendLeadContact({
        context: input.context,
        email: input.contact.email ?? "",
        firstName: input.contact.firstName ?? input.contact.name,
        lastName: input.contact.lastName,
        requestType: input.requestType,
      }),
    }));
  }

  const results = await Promise.all(deliveries);
  return { leadId: lead.id, deliveries: results };
}

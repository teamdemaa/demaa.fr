import "server-only";

import { escapeSlackMrkdwn } from "@/lib/api-security";
import type { LeadAttributionRecord } from "@/lib/lead-attribution";
import { buildAttributionDisplayFields } from "@/lib/lead-attribution-server";
import { chunkSlackLines } from "@/lib/lead-notification-format";
import { MAX_LEAD_DELIVERY_ATTEMPTS } from "@/lib/lead-retry";
import {
  logOperationalError,
  logOperationalEvent,
} from "@/lib/operational-log";
import type { LeadContext } from "@/lib/lead-context";
import {
  createLeadRequest,
  claimLeadDeliveryRetry,
  getFailedLeadRequests,
  markLeadDeliveryAbandoned,
  resolveStoredLeadAssetSnapshot,
  type LeadContact,
  type LeadAssetSnapshot,
  type LeadCommercialSnapshot,
  type LeadDeliveryChannel,
  type LeadField,
  type LeadMarketingConsent,
  type StoredLeadRequest,
  updateLeadDeliveryStatus,
} from "@/lib/lead-storage";
import { syncResendLeadContact } from "@/lib/resend-audience";
import { sendSlackMessage } from "@/lib/slack";

type LeadSubmission = {
  assetSnapshot?: LeadAssetSnapshot | null;
  attribution: LeadAttributionRecord;
  channels: {
    email: boolean;
    resend: boolean;
    slack: boolean;
  };
  commercialSnapshot?: LeadCommercialSnapshot | null;
  contact: LeadContact;
  consents?: Array<{
    capturedAt: string;
    granted: boolean;
    purpose: string;
    text: string;
    version: string;
  }>;
  context: LeadContext;
  emoji: string;
  fields?: LeadField[];
  idempotencyKey?: string | null;
  marketingConsent?: LeadMarketingConsent | null;
  requestType: string;
  title: string;
};

type OperationalSystemDeliveryEmailSender = (input: {
  assetSnapshot: LeadAssetSnapshot;
  deliveryId: string;
  email: string;
  firstName?: string | null;
  systemName: string;
  systemSlug: string;
}) => Promise<
  | Readonly<{ sent: true; reason: null }>
  | Readonly<{ sent: false; reason: string }>
>;

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
    { label: "Activité / système", value: input.context.systemName },
    { label: "Slug du système", value: input.context.systemSlug },
    { label: "Secteur", value: input.context.sectorLabel },
    { label: "Source", value: input.context.source },
    { label: "Page d’origine", value: input.context.sourceUrl },
    ...buildAttributionDisplayFields(input.attribution),
    ...(input.fields ?? []),
  ].filter((field) => field.value?.trim());
}

function buildTitle(input: LeadSubmission) {
  return input.context.sectorLabel
    ? `[${input.context.sectorLabel}] ${input.title}`
    : input.title;
}

function buildSlackBlocks(input: LeadSubmission, leadId: string, retry = false) {
  const lines = [
    `*${escapeSlackMrkdwn(buildTitle(input))}*`,
    ...buildDisplayFields(input).map(
      (field) =>
        `*${escapeSlackMrkdwn(field.label)}* : ${escapeSlackMrkdwn(field.value ?? "")}`,
    ),
  ];
  const sections = chunkSlackLines(lines);

  return [
    ...sections.slice(0, 48).map((text) => ({
      type: "section",
      text: { type: "mrkdwn", text },
    })),
    {
      type: "context",
      elements: [{
        type: "mrkdwn",
        text: retry
          ? `Référence ${escapeSlackMrkdwn(leadId)} · nouvelle tentative automatique`
          : `Référence ${escapeSlackMrkdwn(leadId)} · ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`,
      }],
    },
  ];
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

async function deliverChannel<TChannel extends LeadDeliveryChannel>(input: {
  channel: TChannel;
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
    logOperationalError("lead.delivery.failed", error, {
      channel: input.channel,
      leadId: input.leadId,
    });
    await updateLeadDeliveryStatus({
      channel: input.channel,
      error: message,
      leadId: input.leadId,
      status: "failed",
    }).catch((statusError) => {
      logOperationalError("lead.delivery_status.failed", statusError, {
        channel: input.channel,
        leadId: input.leadId,
      });
    });
    return { channel: input.channel, status: "failed" as const };
  }
}

export async function submitLeadRequest(input: LeadSubmission) {
  const lead = await createLeadRequest({
    assetSnapshot: input.assetSnapshot,
    attribution: input.attribution,
    channels: input.channels,
    commercialSnapshot: input.commercialSnapshot,
    contact: input.contact,
    consents: input.consents,
    context: input.context,
    fields: input.fields ?? [],
    idempotencyKey: input.idempotencyKey,
    emoji: input.emoji,
    marketingConsent: input.marketingConsent,
    requestType: input.requestType,
    title: input.title,
  });

  if (!lead.created) {
    logOperationalEvent("lead.duplicate", {
      leadId: lead.id,
      requestId: input.attribution.conversion.request_id,
      requestType: input.requestType,
      systemSlug: input.context.systemSlug,
    });
    return {
      assetSnapshot: lead.assetSnapshot,
      duplicate: true,
      leadId: lead.id,
      deliveries: [],
    };
  }

  logOperationalEvent("lead.created", {
    leadId: lead.id,
    requestId: input.attribution.conversion.request_id,
    requestType: input.requestType,
    systemSlug: input.context.systemSlug,
  });

  const deliveries: Array<Promise<{ channel: LeadDeliveryChannel; status: "failed" | "sent" }>> = [];

  if (input.channels.slack) {
    deliveries.push(deliverChannel({
      channel: "slack",
      leadId: lead.id,
      operation: () => sendSlackMessage({
        text: `${input.emoji} ${buildTitle(input)}`,
        blocks: buildSlackBlocks(input, lead.id),
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
        email: input.contact.email ?? "",
        firstName: input.contact.firstName ?? input.contact.name,
        lastName: input.contact.lastName,
      }),
    }));
  }

  const results = await Promise.all(deliveries);
  logOperationalEvent("lead.deliveries.completed", {
    failed: results.filter((result) => result.status === "failed").length,
    leadId: lead.id,
    sent: results.filter((result) => result.status === "sent").length,
  });
  return {
    assetSnapshot: lead.assetSnapshot,
    duplicate: false,
    leadId: lead.id,
    deliveries: results,
  };
}

function rebuildLeadSubmission(data: StoredLeadRequest): LeadSubmission {
  return {
    assetSnapshot: resolveStoredLeadAssetSnapshot(data),
    attribution: data.attribution,
    channels: {
      email: data.notification_status.email?.status !== "skipped",
      resend: data.notification_status.resend?.status !== "skipped",
      slack: data.notification_status.slack?.status !== "skipped",
    },
    commercialSnapshot: data.commercial_snapshot
      ? {
          amountMinor: data.commercial_snapshot.amount_minor,
          countryCode: data.commercial_snapshot.country_code,
          currencyCode: data.commercial_snapshot.currency_code,
          exchangeRate: data.commercial_snapshot.exchange_rate,
          exchangeRateDate: data.commercial_snapshot.exchange_rate_date,
          localeCode: data.commercial_snapshot.locale_code,
          marketCode: data.commercial_snapshot.market_code,
          packageSlug: data.commercial_snapshot.package_slug,
          pricingMode: data.commercial_snapshot.pricing_mode,
          serviceSlug: data.commercial_snapshot.service_slug,
        }
      : null,
    contact: {
      company: data.contact.company,
      email: data.contact.email,
      firstName: data.contact.first_name,
      lastName: data.contact.last_name,
      name: data.contact.name,
      phone: data.contact.phone,
    },
    consents: (data.consents ?? []).map((consent) => ({
      capturedAt: consent.captured_at,
      granted: consent.granted,
      purpose: consent.purpose,
      text: consent.text,
      version: consent.version,
    })),
    context: {
      sectorLabel: data.context.sector_label,
      sectorSlug: data.context.sector_slug,
      source: data.context.source,
      sourceUrl: data.context.source_url,
      systemName: data.context.system_name,
      systemSlug: data.context.system_slug,
    },
    emoji: data.emoji || "📬",
    fields: data.fields,
    marketingConsent: data.marketing_consent
      ? {
          capturedAt: data.marketing_consent.captured_at,
          granted: data.marketing_consent.granted,
          text: data.marketing_consent.text,
          version: data.marketing_consent.version,
        }
      : null,
    requestType: data.request_type,
    title: data.title,
  };
}

export async function retryFailedLeadDeliveries(
  limit: number,
  sendOperationalSystemDeliveryEmail: OperationalSystemDeliveryEmailSender,
) {
  const failedLeads = await getFailedLeadRequests(limit);
  const now = Date.now();
  const results: Array<{
    channel: LeadDeliveryChannel;
    status: "failed" | "sent";
  }> = [];

  for (const lead of failedLeads) {
    const input = rebuildLeadSubmission(lead.data);

    for (const channel of ["email", "kit_email", "resend", "slack"] as const) {
      const delivery = lead.data.notification_status[channel];
      if (!delivery) continue;
      const attemptCount = delivery.attempt_count ?? 1;
      const retryAt = delivery.next_retry_at
        ? Date.parse(delivery.next_retry_at)
        : 0;

      if (
        delivery.status !== "failed" ||
        (Number.isFinite(retryAt) && retryAt > now)
      ) {
        continue;
      }

      if (attemptCount >= MAX_LEAD_DELIVERY_ATTEMPTS) {
        await markLeadDeliveryAbandoned({ channel, leadId: lead.id });
        logOperationalEvent("lead.delivery.abandoned", {
          channel,
          leadId: lead.id,
        });
        continue;
      }

      const missingRetryData =
        (channel === "resend" && !input.contact.email)
        || (
          channel === "kit_email"
          && (
            !input.contact.email
            || !input.context.systemName
            || !input.context.systemSlug
            || !input.assetSnapshot?.assetRevision
            || !input.assetSnapshot.workbookVersion
            || (
              !input.assetSnapshot.resourceId
              && !input.contact.firstName
            )
          )
        );
      if (missingRetryData) {
        await markLeadDeliveryAbandoned({ channel, leadId: lead.id });
        logOperationalEvent("lead.delivery.abandoned", {
          channel,
          leadId: lead.id,
          reason: "missing_retry_data",
        });
        continue;
      }

      const claimed = await claimLeadDeliveryRetry({ channel, leadId: lead.id });
      if (!claimed) continue;

      let result: { channel: LeadDeliveryChannel; status: "failed" | "sent" } | null = null;

      if (channel === "email") {
        result = await deliverChannel({
          channel,
          leadId: lead.id,
          operation: () => sendInternalLeadEmail(input, lead.id),
        });
      } else if (
        channel === "kit_email"
        && input.contact.email
        && input.context.systemName
        && input.context.systemSlug
        && input.assetSnapshot?.assetRevision
      ) {
        const assetSnapshot = input.assetSnapshot;
        result = await deliverChannel({
          channel,
          leadId: lead.id,
          operation: async () => {
            const delivery = await sendOperationalSystemDeliveryEmail({
              assetSnapshot,
              deliveryId: `lead-${lead.id}-system`,
              email: input.contact.email ?? "",
              firstName: input.contact.firstName,
              systemName: input.context.systemName ?? "",
              systemSlug: input.context.systemSlug ?? "",
            });
            if (!delivery.sent) {
              throw new Error(delivery.reason);
            }
          },
        });
      } else if (channel === "resend" && input.contact.email) {
        result = await deliverChannel({
          channel,
          leadId: lead.id,
          operation: () => syncResendLeadContact({
            email: input.contact.email ?? "",
            firstName: input.contact.firstName ?? input.contact.name,
            lastName: input.contact.lastName,
          }),
        });
      } else if (channel === "slack") {
        result = await deliverChannel({
          channel,
          leadId: lead.id,
          operation: () => sendSlackMessage({
            text: `${input.emoji} ${buildTitle(input)}`,
            blocks: buildSlackBlocks(input, lead.id, true),
          }),
        });
      }

      if (result) {
        results.push(result);
        if (
          result.status === "failed"
          && attemptCount >= MAX_LEAD_DELIVERY_ATTEMPTS - 1
        ) {
          await markLeadDeliveryAbandoned({ channel, leadId: lead.id });
          logOperationalEvent("lead.delivery.abandoned", {
            channel,
            leadId: lead.id,
          });
        }
      }
    }
  }

  return results;
}

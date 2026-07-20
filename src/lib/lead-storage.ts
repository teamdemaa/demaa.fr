import "server-only";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type { LeadContext } from "@/lib/lead-context";

export type LeadDeliveryChannel = "email" | "resend" | "slack";
export type LeadDeliveryState = "failed" | "pending" | "sent" | "skipped";

export type LeadContact = {
  company?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  phone?: string | null;
};

export type LeadField = {
  label: string;
  value?: string | null;
};

export type LeadRequestInput = {
  channels: Record<LeadDeliveryChannel, boolean>;
  contact: LeadContact;
  context: LeadContext;
  fields: LeadField[];
  requestType: string;
  title: string;
};

function cleanString(value?: string | null) {
  return value?.trim() || null;
}

export async function createLeadRequest(input: LeadRequestInput) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();
  const leadRef = database.collection("lead_requests").doc();

  await leadRef.set({
    request_type: input.requestType,
    title: input.title,
    contact: {
      company: cleanString(input.contact.company),
      email: cleanString(input.contact.email)?.toLowerCase() ?? null,
      first_name: cleanString(input.contact.firstName),
      last_name: cleanString(input.contact.lastName),
      name: cleanString(input.contact.name),
      phone: cleanString(input.contact.phone),
    },
    context: {
      system_slug: input.context.systemSlug,
      system_name: input.context.systemName,
      sector_slug: input.context.sectorSlug,
      sector_label: input.context.sectorLabel,
      source: input.context.source,
      source_url: input.context.sourceUrl,
    },
    fields: input.fields.map((field) => ({
      label: field.label.trim(),
      value: cleanString(field.value),
    })),
    notification_status: {
      email: { status: input.channels.email ? "pending" : "skipped" },
      resend: { status: input.channels.resend ? "pending" : "skipped" },
      slack: { status: input.channels.slack ? "pending" : "skipped" },
    },
    created_at: now,
    updated_at: now,
  });

  return { id: leadRef.id };
}

export async function updateLeadDeliveryStatus(input: {
  channel: LeadDeliveryChannel;
  error?: string | null;
  leadId: string;
  status: LeadDeliveryState;
}) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();

  await database.collection("lead_requests").doc(input.leadId).update({
    [`notification_status.${input.channel}`]: {
      status: input.status,
      attempted_at: now,
      error: input.error?.slice(0, 500) || null,
    },
    updated_at: now,
  });
}

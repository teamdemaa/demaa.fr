import "server-only";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type { LeadAttributionRecord } from "@/lib/lead-attribution";
import type { LeadContext } from "@/lib/lead-context";
import { buildLeadIdempotencyHash } from "@/lib/lead-idempotency";
import {
  getLeadRetryDelayMs,
  MAX_LEAD_DELIVERY_ATTEMPTS,
} from "@/lib/lead-retry";
import { getLeadRetentionExpiry } from "@/lib/operational-maintenance";

type LeadNotificationChannel = "email" | "resend" | "slack";
export type LeadDeliveryChannel = LeadNotificationChannel | "kit_email";
export type LeadDeliveryState = "abandoned" | "failed" | "pending" | "sent" | "skipped";

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
  attribution: LeadAttributionRecord;
  channels: Record<LeadNotificationChannel, boolean>;
  contact: LeadContact;
  context: LeadContext;
  fields: LeadField[];
  idempotencyKey?: string | null;
  emoji: string;
  requestType: string;
  title: string;
};

export type StoredLeadRequest = {
  attribution: LeadAttributionRecord;
  contact: {
    company: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    name: string | null;
    phone: string | null;
  };
  context: {
    sector_label: string | null;
    sector_slug: string | null;
    source: string;
    source_url: string | null;
    system_name: string | null;
    system_slug: string | null;
  };
  created_at: string;
  emoji?: string;
  fields: Array<{ label: string; value: string | null }>;
  notification_status: Record<LeadDeliveryChannel, {
    attempted_at?: string;
    attempt_count?: number;
    error?: string | null;
    next_retry_at?: string | null;
    retry_claimed_at?: string | null;
    status: LeadDeliveryState;
  }>;
  request_type: string;
  title: string;
};

function cleanString(value?: string | null) {
  return value?.trim() || null;
}

export async function createLeadRequest(input: LeadRequestInput) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();
  const idempotencyHash = input.idempotencyKey
    ? buildLeadIdempotencyHash(input.requestType, input.idempotencyKey)
    : null;
  const leadRef = idempotencyHash
    ? database.collection("lead_requests").doc(idempotencyHash)
    : database.collection("lead_requests").doc();
  const leadData = {
    attribution: input.attribution,
    request_type: input.requestType,
    title: input.title,
    emoji: input.emoji,
    idempotency_key_hash: idempotencyHash,
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
      email: { attempt_count: 0, status: input.channels.email ? "pending" : "skipped" },
      kit_email: {
        attempt_count: 0,
        status: input.requestType === "system_kit_request" ? "pending" : "skipped",
      },
      resend: { attempt_count: 0, status: input.channels.resend ? "pending" : "skipped" },
      slack: { attempt_count: 0, status: input.channels.slack ? "pending" : "skipped" },
    },
    created_at: now,
    retention_expires_at: getLeadRetentionExpiry(),
    updated_at: now,
  };

  if (!idempotencyHash) {
    await leadRef.set(leadData);
    return { created: true, id: leadRef.id };
  }

  const created = await database.runTransaction(async (transaction) => {
    const existing = await transaction.get(leadRef);
    if (existing.exists) return false;
    transaction.create(leadRef, leadData);
    return true;
  });

  return { created, id: leadRef.id };
}

export async function updateLeadDeliveryStatus(input: {
  channel: LeadDeliveryChannel;
  error?: string | null;
  leadId: string;
  status: LeadDeliveryState;
}) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();
  const leadRef = database.collection("lead_requests").doc(input.leadId);

  await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(leadRef);
    const data = snapshot.data() as StoredLeadRequest | undefined;
    const previousAttempts = data?.notification_status?.[input.channel]?.attempt_count ?? 0;
    const attemptCount = previousAttempts + 1;
    const retryDelayMs = getLeadRetryDelayMs(attemptCount);
    const nextRetryAt = input.status === "failed"
      ? new Date(Date.now() + retryDelayMs).toISOString()
      : null;

    transaction.update(leadRef, {
      [`notification_status.${input.channel}.status`]: input.status,
      [`notification_status.${input.channel}.attempted_at`]: now,
      [`notification_status.${input.channel}.attempt_count`]: attemptCount,
      [`notification_status.${input.channel}.error`]: input.error?.slice(0, 500) || null,
      [`notification_status.${input.channel}.next_retry_at`]: nextRetryAt,
      [`notification_status.${input.channel}.retry_claimed_at`]: null,
      updated_at: now,
    });
  });
}

export async function getFailedLeadRequests(limit = 30) {
  const database = getAdminFirestore();
  const channels: LeadDeliveryChannel[] = ["email", "kit_email", "resend", "slack"];
  const scanLimit = Math.max(100, limit * 10);
  const snapshots = await Promise.all(
    channels.map((channel) =>
      database
        .collection("lead_requests")
        .where(`notification_status.${channel}.status`, "==", "failed")
        .limit(scanLimit)
        .get(),
    ),
  );
  const leads = new Map<string, StoredLeadRequest>();

  for (const snapshot of snapshots) {
    for (const document of snapshot.docs) {
      leads.set(document.id, document.data() as StoredLeadRequest);
    }
  }

  return [...leads.entries()]
    .sort(([, first], [, second]) => {
      const firstRetry = Math.min(
        ...Object.values(first.notification_status)
          .filter((delivery) => delivery.status === "failed")
          .map((delivery) => Date.parse(delivery.next_retry_at ?? "") || 0),
      );
      const secondRetry = Math.min(
        ...Object.values(second.notification_status)
          .filter((delivery) => delivery.status === "failed")
          .map((delivery) => Date.parse(delivery.next_retry_at ?? "") || 0),
      );
      return firstRetry - secondRetry;
    })
    .slice(0, limit)
    .map(([id, data]) => ({ id, data }));
}

export async function claimLeadDeliveryRetry(input: {
  channel: LeadDeliveryChannel;
  leadId: string;
}) {
  const database = getAdminFirestore();
  const leadRef = database.collection("lead_requests").doc(input.leadId);
  const now = Date.now();

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(leadRef);
    const data = snapshot.data() as StoredLeadRequest | undefined;
    const delivery = data?.notification_status?.[input.channel];
    const retryAt = Date.parse(delivery?.next_retry_at ?? "");

    if (
      !delivery
      || delivery.status !== "failed"
      || (Number.isFinite(retryAt) && retryAt > now)
      || (delivery.attempt_count ?? 0) >= MAX_LEAD_DELIVERY_ATTEMPTS
    ) {
      return false;
    }

    transaction.update(leadRef, {
      [`notification_status.${input.channel}.next_retry_at`]: new Date(now + 5 * 60 * 1000).toISOString(),
      [`notification_status.${input.channel}.retry_claimed_at`]: new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
    });
    return true;
  });
}

export async function getLeadDeliveryState(
  leadId: string,
  channel: LeadDeliveryChannel,
) {
  const document = await getAdminFirestore()
    .collection("lead_requests")
    .doc(leadId)
    .get();
  const data = document.data() as StoredLeadRequest | undefined;
  return data?.notification_status?.[channel]?.status ?? null;
}

export async function markLeadDeliveryAbandoned(input: {
  channel: LeadDeliveryChannel;
  leadId: string;
}) {
  const now = new Date().toISOString();
  await getAdminFirestore().collection("lead_requests").doc(input.leadId).update({
    [`notification_status.${input.channel}.status`]: "abandoned",
    [`notification_status.${input.channel}.next_retry_at`]: null,
    [`notification_status.${input.channel}.retry_claimed_at`]: null,
    updated_at: now,
  });
}

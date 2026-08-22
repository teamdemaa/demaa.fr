import "server-only";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type {
  AdminRequestDetail,
  AdminRequestSource,
  AdminRequestStatus,
  AdminRequestSummary,
} from "@/lib/admin-request-contract";
import { ADMIN_REQUEST_SOURCES, ADMIN_REQUEST_STATUSES } from "@/lib/admin-request-contract";
import type { StoredLeadRequest } from "@/lib/lead-storage";
import {
  SERVICE_REQUEST_COLLECTION,
  SOLUTION_REFERRAL_COLLECTION,
  type StoredServiceRequest,
  type StoredSolutionReferral,
} from "@/lib/service-request-storage.server";

const SOURCE_COLLECTIONS = {
  lead: "lead_requests",
  service: SERVICE_REQUEST_COLLECTION,
  referral: SOLUTION_REFERRAL_COLLECTION,
} as const satisfies Record<AdminRequestSource, string>;
const MAX_SCAN_PER_SOURCE = 200;

type StoredAdminState = {
  admin_status?: AdminRequestStatus;
};

function clean(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function status(value: unknown): AdminRequestStatus {
  return ADMIN_REQUEST_STATUSES.includes(value as AdminRequestStatus)
    ? value as AdminRequestStatus
    : "new";
}

function deliveryStatus(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([channel, state]) => {
    if (!state || typeof state !== "object" || Array.isArray(state)) return [];
    const resolved = clean(Reflect.get(state, "status"));
    return resolved ? [[channel, resolved]] : [];
  }));
}

function leadDetail(id: string, data: StoredLeadRequest & StoredAdminState): AdminRequestDetail {
  const name = clean(data.contact.name)
    ?? ([data.contact.first_name, data.contact.last_name].filter(Boolean).join(" ").trim() || null);
  return {
    attribution: data.attribution,
    contact: {
      company: clean(data.contact.company),
      email: clean(data.contact.email),
      name,
      phone: clean(data.contact.phone),
    },
    createdAt: data.created_at,
    deliveryStatus: deliveryStatus(data.notification_status),
    fields: data.fields.map((field) => ({ label: field.label, value: clean(field.value) })),
    id,
    requestType: data.request_type,
    source: "lead",
    sourceLabel: data.context.source || "Formulaire",
    sourceUrl: clean(data.context.source_url),
    specializedHref: data.request_type === "opportunity_interest" ? "/admin/opportunites" : null,
    status: status(data.admin_status),
    systemName: clean(data.context.system_name),
    title: data.title,
  };
}

function serviceDetail(id: string, data: StoredServiceRequest & StoredAdminState): AdminRequestDetail {
  return {
    attribution: data.attribution,
    contact: {
      company: clean(data.contact.company),
      email: clean(data.contact.email),
      name: clean(data.contact.first_name),
      phone: null,
    },
    createdAt: data.created_at,
    deliveryStatus: deliveryStatus(data.notification_status),
    fields: [
      { label: "Besoin", value: clean(data.need) },
      { label: "Service", value: data.service.service_name },
      { label: "Opérateur", value: data.service.contracting_party },
      { label: "Facturation", value: data.service.billing_party },
    ],
    id,
    requestType: data.request_type,
    source: "service",
    sourceLabel: "Services",
    sourceUrl: null,
    specializedHref: null,
    status: status(data.admin_status),
    systemName: clean(data.system_slug),
    title: `Demande de service - ${data.service.service_name}`,
  };
}

function referralDetail(id: string, data: StoredSolutionReferral & StoredAdminState): AdminRequestDetail {
  return {
    attribution: data.attribution,
    contact: {
      company: clean(data.contact.company),
      email: clean(data.contact.email),
      name: clean(data.contact.first_name),
      phone: null,
    },
    createdAt: data.created_at,
    deliveryStatus: deliveryStatus(data.notification_status),
    fields: [
      { label: "Besoin", value: clean(data.need) },
      { label: "Solution", value: data.solution.resource_name },
      { label: "Contractant", value: data.solution.contracting_party },
      { label: "Facturant", value: data.solution.billing_party },
      { label: "Transparence", value: data.solution.transparency },
    ],
    id,
    requestType: data.request_type,
    source: "referral",
    sourceLabel: "Mise en relation",
    sourceUrl: null,
    specializedHref: null,
    status: status(data.admin_status),
    systemName: clean(data.system_slug),
    title: `Mise en relation - ${data.solution.resource_name}`,
  };
}

function normalize(source: AdminRequestSource, id: string, data: unknown): AdminRequestDetail | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  try {
    if (source === "lead") return leadDetail(id, data as StoredLeadRequest & StoredAdminState);
    if (source === "service") return serviceDetail(id, data as StoredServiceRequest & StoredAdminState);
    return referralDetail(id, data as StoredSolutionReferral & StoredAdminState);
  } catch {
    return null;
  }
}

function sortKey(request: Pick<AdminRequestSummary, "createdAt" | "id" | "source">) {
  return `${request.createdAt}\u0000${request.source}\u0000${request.id}`;
}

function encodeCursor(request: AdminRequestSummary) {
  return Buffer.from(sortKey(request), "utf8").toString("base64url");
}

function toSummary(request: AdminRequestDetail): AdminRequestSummary {
  return {
    contact: request.contact,
    createdAt: request.createdAt,
    deliveryStatus: request.deliveryStatus,
    id: request.id,
    requestType: request.requestType,
    source: request.source,
    sourceLabel: request.sourceLabel,
    status: request.status,
    title: request.title,
  };
}

function decodeCursor(value: string | null) {
  if (!value || !/^[A-Za-z0-9_-]{1,600}$/.test(value)) return null;
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    return decoded.length <= 400 ? decoded : null;
  } catch {
    return null;
  }
}

export async function listAdminRequests(input: {
  cursor?: string | null;
  limit?: number;
  requestType?: string | null;
  source?: AdminRequestSource | null;
  status?: AdminRequestStatus | null;
}) {
  const database = getAdminFirestore();
  const sources = input.source ? [input.source] : [...ADMIN_REQUEST_SOURCES];
  const snapshots = await Promise.all(sources.map(async (source) => ({
    source,
    snapshot: await database
      .collection(SOURCE_COLLECTIONS[source])
      .orderBy("created_at", "desc")
      .limit(MAX_SCAN_PER_SOURCE)
      .get(),
  })));
  const cursor = decodeCursor(input.cursor ?? null);
  const limit = Math.min(50, Math.max(1, input.limit ?? 30));
  const normalized = snapshots.flatMap(({ source, snapshot }) =>
    snapshot.docs.flatMap((document) => {
      const detail = normalize(source, document.id, document.data());
      return detail ? [detail] : [];
    }),
  ).sort((first, second) => sortKey(second).localeCompare(sortKey(first)));
  const filtered = normalized.filter((request) =>
    (!cursor || sortKey(request) < cursor)
    && (!input.requestType || request.requestType === input.requestType)
    && (!input.status || request.status === input.status),
  );
  const page = filtered.slice(0, limit);
  return {
    nextCursor: filtered.length > limit && page.length > 0
      ? encodeCursor(page[page.length - 1])
      : null,
    requests: page.map(toSummary),
  };
}

export async function getAdminRequest(source: AdminRequestSource, id: string) {
  if (!/^[A-Za-z0-9_-]{1,180}$/.test(id)) return null;
  const snapshot = await getAdminFirestore().collection(SOURCE_COLLECTIONS[source]).doc(id).get();
  return snapshot.exists ? normalize(source, id, snapshot.data()) : null;
}

export async function updateAdminRequestStatus(input: {
  adminUid: string;
  id: string;
  source: AdminRequestSource;
  status: AdminRequestStatus;
}) {
  if (!/^[A-Za-z0-9_-]{1,180}$/.test(input.id)) return false;
  const document = getAdminFirestore().collection(SOURCE_COLLECTIONS[input.source]).doc(input.id);
  const snapshot = await document.get();
  if (!snapshot.exists) return false;
  await document.update({
    admin_status: input.status,
    admin_updated_at: new Date().toISOString(),
    admin_updated_by_uid: input.adminUid,
  });
  return true;
}

import { NextResponse } from "next/server";
import { getCurrentAdminIdentity } from "@/lib/admin-auth.server";
import { enforceRateLimit } from "@/lib/api-security";
import { getRecentLeadRequests } from "@/lib/lead-storage";
import { enforceAllowedHost } from "@/lib/request-guard";

export const runtime = "nodejs";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
} as const;

export type LeadRequestSummary = {
  contact: {
    company: string | null;
    email: string | null;
    name: string | null;
    phone: string | null;
  };
  createdAt: string;
  id: string;
  notificationStatus: Record<string, string>;
  requestType: string;
  sectorLabel: string | null;
  systemName: string | null;
  title: string;
};

export async function GET(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "admin-lead-requests-read",
    limit: 180,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  const identity = await getCurrentAdminIdentity();
  if (!identity) {
    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  const leads = await getRecentLeadRequests(200);
  const requests: LeadRequestSummary[] = leads.map(({ id, data }) => ({
    contact: {
      company: data.contact.company,
      email: data.contact.email,
      name: data.contact.name
        ?? [data.contact.first_name, data.contact.last_name].filter(Boolean).join(" ")
        ?? null,
      phone: data.contact.phone,
    },
    createdAt: data.created_at,
    id,
    notificationStatus: Object.fromEntries(
      Object.entries(data.notification_status).map(([channel, delivery]) => [
        channel,
        delivery.status,
      ]),
    ),
    requestType: data.request_type,
    sectorLabel: data.context.sector_label,
    systemName: data.context.system_name,
    title: data.title,
  }));

  return NextResponse.json(
    { requests },
    { headers: PRIVATE_NO_STORE_HEADERS },
  );
}

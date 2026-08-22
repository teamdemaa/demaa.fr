export const ADMIN_REQUEST_SOURCES = ["lead", "service", "referral"] as const;
export type AdminRequestSource = (typeof ADMIN_REQUEST_SOURCES)[number];

export const ADMIN_REQUEST_STATUSES = ["new", "in_progress", "responded", "closed"] as const;
export type AdminRequestStatus = (typeof ADMIN_REQUEST_STATUSES)[number];

export type AdminRequestSummary = {
  contact: {
    company: string | null;
    email: string | null;
    name: string | null;
    phone: string | null;
  };
  createdAt: string;
  deliveryStatus: Record<string, string>;
  id: string;
  requestType: string;
  source: AdminRequestSource;
  sourceLabel: string;
  status: AdminRequestStatus;
  title: string;
};

export type AdminRequestDetail = AdminRequestSummary & {
  attribution: unknown;
  fields: Array<{ label: string; value: string | null }>;
  sourceUrl: string | null;
  specializedHref: string | null;
  systemName: string | null;
};

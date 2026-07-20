import "server-only";

import type { LeadContext } from "@/lib/lead-context";

const RESEND_API_URL = "https://api.resend.com";
const CONTACT_PROPERTY_KEYS = [
  "activity_name",
  "activity_slug",
  "last_request_at",
  "last_request_type",
  "sector_label",
  "sector_slug",
] as const;

function getApiKey() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  return apiKey;
}

async function resendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${RESEND_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend ${response.status}: ${body || "unknown error"}`);
  }

  return response.json() as Promise<T>;
}

async function ensureContactProperties() {
  const result = await resendRequest<{
    data?: Array<{ key?: string }>;
  }>("/contact-properties?limit=100");
  const existingKeys = new Set((result.data ?? []).map((property) => property.key));

  await Promise.all(
    CONTACT_PROPERTY_KEYS.filter((key) => !existingKeys.has(key)).map((key) =>
      resendRequest("/contact-properties", {
        method: "POST",
        body: JSON.stringify({ key, type: "string", fallback_value: "Non renseigné" }),
      }),
    ),
  );
}

async function upsertResendContact(input: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  properties?: Record<string, string>;
}) {
  const email = input.email.trim().toLowerCase();
  let propertiesAvailable = Boolean(input.properties);

  if (propertiesAvailable) {
    try {
      await ensureContactProperties();
    } catch (error) {
      propertiesAvailable = false;
      console.warn("[resend-audience] Contact properties unavailable; continuing without them.", error);
    }
  }

  const contactPayload = {
    first_name: input.firstName?.trim() || undefined,
    last_name: input.lastName?.trim() || undefined,
    ...(propertiesAvailable ? { properties: input.properties } : {}),
  };
  const contactPath = `/contacts/${encodeURIComponent(email)}`;

  try {
    await resendRequest(contactPath, {
      method: "PATCH",
      body: JSON.stringify(contactPayload),
    });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("Resend 404")) throw error;

    await resendRequest("/contacts", {
      method: "POST",
      body: JSON.stringify({ email, ...contactPayload }),
    });
  }

  return email;
}

export async function syncResendLeadContact(input: {
  context: LeadContext;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  requestType: string;
}) {
  const email = input.email.trim().toLowerCase();
  const properties = {
    activity_name: input.context.systemName ?? "",
    activity_slug: input.context.systemSlug ?? "",
    last_request_at: new Date().toISOString(),
    last_request_type: input.requestType,
    sector_label: input.context.sectorLabel ?? "",
    sector_slug: input.context.sectorSlug ?? "",
  };

  await upsertResendContact({
    email,
    firstName: input.firstName,
    lastName: input.lastName,
    properties,
  });

  return { email };
}

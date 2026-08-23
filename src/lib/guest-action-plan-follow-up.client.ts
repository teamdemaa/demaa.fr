import type { GuestAccess } from "@/lib/guest-action-plan.client";

export function createGuestFollowUpIdempotencyKey(prefix: string) {
  return `${prefix}:${crypto.randomUUID()}`;
}

export async function submitGuestActionPlanFollowUp(
  path: "diagnostic" | "email",
  access: GuestAccess,
  body: Record<string, unknown>,
) {
  const response = await fetch(
    `/api/guest/action-plans/${encodeURIComponent(access.generationId)}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${access.accessKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
  const payload = await response.json().catch(() => null) as {
    error?: string;
    ok?: boolean;
  } | null;
  if (!response.ok || payload?.ok !== true) {
    throw new Error(payload?.error ?? "La demande n’a pas pu être envoyée.");
  }
}

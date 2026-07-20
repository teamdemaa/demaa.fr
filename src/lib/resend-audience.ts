import "server-only";

const RESEND_API_URL = "https://api.resend.com";

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

async function upsertResendContact(input: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const email = input.email.trim().toLowerCase();

  const contactPayload = {
    first_name: input.firstName?.trim() || undefined,
    last_name: input.lastName?.trim() || undefined,
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
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const email = input.email.trim().toLowerCase();

  await upsertResendContact({
    email,
    firstName: input.firstName,
    lastName: input.lastName,
  });

  return { email };
}

"use client";

export type CustomerSessionPayload = {
  authenticated: boolean;
  companyReady: boolean;
  email: string | null;
  provider: "google" | "password" | null;
  uid: string | null;
  error?: string;
};

export class CustomerSessionExchangeError extends Error {
  readonly code: string | null;
  readonly status: number;

  constructor(message: string, input: { code?: string | null; status: number }) {
    super(message);
    this.name = "CustomerSessionExchangeError";
    this.code = input.code ?? null;
    this.status = input.status;
  }
}

export async function exchangeFirebaseIdTokenForSession(input: {
  idToken: string;
  returnTo: string;
}) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => null) as
    | { code?: string; error?: string; redirectTo?: string }
    | null;
  if (!response.ok || !payload?.redirectTo) {
    throw new CustomerSessionExchangeError(
      payload?.error || "La connexion n’a pas pu aboutir.",
      { code: payload?.code, status: response.status },
    );
  }
  return { redirectTo: payload.redirectTo };
}

export async function readCustomerSession(signal?: AbortSignal) {
  const response = await fetch("/api/auth/session", {
    cache: "no-store",
    signal,
  });
  const payload = await response.json().catch(() => null) as CustomerSessionPayload | null;
  if (!response.ok || !payload) {
    throw new Error(
      payload?.error === "company_context_unavailable"
        ? "Votre espace entreprise est momentanément indisponible."
        : "Votre session n’a pas pu être vérifiée.",
    );
  }
  return payload;
}

export async function deleteCustomerSession() {
  const response = await fetch("/api/auth/session", { method: "DELETE" });
  if (!response.ok) throw new Error("La déconnexion n’a pas pu aboutir.");
}

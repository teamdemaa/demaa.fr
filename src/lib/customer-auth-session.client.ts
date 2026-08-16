"use client";

export type CustomerSessionPayload = {
  authenticated: boolean;
  companyReady: boolean;
  email: string | null;
  provider: "google" | "password" | null;
  uid: string | null;
  error?: string;
};

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
    | { error?: string; redirectTo?: string }
    | null;
  if (!response.ok || !payload?.redirectTo) {
    throw new Error(payload?.error || "La connexion n’a pas pu aboutir.");
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

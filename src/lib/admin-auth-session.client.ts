"use client";

export class AdminSessionExchangeError extends Error {
  readonly code: string | null;
  readonly status: number;

  constructor(message: string, input: { code?: string | null; status: number }) {
    super(message);
    this.name = "AdminSessionExchangeError";
    this.code = input.code ?? null;
    this.status = input.status;
  }
}

export async function exchangeFirebaseIdTokenForAdminSession(input: {
  idToken: string;
  returnTo: string;
}) {
  const response = await fetch("/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => null) as
    | { code?: string; error?: string; redirectTo?: string }
    | null;
  if (!response.ok || !payload?.redirectTo) {
    throw new AdminSessionExchangeError(
      payload?.error || "La connexion Team n’a pas pu aboutir.",
      { code: payload?.code, status: response.status },
    );
  }
  return { redirectTo: payload.redirectTo };
}

export async function deleteAdminSession() {
  const response = await fetch("/api/admin/session", { method: "DELETE" });
  if (!response.ok) throw new Error("La déconnexion Team n’a pas pu aboutir.");
}

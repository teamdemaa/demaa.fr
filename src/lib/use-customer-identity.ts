"use client";

import { useEffect, useState } from "react";

type CustomerIdentity = {
  email: string | null;
  loading: boolean;
};

export function useCustomerIdentity(initialEmail = ""): CustomerIdentity {
  const [email, setEmail] = useState<string | null>(initialEmail || null);
  const [loading, setLoading] = useState(!initialEmail);

  useEffect(() => {
    if (initialEmail) return;

    const controller = new AbortController();
    fetch("/api/customer-space/session", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null) as
          | { authenticated?: boolean; email?: string | null }
          | null;
        setEmail(response.ok && body?.authenticated ? body.email ?? null : null);
      })
      .catch(() => setEmail(null))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [initialEmail]);

  return { email, loading };
}

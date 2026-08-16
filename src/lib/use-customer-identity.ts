"use client";

import { useEffect, useState } from "react";
import { readCustomerSession } from "@/lib/customer-auth-session.client";

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
    readCustomerSession(controller.signal)
      .then((session) => {
        setEmail(session.authenticated && session.companyReady ? session.email : null);
      })
      .catch(() => setEmail(null))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [initialEmail]);

  return { email, loading };
}

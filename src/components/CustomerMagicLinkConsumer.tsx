"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CustomerMagicLinkConsumer({
  returnTo,
  token,
}: {
  returnTo: string;
  token: string;
}) {
  const startedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let mounted = true;

    async function consumeLink() {
      try {
        const response = await fetch("/api/customer-space/consume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ returnTo, token }),
        });
        const payload = (await response.json().catch(() => null)) as
          | { error?: string; redirectTo?: string }
          | null;

        if (!response.ok || !payload?.redirectTo) {
          throw new Error(payload?.error || "connexion-impossible");
        }

        if (!mounted) return;
        window.location.replace(payload.redirectTo);
      } catch {
        if (mounted) {
          setError("Ce lien n’est plus valide. Demandez un nouveau lien.");
        }
      }
    }

    void consumeLink();
    return () => {
      mounted = false;
    };
  }, [returnTo, token]);

  if (error) {
    return (
      <div className="text-center">
        <p className="rounded-[0.9rem] border border-dema-forest/15 bg-dema-sage/70 px-4 py-3 text-sm text-dema-forest">
          {error}
        </p>
        <Link
          href="/mon-espace"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-6 text-sm font-medium text-dema-paper"
        >
          Recevoir un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-dema-muted" role="status" aria-live="polite">
      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      Connexion sécurisée en cours…
    </div>
  );
}
